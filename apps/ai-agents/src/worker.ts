import { AuditLogData, EmailService, logger, prisma, WebhookService } from '@salesos/core';
import { createQueue, createWorker } from '@salesos/queue-core';
import { Job } from 'bullmq';
import IORedis from 'ioredis';

import { ScraperEngine } from './scraper/scraper-engine';

// Initialize Engines
const scraperEngine = new ScraperEngine();
const emailQueue = createQueue('email-sending');
const redisLock = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// Import sub-workers to register them
// import './workers/hubspot-sync'; // Removed/Commented out to use the new one
import { createCrmSyncWorker } from '@salesos/core';

// Start CRM Sync Worker
createCrmSyncWorker();

interface EmailJobData {
  scheduledEmailId: string;
  organizationId: string;
}

// Scraping Worker
createWorker('scraping-queue', async (job) => {
  logger.info({ jobId: job.id, url: job.data.url }, 'Processing scraping job');

  if (!job.data.url) {
    throw new Error('URL is required');
  }

  // Ensure engine is ready (lazy init)
  // Or call init() once globally. But lazy allows retry if browser crashes.
  await scraperEngine.init();

  try {
    const result = await scraperEngine.scrape(job.data.url);
    logger.info({ jobId: job.id, success: true }, 'Scraping successful');
    return result;
  } catch (error) {
    logger.error({ jobId: job.id, error }, 'Scraping failed');
    throw error;
  }
}, {
  concurrency: 5, // Limit concurrent browser contexts
});

// AI Analysis Worker (Placeholder)
createWorker('ai-analysis-queue', async (job) => {
  logger.info({ jobId: job.id }, 'Processing AI analysis job');
  // ... OpenAI logic ...
  return { analysis: 'Placeholder' };
}, {
  concurrency: 2, // CPU bound
});

/**
 * Worker processador de emails.
 * Padrão: At Least Once Delivery (com Idempotência para simular Exactly Once)
 */
export const emailWorker = createWorker<EmailJobData>(
  'email-sending',
  async (job: Job<EmailJobData>) => {
    const { scheduledEmailId, organizationId } = job.data;
    const lockKey = `lock:email:${scheduledEmailId}`;

    // 1. Verificação de Idempotência (Redis SETNX)
    // Tenta setar a chave. Se já existe (retorna 0), significa que outro worker está processando
    // ou processou recentemente. TTL de 5 minutos.
    const acquiredLock = await redisLock.set(lockKey, 'processing', 'EX', 300, 'NX');

    if (!acquiredLock) {
      logger.warn({ scheduledEmailId, jobId: job.id }, 'Idempotency lock active. Skipping duplicate job.');
      return; // Aborta silenciosamente, assumindo que já foi processado
    }

    try {
      // 2. Busca e Validação de Estado (Concorrência Otimista)
      const emailRecord = await prisma.scheduledEmail.findUnique({
        where: { id: scheduledEmailId },
        include: { sender: true } // Pegar config do sender se existir
      });

      if (!emailRecord) {
        logger.error({ scheduledEmailId }, 'Email record not found in DB');
        return; // Job inútil, não retentar
      }

      if (emailRecord.status === 'SENT' || emailRecord.status === 'FAILED') {
        logger.info({ scheduledEmailId, status: emailRecord.status }, 'Email already processed. Skipping.');
        return;
      }

      // 3. Atualizar para PROCESSING (Visibilidade para UI)
      await prisma.scheduledEmail.update({
        where: { id: scheduledEmailId },
        data: { status: 'PROCESSING' }
      });

      // 4. Executar Envio
      logger.info({ scheduledEmailId }, 'Sending email via provider...');

      const { messageId } = await EmailService.sendNow({
        scheduledEmailId,
        organizationId,
        to: emailRecord.to,
        subject: emailRecord.subject,
        html: emailRecord.body,
        senderEmail: emailRecord.sender?.email
      });

      // 5. Sucesso: Atualizar DB
      await EmailService.markAsSent(scheduledEmailId, messageId);
      logger.info({ scheduledEmailId, messageId }, 'Email sent successfully');

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      // 6. Falha: Análise de Erro
      logger.error({ error, scheduledEmailId }, 'Email sending failed');

      // Se for erro 4xx (Client Error), provavelmente é permanente (email inválido, rejeitado)
      // Se for 5xx ou Network, o BullMQ fará retry automático (throw error)

      const isPermanentError = error.message?.includes('validation') || error.message?.includes('400');

      if (isPermanentError) {
        await EmailService.markAsFailed(scheduledEmailId, error.message);
        // Não lançar erro para não gerar retry no BullMQ
      } else {
        // Erro transiente: Lançar erro para o BullMQ retentar (Backoff exponencial configurado na queue)
        throw error;
      }
    } finally {
      // Opcional: Liberar lock imediatamente ou deixar expirar (mais seguro deixar expirar em caso de crash)
      // await redisLock.del(lockKey);
    }
  },
  {
    concurrency: 20, // Alta concorrência I/O bound
    limiter: {
      max: 10,      // Max 10 emails
      duration: 1000 // por 1 segundo (Resend Global Rate Limit preventivo)
    }
  }
);

/**
 * Função executada via Cron/Interval
 * Busca emails 'PENDING' que já passaram da hora de envio e enfileira
 */
export async function scheduleEmails() {
  const BATCH_SIZE = 500; // Processar em blocos para não estourar memória

  try {
    const now = new Date();

    // 1. Buscar candidatos
    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: 'PENDING',
        sendAt: {
          lte: now // Agendado para agora ou passado
        },
        deletedAt: null // Respeitando Soft Delete
      },
      take: BATCH_SIZE,
      orderBy: { sendAt: 'asc' } // FIFO: Mais antigos primeiro
    });

    if (pendingEmails.length === 0) return;

    logger.info({ count: pendingEmails.length }, 'Found pending emails to schedule');

    // 2. Processamento em Batch
    const jobs = pendingEmails.map(email => ({
      name: 'send-email',
      data: {
        scheduledEmailId: email.id,
        organizationId: email.organizationId
      },
      opts: {
        jobId: `email:${email.id}`, // Deduplicação nível BullMQ
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 5000 // 5s, 10s, 20s, 40s, 80s
        }
      }
    }));

    // 3. Adicionar à fila em Bulk (Atomicidade de rede)
    await emailQueue.addBulk(jobs);

    // 4. Marcar como QUEUED na DB (Para não pegar na próxima query do scheduler)
    // Isso reduz a chance de race condition entre schedulers redundantes
    const ids = pendingEmails.map(e => e.id);
    await prisma.scheduledEmail.updateMany({
      where: { id: { in: ids } },
      data: { status: 'QUEUED' }
    });

    logger.info({ count: ids.length }, 'Emails queued successfully');

  } catch (error) {
    logger.error({ error }, 'Error in email scheduler');
  }
}

// Start Dispatcher Loop
setInterval(scheduleEmails, 60000);
// Run immediately on startup
scheduleEmails();

// Audit Log Worker
createWorker<AuditLogData>('audit-queue', async (job) => {
  logger.info({ jobId: job.id, action: job.data.action }, 'Processing audit log');

  const { organizationId, actorId, action, entity, entityId, metadata, ipAddress, userAgent } = job.data;

  await prisma.auditLog.create({
    data: {
      organizationId,
      actorId,
      action,
      entity,
      entityId,
      metadata: metadata || {},
      ipAddress,
      userAgent
    }
  });

  return { logged: true };
}, {
  concurrency: 5,
});

// Webhook Worker
createWorker('webhook-queue', async (job) => {
  const { event, organizationId } = job.data;
  logger.info({ jobId: job.id, event, organizationId }, 'Processing webhook job');

  await WebhookService.process(job.data);

  return { processed: true };
}, {
  concurrency: 50, // High I/O concurrency
  limiter: {
    max: 100,      // Max 100 requests per second globally (prevent flooding clients)
    duration: 1000
  }
});

logger.info('Workers started');

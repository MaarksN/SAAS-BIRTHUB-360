import { Resend } from 'resend';
import { prisma } from '../prisma';
import { logger } from '../logger';

// Inicialização Lazy do Resend
// Note: process.env.RESEND_API_KEY is usually loaded by dotenv or framework
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

interface SendEmailParams {
  scheduledEmailId: string;
  to: string;
  subject: string;
  html: string;
  organizationId: string;
  senderEmail?: string;
}

/**
 * Service responsável pela lógica de negócio de envio de email.
 * NÃO deve ser chamado diretamente pela UI, apenas pelo Worker.
 */
export class EmailService {
  /**
   * Executa o envio real via provedor (Resend)
   */
  static async sendNow(params: SendEmailParams): Promise<{ messageId: string }> {
    const { scheduledEmailId, to, subject, html, organizationId, senderEmail } = params;

    // 1. Validação de Rate Limit da Organização (Opcional - Camada extra de segurança)
    // Implementar checkBudgetLimit(organizationId) aqui se necessário

    // 2. Definir remetente
    const from = senderEmail || process.env.DEFAULT_FROM_EMAIL || 'onboarding@resend.dev';

    try {
      // 3. Chamada à API externa
      const data = await resend.emails.send({
        from,
        to,
        subject,
        html,
        headers: {
          'X-Entity-Ref-ID': scheduledEmailId, // Header para tracking de webhooks (Open/Click)
          'X-Organization-ID': organizationId,
        },
        tags: [
          { name: 'category', value: 'campaign_automation' },
          { name: 'org_id', value: organizationId },
        ],
      });

      if (data.error) {
        throw new Error(`Resend API Error: ${data.error.message}`);
      }

      return { messageId: data.data?.id || 'unknown' };

    } catch (error: any) {
      logger.error({
        error: error.message,
        scheduledEmailId,
        provider: 'RESEND',
      }, 'Failed to send email via provider');

      throw error; // Re-throw para o worker lidar com a estratégia de retry
    }
  }

  /**
   * Marca o email como falhado permanentemente na DB
   */
  static async markAsFailed(id: string, error: string) {
    await prisma.scheduledEmail.update({
      where: { id },
      data: {
        status: 'FAILED',
        error: error.substring(0, 1000), // Updated to use 'error' field instead of errorMessage
        processedAt: new Date(),
      },
    });
  }

  /**
   * Marca o email como enviado com sucesso
   */
  static async markAsSent(id: string, messageId: string) {
    await prisma.scheduledEmail.update({
      where: { id },
      data: {
        status: 'SENT',
        providerMessageId: messageId,
        processedAt: new Date(),
        sentAt: new Date(),
      },
    });
  }
}

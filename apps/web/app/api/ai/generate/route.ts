import Anthropic from '@anthropic-ai/sdk';
import {
  type AiGenerationRequest,
  AiGenerationSchema,
  calculateUsage,
  logAIUsage,
} from '@salesos/core';
import { NextRequest, NextResponse } from 'next/server';

import { createApiHandler } from '@/lib/api-handler';
import { guardAIRequest, QuotaExceededError } from '@/lib/budget-guard';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const generateAI = async (
  req: NextRequest,
  { body }: { body: AiGenerationRequest },
) => {
  try {
    // 1. Verificar budget ANTES de chamar API
    await guardAIRequest();

    // Body já validado pelo Zod via createApiHandler
    const { prompt, model } = body;

    // 2. Medir tempo de execução
    const startTime = Date.now();

    // 3. Fazer requisição à API
    const message = await anthropic.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });

    const latencyMs = Date.now() - startTime;
    const output =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // 4. Calcular tokens e custo
    const usage = calculateUsage(
      prompt,
      output,
      model || 'claude-3-5-sonnet-20241022',
      0, // cachedTokens - pode ser extraído do response se disponível
    );

    // 5. Gravar usage log (async, não bloqueia response)
    logAIUsage({
      modelUsed: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      cachedTokens: usage.cachedTokens,
      latencyMs,
      estimatedCost: usage.estimatedCost,
      contextType: 'Chat_Assistant',
    }).catch(console.error);

    // 6. Retornar resposta
    return NextResponse.json({
      output,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
        estimatedCost: usage.estimatedCost,
      },
    });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        {
          error: 'Budget limit exceeded',
          message: error.message,
          usage: error.usage,
          limit: error.limit,
        },
        { status: 402 }, // Payment Required
      );
    }

    // Outros erros são capturados pelo createApiHandler (mas se re-throw, ou podemos deixar passar)
    // Se lançarmos erro aqui, createApiHandler pega.
    // Mas o código original tinha tratamento específico para console.error.
    // O createApiHandler já loga erros não tratados.
    throw error;
  }
};

export const POST = createApiHandler(generateAI, {
  schema: AiGenerationSchema,
});

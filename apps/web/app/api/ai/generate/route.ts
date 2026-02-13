import { NextRequest, NextResponse } from 'next/server';
import { withRequestContext } from '@/lib/api-context';
import { guardAIRequest, QuotaExceededError } from '@/lib/budget-guard';
import { calculateUsage, logAIUsage } from '@salesos/core';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export async function POST(req: NextRequest) {
  return withRequestContext(req, async () => {
    try {
      // 1. Verificar budget ANTES de chamar API
      await guardAIRequest();

      const { prompt, model = 'claude-3-5-sonnet-20241022' } = await req.json();

      // 2. Medir tempo de execução
      const startTime = Date.now();

      // 3. Fazer requisição à API
      const message = await anthropic.messages.create({
        model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const latencyMs = Date.now() - startTime;
      const output = message.content[0].type === 'text' ? message.content[0].text : '';

      // 4. Calcular tokens e custo
      const usage = calculateUsage(
        prompt,
        output,
        model,
        0 // cachedTokens - pode ser extraído do response se disponível
      );

      // 5. Gravar usage log (async, não bloqueia response)
      logAIUsage({
        modelUsed: usage.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cachedTokens: usage.cachedTokens,
        latencyMs,
        estimatedCost: usage.estimatedCost,
        contextType: 'Chat_Assistant'
      }).catch(console.error);

      // 6. Retornar resposta
      return NextResponse.json({
        output,
        usage: {
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          totalTokens: usage.totalTokens,
          estimatedCost: usage.estimatedCost
        }
      });

    } catch (error) {
      if (error instanceof QuotaExceededError) {
        return NextResponse.json(
          {
            error: 'Budget limit exceeded',
            message: error.message,
            usage: error.usage,
            limit: error.limit
          },
          { status: 402 } // Payment Required
        );
      }

      console.error('AI generation error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  });
}

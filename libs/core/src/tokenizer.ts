import { encoding_for_model, Tiktoken, TiktokenModel } from 'tiktoken';

/**
 * Tabela de preços por modelo (USD por 1M tokens)
 * Atualizar conforme mudanças de preço dos provedores
 */
const PRICING_TABLE = {
  // OpenAI
  'gpt-4o': { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
  'gpt-4': { input: 30.00, output: 60.00 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },

  // Anthropic
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },

  // Gemini
  'gemini-2.5-flash-preview': { input: 0.075, output: 0.30 },
  'gemini-pro': { input: 0.50, output: 1.50 }
} as const;

type ModelName = keyof typeof PRICING_TABLE;

/**
 * Mapeamento de modelos para encoders Tiktoken
 */
const MODEL_TO_ENCODING: Record<string, TiktokenModel> = {
  'gpt-4o': 'gpt-4o',
  'gpt-4o-mini': 'gpt-4o',
  'gpt-4-turbo': 'gpt-4-turbo',
  'gpt-4': 'gpt-4',
  'gpt-3.5-turbo': 'gpt-3.5-turbo',
  // Claude e Gemini usam cl100k_base como aproximação
  'claude-3-5-sonnet-20241022': 'cl100k_base' as any,
  'claude-3-opus-20240229': 'cl100k_base' as any,
  'claude-3-sonnet-20240229': 'cl100k_base' as any,
  'claude-3-haiku-20240307': 'cl100k_base' as any,
  'gemini-2.5-flash-preview': 'cl100k_base' as any,
  'gemini-pro': 'cl100k_base' as any
};

/**
 * Cache de encoders para evitar recriação
 */
const encoderCache = new Map<string, Tiktoken>();

/**
 * Obtém ou cria encoder para um modelo
 */
function getEncoder(model: string): Tiktoken {
  if (encoderCache.has(model)) {
    return encoderCache.get(model)!;
  }

  const encodingName = MODEL_TO_ENCODING[model] || 'cl100k_base';
  const encoder = encoding_for_model(encodingName as TiktokenModel);
  encoderCache.set(model, encoder);

  return encoder;
}

/**
 * Conta tokens em um texto
 */
export function countTokens(text: string, model: string = 'gpt-4o'): number {
  try {
    const encoder = getEncoder(model);
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    console.error('Error counting tokens:', error);
    // Fallback: estimativa grosseira
    return Math.ceil(text.length / 4);
  }
}

/**
 * Conta tokens em mensagens de chat (formato OpenAI/Anthropic)
 */
export function countChatTokens(
  messages: Array<{ role: string; content: string }>,
  model: string = 'gpt-4o'
): number {
  try {
    const encoder = getEncoder(model);
    let totalTokens = 0;

    // Tokens por mensagem (overhead)
    const tokensPerMessage = 3;
    const tokensPerName = 1;

    for (const message of messages) {
      totalTokens += tokensPerMessage;

      // Contar tokens do conteúdo
      const contentTokens = encoder.encode(message.content);
      totalTokens += contentTokens.length;

      // Tokens do role
      totalTokens += tokensPerName;
    }

    // Tokens de priming (resposta inicial)
    totalTokens += 3;

    return totalTokens;
  } catch (error) {
    console.error('Error counting chat tokens:', error);
    // Fallback
    const totalText = messages.map(m => m.content).join(' ');
    return Math.ceil(totalText.length / 4);
  }
}

/**
 * Calcula custo estimado baseado em tokens
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  cachedTokens: number = 0
): number {
  const pricing = PRICING_TABLE[model as ModelName];

  if (!pricing) {
    console.warn(`Unknown model: ${model}. Using default pricing.`);
    return ((inputTokens + outputTokens) / 1_000_000) * 5.0; // Default fallback
  }

  // Tokens em cache custam 50% do preço normal (aproximação)
  const effectiveInputTokens = inputTokens - cachedTokens;
  const cachedCost = (cachedTokens / 1_000_000) * (pricing.input * 0.5);

  const inputCost = (effectiveInputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;

  return inputCost + outputCost + cachedCost;
}

/**
 * Interface para resultado de contagem
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}

/**
 * Wrapper conveniente para calcular uso completo
 */
export function calculateUsage(
  input: string | Array<{ role: string; content: string }>,
  output: string,
  model: string,
  cachedTokens: number = 0
): TokenUsage {
  const inputTokens = typeof input === 'string'
    ? countTokens(input, model)
    : countChatTokens(input, model);

  const outputTokens = countTokens(output, model);
  const totalTokens = inputTokens + outputTokens;
  const estimatedCost = calculateCost(inputTokens, outputTokens, model, cachedTokens);

  return {
    inputTokens,
    outputTokens,
    cachedTokens,
    totalTokens,
    estimatedCost,
    model
  };
}

/**
 * Limpa encoders do cache (para liberar memória)
 */
export function clearEncoderCache(): void {
  for (const encoder of Array.from(encoderCache.values())) {
    encoder.free();
  }
  encoderCache.clear();
}

/**
 * Obtém preços de um modelo
 */
export function getModelPricing(model: string): { input: number; output: number } | null {
  return PRICING_TABLE[model as ModelName] || null;
}

/**
 * Lista todos os modelos suportados
 */
export function getSupportedModels(): string[] {
  return Object.keys(PRICING_TABLE);
}

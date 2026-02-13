import { encoding_for_model, TiktokenModel, get_encoding } from 'tiktoken';

/**
 * Counts the number of tokens in a text string for a given model.
 * Uses cl100k_base as fallback for GPT-4 models.
 */
export const countTokens = (text: string, model: string = 'gpt-4o'): number => {
  if (!text) return 0;

  let encoder;
  try {
    encoder = encoding_for_model(model as TiktokenModel);
  } catch (e) {
    // Fallback for newer models or unknown strings
    try {
      encoder = get_encoding('cl100k_base');
    } catch (e2) {
      console.warn('Failed to load cl100k_base encoder, using approximation');
      return Math.ceil(text.length / 4);
    }
  }

  try {
    const tokens = encoder.encode(text);
    return tokens.length;
  } finally {
    if (encoder) {
        encoder.free();
    }
  }
};

/**
 * Estimates tokens for a chat completion request (System + User + Assistant messages).
 * Based on OpenAI Cookbook logic.
 */
export const countChatTokens = (messages: { role: string; content: string; name?: string }[], model: string = 'gpt-4o'): number => {
  let tokensPerMessage = 3;
  let tokensPerName = 1;

  if (model.includes('gpt-3.5-turbo')) {
    tokensPerMessage = 4;
    tokensPerName = -1;
  }

  let numTokens = 0;
  for (const message of messages) {
    numTokens += tokensPerMessage;
    for (const [key, value] of Object.entries(message)) {
      if (key === 'content' && typeof value === 'string') {
        numTokens += countTokens(value, model);
      }
      if (key === 'name' && typeof value === 'string') {
        numTokens += tokensPerName;
        numTokens += countTokens(value, model);
      }
    }
  }

  numTokens += 3; // every reply is primed with <|start|>assistant<|message|>
  return numTokens;
};
// Forced update

import { describe, it, expect } from 'vitest';
import { countTokens, countChatTokens } from './tokenizer';

describe('Tokenizer', () => {
  describe('countTokens', () => {
    it('should return 0 for empty string', () => {
      expect(countTokens('')).toBe(0);
    });

    it('should count tokens correctly for simple text', () => {
      const text = 'Hello, world!';
      // "Hello" (1) + "," (1) + " world" (1) + "!" (1) = 4 tokens (approximate depending on encoder)
      const count = countTokens(text);
      expect(count).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const text = 'user@example.com';
      const count = countTokens(text);
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('countChatTokens', () => {
    it('should count tokens for chat messages', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ];
      const count = countChatTokens(messages);
      expect(count).toBeGreaterThan(0);
    });

    it('should include overhead for message format', () => {
      const messages = [{ role: 'user', content: 'Hi' }];
      const count = countChatTokens(messages);
      // overhead per message (3) + content tokens + reply prime (3)
      expect(count).toBeGreaterThan(6);
    });
  });
});

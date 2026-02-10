import { describe, expect,it } from 'vitest';

import { EmailSchema,PaginationSchema } from './common.schema';

describe('Common Schemas', () => {
  describe('PaginationSchema', () => {
    it('should use default values', () => {
      const result = PaginationSchema.parse({});
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it('should coerce strings to numbers', () => {
      const result = PaginationSchema.parse({ page: '2', limit: '20' });
      expect(result).toEqual({ page: 2, limit: 20 });
    });

    it('should clamp limit', () => {
      expect(() => PaginationSchema.parse({ limit: 101 })).toThrow();
      expect(() => PaginationSchema.parse({ limit: 0 })).toThrow();
    });
  });

  describe('EmailSchema', () => {
    it('should validate email', () => {
      expect(EmailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('should normalize email', () => {
      expect(EmailSchema.parse('  Test@Example.COM  ')).toBe('test@example.com');
    });

    it('should fail on invalid email', () => {
      expect(() => EmailSchema.parse('invalid-email')).toThrow();
    });
  });
});

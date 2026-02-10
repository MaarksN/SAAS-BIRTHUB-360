import { describe, it, expect } from 'vitest';
import { PaginationSchema, EmailSchema, TimestampSchema } from '../../schemas/v1/common.schema';
import { PaginationMetaDto } from './common.dto';

describe('Common Schemas', () => {
  it('should validate and coerce pagination', () => {
    // Test string input coercion
    const valid = { page: "1", limit: "10" };
    const result = PaginationSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
    }
  });

  it('should fail invalid pagination', () => {
    const invalid = { page: -1, limit: 10 };
    const result = PaginationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should validate email', () => {
    const valid = 'test@example.com';
    const result = EmailSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('should coerce date strings', () => {
      const dateStr = "2023-01-01T00:00:00.000Z";
      const valid = {
          createdAt: dateStr,
          updatedAt: dateStr
      };
      const result = TimestampSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
          expect(result.data.createdAt).toBeInstanceOf(Date);
      }
  });
});

describe('Common DTOs', () => {
  it('should allow partial PaginationMetaDto', () => {
      const meta: PaginationMetaDto = {
          total: 100
      };
      expect(meta.total).toBe(100);
      expect(meta.page).toBeUndefined();
  });
});

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate } from './validate';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../errors/error-codes';

describe('validate', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.number().min(18),
  });

  it('should validate correct data', () => {
    const data = { name: 'John', age: 30 };
    const result = validate(schema, data);
    expect(result).toEqual(data);
  });

  it('should throw AppError on validation failure', () => {
    const data = { name: 'John', age: 10 };
    expect(() => validate(schema, data)).toThrow(AppError);
    try {
      validate(schema, data);
    } catch (error) {
      const err = error as AppError;
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe(ErrorCode.INVALID_INPUT);
      expect(err.message).toContain('age: Number must be greater than or equal to 18');
    }
  });
});

import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate } from './validate';
import { AppError } from './AppError';
import { ErrorCode, ErrorCategory } from './error-codes';

describe('validate', () => {
  const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(18, 'Age must be at least 18'),
    email: z.string().email('Invalid email').optional(),
  });

  it('should return valid data when input matches schema', () => {
    const validData = {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    };

    const result = validate(schema, validData);

    expect(result).toEqual(validData);
  });

  it('should strip unknown keys if schema allows it (default zod behavior is strict or strip?)', () => {
    // Zod default is strip unknown keys when parsing
    const dataWithExtra = {
      name: 'Jane Doe',
      age: 25,
      extra: 'field',
    };

    const result = validate(schema, dataWithExtra);

    expect(result).not.toHaveProperty('extra');
    expect(result.name).toBe('Jane Doe');
  });

  it('should throw AppError when validation fails', () => {
    const invalidData = {
      name: '', // Too short
      age: 10,  // Too young
    };

    try {
      validate(schema, invalidData);
      expect.fail('Should have thrown AppError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.message).toContain('Validation Error');
      expect(error.message).toContain('name: Name is required');
      expect(error.message).toContain('age: Age must be at least 18');
    }
  });

  it('should format nested error messages correctly', () => {
    const nestedSchema = z.object({
      user: z.object({
        profile: z.object({
          bio: z.string().min(10, 'Bio too short'),
        }),
      }),
    });

    const invalidNestedData = {
      user: {
        profile: {
          bio: 'short',
        },
      },
    };

    try {
      validate(nestedSchema, invalidNestedData);
      expect.fail('Should have thrown AppError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toContain('user.profile.bio: Bio too short');
    }
  });

  it('should handle array validation errors', () => {
    const arraySchema = z.object({
      tags: z.array(z.string().min(3, 'Tag too short')),
    });

    const invalidArrayData = {
      tags: ['ab', 'valid'],
    };

    try {
      validate(arraySchema, invalidArrayData);
      expect.fail('Should have thrown AppError');
    } catch (error: any) {
      expect(error).toBeInstanceOf(AppError);
      // Zod path for array is tags.0
      expect(error.message).toContain('tags.0: Tag too short');
    }
  });
});

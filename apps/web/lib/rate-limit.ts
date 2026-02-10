import { AppError } from '../errors/AppError';
import { ErrorCategory,ErrorCode } from '../errors/error-codes';

// Simple in-memory store for demonstration. In production, use Redis.
const store = new Map<string, number[]>();

export function checkRateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  const timestamps = store.get(key) || [];

  // Filter out old timestamps
  const validTimestamps = timestamps.filter(t => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    throw new AppError(
      'Rate limit exceeded',
      429,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCategory.SYSTEM
    );
  }

  validTimestamps.push(now);
  store.set(key, validTimestamps);
}

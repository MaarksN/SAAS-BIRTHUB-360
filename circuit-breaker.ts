import { AppError } from '../errors/AppError';
import { ErrorCategory,ErrorCode } from '../errors/error-codes';

enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN,
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold: number;
  private readonly resetTimeout: number;

  constructor(threshold = 5, resetTimeout = 10000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new AppError(
          'Service Unavailable (Circuit Breaker)',
          503,
          ErrorCode.SERVICE_UNAVAILABLE,
          ErrorCategory.SYSTEM
        );
      }
    }

    try {
      const result = await fn();
      if (this.state === CircuitState.HALF_OPEN) {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      if (this.failures >= this.threshold) {
        this.state = CircuitState.OPEN;
      }
      throw error;
    }
  }
}

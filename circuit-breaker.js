import { AppError } from '../errors/AppError';
import { ErrorCategory, ErrorCode } from '../errors/error-codes';
var CircuitState;
(function (CircuitState) {
    CircuitState[CircuitState["CLOSED"] = 0] = "CLOSED";
    CircuitState[CircuitState["OPEN"] = 1] = "OPEN";
    CircuitState[CircuitState["HALF_OPEN"] = 2] = "HALF_OPEN";
})(CircuitState || (CircuitState = {}));
export class CircuitBreaker {
    state = CircuitState.CLOSED;
    failures = 0;
    lastFailureTime = 0;
    threshold;
    resetTimeout;
    constructor(threshold = 5, resetTimeout = 10000) {
        this.threshold = threshold;
        this.resetTimeout = resetTimeout;
    }
    async execute(fn) {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = CircuitState.HALF_OPEN;
            }
            else {
                throw new AppError('Service Unavailable (Circuit Breaker)', 503, ErrorCode.SERVICE_UNAVAILABLE, ErrorCategory.SYSTEM);
            }
        }
        try {
            const result = await fn();
            if (this.state === CircuitState.HALF_OPEN) {
                this.state = CircuitState.CLOSED;
                this.failures = 0;
            }
            return result;
        }
        catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();
            if (this.failures >= this.threshold) {
                this.state = CircuitState.OPEN;
            }
            throw error;
        }
    }
}

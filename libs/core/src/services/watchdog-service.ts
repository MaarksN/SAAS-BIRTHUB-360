import Redis from 'ioredis';

export class WatchdogService {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
  }

  async monitorHealth() {
    const health = {
      queueSize: await this.checkQueueSize(),
      errorRate: await this.checkErrorRate(),
      status: 'healthy',
    };

    if (health.queueSize > 1000) {
      console.warn('Watchdog Alert: High Queue Size. Triggering scaling...');
      // Logic to auto-scale workers (e.g. K8s API or just logging for now)
      health.status = 'degraded';
    }

    if (health.errorRate > 0.05) {
      console.error('Watchdog Alert: High Error Rate. Pausing new jobs...');
      // Logic to pause queue
      health.status = 'critical';
    }

    return health;
  }

  private async checkQueueSize(): Promise<number> {
    return await this.redis.llen('ai:agents:crawl_queue');
  }

  private async checkErrorRate(): Promise<number> {
    // Mock metric: errors / total in last minute
    // In prod, read from Prometheus/OpenTelemetry
    return 0.01;
  }
}

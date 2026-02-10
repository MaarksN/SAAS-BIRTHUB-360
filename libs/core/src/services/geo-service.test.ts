import { describe, it, expect, vi } from 'vitest';
import { GeoService } from './geo-service';

describe('GeoService', () => {
  it('should be defined', () => {
    const service = new GeoService({
      redisUrl: 'redis://localhost:6379',
      googleMapsKey: 'test',
      serpApiKey: 'test'
    });
    expect(service).toBeDefined();
  });

  // Mocking Redis and Axios would be better, but for now just instantiation test.
});

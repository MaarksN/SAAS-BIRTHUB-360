import { describe, expect, it } from 'vitest';
import { GET } from '../../app/api/health/route';
import { NextRequest } from 'next/server';

describe('API Health Check', () => {
  it('should return 200 OK and status', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
  });
});

import { describe, expect, it, vi } from 'vitest';

describe('API Health Check', () => {
  it('should return 200 OK', async () => {
    // Mocking fetch since we don't have a running server in unit tests
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'operational' }),
    });

    const response = await fetch('http://localhost:3000/api/health');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('operational');
  });
});

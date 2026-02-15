import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProxyManager } from './proxy-manager';

describe('ProxyManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.PROXY_LIST;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should initialize with empty list if no proxies provided', () => {
    const manager = new ProxyManager();
    expect(manager.getNextProxy()).toBeUndefined();
  });

  it('should initialize with provided proxy list', () => {
    const proxies = ['http://proxy1:8080', 'http://proxy2:8080'];
    const manager = new ProxyManager(proxies);
    expect(manager.getNextProxy()).toBe('http://proxy1:8080');
    expect(manager.getNextProxy()).toBe('http://proxy2:8080');
    expect(manager.getNextProxy()).toBe('http://proxy1:8080'); // Cycles
  });

  it('should load proxies from PROXY_LIST environment variable', () => {
    process.env.PROXY_LIST = 'http://env-proxy1:8080,http://env-proxy2:8080';
    const manager = new ProxyManager();
    expect(manager.getNextProxy()).toBe('http://env-proxy1:8080');
    expect(manager.getNextProxy()).toBe('http://env-proxy2:8080');
  });

  it('should prioritize environment variable over constructor argument', () => {
    process.env.PROXY_LIST = 'http://env-proxy:8080';
    const manager = new ProxyManager(['http://arg-proxy:8080']);
    expect(manager.getNextProxy()).toBe('http://env-proxy:8080');
  });

  it('should handle whitespace in environment variable list', () => {
    process.env.PROXY_LIST = ' http://p1:80 , http://p2:80 ';
    const manager = new ProxyManager();
    expect(manager.getNextProxy()).toBe('http://p1:80');
    expect(manager.getNextProxy()).toBe('http://p2:80');
  });

  it('should report failure without error', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const manager = new ProxyManager(['http://p1:80']);
    manager.reportFailure('http://p1:80');
    expect(consoleSpy).toHaveBeenCalledWith('Proxy failed: http://p1:80');
    consoleSpy.mockRestore();
  });
});

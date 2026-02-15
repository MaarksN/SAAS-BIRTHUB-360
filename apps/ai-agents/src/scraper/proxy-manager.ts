export class ProxyManager {
  private proxies: string[] = [];
  private currentIndex = 0;

  constructor(initialProxies: string[] = []) {
    this.proxies = initialProxies;
    if (process.env.PROXY_LIST) {
        // Priority to env vars
        this.proxies = process.env.PROXY_LIST.split(',').map(p => p.trim()).filter(Boolean);
    }
  }

  getNextProxy(): string | undefined {
    if (this.proxies.length === 0) return undefined;
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  reportFailure(proxy: string): void {
    console.warn(`Proxy failed: ${proxy}`);
  }
}

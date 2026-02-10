export class ProxyManager {
  private proxies: string[] = [];
  private currentIndex = 0;

  constructor(proxyList?: string[]) {
    this.proxies = proxyList || [];
    // Could also load from env
    if (process.env.PROXY_LIST) {
      this.proxies = process.env.PROXY_LIST.split(',').map(p => p.trim());
    }
  }

  getNextProxy(): string | undefined {
    if (this.proxies.length === 0) return undefined;
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }

  reportFailure(proxy: string) {
    // Implement logic to remove bad proxy or reduce score
    console.warn(`Proxy failed: ${proxy}`);
  }
}

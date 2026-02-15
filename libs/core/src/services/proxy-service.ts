export class ProxyService {
  private static proxies: string[] = [
    // Placeholder list of proxies
    'http://user:pass@proxy1.example.com:8080',
    'http://user:pass@proxy2.example.com:8080',
    'http://user:pass@proxy3.example.com:8080',
  ];

  private static currentIndex = 0;

  static getRotationProxy(): string | undefined {
    if (this.proxies.length === 0) return undefined;

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

    return proxy;
  }

  static addProxy(proxy: string) {
    this.proxies.push(proxy);
  }

  static removeProxy(proxy: string) {
    this.proxies = this.proxies.filter(p => p !== proxy);
  }
}

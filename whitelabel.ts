export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  companyName: string;
}

export class WhiteLabelService {
  private config: ThemeConfig = {
    primaryColor: '#0070f3',
    secondaryColor: '#000000',
    logoUrl: '/logo.png',
    companyName: 'SalesOS'
  };

  updateConfig(newConfig: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('White label config updated:', this.config);
  }

  getConfig(): ThemeConfig {
    return this.config;
  }
}

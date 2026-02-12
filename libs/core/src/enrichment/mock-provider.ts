import { IEnrichmentProvider, EnrichmentData } from './provider';

export class MockEnrichmentProvider implements IEnrichmentProvider {
  async enrichPerson(email: string): Promise<EnrichmentData | null> {
    console.log(`[Enrichment] Mock lookup for ${email}`);

    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 800));

    if (email.includes('fail')) return null;

    return {
      email,
      phone: '+1 (555) 012-3456',
      linkedinUrl: `https://linkedin.com/in/${email.split('@')[0]}`,
      companyName: 'Acme Corp (Enriched)',
      employees: 500,
      industry: 'Software'
    };
  }

  async enrichCompany(domain: string): Promise<EnrichmentData | null> {
    return {
      companyName: 'Acme Corp',
      industry: 'Tech',
      employees: 1000
    };
  }

  async getBalance(): Promise<number> {
    return 100;
  }
}

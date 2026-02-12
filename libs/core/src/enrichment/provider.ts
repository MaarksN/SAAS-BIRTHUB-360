export interface EnrichmentData {
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  companyName?: string;
  employees?: number;
  industry?: string;
}

export interface IEnrichmentProvider {
  enrichPerson(email: string): Promise<EnrichmentData | null>;
  enrichCompany(domain: string): Promise<EnrichmentData | null>;
  getBalance(): Promise<number>;
}

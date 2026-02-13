export interface ICNPJEnrichmentResult {
  cnpj: string;
  legalName: string;
  tradeName: string;
  foundedDate: string;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phones: string[];
  emails: string[];
  cnae: {
    code: string;
    description: string;
  };
}

export interface IDataReliabilityScore {
  companyId: string;
  overallScore: number;
  factors: {
    recency: number;
    completeness: number;
    consistency: number;
    sourceCredibility: number;
  };
}

export interface IInactiveCompanyDetection {
  isInactive: boolean;
  reason?: string;
}

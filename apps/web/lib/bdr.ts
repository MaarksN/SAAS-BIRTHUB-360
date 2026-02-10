export interface IBuyingCommitteeMap {
  companyId: string;
  contacts: {
    name: string;
    role: string;
    influenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export interface IEmailValidation {
  email: string;
  isValid: boolean;
  score: number;
}

export interface IMessageGeneration {
  subject: string;
  body: string;
}

// ... more interfaces

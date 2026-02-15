import { IChurnRisk, IQBRAgenda } from '../lib/roles';

export class AccountManagerService {
  // 1. Alerta de Risco de Churn
  async monitorChurnRisk(accountId: string): Promise<IChurnRisk> {
    return {
      accountId,
      riskScore: 65, // 0-100
      factors: ['Low Login Rate', 'Support Ticket Escalation', 'Decreased Usage']
    };
  }

  // 2. Gerador de Pauta para QBR
  async generateQBRAgenda(accountId: string): Promise<IQBRAgenda> {
    return {
      accountId,
      topics: ['Review of Last Quarter Goals', 'Usage Analysis', 'Upcoming Features Roadmap', 'Renewal Discussion'],
      goals: ['Confirm Renewal', 'Identify Upsell Opportunity']
    };
  }
}

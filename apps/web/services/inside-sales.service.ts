import { IProposal, IBattleCard } from '../lib/roles';

export class InsideSalesService {
  // 1. Gerador de Propostas Personalizadas
  async generateProposal(dealId: string, template: string): Promise<IProposal> {
    return {
      dealId,
      content: `Proposal for ${dealId} based on ${template}`,
      value: 5000 // Mock value
    };
  }

  // 2. Análise de Concorrência (Battle Cards)
  async generateBattleCard(competitor: string): Promise<IBattleCard> {
    return {
      competitor,
      strengths: ['Brand', 'Global Reach'],
      weaknesses: ['Slow Support', 'High Price'],
      killPoints: ['We are 2x faster', 'We are 50% cheaper']
    };
  }
}

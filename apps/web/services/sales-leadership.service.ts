import {
  ICoachingInsight,
  IPipelineAnalysis,
  IGoalPlan,
  IWeeklyReport,
  IChannelEfficiency,
  IOnboardingTrack,
  IMarketTrend,
  ISalesScenario
} from '../lib/roles';

export class SalesTeamLeadService {
  // 1. Coach de Vendas IA
  async coachSales(repId: string): Promise<ICoachingInsight> {
    return {
      repId,
      strength: 'Closing',
      areaForImprovement: 'Discovery',
      suggestedAction: 'Review "Questioning Techniques" module.'
    };
  }

  // 2. Analisador de Pipeline da Equipe
  async analyzeTeamPipeline(teamId: string): Promise<IPipelineAnalysis> {
    return {
      riskDeals: 3,
      totalValue: 500000,
      bottleneckStage: 'Demo'
    };
  }
}

export class SalesManagerService {
  // 1. Planejador Estratégico de Metas
  async planGoals(targetRevenue: number): Promise<IGoalPlan> {
    return {
      period: 'Q4',
      revenueTarget: targetRevenue,
      kpis: {
        callsPerDay: 50,
        demosPerWeek: 5,
        closeRate: 0.2
      }
    };
  }

  // 2. Relatório Semanal Automático
  async generateWeeklyReport(teamId: string): Promise<IWeeklyReport> {
    return {
      week: 'Week 42',
      highlights: ['Rep A hit 120% quota', 'Closed Deal X'],
      challenges: ['Low demo volume in Mid-Market'],
      metrics: {
        totalRevenue: 150000,
        newPipeline: 300000
      }
    };
  }
}

export class HeadOfSalesService {
  // 1. Analisador de Eficiência de Canais
  async analyzeChannelEfficiency(): Promise<IChannelEfficiency[]> {
    return [
      { channel: 'Outbound', roi: 4.5, cac: 1500, conversionRate: 0.03 },
      { channel: 'Inbound', roi: 6.0, cac: 800, conversionRate: 0.08 }
    ];
  }

  // 2. Ferramenta de Onboarding de Vendas IA
  async createOnboardingTrack(role: string): Promise<IOnboardingTrack> {
    return {
      role,
      modules: ['Company Culture', 'Product Deep Dive', 'Sales Methodology', 'CRM Training'],
      durationWeeks: 4
    };
  }
}

export class SalesDirectorService {
  // 1. Analisador de Tendências de Mercado
  async analyzeMarketTrends(industry: string): Promise<IMarketTrend[]> {
    return [
      { trend: 'AI Adoption', impact: 'High', source: 'Gartner' },
      { trend: 'Remote Selling', impact: 'Medium', source: 'Forrester' }
    ];
  }

  // 2. Simulador de Cenários de Vendas
  async simulateSalesScenarios(params: any): Promise<ISalesScenario> {
    return {
      name: 'Hire 2 SDRs',
      inputChanges: { headCount: '+2 SDR' },
      projectedOutcome: { revenueIncrease: '15%', costIncrease: '5%' }
    };
  }
}

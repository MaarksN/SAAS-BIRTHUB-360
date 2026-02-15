export interface IProposal {
  dealId: string;
  content: string;
  value: number;
}

export interface IBattleCard {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  killPoints: string[];
}

export interface IChurnRisk {
  accountId: string;
  riskScore: number;
  factors: string[];
}

export interface IQBRAgenda {
  accountId: string;
  topics: string[];
  goals: string[];
}

export interface IRelationshipMap {
  accountId: string;
  keyStakeholders: { name: string; role: string; influence: string }[];
  pathways: string[];
}

export interface IStrategicNews {
  headline: string;
  source: string;
  relevance: string;
  date: Date;
}

export interface ICoachingInsight {
  repId: string;
  strength: string;
  areaForImprovement: string;
  suggestedAction: string;
}

export interface IPipelineAnalysis {
  riskDeals: number;
  totalValue: number;
  bottleneckStage: string;
}

export interface IGoalPlan {
  period: string;
  revenueTarget: number;
  kpis: Record<string, number>;
}

export interface IWeeklyReport {
  week: string;
  highlights: string[];
  challenges: string[];
  metrics: Record<string, any>;
}

export interface IChannelEfficiency {
  channel: string;
  roi: number;
  cac: number;
  conversionRate: number;
}

export interface IOnboardingTrack {
  role: string;
  modules: string[];
  durationWeeks: number;
}

export interface IMarketTrend {
  trend: string;
  impact: string;
  source: string;
}

export interface ISalesScenario {
  name: string;
  inputChanges: Record<string, any>;
  projectedOutcome: Record<string, any>;
}

export interface ISuccessPlan {
  customerId: string;
  milestones: { name: string; dueDate: Date }[];
  successMetrics: string[];
}

export interface ISentimentAnalysis {
  score: number; // -1 to 1
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  keywords: string[];
}

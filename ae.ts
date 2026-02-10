export interface IMeetingAnalysis {
  summary: string;
  sentiment: string;
  actionItems: string[];
}

export interface IProposal {
  dealId: string;
  content: string;
  totalValue: number;
}

// ... more interfaces

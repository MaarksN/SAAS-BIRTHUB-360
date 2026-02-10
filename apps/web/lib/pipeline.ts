export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
}

export const pipelineService = {
  getDeals: async (): Promise<Deal[]> => {
    return [
      { id: 'd1', title: 'Enterprise License - Corp Inc', value: 50000, stage: 'Negotiation' },
      { id: 'd2', title: 'Starter Plan - StartUp', value: 5000, stage: 'Discovery' },
    ];
  }
};

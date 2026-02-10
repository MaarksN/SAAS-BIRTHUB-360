export interface SequenceStep {
  day: number;
  type: 'EMAIL' | 'LINKEDIN_CONNECT' | 'CALL';
  templateId: string;
}

export interface Sequence {
  id: string;
  name: string;
  steps: SequenceStep[];
}

export const sequenceBuilder = {
  create: async (name: string, steps: SequenceStep[]): Promise<Sequence> => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name,
      steps
    };
  },
  list: async (): Promise<Sequence[]> => {
    return [
      {
        id: 's1',
        name: 'Cold Outreach - SaaS Founders',
        steps: [
          { day: 0, type: 'EMAIL', templateId: 't1' },
          { day: 2, type: 'LINKEDIN_CONNECT', templateId: 't2' },
          { day: 5, type: 'EMAIL', templateId: 't3' }
        ]
      }
    ];
  }
};

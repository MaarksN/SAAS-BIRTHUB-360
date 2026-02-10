export const sequenceBuilder = {
    create: async (name, steps) => {
        return {
            id: Math.random().toString(36).substr(2, 9),
            name,
            steps
        };
    },
    list: async () => {
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

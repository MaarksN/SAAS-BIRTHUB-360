export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export const emailClient = {
  getInbox: async (): Promise<Email[]> => {
    return [
      {
        id: 'e1',
        from: 'prospect@target.com',
        to: 'me@salesos.io',
        subject: 'Re: Partnership Opportunity',
        body: 'Hi, thanks for reaching out. Let\'s chat next week.',
        timestamp: new Date().toISOString(),
        read: false
      },
      {
        id: 'e2',
        from: 'newsletter@industry.com',
        to: 'me@salesos.io',
        subject: 'Weekly Trends',
        body: 'Here are the latest trends in SaaS...',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: true
      }
    ];
  },
  sendEmail: async (to: string, subject: string, body: string) => {
    console.log(`Sending email to ${to}: ${subject}`);
    return { success: true, id: Math.random().toString(36).substr(2, 9) };
  }
};

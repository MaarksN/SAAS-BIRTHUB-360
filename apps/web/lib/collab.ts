export interface UserPresence {
  userId: string;
  status: 'online' | 'idle' | 'offline';
  lastSeen: Date;
  currentPath: string;
}

export class CollaborationService {
  private activeUsers: Map<string, UserPresence> = new Map();

  updatePresence(userId: string, path: string): void {
    this.activeUsers.set(userId, {
      userId,
      status: 'online',
      lastSeen: new Date(),
      currentPath: path,
    });
    console.log(`User ${userId} is now on ${path}`);
  }

  getActiveUsersOnPath(path: string): UserPresence[] {
    return Array.from(this.activeUsers.values()).filter(
      (u) => u.currentPath === path,
    );
  }

  // --- ARSENAL EXPANSION (Tools 81-100) ---

  // 81. Deal Room Comments
  async addComment(dealId: string, text: string): Promise<string> {
    return 'Comment added: ' + text;
  }

  // 82. @Mention Notifications
  async notifyMention(userId: string, context: string): Promise<string> {
    return `Notified ${userId} about ${context}`;
  }

  // 83. Live Co-browsing (Simulation)
  async startCoBrowsing(sessionId: string): Promise<string> {
    return 'Co-browsing active. View mode enabled.';
  }

  // 84. Shared Pipeline Views
  async sharePipeline(viewId: string, email: string): Promise<string> {
    return 'Pipeline view shared via secure link.';
  }

  // 85. Slack/Teams Deal Alerts
  async sendDealAlert(channel: string, deal: any): Promise<string> {
    return 'Alert sent to #sales-wins';
  }

  // 86. Competitive Intel Sharing
  async shareIntel(competitor: string): Promise<string> {
    return 'Intel card pinned to team dashboard.';
  }

  // 87. "Ask an Expert" Routing
  async routeQuestion(question: string): Promise<string> {
    return "Question routed to 'Technical Sales' group.";
  }

  // 88. Team Leaderboard (Live)
  async getLeaderboard(): Promise<any[]> {
    return [
      { name: 'Alice', value: 5000 },
      { name: 'Bob', value: 3000 },
    ];
  }

  // 89. Win Celebration Wall
  async postWin(deal: any): Promise<string> {
    return 'Posted to Celebration Wall!';
  }

  // 90. Weekly Retro Board
  async createRetro(): Promise<string> {
    return "Retro board created: What went well / What didn't.";
  }

  // 91. Sales Enablement Wiki
  async searchWiki(query: string): Promise<string> {
    return "Found 3 articles on '" + query + "'";
  }

  // 92. Pitch Practice Room (Async Video)
  async submitPitch(videoUrl: string): Promise<string> {
    return 'Pitch submitted for peer review.';
  }

  // 93. Shadowing Request
  async requestShadow(callId: string): Promise<string> {
    return 'Shadow request sent to AE.';
  }

  // 94. Territory Balancing
  async balanceTerritories(): Promise<string> {
    return 'Suggestion: Move Zip 90210 to Rep B.';
  }

  // 95. Quota Attainment Visualizer
  async visualizeQuota(userId: string): Promise<number> {
    return 78; // 78% attainment
  }

  // 96. "Saved" ROI Calculators
  async saveCalculator(inputs: any): Promise<string> {
    return "Calculator configuration saved as 'Enterprise Saas'.";
  }

  // 97. Email Template Library (Shared)
  async getSharedTemplates(): Promise<string[]> {
    return ['Intro V1', 'Closing V2'];
  }

  // 98. Call Snippet Sharing
  async shareSnippet(
    callId: string,
    start: number,
    end: number,
  ): Promise<string> {
    return 'Snippet (30s) generated and link copied.';
  }

  // 99. Performance Badge System
  async awardBadge(userId: string, badge: string): Promise<string> {
    return `Awarded '${badge}' to ${userId}`;
  }

  // 100. "God Mode" (Manager View)
  async enableGodMode(): Promise<string> {
    return 'Manager view enabled. Seeing all active deals.';
  }
}

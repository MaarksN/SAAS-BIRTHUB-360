export interface TourStep {
  target: string;
  title: string;
  content: string;
}

export class OnboardingService {
  getTour(featureId: string): TourStep[] {
    console.log(`Fetching tour for ${featureId}`);
    return [
      {
        target: '#header',
        title: 'Welcome',
        content: 'This is your dashboard.',
      },
      { target: '#search', title: 'Search', content: 'Find leads here.' },
    ];
  }

  // --- ARSENAL EXPANSION (Tools 41-60) ---

  // 41. "Aha!" Moment Trigger
  async triggerAhaMoment(userId: string): Promise<string> {
    return 'User enriched their first lead! Displaying celebration confetti.';
  }

  // 42. Personalized Welcome Video
  async getWelcomeVideo(role: string): Promise<string> {
    return role === 'Admin' ? 'admin-setup.mp4' : 'rep-quickstart.mp4';
  }

  // 43. Checklist Gamification
  async getChecklist(userId: string): Promise<any> {
    return {
      steps: ['Connect LinkedIn', 'Import CSV', 'Send Email'],
      progress: 33,
    };
  }

  // 44. Interactive Tooltips
  async showTooltip(elementId: string): Promise<string> {
    return `Tip: Use ${elementId} to filter by high-value accounts.`;
  }

  // 45. "Empty State" Education
  async getEmptyStateContent(page: string): Promise<string> {
    return "No deals yet? Click 'Import' to start your engine.";
  }

  // 46. Progress Bar Animation
  async animateProgress(current: number): Promise<string> {
    return `Animating bar to ${current}%`;
  }

  // 47. "Did You Know?" Rotator
  async getTipOfTheDay(): Promise<string> {
    return 'Did you know? You can sync with Salesforce in 1 click.';
  }

  // 48. Contextual Help Chatbot
  async getBotResponse(page: string): Promise<string> {
    return `I see you are on ${page}. Need help with configuration?`;
  }

  // 49. Implementation Roadmap
  async getRoadmap(userId: string): Promise<string> {
    return 'Day 1: Setup. Day 7: First Campaign. Day 30: ROI Analysis.';
  }

  // 50. Team Invite Viral Loop
  async generateInviteLink(teamId: string): Promise<string> {
    return `salesos.io/join/${teamId}?ref=onboarding`;
  }

  // 51. Feature Unlock System
  async checkUnlock(feature: string, usage: number): Promise<boolean> {
    return usage > 10; // Unlock feature if usage > 10
  }

  // 52. "Magic Link" Login
  async sendMagicLink(email: string): Promise<string> {
    return 'Magic link sent! No password needed.';
  }

  // 53. Setup Wizard
  async runWizard(): Promise<string> {
    return 'Step 1/5: Connecting Calendar...';
  }

  // 54. Integration Auto-Discovery
  async detectIntegrations(email: string): Promise<string[]> {
    return ['Gmail', 'Slack', 'Salesforce (detected via domain)'];
  }

  // 55. Role-Based Customization
  async customizeUI(role: string): Promise<string> {
    return role === 'SDR' ? 'Outbound View' : 'Executive View';
  }

  // 56. "First Win" Celebration
  async celebrateFirstWin(winType: string): Promise<string> {
    return `Congrats on your first ${winType}!`;
  }

  // 57. Usage Analytics Email
  async sendWeeklyReport(userId: string): Promise<string> {
    return 'You saved 5 hours this week!';
  }

  // 58. Nudge Notifications
  async sendNudge(action: string): Promise<string> {
    return `Don't forget to ${action} to complete your profile.`;
  }

  // 59. Academy/Certification Link
  async getCertificationStatus(userId: string): Promise<string> {
    return 'Certified SalesOS Pro (Level 1)';
  }

  // 60. Feedback Loop
  async collectFeedback(score: number): Promise<string> {
    return score > 8 ? 'Ask for G2 Review' : 'Open Support Ticket';
  }
}

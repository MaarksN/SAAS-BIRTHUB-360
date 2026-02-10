import { Deal } from "../types/pipeline";

export class PipelineService {

  // --- EXISTING/BASIC METHODS ---
  async getDeals(userId: string): Promise<Deal[]> {
    // Mock
    return [
      { id: "1", title: "Deal A", value: 5000, stage: "Negotiation", probability: 0.8 },
      { id: "2", title: "Deal B", value: 12000, stage: "Discovery", probability: 0.2 }
    ];
  }

  // --- CRM HUB FEATURES (TOOLS 31-40) ---

  // 31. Auto-Move Deal Stage
  async autoMoveStage(dealId: string, activityCount: number): Promise<string> {
    if (activityCount > 5) return "Recommended: Move to 'Negotiation'";
    return "Stay in 'Discovery'";
  }

  // 32. Stale Deal Alert
  async checkStaleDeals(userId: string): Promise<string[]> {
    return ["Deal A has no activity for 14 days.", "Deal C is stuck in 'Proposal' for 30 days."];
  }

  // 33. Win Probability Calculator
  async calculateWinProbability(dealId: string, metrics: any): Promise<number> {
    // Mock logic based on engagement
    let prob = 50;
    if (metrics.decisionMakerEngaged) prob += 20;
    if (metrics.budgetApproved) prob += 20;
    if (metrics.competitorsPresent) prob -= 10;
    return Math.min(prob, 99);
  }

  // 34. Next Best Action
  async getNextBestAction(dealId: string): Promise<string> {
    return "Schedule a technical demo with the CTO to address security concerns.";
  }

  // 35. Deal Health Score
  async getHealthScore(dealId: string): Promise<{ score: number, status: 'Healthy' | 'At Risk' | 'Critical' }> {
    return { score: 78, status: 'Healthy' };
  }

  // 36. Activity Logger
  async logActivity(dealId: string, type: 'CALL' | 'EMAIL' | 'MEETING', notes: string): Promise<boolean> {
    console.log(`[PipelineService] Logged ${type} for ${dealId}: ${notes}`);
    return true;
  }

  // 37. Note Sentiment Analysis
  async analyzeSentiment(notes: string): Promise<'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'> {
    if (notes.toLowerCase().includes("preço") || notes.toLowerCase().includes("caro")) return 'NEGATIVE';
    if (notes.toLowerCase().includes("gostei") || notes.toLowerCase().includes("fechar")) return 'POSITIVE';
    return 'NEUTRAL';
  }

  // 38. Task Prioritizer
  async prioritizeTasks(tasks: string[]): Promise<string[]> {
    return tasks.sort(); // Mock sorting
  }

  // 39. Meeting Scheduler Helper
  async suggestMeetingTimes(attendees: string[]): Promise<string[]> {
    return ["Tomorrow 10:00 AM", "Tomorrow 02:00 PM", "Friday 11:00 AM"];
  }

  // 40. Churn Risk Detector
  async detectChurnRisk(accountId: string): Promise<{ risk: number, factors: string[] }> {
    return { risk: 15, factors: ["Low usage last week", "Ticket open for 5 days"] };
  }
}

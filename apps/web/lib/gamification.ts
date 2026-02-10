export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface UserProgress {
  userId: string;
  points: number;
  badges: Badge[];
}

export class GamificationService {
  async awardPoints(userId: string, points: number): Promise<void> {
    console.log(`Awarded ${points} points to ${userId}`);
  }

  async unlockBadge(userId: string, badgeId: string): Promise<void> {
    console.log(`Unlocked badge ${badgeId} for ${userId}`);
  }
}

export class ExperimentService {
  isInExperiment(userId: string, experimentId: string): boolean {
    // Simple deterministic hash based on User ID
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 2 === 0; // 50/50 split
  }
}

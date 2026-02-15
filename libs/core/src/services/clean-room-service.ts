export class CleanRoomService {
  /**
   * Computes the intersection of two sets of hashes.
   * This is a simplified "Private Set Intersection" (PSI).
   * Ideally, this runs in a secure enclave, but for Node.js:
   */
  computeIntersection(datasetA: string[], datasetB: string[]): string[] {
    const setA = new Set(datasetA);
    const intersection: string[] = [];

    for (const hash of datasetB) {
      if (setA.has(hash)) {
        intersection.push(hash);
      }
    }

    return intersection;
  }

  // Helper to hash emails (SHA-256)
  static hashEmail(email: string): string {
    const { createHash } = require('crypto');
    return createHash('sha256')
      .update(email.trim().toLowerCase())
      .digest('hex');
  }
}

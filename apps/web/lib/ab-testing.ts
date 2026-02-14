// Deterministic string hashing (Jenkins One-at-a-time hash implementation)
function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
        hash += (hash << 10);
        hash ^= (hash >>> 6);
    }
    hash += (hash << 3);
    hash ^= (hash >>> 11);
    hash += (hash << 15);
    return Math.abs(hash);
}

export interface Experiment {
    id: string;
    variants: string[]; // e.g., ['control', 'test_A', 'test_B']
    weights?: number[]; // e.g., [50, 25, 25] - must sum to 100
    isActive: boolean;
}

export class ABTestingService {
    /**
     * Get the variant for a user in a specific experiment.
     * Deterministic: Always returns the same variant for the same (userId + experimentId).
     */
    static getVariant(userId: string, experiment: Experiment): string {
        if (!experiment.isActive) return experiment.variants[0]; // Default to control (first variant)

        const hashInput = `${userId}:${experiment.id}`;
        const hash = hashString(hashInput);
        const normalizedHash = hash % 100; // 0-99

        if (!experiment.weights) {
            // Equal distribution
            const index = hash % experiment.variants.length;
            return experiment.variants[index];
        }

        // Weighted distribution
        let cumulativeWeight = 0;
        for (let i = 0; i < experiment.variants.length; i++) {
            cumulativeWeight += experiment.weights[i];
            if (normalizedHash < cumulativeWeight) {
                return experiment.variants[i];
            }
        }

        return experiment.variants[0]; // Fallback
    }

    /**
     * Log exposure event (mock implementation).
     * In production, this would send data to PostHog, Mixpanel, or internal analytics.
     */
    static trackExposure(userId: string, experimentId: string, variant: string) {
        console.log(`[AB-TEST] User ${userId} exposed to experiment ${experimentId} variant: ${variant}`);
        // Analytics.track('Experiment Exposure', { experimentId, variant, userId });
    }
}

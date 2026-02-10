export const FeatureFlags = {
  AI_ENABLED: 'AI_ENABLED',
  BILLING_ENABLED: 'BILLING_ENABLED',
} as const;

export type FeatureFlag = keyof typeof FeatureFlags;

// Default states if env var is missing
const DEFAULTS: Record<FeatureFlag, boolean> = {
  AI_ENABLED: true,
  BILLING_ENABLED: true,
};

export const features = {
  isEnabled: (flag: FeatureFlag): boolean => {
    // Check env var first (e.g. FEATURE_AI_ENABLED)
    const envKey = `FEATURE_${flag}`;
    // process.env is available in Node.js
    if (typeof process !== 'undefined' && process.env[envKey] !== undefined) {
      return process.env[envKey] === 'true';
    }
    return DEFAULTS[flag];
  }
};

export const FeatureFlags = {
    AI_ENABLED: 'AI_ENABLED',
    BILLING_ENABLED: 'BILLING_ENABLED',
};
// Default states if env var is missing
const DEFAULTS = {
    AI_ENABLED: true,
    BILLING_ENABLED: true,
};
export const features = {
    isEnabled: (flag) => {
        // Check env var first (e.g. FEATURE_AI_ENABLED)
        const envKey = `FEATURE_${flag}`;
        // process.env is available in Node.js
        if (typeof process !== 'undefined' && process.env[envKey] !== undefined) {
            return process.env[envKey] === 'true';
        }
        return DEFAULTS[flag];
    }
};

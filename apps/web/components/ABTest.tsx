import { ReactNode } from 'react';
import { useABTest } from '../hooks/use-ab-test';
import { Experiment } from '../lib/ab-testing';

interface ABTestProps {
    experimentId: string;
    userId: string;
    variants: Record<string, ReactNode>;
    weights?: number[];
    fallback?: ReactNode; // Fallback if user ID is missing or experiment fails
}

export function ABTest({ experimentId, userId, variants, weights, fallback }: ABTestProps) {
    const experiment: Experiment = {
        id: experimentId,
        variants: Object.keys(variants),
        weights: weights || new Array(Object.keys(variants).length).fill(100 / Object.keys(variants).length),
        isActive: true
    };

    const { variant, loading } = useABTest(userId, experiment);

    if (loading) return fallback || variants[experiment.variants[0]]; // Show loading or default

    return <>{variants[variant]}</>;
}

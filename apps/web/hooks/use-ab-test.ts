import { useEffect,useState } from 'react';

import { ABTestingService, Experiment } from '../lib/ab-testing';

export function useABTest(userId: string, experiment: Experiment) {
  const [variant, setVariant] = useState<string>('control'); // Default to control
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const assignedVariant = ABTestingService.getVariant(userId, experiment);

    // Log exposure only once per session/visit (in a real app, this might be debounced or checked against a session store)
    ABTestingService.trackExposure(userId, experiment.id, assignedVariant);

    setVariant(assignedVariant);
    setLoading(false);
  }, [userId, experiment.id]);

  return { variant, loading };
}

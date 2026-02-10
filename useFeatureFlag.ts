import { useEffect,useState } from 'react';

import { FeatureFlag,features } from '../features';

export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [isEnabled, setIsEnabled] = useState<boolean>(features.isEnabled(flag));

  useEffect(() => {
    // In a real app, this might subscribe to a feature flag service or context
    setIsEnabled(features.isEnabled(flag));
  }, [flag]);

  return isEnabled;
}

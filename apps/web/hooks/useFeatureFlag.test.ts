import { renderHook } from '@testing-library/react';
import { describe, expect,it } from 'vitest';

import { useFeatureFlag } from './useFeatureFlag';

describe('useFeatureFlag', () => {
  it('should return default value for known flag', () => {
    const { result } = renderHook(() => useFeatureFlag('AI_ENABLED'));
    expect(result.current).toBe(true);
  });
});

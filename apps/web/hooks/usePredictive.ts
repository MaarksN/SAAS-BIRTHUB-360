"use client";

import { useEffect, useState } from 'react';

export function usePredictivePrefetch<T>(fetcher: () => Promise<T>, triggerSelector: string) {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll(triggerSelector);

    const handleMouseEnter = () => {
      if (!data) {
        console.log(`Predictively fetching data for ${triggerSelector}...`);
        fetcher().then(setData);
      }
    };

    elements.forEach(el => el.addEventListener('mouseenter', handleMouseEnter));

    return () => {
      elements.forEach(el => el.removeEventListener('mouseenter', handleMouseEnter));
    };
  }, [triggerSelector, fetcher, data]);

  return data;
}

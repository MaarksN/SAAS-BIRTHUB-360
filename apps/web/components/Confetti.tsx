'use client';
import React, { useEffect, useState } from 'react';

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-start justify-center pt-20">
      <div className="animate-bounce text-6xl">🎉</div>
    </div>
  );
};

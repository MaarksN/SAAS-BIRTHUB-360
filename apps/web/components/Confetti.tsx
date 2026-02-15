'use client';
import React, { useEffect, useState } from 'react';

export const Confetti: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex justify-center items-start pt-20">
      <div className="animate-bounce text-6xl">🎉</div>
    </div>
  );
};

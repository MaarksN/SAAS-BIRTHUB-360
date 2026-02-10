'use client';

import React from 'react';

export function ThemeColorPicker() {
  return (
    <input
       type="color"
       className="w-8 h-8 rounded cursor-pointer border-0 p-0"
       onChange={(e) => {
          document.documentElement.style.setProperty('--primary-color', e.target.value);
          if (typeof window !== "undefined") {
              localStorage.setItem('theme_color', e.target.value);
          }
       }}
       title="Escolher cor do tema"
    />
  );
}

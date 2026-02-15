import React from 'react';

const stringToColor = (str: string) => {
  let hash = 0;
  // Algoritmo simples de hash DJB2 ou similar
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // HSL: Hue (0-360), Saturation (70% - vibrante), Lightness (50% - legível)
  return `hsl(${hash % 360}, 70%, 50%)`;
};

interface AvatarHashProps {
  name: string;
  className?: string;
}

export const AvatarHash = ({ name, className }: AvatarHashProps) => {
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${className || ''}`}
      style={{ backgroundColor: stringToColor(name) }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

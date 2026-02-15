import * as React from "react";

interface BadgeProps {
  label: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, color = 'blue', className }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[color]} ${className || ""}`}>
      {label}
    </span>
  );
};

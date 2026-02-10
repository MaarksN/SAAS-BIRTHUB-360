import * as React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`animate-pulse bg-slate-700/50 rounded ${className || ""}`}></div>
  );
};

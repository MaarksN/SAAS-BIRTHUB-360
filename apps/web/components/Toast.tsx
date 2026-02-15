import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import * as React from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: <CheckCircle className="size-5" />,
    error: <XCircle className="size-5" />,
    warning: <AlertTriangle className="size-5" />,
    info: <Info className="size-5" />,
  };

  return (
    <div
      className={`animate-in slide-in-from-bottom-5 fade-in fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full px-6 py-3 text-white shadow-2xl duration-300 ${colors[type]}`}
    >
      {icons[type]}
      <span className="text-xs font-bold uppercase tracking-widest">
        {message}
      </span>
    </div>
  );
};

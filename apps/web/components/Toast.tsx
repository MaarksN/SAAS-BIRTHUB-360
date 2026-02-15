import * as React from "react";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
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
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full text-white shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 z-50 ${colors[type]}`}>
      {icons[type]}
      <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
    </div>
  );
};

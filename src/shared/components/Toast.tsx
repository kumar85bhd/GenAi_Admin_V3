import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<ToastMessage & { onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  };

  const icons = {
    success: <CheckCircle size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-indigo-500" />
  };

  return (
    <div className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-neutral-200/50 dark:shadow-none min-w-[300px] animate-in slide-in-from-bottom-5 fade-in duration-300 ${styles[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black/10">
        <X size={14} />
      </button>
    </div>
  );
};

export default ToastContainer;

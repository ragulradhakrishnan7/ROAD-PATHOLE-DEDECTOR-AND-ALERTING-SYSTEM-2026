import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const ICONS = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    error: <XCircle className="w-5 h-5 text-rose-500" />,
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start space-x-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-5">
      <div className="mt-0.5">{ICONS[toast.type]}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{toast.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

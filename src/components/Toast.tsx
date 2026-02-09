import React from 'react';
import { useToast } from '../context/ToastContext';

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          <span>{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="toast-close" aria-label="Close">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;

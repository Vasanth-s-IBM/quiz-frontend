import React from 'react';
import { useToast } from '../context/ToastContext';
import { CheckIcon, XIcon, AlertTriangleIcon, InfoIcon } from './Icons';

const ICONS: Record<string, React.ReactNode> = {
  success: <CheckIcon size={16} />,
  error:   <XIcon size={16} />,
  warning: <AlertTriangleIcon size={16} />,
  info:    <InfoIcon size={16} />,
};

const TITLES: Record<string, string> = {
  success: 'Success', error: 'Error', warning: 'Warning', info: 'Info',
};

const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          <span className="toast-icon">{ICONS[toast.type]}</span>
          <div className="toast-body">
            <div className="toast-title">{TITLES[toast.type]}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Dismiss">
            <XIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;

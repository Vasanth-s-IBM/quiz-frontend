import React from 'react';
import { AlertTriangleIcon, CheckIcon, XIcon } from './Icons';

interface ConfirmModalProps {
  title: string; message: string;
  confirmLabel?: string; cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void; onCancel: () => void;
}

const ICONS: Record<string, React.ReactNode> = {
  danger:  <AlertTriangleIcon size={32} />,
  warning: <AlertTriangleIcon size={32} />,
  primary: <CheckIcon size={32} />,
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', onConfirm, onCancel,
}) => (
  <div className="confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
    <div className="confirm-box">
      <div className="confirm-icon">{ICONS[variant]}</div>
      <h3 id="confirm-title">{title}</h3>
      <p>{message}</p>
      <div className="confirm-actions">
        <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
        <button className={`btn-${variant}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

export default ConfirmModal;

import React from 'react';
import { ClockIcon, ArrowRightIcon } from './Icons';

interface Props { onLogin: () => void; }

const SessionExpiredModal: React.FC<Props> = ({ onLogin }) => (
  <div className="session-overlay" role="dialog" aria-modal="true" aria-labelledby="session-title">
    <div className="session-box">
      <div className="session-icon">
        <ClockIcon size={32} />
      </div>
      <h3 id="session-title">Session Ended</h3>
      <p>Your session has expired due to inactivity. Please sign in again to continue.</p>
      <button className="btn-primary btn-lg btn-full" onClick={onLogin}>
        Go to Login <ArrowRightIcon size={16} />
      </button>
    </div>
  </div>
);

export default SessionExpiredModal;

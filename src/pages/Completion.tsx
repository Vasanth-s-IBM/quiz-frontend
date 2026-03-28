import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CheckIcon, XIcon, AlertTriangleIcon, ClockIcon, UserIcon, ArrowLeftIcon } from '../components/Icons';

const Completion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) { navigate('/topics'); return null; }

  const passed = result.percentage >= 60;

  return (
    <div className="completion-page" role="main">
      <Header />
      <div className="completion-body">
        <div className="completion-card">
          <div
            className="completion-icon"
            style={!passed ? {
              background: 'var(--danger-light)', color: 'var(--danger)',
              boxShadow: '0 0 0 10px rgba(239,68,68,.08)'
            } : {}}
          >
            {passed ? <CheckIcon size={36} /> : <XIcon size={36} />}
          </div>

          <h1 style={{ marginBottom: '1.5rem' }}>{passed ? 'Exam Completed!' : 'Exam Submitted'}</h1>

          <div className="score-card">
            <h2>Your Score</h2>
            <div className="score-display">
              <span className="score-num" style={{ color: passed ? 'var(--primary)' : 'var(--danger)' }}>
                {result.score}
              </span>
              <span className="score-total">/ {result.total_questions}</span>
            </div>
            <div className="score-pct">{result.percentage}%</div>
          </div>

          {result.malpractice_detected && (
            <div className="malpractice-banner" role="alert">
              <AlertTriangleIcon size={16} />
              Malpractice was detected during your exam. This has been flagged for review.
            </div>
          )}

          <div className="review-banner" role="status">
            <ClockIcon size={16} />
            Your result is <strong style={{ marginLeft: '.25rem' }}>under review</strong>. You'll receive an update shortly.
          </div>

          <div className="completion-actions">
            <button className="btn-primary btn-lg" onClick={() => navigate('/profile')}>
              <UserIcon size={16} /> View My Results
            </button>
            <button className="btn-secondary btn-lg" onClick={() => navigate('/topics')}>
              <ArrowLeftIcon size={16} /> Back to Topics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Completion;

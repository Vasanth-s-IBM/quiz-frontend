import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { CheckIcon, AlertTriangleIcon, ClockIcon, UserIcon, ArrowLeftIcon } from '../components/Icons';

const Completion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) { navigate('/topics'); return null; }

  return (
    <div className="completion-page" role="main">
      <Header />
      <div className="completion-body">
        <div className="completion-card">
          <div className="completion-icon">
            <CheckIcon size={36} />
          </div>

          <h1 style={{ marginBottom: '.75rem' }}>Exam Submitted!</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '.95rem' }}>
            Thank you for completing the exam.
          </p>

          {result.malpractice_detected && (
            <div className="malpractice-banner" role="alert">
              <AlertTriangleIcon size={16} />
              Malpractice was detected during your exam. This has been flagged for review.
            </div>
          )}

          <div className="review-banner" role="status">
            <ClockIcon size={16} />
            Your result is <strong style={{ marginLeft: '.25rem' }}>under review</strong>. You'll be notified once it's approved.
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

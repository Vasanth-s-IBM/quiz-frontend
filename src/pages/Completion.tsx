import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Completion: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    navigate('/topics');
    return null;
  }

  return (
    <div className="completion-page">
      <div className="completion-card">
        <div className="success-icon">✓</div>
        <h1>Exam Completed!</h1>

        <div className="result-box">
          <h2>Your Score</h2>
          <div className="score-display">
            <span className="score">{result.score}</span>
            <span className="total">/ {result.total_questions}</span>
          </div>
          <div className="percentage">{result.percentage}%</div>
        </div>

        {result.malpractice_detected && (
          <div className="malpractice-warning">
            ⚠️ Malpractice detected during exam
          </div>
        )}

        <div className="message-box">
          <p>🕐 Your result is <strong>under review</strong>. You will get an update shortly.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/profile')} className="btn-primary">
            View My Profile
          </button>
          <button onClick={() => navigate('/topics')} className="btn-secondary">
            Back to Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Completion;

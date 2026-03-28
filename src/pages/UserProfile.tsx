import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Loader from '../components/Loader';

interface Result {
  id: number;
  topic_id: number;
  topic_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  certificate_status: string;
  certificate_issued: boolean;
  created_at: string;
}

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
  in_review: { label: 'In Review',  className: 'status-review',    icon: '🕐' },
  approved:  { label: 'Approved',   className: 'status-approved',  icon: '✅' },
  rejected:  { label: 'Rejected',   className: 'status-rejected',  icon: '❌' },
};

const UserProfile: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setResults(res.data);
    } catch {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (scoreId: number, topicName: string) => {
    setDownloading(scoreId);
    try {
      const res = await userAPI.downloadCertificate(scoreId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate_${topicName.replace(/\s+/g, '_')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showToast('Failed to download certificate', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleRetry = (topicId: number) => {
    navigate(`/instructions/${topicId}`);
  };

  if (loading) return <Loader />;

  return (
    <div className="topics-page">
      <Header />
      <div className="topics-container">
        <h1>My Results</h1>

        {results.length === 0 ? (
          <div className="profile-empty">
            <p>You haven't taken any exams yet.</p>
            <button className="btn-primary" onClick={() => navigate('/topics')}>
              Browse Topics
            </button>
          </div>
        ) : (
          <div className="profile-results">
            {results.map((result) => {
              const st = statusConfig[result.certificate_status] ?? statusConfig['in_review'];
              return (
                <div key={result.id} className="profile-card">
                  <div className="profile-card-header">
                    <h3>{result.topic_name}</h3>
                    <span className={`cert-status-badge ${st.className}`}>
                      {st.icon} {st.label}
                    </span>
                  </div>

                  <div className="profile-card-body">
                    {result.certificate_status !== 'in_review' && (
                      <>
                        <div className="profile-stat">
                          <span className="profile-stat-label">Score</span>
                          <span className="profile-stat-value">{result.score} / {result.total_marks}</span>
                        </div>
                        <div className="profile-stat">
                          <span className="profile-stat-label">Percentage</span>
                          <span className="profile-stat-value">{result.percentage}%</span>
                        </div>
                        <div className="profile-stat">
                          <span className="profile-stat-label">Grade</span>
                          <span className="profile-stat-value">{result.grade}</span>
                        </div>
                      </>
                    )}
                    <div className="profile-stat">
                      <span className="profile-stat-label">Date</span>
                      <span className="profile-stat-value">
                        {new Date(result.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {result.certificate_status === 'in_review' && (
                    <div className="profile-banner banner-review">
                      🕐 Your test is under review. You will get an update shortly.
                    </div>
                  )}
                  {result.certificate_status === 'rejected' && (
                    <div className="profile-banner banner-rejected">
                      ❌ Your certificate request was rejected.
                    </div>
                  )}

                  <div className="profile-card-actions">
                    <button
                      className="btn-success"
                      disabled={result.certificate_status !== 'approved' || downloading === result.id}
                      onClick={() => handleDownload(result.id, result.topic_name)}
                    >
                      {downloading === result.id ? 'Downloading...' : '⬇ Download Certificate'}
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => handleRetry(result.topic_id)}
                    >
                      🔄 Retry Test
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

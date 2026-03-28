import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import { SkeletonGrid } from '../components/Loader';
import {
  AwardIcon, DownloadIcon, RefreshIcon, ClockIcon,
  CheckIcon, XIcon, BookIcon, ArrowRightIcon
} from '../components/Icons';

interface Result {
  id: number; topic_id: number; topic_name: string;
  score: number; total_marks: number; percentage: number;
  grade: string; certificate_status: string; certificate_issued: boolean;
  created_at: string;
}

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  in_review: { label: 'In Review', cls: 'status-review',   icon: <ClockIcon size={12} /> },
  approved:  { label: 'Approved',  cls: 'status-approved', icon: <CheckIcon size={12} /> },
  rejected:  { label: 'Rejected',  cls: 'status-rejected', icon: <XIcon size={12} /> },
};

const UserProfile: React.FC = () => {
  const [results, setResults]         = useState<Result[]>([]);
  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    userAPI.getProfile()
      .then(r => setResults(r.data))
      .catch(() => showToast('Failed to load results', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (scoreId: number, topicName: string) => {
    setDownloading(scoreId);
    try {
      const res = await userAPI.downloadCertificate(scoreId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `certificate_${topicName.replace(/\s+/g, '_')}.pdf`;
      a.click(); window.URL.revokeObjectURL(url);
      showToast('Certificate downloaded', 'success');
    } catch {
      showToast('Failed to download certificate', 'error');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="page">
      <Header />
      <div className="page-body">
        <div className="page-header">
          <div>
            <h1>My Results</h1>
            <p className="text-muted text-sm mt-1">Track your exam history and download certificates</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/topics')}>
            Browse Topics <ArrowRightIcon size={15} />
          </button>
        </div>

        {loading ? (
          <SkeletonGrid count={4} />
        ) : results.length === 0 ? (
          <div className="profile-empty">
            <div className="empty-icon"><BookIcon size={48} /></div>
            <p>You haven't taken any exams yet.</p>
            <button className="btn-primary btn-lg" onClick={() => navigate('/topics')}>
              Browse Topics <ArrowRightIcon size={16} />
            </button>
          </div>
        ) : (
          <div className="results-grid">
            {results.map((result, i) => {
              const st = statusConfig[result.certificate_status] ?? statusConfig['in_review'];
              const isApproved = result.certificate_status === 'approved';
              const isRejected = result.certificate_status === 'rejected';
              const isReview   = result.certificate_status === 'in_review';

              return (
                <div key={result.id} className="result-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="result-card-header">
                    <h3>{result.topic_name}</h3>
                    <span className={`cert-status-badge ${st.cls}`}>{st.icon} {st.label}</span>
                  </div>

                  <div className="result-card-body">
                    {!isReview && (
                      <>
                        <div className="result-stat">
                          <span className="result-stat-label">Score</span>
                          <span className="result-stat-value">{result.score} / {result.total_marks}</span>
                        </div>
                        <div className="result-stat">
                          <span className="result-stat-label">Percentage</span>
                          <span className="result-stat-value">{result.percentage}%</span>
                        </div>
                        <div className="result-stat">
                          <span className="result-stat-label">Grade</span>
                          <span className="result-stat-value">{result.grade}</span>
                        </div>
                      </>
                    )}
                    <div className="result-stat">
                      <span className="result-stat-label">Date</span>
                      <span className="result-stat-value">{new Date(result.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {isReview   && <div className="result-banner review"   role="status"><ClockIcon size={14} /> Under review — you'll get an update shortly.</div>}
                  {isRejected && <div className="result-banner rejected" role="alert"><XIcon size={14} /> Certificate request was rejected.</div>}

                  <div className="result-card-actions">
                    <button
                      className="btn-success"
                      disabled={!isApproved || downloading === result.id}
                      onClick={() => handleDownload(result.id, result.topic_name)}
                      aria-label={`Download certificate for ${result.topic_name}`}
                    >
                      {downloading === result.id
                        ? <><span className="btn-spinner" /> Downloading…</>
                        : <><DownloadIcon size={15} /> Certificate</>}
                    </button>
                    <button className="btn-secondary" onClick={() => navigate(`/instructions/${result.topic_id}`)}>
                      <RefreshIcon size={15} /> Retry
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

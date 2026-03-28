import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/services';
import AdminLayout from '../components/AdminLayout';
import { SkeletonDashboard } from '../components/Loader';
import { UserIcon, BookIcon, AwardIcon, ShieldIcon, CheckIcon, XIcon, ClockIcon, ArrowRightIcon, ZapIcon } from '../components/Icons';

interface Stats {
  total_users: number;
  total_admins: number;
  total_topics: number;
  total_exams_taken: number;
}

interface Result {
  id: number;
  user_name: string;
  topic_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  certificate_status: string;
  malpractice_detected: boolean;
  created_at: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'approved') return <span className="badge badge-success"><CheckIcon size={10} /> Approved</span>;
  if (status === 'rejected') return <span className="badge badge-danger"><XIcon size={10} /> Rejected</span>;
  return <span className="badge badge-warning"><ClockIcon size={10} /> In Review</span>;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getResults()])
      .then(([s, r]) => { setStats(s.data); setResults(r.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <SkeletonDashboard />
    </AdminLayout>
  );

  const statCards = [
    { label: 'Total Users',  value: stats?.total_users,       icon: <UserIcon size={22} />,   cls: 'blue'   },
    { label: 'Total Admins', value: stats?.total_admins,      icon: <ShieldIcon size={22} />, cls: 'purple' },
    { label: 'Topics',       value: stats?.total_topics,      icon: <BookIcon size={22} />,   cls: 'green'  },
    { label: 'Exams Taken',  value: stats?.total_exams_taken, icon: <AwardIcon size={22} />,  cls: 'amber'  },
  ];

  const recent = [...results]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 7);

  const approved  = results.filter(r => r.certificate_status === 'approved').length;
  const inReview  = results.filter(r => r.certificate_status === 'in_review').length;
  const flagged   = results.filter(r => r.malpractice_detected).length;
  const passRate  = results.length
    ? Math.round((results.filter(r => r.percentage >= 60).length / results.length) * 100)
    : 0;

  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-top">
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            </div>
            <div className="stat-value">{s.value ?? '—'}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom two-column layout */}
      <div className="dashboard-bottom">

        {/* Recent exams — left, wider */}
        <div className="dashboard-recent">
          <div className="dashboard-card-header">
            <span className="dashboard-section-label">Recent Exam Results</span>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/admin/results')}>
              View all <ArrowRightIcon size={13} />
            </button>
          </div>
          <div className="table-wrapper" style={{ boxShadow: 'none', border: '1px solid #e0edf8' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr><td colSpan={5}>
                    <div className="table-empty" style={{ padding: '2rem' }}>
                      <div className="empty-icon"><AwardIcon size={28} /></div>
                      <p>No exams yet</p>
                    </div>
                  </td></tr>
                ) : recent.map(r => (
                  <tr key={r.id} className={r.malpractice_detected ? 'row-flagged' : ''}>
                    <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                    <td style={{ color: '#64748b' }}>{r.topic_name}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{r.score}/{r.total_marks}</span>
                      <span style={{ color: '#94a3b8', fontSize: '.75rem', marginLeft: '.3rem' }}>({r.percentage}%)</span>
                    </td>
                    <td><StatusBadge status={r.certificate_status} /></td>
                    <td style={{ color: '#94a3b8', fontSize: '.78rem' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary panel — right */}
        <div className="dashboard-summary">
          <div className="dashboard-card-header">
            <span className="dashboard-section-label">Overview</span>
          </div>
          <div className="dashboard-summary-card">
            <div className="summary-stat-list">
            <div className="summary-stat">
              <div className="summary-stat-left">
                <div className="summary-stat-icon green"><CheckIcon size={15} /></div>
                <span>Approved</span>
              </div>
              <span className="summary-stat-value">{approved}</span>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-left">
                <div className="summary-stat-icon amber"><ClockIcon size={15} /></div>
                <span>In Review</span>
              </div>
              <span className="summary-stat-value">{inReview}</span>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-left">
                <div className="summary-stat-icon red"><XIcon size={15} /></div>
                <span>Flagged</span>
              </div>
              <span className="summary-stat-value">{flagged}</span>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-left">
                <div className="summary-stat-icon blue"><ZapIcon size={15} /></div>
                <span>Pass Rate</span>
              </div>
              <span className="summary-stat-value">{passRate}%</span>
            </div>
          </div>

          {/* Pass rate bar */}
          <div className="pass-rate-bar-wrap">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '.78rem', color: '#64748b', fontWeight: 600 }}>Overall Pass Rate</span>
              <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#2563eb' }}>{passRate}%</span>
            </div>
            <div className="pass-rate-track">
              <div className="pass-rate-fill" style={{ width: `${passRate}%` }} />
            </div>
          </div>

          <button
            className="btn-primary btn-full"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/admin/results')}
          >
            <AwardIcon size={15} /> Manage Results
          </button>
          </div>{/* end dashboard-summary-card */}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

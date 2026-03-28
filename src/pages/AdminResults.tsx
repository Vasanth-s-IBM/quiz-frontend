import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

interface Result {
  id: number;
  user_name: string;
  topic_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  grade: string;
  certificate_issued: boolean;
  certificate_status: string;
  malpractice_detected: boolean;
  tab_switch_count: number;
  face_violation_count: number;
  created_at: string;
}

const statusBadge = (s: string) => {
  if (s === 'approved') return <span className="badge badge-success">Approved</span>;
  if (s === 'rejected') return <span className="badge badge-rejected">Rejected</span>;
  return <span className="badge badge-pending">In Review</span>;
};

const ViolationBadge: React.FC<{ result: Result }> = ({ result }) => {
  const hasViolation = result.malpractice_detected ||
    result.tab_switch_count > 0 || result.face_violation_count > 0;

  if (!hasViolation) {
    return <span className="badge badge-success">Clean</span>;
  }

  const lines: string[] = [];
  if (result.malpractice_detected) lines.push('⚠️ Malpractice flagged');
  if (result.tab_switch_count > 0)  lines.push(`🔀 Tab switches: ${result.tab_switch_count}`);
  if (result.face_violation_count > 0) lines.push(`📷 Face violations: ${result.face_violation_count}`);

  return (
    <div className="violation-badge-wrap">
      <span className="badge badge-violation">⚠️ Violations</span>
      <div className="violation-tooltip">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
};

const AdminResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ resultId: number; action: 'approved' | 'rejected' } | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const response = await adminAPI.getResults();
      setResults(response.data);
    } catch {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (resultId: number, newStatus: 'approved' | 'rejected') => {
    try {
      await adminAPI.updateCertificateStatus(resultId, newStatus);
      showToast(`Certificate ${newStatus} successfully`, 'success');
      setConfirmAction(null);
      fetchResults();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to update status', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.action === 'approved' ? 'Approve Certificate' : 'Reject Certificate'}
          message={`Are you sure you want to ${confirmAction.action === 'approved' ? 'approve' : 'reject'} this certificate?`}
          onConfirm={() => handleStatusUpdate(confirmAction.resultId, confirmAction.action)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <Header isAdmin />

      <div className="admin-container">
        <div className="admin-toolbar">
          <h1>Exam Results</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">Back</button>
        </div>

        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Topic</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
                <th>Violations</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id} className={result.malpractice_detected ? 'row-flagged' : ''}>
                  <td>{result.user_name}</td>
                  <td>{result.topic_name}</td>
                  <td>{result.score} / {result.total_marks}</td>
                  <td>{result.percentage}%</td>
                  <td>
                    <span className={`badge ${result.grade === 'A+' || result.grade === 'A' ? 'badge-success' : 'badge-pending'}`}>
                      {result.grade}
                    </span>
                  </td>
                  <td><ViolationBadge result={result} /></td>
                  <td>{new Date(result.created_at).toLocaleDateString()}</td>
                  <td>{statusBadge(result.certificate_status)}</td>
                  <td>
                    <div className="row-actions">
                      {result.certificate_status !== 'approved' && (
                        <button className="btn-success"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => setConfirmAction({ resultId: result.id, action: 'approved' })}>
                          Approve
                        </button>
                      )}
                      {result.certificate_status !== 'rejected' && (
                        <button className="btn-danger"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => setConfirmAction({ resultId: result.id, action: 'rejected' })}>
                          Reject
                        </button>
                      )}
                      {result.certificate_status === 'approved' && (
                        <button className="btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '13px' }}
                          onClick={() => setConfirmAction({ resultId: result.id, action: 'rejected' })}>
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResults;

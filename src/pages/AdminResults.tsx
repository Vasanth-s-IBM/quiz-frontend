import React, { useEffect, useState } from 'react';
import { adminAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import AdminLayout from '../components/AdminLayout';
import { SkeletonTable } from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';
import { AwardIcon, CheckIcon, XIcon, AlertTriangleIcon } from '../components/Icons';

interface Result {
  id: number; user_name: string; topic_name: string;
  score: number; total_marks: number; percentage: number; grade: string;
  certificate_issued: boolean; certificate_status: string;
  malpractice_detected: boolean; tab_switch_count: number; face_violation_count: number;
  created_at: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'approved') return <span className="badge badge-success"><CheckIcon size={10} /> Approved</span>;
  if (status === 'rejected') return <span className="badge badge-danger"><XIcon size={10} /> Rejected</span>;
  return <span className="badge badge-warning">In Review</span>;
};

const ViolationBadge: React.FC<{ result: Result }> = ({ result }) => {
  const has = result.malpractice_detected || result.tab_switch_count > 0 || result.face_violation_count > 0;
  if (!has) return <span className="badge badge-success">Clean</span>;
  const lines = [
    result.malpractice_detected && 'Malpractice flagged',
    result.tab_switch_count > 0 && `Tab switches: ${result.tab_switch_count}`,
    result.face_violation_count > 0 && `Face violations: ${result.face_violation_count}`,
  ].filter(Boolean) as string[];
  return (
    <div className="violation-badge-wrap">
      <span className="badge badge-danger"><AlertTriangleIcon size={10} /> Violations</span>
      <div className="violation-tooltip">{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
    </div>
  );
};

const AdminResults: React.FC = () => {
  const [results, setResults]   = useState<Result[]>([]);
  const [loading, setLoading]   = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ resultId: number; action: 'approved' | 'rejected' } | null>(null);
  const { showToast } = useToast();

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try { const r = await adminAPI.getResults(); setResults(r.data); }
    catch { showToast('Failed to fetch results', 'error'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async (resultId: number, newStatus: 'approved' | 'rejected') => {
    try {
      await adminAPI.updateCertificateStatus(resultId, newStatus);
      showToast(`Certificate ${newStatus}`, 'success'); setConfirmAction(null); fetchResults();
    } catch (e: any) { showToast(e.response?.data?.detail || 'Failed', 'error'); }
  };

  if (loading) return <AdminLayout title="Results"><SkeletonTable cols={8} rows={7} /></AdminLayout>;

  return (
    <AdminLayout title="Results">
      {confirmAction && (
        <ConfirmModal
          title={confirmAction.action === 'approved' ? 'Approve Certificate' : 'Reject Certificate'}
          message={`Are you sure you want to ${confirmAction.action === 'approved' ? 'approve' : 'reject'} this certificate?`}
          variant={confirmAction.action === 'approved' ? 'primary' : 'danger'}
          confirmLabel={confirmAction.action === 'approved' ? 'Approve' : 'Reject'}
          onConfirm={() => handleStatusUpdate(confirmAction.resultId, confirmAction.action)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <div className="admin-page-header">
        <div><h2>Exam Results</h2><p>{results.length} results total</p></div>
      </div>

      <div className="table-wrapper">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th><th>Topic</th><th>Score</th>
                <th>Grade</th><th>Violations</th><th>Date</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={8}><div className="table-empty">
                  <div className="empty-icon"><AwardIcon size={36} /></div>
                  <p>No results yet</p>
                </div></td></tr>
              ) : results.map(r => (
                <tr key={r.id} className={r.malpractice_detected ? 'row-flagged' : ''}>
                  <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                  <td>{r.topic_name}</td>
                  <td>{r.score}/{r.total_marks} <span style={{ color: '#94a3b8', fontSize: '.78rem' }}>({r.percentage}%)</span></td>
                  <td><span className={`badge ${['A+','A'].includes(r.grade) ? 'badge-success' : r.grade === 'F' ? 'badge-danger' : 'badge-warning'}`}>{r.grade}</span></td>
                  <td><ViolationBadge result={r} /></td>
                  <td style={{ color: '#64748b', fontSize: '.82rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><StatusBadge status={r.certificate_status} /></td>
                  <td>
                    <div className="row-actions">
                      {r.certificate_status !== 'approved' && (
                        <button className="btn-success btn-sm" onClick={() => setConfirmAction({ resultId: r.id, action: 'approved' })}>
                          <CheckIcon size={13} /> Approve
                        </button>
                      )}
                      {r.certificate_status !== 'rejected' && (
                        <button className="btn-danger btn-sm" onClick={() => setConfirmAction({ resultId: r.id, action: 'rejected' })}>
                          <XIcon size={13} /> {r.certificate_status === 'approved' ? 'Revoke' : 'Reject'}
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
    </AdminLayout>
  );
};

export default AdminResults;

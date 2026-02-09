import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, certificateAPI } from '../api/services';
import { useToast } from '../context/ToastContext';
import Header from '../components/Header';
import Loader from '../components/Loader';
import ConfirmModal from '../components/ConfirmModal';

interface Result {
  id: number;
  user_name: string;
  topic_name: string;
  score: number;
  certificate_issued: boolean;
  created_at: string;
}

const AdminResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ resultId: number } | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await adminAPI.getResults();
      setResults(response.data);
    } catch (error) {
      showToast('Failed to fetch results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCertificate = async (resultId: number) => {
    try {
      await certificateAPI.publish(resultId);
      showToast('Certificate published and sent successfully!', 'success');
      setConfirmAction(null);
      fetchResults();
    } catch (error: any) {
      showToast(error.response?.data?.detail || 'Failed to publish certificate', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      {confirmAction && (
        <ConfirmModal
          title="Publish Certificate"
          message="Are you sure you want to publish certificate for this user?"
          onConfirm={() => handlePublishCertificate(confirmAction.resultId)}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      <Header isAdmin />

      <div className="admin-container">
        <div className="admin-toolbar">
          <h1>Exam Results</h1>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">
            Back
          </button>
        </div>

        <div className="table-container">
          <table className="results-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Topic</th>
                <th>Score</th>
                <th>Date</th>
                <th>Certificate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.user_name}</td>
                  <td>{result.topic_name}</td>
                  <td>{result.score}</td>
                  <td>{new Date(result.created_at).toLocaleDateString()}</td>
                  <td>
                    {result.certificate_issued ? (
                      <span className="badge badge-success">Issued</span>
                    ) : (
                      <span className="badge badge-pending">Pending</span>
                    )}
                  </td>
                  <td>
                    {!result.certificate_issued && (
                      <button
                        onClick={() => setConfirmAction({ resultId: result.id })}
                        className="btn-success"
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                      >
                        Publish Certificate
                      </button>
                    )}
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

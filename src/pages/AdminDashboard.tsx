import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/services';
import Header from '../components/Header';
import Loader from '../components/Loader';

interface Stats {
  total_users: number;
  total_admins: number;
  total_topics: number;
  total_exams_taken: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="admin-page">
      <Header isAdmin />

      <div className="admin-container">
        <h1>Dashboard</h1>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-value">{stats.total_users}</div>
              <div className="stat-label">Total Users</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-value">{stats.total_admins}</div>
              <div className="stat-label">Total Admins</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-value">{stats.total_topics}</div>
              <div className="stat-label">Topics</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-value">{stats.total_exams_taken}</div>
              <div className="stat-label">Exams Taken</div>
            </div>
          </div>
        )}

        <div className="admin-actions">
          <h2>Management</h2>
          <div className="action-grid">
            <button
              onClick={() => navigate('/admin/users')}
              className="action-card"
            >
              <span className="action-icon">👥</span>
              <span>User Management</span>
            </button>

            <button
              onClick={() => navigate('/admin/results')}
              className="action-card"
            >
              <span className="action-icon">📊</span>
              <span>View Results</span>
            </button>

            <button
              onClick={() => navigate('/admin/topics')}
              className="action-card"
            >
              <span className="action-icon">📚</span>
              <span>Manage Topics</span>
            </button>

            <button
              onClick={() => navigate('/admin/questions')}
              className="action-card"
            >
              <span className="action-icon">❓</span>
              <span>Manage Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

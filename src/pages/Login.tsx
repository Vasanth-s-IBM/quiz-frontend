import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../api/services';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(email, password);
      const { access_token, refresh_token, role, role_id, user_id, name } = response.data;

      // Normalize role — backend may return role as string or role_id as number
      let userRole = role;
      if (!userRole && role_id !== undefined) {
        userRole = role_id === 1 ? 'Admin' : 'User';
      }

      login(access_token, refresh_token, {
        id: user_id,
        name,
        email,
        role: userRole,
      });
      
      if (userRole?.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/topics');
      }
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Invalid email or password';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-left">
        <div className="login-content">
          <h1>Quiz System</h1>
          <p className="login-subtitle">Test your knowledge and track your progress</p>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%' }}>
              {loading && <span className="btn-spinner"></span>}
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="footer-text">
            © {new Date().getFullYear()} Quiz System
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-image-content">
          <img src="https://img.freepik.com/free-vector/online-test-concept-illustration_114360-956.jpg" alt="Quiz illustration" className="login-image" />
          <h2>Knowledge Testing Platform</h2>
          <p>Take exams, earn certificates, and showcase your expertise</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

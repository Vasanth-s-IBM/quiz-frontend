import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  isAdmin?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isAdmin = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={`app-header ${isAdmin ? 'admin' : ''}`}>
      <h2>Quiz System {isAdmin ? '- Admin' : ''}</h2>
      <div className="header-right">
        <span>Welcome, {user?.name}</span>
        <button onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Header;

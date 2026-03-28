import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, XIcon, UserIcon, LogOutIcon, GridIcon, ArrowRightIcon, BookIcon } from './Icons';

interface HeaderProps { isAdmin?: boolean; }

const Header: React.FC<HeaderProps> = ({ isAdmin = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => { logout(); navigate('/login'); setMobileOpen(false); };

  return (
    <>
      <header className="app-header" role="banner">
        <div className="header-brand">
          <div className="brand-icon"><GridIcon size={18} /></div>
          <span>QuizPlatform</span>
        </div>

        <div className="header-right header-desktop-actions">
          <div className="header-user">
            <div className="header-avatar">{initials}</div>
            <span className="header-username">{user?.name}</span>
          </div>
          <button className="btn-secondary btn-sm" onClick={() => navigate('/profile')}>
            My Results
          </button>
          <button className="btn-secondary btn-sm" onClick={handleLogout}
            style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,.3)' }}>
            <LogOutIcon size={14} /> Logout
          </button>
        </div>

        <button className="header-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <MenuIcon size={22} />
        </button>
      </header>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-nav-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="mobile-nav-drawer" role="dialog">
          <div className="mobile-nav-header">
            <div className="header-brand">
              <div className="brand-icon"><GridIcon size={16} /></div>
              <span>QuizPlatform</span>
            </div>
            <button className="btn-icon" onClick={() => setMobileOpen(false)}><XIcon size={20} /></button>
          </div>
          <div className="mobile-nav-body">
            <button className="mobile-nav-link" onClick={() => { navigate('/topics'); setMobileOpen(false); }}>
              <BookIcon size={18} /> Topics
            </button>
            <button className="mobile-nav-link" onClick={() => { navigate('/profile'); setMobileOpen(false); }}>
              <UserIcon size={18} /> My Results
            </button>
            <button className="mobile-nav-link danger" onClick={handleLogout}>
              <LogOutIcon size={18} /> Logout
            </button>
          </div>
          <div className="mobile-nav-footer">
            <div className="mobile-nav-user">
              <div className="header-avatar">{initials}</div>
              <div className="mobile-nav-user-info">
                <div className="name">{user?.name}</div>
                <div className="role">{user?.role}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

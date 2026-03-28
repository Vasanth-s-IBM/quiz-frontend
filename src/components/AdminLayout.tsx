import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GridIcon, UserIcon, BookIcon, PenToolIcon, AwardIcon,
  ShieldIcon, LogOutIcon, MenuIcon, XIcon, ChevronRightIcon
} from './Icons';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  path: '/admin/dashboard',  icon: <GridIcon size={18} /> },
  { label: 'Users',      path: '/admin/users',       icon: <UserIcon size={18} /> },
  { label: 'Topics',     path: '/admin/topics',      icon: <BookIcon size={18} /> },
  { label: 'Questions',  path: '/admin/questions',   icon: <PenToolIcon size={18} /> },
  { label: 'Results',    path: '/admin/results',     icon: <AwardIcon size={18} /> },
  { label: 'Proctoring', path: '/admin/proctoring',  icon: <ShieldIcon size={18} /> },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={`admin-sidebar ${mobile ? 'mobile' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><GridIcon size={18} /></div>
        <div>
          <div className="sidebar-logo-text">QuizPro</div>
          <div className="sidebar-logo-sub">Admin Panel</div>
        </div>
        {mobile && (
          <button className="btn-icon sidebar-close-btn" onClick={() => setSidebarOpen(false)}
            style={{ marginLeft: 'auto', color: '#94a3b8' }}>
            <XIcon size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" role="navigation">
        <div className="sidebar-section-label">Main Menu</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
            {location.pathname === item.path && (
              <span style={{ marginLeft: 'auto', opacity: .5, display: 'flex' }}>
                <ChevronRightIcon size={14} />
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOutIcon size={15} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="admin-layout">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div onClick={e => e.stopPropagation()}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar">
              <MenuIcon size={22} />
            </button>
            <div className="admin-topbar-title">{title}</div>
          </div>
          <div className="admin-topbar-right">
            <div className="admin-topbar-user">
              <div className="header-avatar" style={{ width: 34, height: 34, fontSize: '.78rem', background: 'linear-gradient(135deg,#2563eb,#38bdf8)' }}>{initials}</div>
              <span className="admin-topbar-username">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LogOut,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
} from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';

export function Navbar({ onToggleSidebar, sidebarOpen = true }) {
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      className="glass-panel navbar"
      style={{
        margin: '1rem',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.8)',
        position: 'sticky',
        top: '1rem',
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Hide sidebar menu' : 'Show sidebar menu'}
          title={sidebarOpen ? 'Hide Menu' : 'Show Menu'}
          style={{
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.08) 0%, rgba(59, 130, 246, 0.12) 100%)',
            border: '1px solid rgba(30, 58, 138, 0.25)',
            cursor: 'pointer',
            padding: '0.45rem 0.85rem',
            borderRadius: '10px',
            color: '#1e3a8a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(30, 58, 138, 0.08)',
          }}
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          <span className="toggle-label">{sidebarOpen ? 'Collapse Menu' : 'Expand Menu'}</span>
        </button>

        <Link
          to="/"
          title="School Public Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            color: '#334155',
            fontSize: '0.9rem',
            fontWeight: 700,
            padding: '0.45rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid rgba(203, 213, 225, 0.85)',
            background: 'rgba(255, 255, 255, 0.75)',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Home size={16} color="#1e3a8a" />
          <span className="home-text">Portal Home</span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* User Info Profile Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid rgba(226, 232, 240, 0.95)',
            borderRadius: '9999px',
            padding: '0.35rem 0.95rem 0.35rem 0.45rem',
            boxShadow: '0 2px 10px rgba(30, 58, 138, 0.06)',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 2px 6px rgba(30, 58, 138, 0.3)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span
              className="pulse-dot-green"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                border: '1.5px solid #ffffff',
              }}
              title="Session Online"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{user?.email}</span>
          </div>
          <Badge status={role} />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Sign out"
          title="Sign out"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.12) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#dc2626',
            cursor: 'pointer',
            padding: '0.45rem 0.95rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.875rem',
            fontWeight: 700,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)',
          }}
        >
          <LogOut size={16} />
          <span className="logout-text">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

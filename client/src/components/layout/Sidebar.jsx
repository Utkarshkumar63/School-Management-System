import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  BarChart3,
  ShieldAlert,
  ClipboardList,
  FileSpreadsheet,
  X,
  Sliders,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { role } = useAuth();

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Students', path: '/admin/students', icon: <GraduationCap size={18} /> },
    { label: 'Teachers', path: '/admin/teachers', icon: <Users size={18} /> },
    { label: 'Guardians', path: '/admin/guardians', icon: <UserCheck size={18} /> },
    { label: 'Classes & Subjects', path: '/admin/academic', icon: <BookOpen size={18} /> },
    { label: 'Teacher Assignments', path: '/admin/assignments', icon: <ClipboardList size={18} /> },
    { label: 'Attendance', path: '/admin/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'Exams & Results', path: '/admin/exams', icon: <Award size={18} /> },
    { label: 'Grading Rules', path: '/admin/grading-rules', icon: <Sliders size={18} /> },
    { label: 'Fees & Ledger', path: '/admin/fees', icon: <CreditCard size={18} /> },
    { label: 'Reports & Export', path: '/admin/reports', icon: <BarChart3 size={18} /> },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: <ShieldAlert size={18} /> },
  ];

  const teacherNav = [
    { label: 'My Dashboard', path: '/teacher/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Mark Attendance', path: '/teacher/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'Enter Exam Marks', path: '/teacher/marks', icon: <Award size={18} /> },
    { label: 'Class Reports', path: '/teacher/reports', icon: <FileSpreadsheet size={18} /> },
  ];

  const guardianNav = [
    { label: 'My Family', path: '/guardian/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Attendance Records', path: '/guardian/attendance', icon: <CalendarCheck size={18} /> },
    { label: 'Report Cards', path: '/guardian/reports', icon: <Award size={18} /> },
    { label: 'Fees & Payments', path: '/guardian/fees', icon: <CreditCard size={18} /> },
  ];

  const items = role === 'ADMIN' ? adminNav : role === 'TEACHER' ? teacherNav : guardianNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 90,
            backdropFilter: 'blur(3px)',
          }}
          className="sidebar-backdrop"
        />
      )}

      <aside
        className={`glass-panel sidebar ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: '1rem',
          bottom: '1rem',
          left: isOpen ? '1rem' : '-280px',
          width: '260px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 100,
          padding: '1.25rem 0.85rem',
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(255, 255, 255, 0.72)',
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.25rem 0.5rem 1.25rem',
            borderBottom: '1px solid rgba(229, 231, 235, 0.6)',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
              }}
            >
              A
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0, color: '#1e3a8a', letterSpacing: '-0.02em', fontWeight: 700 }}>
                Algions Academy
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Academic Suite 2026
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Hide Sidebar"
            title="Hide Sidebar"
            style={{
              background: 'rgba(0, 0, 0, 0.05)',
              border: 'none',
              cursor: 'pointer',
              color: '#4b5563',
              padding: '0.35rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="nav-item"
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.95rem',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: isActive ? 700 : 600,
                color: isActive ? '#1e3a8a' : '#475569',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3.5px solid #1e3a8a' : '3.5px solid transparent',
                textDecoration: 'none',
                boxShadow: isActive ? '0 2px 8px rgba(30, 58, 138, 0.06)' : 'none',
              })}
            >
              <span style={{ color: '#1e3a8a' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(229, 231, 235, 0.6)',
            fontSize: '0.75rem',
            color: '#9ca3af',
            textAlign: 'center',
          }}
        >
          Algions AI Labs © 2026
        </div>
      </aside>
    </>
  );
}


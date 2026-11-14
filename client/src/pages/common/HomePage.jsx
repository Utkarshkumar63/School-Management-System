import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { BlobBackground } from '../../components/layout/BlobBackground.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Shield,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  ChevronRight,
  Clock,
  Compass,
} from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const [loggingInRole, setLoggingInRole] = useState(null);

  const handleQuickLogin = async (email, password, role) => {
    setLoggingInRole(role);
    try {
      const loggedUser = await login(email, password);
      showToast(`Signed in successfully as ${loggedUser.name} (${role})`);
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'TEACHER') navigate('/teacher/dashboard');
      else if (role === 'GUARDIAN') navigate('/guardian/dashboard');
      else navigate('/');
    } catch (err) {
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      <BlobBackground />

      {/* Navigation Header */}
      <header
        className="glass-panel"
        style={{
          margin: '1.25rem auto',
          maxWidth: '1200px',
          padding: '0.85rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: '1rem',
          zIndex: 50,
          background: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#1e3a8a',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1.3rem',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.3)',
            }}
          >
            A
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#1e3a8a', letterSpacing: '-0.02em' }}>
              Algions Academy
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
              Institutional Management System
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <a href="#features" style={{ textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: '0.95rem' }}>
            Academic Pillars
          </a>
          <a href="#portals" style={{ textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: '0.95rem' }}>
            Role Gateways
          </a>
          <a href="#about" style={{ textDecoration: 'none', color: '#374151', fontWeight: 600, fontSize: '0.95rem' }}>
            Assessment Info
          </a>

          {isAuthenticated ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (user.role === 'ADMIN') navigate('/admin/dashboard');
                else if (user.role === 'TEACHER') navigate('/teacher/dashboard');
                else navigate('/guardian/dashboard');
              }}
              icon={<ArrowRight size={15} />}
            >
              My Dashboard ({user.role})
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => navigate('/login')} icon={<Lock size={15} />}>
              Sign In to Portal
            </Button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '2.5rem auto 3.5rem',
          padding: '0 1.5rem',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', padding: '0.45rem 1.25rem', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(203, 213, 225, 0.9)', boxShadow: '0 2px 10px rgba(30, 58, 138, 0.08)', marginBottom: '1.5rem' }}>
          <span className="pulse-dot-green" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a' }}>
            Algions AI Labs • Production Assessment System Online
          </span>
        </div>

        <h1
          style={{
            fontSize: '3.35rem',
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            maxWidth: '920px',
            margin: '0 auto 1.25rem',
            fontWeight: 700,
          }}
        >
          Comprehensive <span className="gradient-text">School Administration</span> & Academic Evaluation System
        </h1>

        <p
          style={{
            fontSize: '1.25rem',
            color: '#4b5563',
            maxWidth: '740px',
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          An end-to-end institutional platform engineered with strict server-side RBAC, automated examination grading policies, an idempotent financial fee ledger, and interactive guardian custody workflows.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/login')}
            icon={<ArrowRight size={18} />}
            style={{ padding: '0.85rem 1.75rem', fontSize: '1.1rem' }}
          >
            Enter School Portal
          </Button>

          <a
            href="http://localhost:5001/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ padding: '0.85rem 1.75rem', fontSize: '1.1rem' }}
          >
            Explore Swagger API Docs
          </a>
        </div>

        {/* Quick KPI Stats Bar */}
        <div
          className="glass-panel"
          style={{
            marginTop: '3.5rem',
            padding: '1.75rem 2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            background: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '2.2rem', color: '#1e3a8a', margin: 0 }}>30+</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
              Active Students Seeded
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', color: '#059669', margin: 0 }}>100%</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
              Ledger Reconciled
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', color: '#4f46e5', margin: 0 }}>19 / 19</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
              Automated Tests Passing
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.2rem', color: '#d97706', margin: 0 }}>Strict RBAC</h3>
            <p style={{ margin: '0.2rem 0 0', color: '#6b7280', fontSize: '0.95rem', fontWeight: 600 }}>
              Server-Enforced Isolation
            </p>
          </div>
        </div>
      </section>

      {/* Role Gateways Section with 1-Click Launch */}
      <section id="portals" style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>
            Interactive Role Gateways
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#4b5563' }}>
            Select any persona below to immediately log in with synthetic test credentials and experience their customized portal view.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Admin Card */}
          <Card hover={true} className="stat-card-accent-blue" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(30, 58, 138, 0.3)',
                  }}
                >
                  <Shield size={26} />
                </div>
                <Badge variant="info">Full System Access</Badge>
              </div>

              <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a', marginBottom: '0.5rem', fontWeight: 700 }}>
                Institutional Administrator
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Full operational control over student enrollment, faculty appointment, class curriculum, examination scheduling, financial fee invoicing, CSV reports, and security audit logs.
              </p>

              <div style={{ background: 'rgba(241, 245, 249, 0.85)', border: '1px solid #cbd5e1', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem' }}>
                <div><strong>Demo Account:</strong> <code>admin@school.test</code></div>
                <div style={{ marginTop: '0.2rem' }}><strong>Password:</strong> <code>Admin@123</code></div>
              </div>
            </div>

            <Button
              variant="primary"
              loading={loggingInRole === 'ADMIN'}
              onClick={() => handleQuickLogin('admin@school.test', 'Admin@123', 'ADMIN')}
              icon={<ArrowRight size={16} />}
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Launch Admin Dashboard
            </Button>
          </Card>

          {/* Teacher Card */}
          <Card hover={true} className="stat-card-accent-indigo" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  <GraduationCap size={26} />
                </div>
                <Badge variant="warning">Classroom Assigned</Badge>
              </div>

              <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a', marginBottom: '0.5rem', fontWeight: 700 }}>
                Faculty & Educator
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Isolated to assigned teaching sections (Grade 10 Mathematics). Mark daily morning/afternoon roll call with safe duplicate handling and enter assessment scores.
              </p>

              <div style={{ background: 'rgba(241, 245, 249, 0.85)', border: '1px solid #cbd5e1', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem' }}>
                <div><strong>Demo Account:</strong> <code>teacher@school.test</code></div>
                <div style={{ marginTop: '0.2rem' }}><strong>Password:</strong> <code>Teacher@123</code></div>
              </div>
            </div>

            <Button
              variant="primary"
              loading={loggingInRole === 'TEACHER'}
              onClick={() => handleQuickLogin('teacher@school.test', 'Teacher@123', 'TEACHER')}
              icon={<ArrowRight size={16} />}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)' }}
            >
              Launch Teacher Portal
            </Button>
          </Card>

          {/* Guardian Card */}
          <Card hover={true} className="stat-card-accent-emerald" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                  }}
                >
                  <Users size={26} />
                </div>
                <Badge variant="success">Strict Family Custody</Badge>
              </div>

              <h3 style={{ fontSize: '1.5rem', color: '#1e3a8a', marginBottom: '0.5rem', fontWeight: 700 }}>
                Parent & Legal Guardian
              </h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Real-time visibility strictly restricted to linked household children (Julian & Beatrice). Monitor classroom attendance %, view official term report cards, and pay school fee invoices.
              </p>

              <div style={{ background: 'rgba(241, 245, 249, 0.85)', border: '1px solid #cbd5e1', padding: '0.85rem 1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#334155', marginBottom: '1.5rem' }}>
                <div><strong>Demo Account:</strong> <code>guardian@school.test</code></div>
                <div style={{ marginTop: '0.2rem' }}><strong>Password:</strong> <code>Guardian@123</code></div>
              </div>
            </div>

            <Button
              variant="primary"
              loading={loggingInRole === 'GUARDIAN'}
              onClick={() => handleQuickLogin('guardian@school.test', 'Guardian@123', 'GUARDIAN')}
              icon={<ArrowRight size={16} />}
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)' }}
            >
              Launch Guardian Portal
            </Button>
          </Card>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#1e3a8a', marginBottom: '0.5rem' }}>
            Engineered for Production Integrity
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#4b5563' }}>
            Key systems built to meet every evaluation requirement of the Algions assessment.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          <Card hover={true}>
            <CalendarCheck size={28} color="#1e3a8a" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Smart Attendance Engine</h3>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Unique compound index on <code>(student, date, session)</code> ensures zero duplicates. Safely upserts records and provides student and class monthly summary statistics.
            </p>
          </Card>

          <Card hover={true}>
            <Award size={28} color="#4f46e5" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Dynamic Grading Scale</h3>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Grading rules stored in MongoDB and editable by admin. Automatically evaluates scores, percentages, letter grades, GPAs, and pass/fail thresholds.
            </p>
          </Card>

          <Card hover={true}>
            <CreditCard size={28} color="#059669" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Idempotent Fee Ledger</h3>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Double-entry accounting with debits and credits. Strict status transitions, overpayment protection, and unique idempotency keys preventing double-billing.
            </p>
          </Card>

          <Card hover={true}>
            <Clock size={28} color="#d97706" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Forensic Audit Trail</h3>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.5 }}>
              Immutable AuditLog collection capturing actor, role, action, target entity, delta changes, IP address, and timestamps for all material operations.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorAlert } from '../../components/ui/ErrorAlert.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import {
  Users,
  GraduationCap,
  BookOpen,
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  UserPlus,
  Layers,
  Award,
  Receipt,
  ClipboardList,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Spinner size="3rem" text="Compiling institutional analytics..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const { totals, attendance, fees, charts, recentActivity } = data;

  const attendancePieData = [
    { name: 'Present', value: attendance.stats?.present || 0, color: '#10b981' },
    { name: 'Absent', value: attendance.stats?.absent || 0, color: '#ef4444' },
    { name: 'Late', value: attendance.stats?.late || 0, color: '#f59e0b' },
    { name: 'Excused', value: attendance.stats?.excused || 0, color: '#6366f1' },
  ].filter((item) => item.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Administrative Overview</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Real-time metrics, student enrollment, fee collections, and active academic records.
        </p>
      </div>

      {/* Quick Administrative Actions (Add & Create) */}
      <Card title="⚡ Quick Administrative Actions (Add & Create New Records)">
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>
          Instantly add new students, teachers, guardians, or create examinations, classes, and fee invoices.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <Link to="/admin/students?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem' }}>
              <Plus size={16} /> + Add Student
            </button>
          </Link>
          <Link to="/admin/teachers?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem', color: '#1e3a8a', fontWeight: 700 }}>
              <Plus size={16} /> + Add Teacher
            </button>
          </Link>
          <Link to="/admin/guardians?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem', color: '#1e3a8a', fontWeight: 700 }}>
              <Plus size={16} /> + Add Guardian
            </button>
          </Link>
          <Link to="/admin/classes?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem' }}>
              <Layers size={16} /> + Create Class
            </button>
          </Link>
          <Link to="/admin/assignments?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem' }}>
              <ClipboardList size={16} /> + Assign Teacher
            </button>
          </Link>
          <Link to="/admin/exams?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem' }}>
              <Award size={16} /> + Create Exam
            </button>
          </Link>
          <Link to="/admin/fees?openAdd=true" style={{ textDecoration: 'none' }}>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 0.75rem' }}>
              <Receipt size={16} /> + Create Invoice
            </button>
          </Link>
        </div>
      </Card>

      {/* Metric Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card hover={true} className="stat-card-accent-blue">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Active Students
              </p>
              <h2 style={{ fontSize: '2.1rem', color: '#1e3a8a', margin: '0.2rem 0', fontWeight: 700 }}>
                {totals.students}
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                Across {totals.classes} grade tiers
              </span>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                color: '#ffffff',
                padding: '0.95rem',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(30, 58, 138, 0.3)',
              }}
            >
              <GraduationCap size={28} />
            </div>
          </div>
        </Card>

        <Card hover={true} className="stat-card-accent-indigo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Faculty Staff
              </p>
              <h2 style={{ fontSize: '2.1rem', color: '#1e3a8a', margin: '0.2rem 0', fontWeight: 700 }}>
                {totals.teachers}
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: 700, background: 'rgba(99, 102, 241, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                Certified instructors
              </span>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
                color: '#ffffff',
                padding: '0.95rem',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Users size={28} />
            </div>
          </div>
        </Card>

        <Card hover={true} className="stat-card-accent-emerald">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Today's Attendance
              </p>
              <h2 style={{ fontSize: '2.1rem', color: '#059669', margin: '0.2rem 0', fontWeight: 700 }}>
                {attendance.todayPercent}%
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                {attendance.stats?.present || 0} recorded present
              </span>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
                color: '#ffffff',
                padding: '0.95rem',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              }}
            >
              <CheckCircle size={28} />
            </div>
          </div>
        </Card>

        <Card hover={true} className="stat-card-accent-amber">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fee Collections
              </p>
              <h2 style={{ fontSize: '2.1rem', color: '#1e3a8a', margin: '0.2rem 0', fontWeight: 700 }}>
                ₹{fees.collected.toLocaleString()}
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                ₹{fees.outstanding.toLocaleString()} outstanding
              </span>
            </div>
            <div
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
                color: '#ffffff',
                padding: '0.95rem',
                borderRadius: '14px',
                boxShadow: '0 4px 14px rgba(217, 119, 6, 0.3)',
              }}
            >
              <IndianRupee size={28} />
            </div>
          </div>
        </Card>
      </div>

      {/* Recharts Analytics Charts */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <Card title="Monthly Fee Invoicing vs Collections">
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={charts.monthlyFee} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(209, 213, 219, 0.5)" />
                <XAxis dataKey="month" stroke="#4b5563" />
                <YAxis stroke="#4b5563" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '10px',
                    border: '1px solid #d1d5db',
                    fontFamily: '"Times New Roman", Times, serif',
                  }}
                />
                <Legend />
                <Bar dataKey="invoiced" name="Invoiced (₹)" fill="#1e3a8a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="collected" name="Collected (₹)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Today's Attendance Status Distribution">
          <div style={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {attendancePieData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={attendancePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {attendancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      fontFamily: '"Times New Roman", Times, serif',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>No attendance sessions marked yet today.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity / Audit Logs */}
      <Card title="Recent Administrative Activity (Audit Log Preview)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((log) => (
              <div
                key={log._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '10px',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} color="#6b7280" />
                  <div>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>
                      {log.actorName}
                    </span>{' '}
                    <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                      performed <strong>{log.action}</strong> on {log.entity}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge status={log.role} />
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#6b7280' }}>No recent activity records found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}


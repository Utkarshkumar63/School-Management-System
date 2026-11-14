import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorAlert } from '../../components/ui/ErrorAlert.jsx';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  ChevronRight,
  IndianRupee,
  User,
} from 'lucide-react';

export function GuardianDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/guardian');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load parent portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Spinner size="3rem" text="Retrieving family academic records..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const { guardian, children } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>
          Parent & Guardian Portal
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Welcome, <strong>{guardian.name}</strong> • Academic, attendance, and fee tracking for your enrolled children.
        </p>
      </div>

      {children && children.length === 0 ? (
        <Card>
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No student profiles currently linked to your parent account. Please contact school administration.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {children.map((childData) => {
            const { student, attendancePercentage, latestResults, feeDue, pendingInvoicesCount } = childData;

            return (
              <Card key={student._id} style={{ padding: '1.75rem' }}>
                {/* Child Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    borderBottom: '1px solid rgba(229, 231, 235, 0.7)',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
                      }}
                    >
                      {student.firstName[0]}
                    </div>
                    <div>
                      <h2 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.4rem', fontWeight: 700 }}>
                        {student.firstName} {student.lastName}
                      </h2>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                        Admission No: <strong>{student.admissionNo}</strong> • {student.class?.name} ({student.section?.name}) • Roll #{student.rollNumber}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<CalendarCheck size={14} />}
                      onClick={() => navigate(`/guardian/attendance?studentId=${student._id}`)}
                    >
                      Attendance
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<Award size={14} />}
                      onClick={() => navigate(`/guardian/reports?studentId=${student._id}`)}
                    >
                      Report Cards
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<CreditCard size={14} />}
                      onClick={() => navigate(`/guardian/fees?studentId=${student._id}`)}
                    >
                      Fee Invoices
                    </Button>
                  </div>
                </div>

                {/* 3 Metric Cards for Child */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div
                    className="glass-panel glass-panel-hover stat-card-accent-emerald"
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.75)',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <CalendarCheck size={18} color="#059669" />
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Attendance Record
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.85rem', color: '#059669', margin: '0.2rem 0', fontWeight: 700 }}>
                      {attendancePercentage}%
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      Consistent classroom presence
                    </span>
                  </div>

                  <div
                    className="glass-panel glass-panel-hover stat-card-accent-indigo"
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.75)',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Award size={18} color="#4f46e5" />
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Latest Term Result
                      </span>
                    </div>
                    {latestResults ? (
                      <div>
                        <h3 style={{ fontSize: '1.85rem', color: '#1e3a8a', margin: '0.2rem 0', fontWeight: 700 }}>
                          {latestResults.percentage}% ({latestResults.grade})
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, background: 'rgba(99, 102, 241, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                          {latestResults.exam?.name || 'Term Exam'}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ fontSize: '1.35rem', color: '#64748b', margin: '0.4rem 0' }}>
                          Awaiting Term
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No results published yet</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="glass-panel glass-panel-hover stat-card-accent-amber"
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.75)',
                      borderRadius: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <CreditCard size={18} color="#d97706" />
                      <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        Outstanding Fees
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.85rem', color: feeDue > 0 ? '#dc2626' : '#059669', margin: '0.2rem 0', fontWeight: 700 }}>
                      ₹{feeDue.toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: feeDue > 0 ? '#dc2626' : '#059669', fontWeight: 600, background: feeDue > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {pendingInvoicesCount} invoice(s) pending payment
                    </span>
                  </div>

                  <div
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <Award size={18} color="#1e3a8a" />
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                        Latest Term Result
                      </span>
                    </div>
                    {latestResults && latestResults.length > 0 ? (
                      <div>
                        <h3 style={{ fontSize: '1.75rem', color: '#1e3a8a', margin: '0.2rem 0' }}>
                          {latestResults[0].percentage}% ({latestResults[0].grade})
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>
                          {latestResults[0].exam?.name || 'Examination Passed'}
                        </span>
                      </div>
                    ) : (
                      <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        No results published yet
                      </p>
                    )}
                  </div>

                  <div
                    className="glass-panel"
                    style={{
                      padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(229, 231, 235, 0.8)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <IndianRupee size={18} color={feeDue > 0 ? '#dc2626' : '#059669'} />
                      <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                        Outstanding Fees
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.75rem', color: feeDue > 0 ? '#dc2626' : '#059669', margin: '0.2rem 0' }}>
                      ₹{feeDue.toLocaleString()}
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                      {pendingInvoicesCount > 0 ? `${pendingInvoicesCount} invoice(s) pending` : 'All invoices settled'}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


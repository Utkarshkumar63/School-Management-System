import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { ErrorAlert } from '../../components/ui/ErrorAlert.jsx';
import {
  BookOpen,
  CalendarCheck,
  AlertCircle,
  Award,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export function TeacherDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/dashboard/teacher');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch teacher dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Spinner size="3rem" text="Retrieving faculty schedule..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboard} />;
  if (!data) return null;

  const { teacher, assignments, pendingAttendance, upcomingExams } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>
          Welcome, {teacher.name}
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Faculty ID: <strong>{teacher.employeeId}</strong> • Authorized Academic Management Workspace
        </p>
      </div>

      {/* Attendance Pending Banner */}
      {pendingAttendance && pendingAttendance.length > 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            background: 'rgba(254, 243, 199, 0.85)',
            border: '1px solid #fde68a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={28} color="#d97706" />
            <div>
              <h3 style={{ margin: 0, color: '#92400e', fontSize: '1.15rem' }}>
                Attendance Pending for Today
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.9rem', color: '#78350f' }}>
                You have {pendingAttendance.length} assigned class section(s) awaiting attendance register:
                {' '}{pendingAttendance.map((p) => `${p.className} (${p.sectionName})`).join(', ')}
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/teacher/attendance')}
            icon={<CalendarCheck size={16} />}
          >
            Mark Daily Attendance
          </Button>
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '1rem 1.25rem',
            background: 'rgba(236, 253, 245, 0.85)',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle2 size={24} color="#059669" />
          <span style={{ color: '#065f46', fontWeight: 600 }}>
            All daily attendance sessions for your assigned classes have been recorded.
          </span>
        </div>
      )}

      {/* My Assigned Classes & Subjects */}
      <Card title="My Official Teaching Assignments">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {assignments?.map((a) => (
            <div
              key={a._id}
              className="glass-panel glass-panel-hover"
              style={{
                padding: '1.25rem',
                border: '1px solid rgba(229, 231, 235, 0.8)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.2rem' }}>
                    {a.class?.name} - {a.section?.name}
                  </h3>
                  <Badge variant="info">{a.academicYear}</Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                  <BookOpen size={16} color="#4f46e5" />
                  <span style={{ fontWeight: 600, color: '#1f2937' }}>
                    {a.subject?.name} ({a.subject?.code})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate('/teacher/attendance')}
                  style={{ flex: 1 }}
                >
                  Attendance
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/teacher/marks')}
                  style={{ flex: 1 }}
                >
                  Enter Marks
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming Exams for Assigned Classes */}
      <Card title="Scheduled Term Assessments">
        {upcomingExams && upcomingExams.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingExams.map((exam) => (
              <div
                key={exam._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid rgba(229, 231, 235, 0.6)',
                }}
              >
                <div>
                  <h4 style={{ margin: 0, color: '#1e3a8a' }}>
                    {exam.name} ({exam.class?.name})
                  </h4>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Term: {exam.term} • {exam.subjects?.length} Subjects Included
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Award size={14} />}
                  onClick={() => navigate('/teacher/marks')}
                >
                  Record Marks
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#6b7280' }}>No examinations scheduled for your classes currently.</p>
        )}
      </Card>
    </div>
  );
}


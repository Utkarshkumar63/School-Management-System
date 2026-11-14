import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function ChildAttendance() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('studentId') || '');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    try {
      const res = await api.get('/dashboard/guardian');
      const kids = res.data?.children?.map((c) => c.student) || [];
      setChildren(kids);
      if (kids.length > 0 && !selectedStudentId) {
        setSelectedStudentId(kids[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const [attRes, sumRes] = await Promise.all([
        api.get(`/attendance?studentId=${selectedStudentId}`),
        api.get(`/attendance/student/${selectedStudentId}/summary`),
      ]);
      setAttendanceRecords(attRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      showToast(err.message || 'Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      setSearchParams({ studentId: selectedStudentId });
      fetchAttendance();
    }
  }, [selectedStudentId]);

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (r) => new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
    },
    {
      header: 'Session',
      accessor: 'session',
      render: (r) => <Badge variant="neutral">{r.session}</Badge>,
    },
    {
      header: 'Attendance Status',
      accessor: 'status',
      render: (r) => <Badge status={r.status} />,
    },
    {
      header: 'Faculty Remarks',
      accessor: 'remarks',
      render: (r) => <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{r.remarks || 'None'}</span>,
    },
    {
      header: 'Recorded By',
      render: (r) => r.recordedBy?.name || 'Academic Office',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Attendance Register & Record</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Detailed record of daily classroom attendance for your child.
        </p>
      </div>

      {/* Child Switcher */}
      {children.length > 1 && (
        <Card style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Select Child:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ width: 'auto', minWidth: '220px' }}
            >
              {children.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.firstName} {c.lastName} ({c.class?.name || 'Class'})
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Monthly Attendance Summary KPI */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Overall Attendance</span>
            <h3 style={{ fontSize: '1.85rem', color: '#059669', margin: '0.2rem 0' }}>
              {summary.attendancePercentage}%
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>Academic Year 2025-2026</span>
          </Card>

          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Sessions Present</span>
            <h3 style={{ fontSize: '1.85rem', color: '#059669', margin: '0.2rem 0' }}>
              {summary.present}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#059669' }}>Out of {summary.totalSessions} sessions</span>
          </Card>

          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Sessions Late</span>
            <h3 style={{ fontSize: '1.85rem', color: '#d97706', margin: '0.2rem 0' }}>
              {summary.late}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#d97706' }}>Minor delays</span>
          </Card>

          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Sessions Absent</span>
            <h3 style={{ fontSize: '1.85rem', color: '#dc2626', margin: '0.2rem 0' }}>
              {summary.absent}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>Excused: {summary.excused}</span>
          </Card>
        </div>
      )}

      {/* Attendance History Table */}
      <Card title="Attendance Session Log">
        <Table columns={columns} data={attendanceRecords} loading={loading} />
      </Card>
    </div>
  );
}


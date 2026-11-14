import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export function AttendanceAdmin() {
  const { showToast } = useToast();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSession, setSelectedSession] = useState('Morning');

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchClasses = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/sections'),
      ]);
      setClasses(cRes.data || []);
      setSections(sRes.data || []);
      if (cRes.data?.length > 0) {
        setSelectedClass(cRes.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      let url = `/attendance?classId=${selectedClass}&date=${selectedDate}&session=${selectedSession}`;
      if (selectedSection) url += `&sectionId=${selectedSection}`;

      const [attRes, sumRes] = await Promise.all([
        api.get(url),
        api.get(`/attendance/class/${selectedClass}/summary?date=${selectedDate}${selectedSection ? `&sectionId=${selectedSection}` : ''}`),
      ]);

      setRecords(attRes.data || []);
      setSummary(sumRes.data || null);
    } catch (err) {
      showToast(err.message || 'Failed to fetch attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchAttendance();
    }
  }, [selectedClass, selectedSection, selectedDate, selectedSession]);

  const updateStatus = async (record, newStatus) => {
    try {
      await api.post('/attendance/mark', {
        student: record.student._id,
        class: selectedClass,
        section: record.section?._id || selectedSection,
        date: selectedDate,
        session: selectedSession,
        status: newStatus,
        remarks: `Status updated to ${newStatus} by Admin`,
      });
      showToast(`Updated ${record.student.firstName}'s status to ${newStatus}`);
      fetchAttendance();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    { header: 'Admission No', accessor: (row) => row.student?.admissionNo || '-' },
    {
      header: 'Student Name',
      accessor: (row) => `${row.student?.firstName} ${row.student?.lastName}`,
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#111827' }}>
            {row.student?.firstName} {row.student?.lastName}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            Roll: {row.student?.rollNumber}
          </span>
        </div>
      ),
    },
    { header: 'Section', accessor: (row) => row.section?.name || '-' },
    {
      header: 'Session',
      accessor: 'session',
      render: (row) => <Badge variant="neutral">{row.session}</Badge>,
    },
    {
      header: 'Current Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Remarks',
      accessor: 'remarks',
      render: (row) => <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{row.remarks || '-'}</span>,
    },
    {
      header: 'Quick Action',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: '#059669' }}
            onClick={() => updateStatus(row, 'Present')}
          >
            Present
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: '#dc2626' }}
            onClick={() => updateStatus(row, 'Absent')}
          >
            Absent
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: '#d97706' }}
            onClick={() => updateStatus(row, 'Late')}
          >
            Late
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem', color: '#4f46e5' }}
            onClick={() => updateStatus(row, 'Excused')}
          >
            Excused
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Institutional Attendance</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Classroom attendance register, daily session reviews, and safe attendance upsert management.
        </p>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Class Attendance Rate</span>
            <h3 style={{ fontSize: '1.75rem', color: '#059669', margin: '0.2rem 0' }}>
              {summary.percentage}%
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>Present vs Enrolled</span>
          </Card>
          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Students</span>
            <h3 style={{ fontSize: '1.75rem', color: '#1e3a8a', margin: '0.2rem 0' }}>
              {summary.totalStudents}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>{summary.recordedCount} marked</span>
          </Card>
          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Present Count</span>
            <h3 style={{ fontSize: '1.75rem', color: '#059669', margin: '0.2rem 0' }}>
              {summary.present}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#059669' }}>In attendance</span>
          </Card>
          <Card hover={false} style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Absent / Late</span>
            <h3 style={{ fontSize: '1.75rem', color: '#dc2626', margin: '0.2rem 0' }}>
              {summary.absent} / {summary.late}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>Requires follow-up</span>
          </Card>
        </div>
      )}

      {/* Register Filter Controls */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.85rem' }}>Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.85rem' }}>Select Section</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
              <option value="">All Sections</option>
              {sections
                .filter((s) => s.class?._id === selectedClass)
                .map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ fontSize: '0.85rem' }}>Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div style={{ flex: '1 1 160px' }}>
            <label style={{ fontSize: '0.85rem' }}>Session</label>
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
              <option value="Morning">Morning Session</option>
              <option value="Afternoon">Afternoon Session</option>
            </select>
          </div>
        </div>

        <Table columns={columns} data={records} loading={loading} />
      </Card>
    </div>
  );
}


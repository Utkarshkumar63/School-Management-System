import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { CalendarCheck, CheckCheck, Save } from 'lucide-react';

export function MarkAttendance() {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null); // { classId, sectionId, className, sectionName }
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [session, setSession] = useState('Morning');

  const [students, setStudents] = useState([]);
  const [roster, setRoster] = useState({}); // { studentId: { status, remarks } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch teacher assignments
  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/assignments/my');
      const list = res.data || [];
      setAssignments(list);

      // Extract unique class/section pairs
      const pairs = [];
      list.forEach((a) => {
        if (a.class && a.section) {
          const key = `${a.class._id}_${a.section._id}`;
          if (!pairs.some((p) => p.key === key)) {
            pairs.push({
              key,
              classId: a.class._id,
              sectionId: a.section._id,
              className: a.class.name,
              sectionName: a.section.name,
            });
          }
        }
      });

      if (pairs.length > 0) {
        setSelectedPair(pairs[0]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch teaching assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch students for selected assigned class and section, and existing attendance
  const fetchStudentsAndAttendance = async () => {
    if (!selectedPair) return;
    setLoading(true);
    try {
      const [stdRes, attRes] = await Promise.all([
        api.get(`/academic/students?classId=${selectedPair.classId}&sectionId=${selectedPair.sectionId}&limit=100`),
        api.get(`/attendance?classId=${selectedPair.classId}&sectionId=${selectedPair.sectionId}&date=${date}&session=${session}`),
      ]);

      const studentList = stdRes.data || [];
      const existingRecords = attRes.data || [];

      setStudents(studentList);

      // Build roster map with existing records or default to 'Present'
      const newRoster = {};
      studentList.forEach((st) => {
        const found = existingRecords.find((r) => r.student?._id === st._id);
        if (found) {
          newRoster[st._id] = { status: found.status, remarks: found.remarks || '' };
        } else {
          newRoster[st._id] = { status: 'Present', remarks: '' };
        }
      });

      setRoster(newRoster);
    } catch (err) {
      showToast(err.message || 'Failed to fetch student roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedPair) {
      fetchStudentsAndAttendance();
    }
  }, [selectedPair, date, session]);

  const handleStatusChange = (studentId, status) => {
    setRoster((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRoster((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAllPresent = () => {
    setRoster((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((id) => {
        updated[id].status = 'Present';
      });
      return updated;
    });
    showToast('Marked all students as Present');
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(roster).map(([studentId, data]) => ({
        student: studentId,
        status: data.status,
        remarks: data.remarks,
      }));

      const res = await api.post('/attendance/mark-batch', {
        class: selectedPair.classId,
        section: selectedPair.sectionId,
        date,
        session,
        records,
      });

      showToast(res.message || 'Attendance register saved successfully!');
      fetchStudentsAndAttendance();
    } catch (err) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Get distinct pairs for selector
  const distinctPairs = [];
  assignments.forEach((a) => {
    if (a.class && a.section) {
      const key = `${a.class._id}_${a.section._id}`;
      if (!distinctPairs.some((p) => p.key === key)) {
        distinctPairs.push({
          key,
          classId: a.class._id,
          sectionId: a.section._id,
          className: a.class.name,
          sectionName: a.section.name,
        });
      }
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Daily Attendance Register</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Record morning or afternoon roll call. Duplicate entries on the same student, date, and session are safely updated.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={markAllPresent} icon={<CheckCheck size={16} />}>
            Mark All Present
          </Button>
          <Button variant="primary" onClick={saveAttendance} loading={saving} icon={<Save size={16} />}>
            Submit Attendance
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem' }}>My Assigned Class & Section</label>
            <select
              value={selectedPair?.key || ''}
              onChange={(e) => {
                const found = distinctPairs.find((p) => p.key === e.target.value);
                if (found) setSelectedPair(found);
              }}
            >
              {distinctPairs.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.className} - {p.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem' }}>Attendance Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem' }}>Session</label>
            <select value={session} onChange={(e) => setSession(e.target.value)}>
              <option value="Morning">Morning Session</option>
              <option value="Afternoon">Afternoon Session</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Student Roster Table */}
      <Card>
        {loading ? (
          <Spinner text="Loading classroom roster..." />
        ) : students.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No students enrolled in this section.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Roll No</th>
                  <th>Student Name</th>
                  <th style={{ width: '130px' }}>Admission No</th>
                  <th style={{ width: '360px' }}>Attendance Status</th>
                  <th>Remarks (Optional)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const currentStatus = roster[st._id]?.status || 'Present';
                  const currentRemarks = roster[st._id]?.remarks || '';

                  return (
                    <tr key={st._id}>
                      <td>
                        <strong>{st.rollNumber}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#111827' }}>
                          {st.firstName} {st.lastName}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{st.admissionNo}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {['Present', 'Absent', 'Late', 'Excused'].map((stType) => {
                            const isSelected = currentStatus === stType;
                            let activeBg = '#10b981';
                            if (stType === 'Absent') activeBg = '#ef4444';
                            else if (stType === 'Late') activeBg = '#f59e0b';
                            else if (stType === 'Excused') activeBg = '#6366f1';

                            return (
                              <button
                                key={stType}
                                type="button"
                                onClick={() => handleStatusChange(st._id, stType)}
                                style={{
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '8px',
                                  fontSize: '0.85rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  border: isSelected ? `2px solid ${activeBg}` : '1px solid #d1d5db',
                                  background: isSelected ? activeBg : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#374151',
                                }}
                              >
                                {stType}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Note (e.g. sick leave, late arrival)"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(st._id, e.target.value)}
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}


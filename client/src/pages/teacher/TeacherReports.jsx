import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { FileSpreadsheet, CalendarCheck, Award } from 'lucide-react';

export function TeacherReports() {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/assignments/my');
      const list = res.data || [];
      setAssignments(list);
      if (list.length > 0) {
        setSelectedAssignment(list[0]);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassReport = async () => {
    if (!selectedAssignment?.class?._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/attendance?classId=${selectedAssignment.class._id}&sectionId=${selectedAssignment.section._id}`);
      setReportData(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to load report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      fetchClassReport();
    }
  }, [selectedAssignment]);

  const columns = [
    { header: 'Admission No', accessor: 'admissionNo' },
    { header: 'Roll No', accessor: 'rollNumber' },
    {
      header: 'Student Name',
      accessor: 'studentName',
      render: (r) => <span style={{ fontWeight: 700 }}>{r.studentName}</span>,
    },
    { header: 'Total Sessions', accessor: 'totalSessions' },
    {
      header: 'Present Count',
      accessor: 'present',
      render: (r) => <span style={{ color: '#059669', fontWeight: 600 }}>{r.present}</span>,
    },
    {
      header: 'Absent Count',
      accessor: 'absent',
      render: (r) => <span style={{ color: '#dc2626', fontWeight: 600 }}>{r.absent}</span>,
    },
    { header: 'Late Count', accessor: 'late' },
    {
      header: 'Attendance %',
      accessor: 'percentage',
      render: (r) => (
        <strong style={{ color: r.percentage >= 75 ? '#059669' : '#dc2626' }}>
          {r.percentage}%
        </strong>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Classroom Attendance & Engagement Reports</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Evaluate attendance consistency across students in your appointed sections.
        </p>
      </div>

      <Card>
        <div style={{ maxWidth: '360px', marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.85rem' }}>Select Assigned Class & Section</label>
          <select
            value={selectedAssignment?._id || ''}
            onChange={(e) => {
              const found = assignments.find((a) => a._id === e.target.value);
              if (found) setSelectedAssignment(found);
            }}
          >
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.class?.name} - {a.section?.name} ({a.subject?.name})
              </option>
            ))}
          </select>
        </div>

        <Table columns={columns} data={reportData} loading={loading} />
      </Card>
    </div>
  );
}


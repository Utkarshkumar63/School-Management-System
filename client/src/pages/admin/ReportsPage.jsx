import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Download, Calendar, Award, IndianRupee, Filter } from 'lucide-react';

export function ReportsPage() {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState('attendance'); // 'attendance' | 'academic' | 'fees'

  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDropdowns = async () => {
    try {
      const [clsRes, exRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/exams'),
      ]);
      setClasses(clsRes.data || []);
      setExams(exRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (reportType === 'attendance') {
        endpoint = `/reports/attendance?classId=${selectedClass}&startDate=${startDate}&endDate=${endDate}`;
      } else if (reportType === 'academic') {
        endpoint = `/reports/academic?examId=${selectedExam}&classId=${selectedClass}`;
      } else if (reportType === 'fees') {
        endpoint = `/reports/fees?status=${selectedStatus}&startDate=${startDate}&endDate=${endDate}`;
      }

      const res = await api.get(endpoint);
      setReportData(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch report data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchReport();
  }, [reportType, selectedClass, selectedExam, selectedStatus]);

  const handleExportCsv = () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
    let url = '';
    const token = localStorage.getItem('token');

    if (reportType === 'attendance') {
      url = `${baseUrl}/reports/attendance?format=csv&classId=${selectedClass}&startDate=${startDate}&endDate=${endDate}`;
    } else if (reportType === 'academic') {
      url = `${baseUrl}/reports/academic?format=csv&examId=${selectedExam}&classId=${selectedClass}`;
    } else if (reportType === 'fees') {
      url = `${baseUrl}/reports/fees?format=csv&status=${selectedStatus}&startDate=${startDate}&endDate=${endDate}`;
    }

    // Trigger download
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${reportType}_report_${Date.now()}.csv`;
        link.click();
        showToast('CSV report export started');
      })
      .catch((err) => showToast('Failed to export CSV', 'error'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Institutional Intelligence & Reports</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Comprehensive analytics, academic trends, fee collection status, and direct CSV data exports.
          </p>
        </div>

        <Button onClick={handleExportCsv} variant="primary" icon={<Download size={16} />}>
          Export CSV Data
        </Button>
      </div>

      {/* Report Type Selector Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(229, 231, 235, 0.8)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${reportType === 'attendance' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setReportType('attendance')}
        >
          <Calendar size={14} /> Attendance Report
        </button>
        <button
          className={`btn ${reportType === 'academic' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setReportType('academic')}
        >
          <Award size={14} /> Academic Performance Report
        </button>
        <button
          className={`btn ${reportType === 'fees' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setReportType('fees')}
        >
          <IndianRupee size={14} /> Fee Collection Report
        </button>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
          {reportType !== 'fees' && (
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: '0.85rem' }}>Filter by Class</label>
              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'academic' && (
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: '0.85rem' }}>Filter by Examination</label>
              <select value={selectedExam} onChange={(e) => setSelectedExam(e.target.value)}>
                <option value="">All Examinations</option>
                {exams.map((ex) => (
                  <option key={ex._id} value={ex._id}>
                    {ex.name} ({ex.term})
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'fees' && (
            <div style={{ flex: '1 1 180px' }}>
              <label style={{ fontSize: '0.85rem' }}>Invoice Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <Button size="sm" variant="secondary" onClick={fetchReport}>
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Live Report Preview Table */}
        {reportType === 'attendance' && (
          <Table
            columns={[
              { header: 'Admission No', accessor: 'admissionNo' },
              { header: 'Student Name', accessor: 'studentName' },
              { header: 'Class', accessor: 'className' },
              { header: 'Section', accessor: 'sectionName' },
              { header: 'Total Sessions', accessor: 'totalSessions' },
              { header: 'Present', accessor: 'present', render: (r) => <span style={{ color: '#059669', fontWeight: 600 }}>{r.present}</span> },
              { header: 'Absent', accessor: 'absent', render: (r) => <span style={{ color: '#dc2626', fontWeight: 600 }}>{r.absent}</span> },
              { header: 'Late', accessor: 'late' },
              { header: 'Excused', accessor: 'excused' },
              {
                header: 'Attendance %',
                accessor: 'percentage',
                render: (r) => (
                  <strong style={{ color: r.percentage >= 75 ? '#059669' : '#dc2626' }}>
                    {r.percentage}%
                  </strong>
                ),
              },
            ]}
            data={reportData}
            loading={loading}
          />
        )}

        {reportType === 'academic' && (
          <Table
            columns={[
              { header: 'Rank', accessor: 'rank', render: (r) => <strong>#{r.rank}</strong> },
              { header: 'Admission No', accessor: 'admissionNo' },
              { header: 'Student Name', accessor: 'studentName' },
              { header: 'Exam', accessor: 'examName' },
              { header: 'Class', accessor: 'className' },
              {
                header: 'Marks',
                render: (r) => `${r.totalMarksObtained} / ${r.totalMaxMarks}`,
              },
              {
                header: 'Percentage',
                accessor: 'percentage',
                render: (r) => <strong>{r.percentage}%</strong>,
              },
              {
                header: 'Grade',
                accessor: 'grade',
                render: (r) => <Badge status={r.isPassed}>{r.grade}</Badge>,
              },
              {
                header: 'Result',
                accessor: 'isPassed',
                render: (r) => <Badge status={r.isPassed} />,
              },
            ]}
            data={reportData}
            loading={loading}
          />
        )}

        {reportType === 'fees' && (
          <Table
            columns={[
              { header: 'Invoice No', accessor: 'invoiceNumber' },
              { header: 'Admission No', accessor: 'admissionNo' },
              { header: 'Student Name', accessor: 'studentName' },
              { header: 'Class', accessor: 'className' },
              { header: 'Invoiced (₹)', accessor: 'totalAmount', render: (r) => `₹${r.totalAmount?.toLocaleString()}` },
              { header: 'Paid (₹)', accessor: 'paidAmount', render: (r) => <span style={{ color: '#059669' }}>₹{r.paidAmount?.toLocaleString()}</span> },
              { header: 'Outstanding (₹)', accessor: 'outstandingAmount', render: (r) => <strong style={{ color: '#dc2626' }}>₹{r.outstandingAmount?.toLocaleString()}</strong> },
              { header: 'Due Date', accessor: 'dueDate' },
              { header: 'Status', accessor: 'status', render: (r) => <Badge status={r.status} /> },
            ]}
            data={reportData}
            loading={loading}
          />
        )}
      </Card>
    </div>
  );
}

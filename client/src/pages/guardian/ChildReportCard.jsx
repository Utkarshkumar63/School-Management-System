import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Printer, Award, BookOpen } from 'lucide-react';

export function ChildReportCard() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('studentId') || '');
  const [reportData, setReportData] = useState(null);
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

  const fetchReportCard = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const res = await api.get(`/exams/report-card/${selectedStudentId}`);
      setReportData(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch report card', 'error');
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
      fetchReportCard();
    }
  }, [selectedStudentId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Official Student Report Card</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Official assessment transcripts, letter grades, and faculty evaluation remarks.
          </p>
        </div>

        <Button variant="primary" icon={<Printer size={16} />} onClick={() => window.print()}>
          Print / Download PDF
        </Button>
      </div>

      {/* Child Switcher */}
      {children.length > 1 && (
        <Card className="no-print" style={{ padding: '1rem' }}>
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

      {loading ? (
        <Spinner text="Compiling academic transcript..." />
      ) : !reportData || !reportData.results?.length ? (
        <Card>
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem' }}>
            No examination results have been published for this student yet.
          </p>
        </Card>
      ) : (
        <div
          className="printable-card glass-panel"
          style={{
            padding: '2.5rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid rgba(209, 213, 219, 0.8)',
          }}
        >
          {/* Institution Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#1e3a8a', fontSize: '2rem', margin: 0, letterSpacing: '-0.02em' }}>
              ALGIONS ACADEMY OF ADVANCED STUDIES
            </h2>
            <p style={{ margin: '0.35rem 0', fontSize: '1.05rem', color: '#374151', fontWeight: 600 }}>
              Official Student Academic Performance Transcript
            </p>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Affiliated with Algions AI Labs • Academic Session 2025-2026
            </span>
          </div>

          {/* Student & Guardian Info */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              background: '#f8fafc',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '2rem',
              fontSize: '0.95rem',
            }}
          >
            <div><strong>Student Name:</strong> {reportData.student.firstName} {reportData.student.lastName}</div>
            <div><strong>Admission No:</strong> {reportData.student.admissionNo}</div>
            <div><strong>Class & Section:</strong> {reportData.student.class?.name} ({reportData.student.section?.name})</div>
            <div><strong>Roll Number:</strong> {reportData.student.rollNumber}</div>
            <div><strong>Guardian / Parent:</strong> {reportData.student.guardian?.name || 'Guardian'}</div>
            <div><strong>Generated At:</strong> {new Date().toLocaleDateString()}</div>
          </div>

          {/* Results per Exam */}
          {reportData.results.map((resObj) => (
            <div key={resObj._id} style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.3rem' }}>
                  {resObj.exam?.name} • {resObj.exam?.term}
                </h3>
                <Badge status={resObj.isPassed ? 'Passed' : 'Failed'}>
                  Overall: {resObj.grade} ({resObj.isPassed ? 'Passed' : 'Failed'})
                </Badge>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ padding: '0.65rem' }}>Course / Subject</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Max Marks</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Passing Marks</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Marks Scored</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Percentage</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Grade</th>
                    <th style={{ padding: '0.65rem', textAlign: 'center' }}>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {resObj.marks?.map((m) => (
                    <tr key={m._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.65rem' }}>
                        <strong>{m.subject?.name}</strong> <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({m.subject?.code})</span>
                      </td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>{m.maxMarks}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>{m.passingMarks || 40}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 700 }}>
                        {m.isAbsent ? <span style={{ color: '#dc2626' }}>Absent</span> : m.marksObtained}
                      </td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>{m.percentage}%</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center', fontWeight: 700 }}>{m.grade}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                        <Badge status={m.isPassed ? 'Passed' : 'Failed'} />
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>
                    <td style={{ padding: '0.75rem' }}>Cumulative Aggregate</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{resObj.totalMaxMarks}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#1e3a8a' }}>{resObj.totalMarksObtained}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center', color: '#1e3a8a' }}>{resObj.percentage}%</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{resObj.grade}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <Badge status={resObj.isPassed ? 'Passed' : 'Failed'} />
                    </td>
                  </tr>
                </tbody>
              </table>

              {resObj.remarks && (
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', borderLeft: '4px solid #1e3a8a' }}>
                  <strong>Evaluator Remarks:</strong> <em>"{resObj.remarks}"</em>
                </div>
              )}
            </div>
          ))}

          {/* Footer Signature Box */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '3.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #cbd5e1',
            }}
          >
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '40px' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Class Teacher</span>
            </div>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #000', marginBottom: '0.5rem', height: '40px' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Principal / Dean</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


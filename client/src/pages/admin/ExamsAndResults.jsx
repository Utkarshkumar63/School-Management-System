import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Plus, Award, Printer, Eye, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

export function ExamsAndResults() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsExamModalOpen(true);
    }
  }, [searchParams]);

  const { register, control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: '',
      term: 'Term 1',
      academicYear: '2025-2026',
      subjects: [{ subject: '', maxMarks: 100, passingMarks: 40 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'subjects',
  });

  const selectedClass = watch('class');

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [exRes, clsRes, subRes] = await Promise.all([
        api.get('/exams'),
        api.get('/academic/classes'),
        api.get('/academic/subjects'),
      ]);
      setExams(exRes.data || []);
      setClasses(clsRes.data || []);
      setSubjects(subRes.data || []);

      if (exRes.data?.length > 0) {
        setSelectedExamId(exRes.data[0]._id);
      }
    } catch (err) {
      showToast(err.message || 'Failed to fetch exam records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    if (!selectedExamId) return;
    try {
      const res = await api.get(`/exams/results/list?examId=${selectedExamId}`);
      setResults(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInitial();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchResults();
    }
  }, [selectedExamId]);

  const onCreateExam = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/exams', {
        ...data,
        subjects: data.subjects.map((s) => ({
          subject: s.subject,
          maxMarks: Number(s.maxMarks) || 100,
          passingMarks: Number(s.passingMarks) || 40,
        })),
      });
      showToast('Exam created successfully');
      setIsExamModalOpen(false);
      reset();
      fetchInitial();
    } catch (err) {
      showToast(err.message || 'Failed to create exam', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openReportCard = async (studentId) => {
    try {
      const res = await api.get(`/exams/report-card/${studentId}?examId=${selectedExamId}`);
      setReportCardData(res.data);
    } catch (err) {
      showToast(err.message || 'Failed to generate report card', 'error');
    }
  };

  const resultColumns = [
    {
      header: 'Student',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#111827' }}>
            {row.student?.firstName} {row.student?.lastName}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            Adm: {row.student?.admissionNo} | Roll: {row.student?.rollNumber}
          </span>
        </div>
      ),
    },
    { header: 'Class / Sec', accessor: (row) => `${row.class?.name || '-'} (${row.section?.name || '-'})` },
    {
      header: 'Marks Scored',
      render: (row) => (
        <span style={{ fontWeight: 700 }}>
          {row.totalMarksObtained} / {row.totalMaxMarks}
        </span>
      ),
    },
    {
      header: 'Percentage',
      accessor: (row) => `${row.percentage}%`,
      render: (row) => (
        <span style={{ fontWeight: 700, color: row.percentage >= 60 ? '#059669' : '#dc2626' }}>
          {row.percentage}%
        </span>
      ),
    },
    {
      header: 'Grade',
      accessor: 'grade',
      render: (row) => <Badge status={row.isPassed ? 'Passed' : 'Failed'}>{row.grade}</Badge>,
    },
    {
      header: 'Result Status',
      accessor: (row) => (row.isPassed ? 'Passed' : 'Failed'),
      render: (row) => <Badge status={row.isPassed ? 'Passed' : 'Failed'} />,
    },
    {
      header: 'Report Card',
      render: (row) => (
        <Button
          size="sm"
          variant="secondary"
          icon={<Eye size={14} />}
          onClick={() => openReportCard(row.student?._id)}
        >
          View Card
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Examinations & Performance</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Create academic term examinations, inspect scored marks, and generate official student report cards.
          </p>
        </div>

        <Button onClick={() => setIsExamModalOpen(true)} icon={<Plus size={16} />}>
          + Create Exam
        </Button>
      </div>

      {/* Exam Selector */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={22} color="#1e3a8a" />
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Select Assessment:</span>
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              style={{ width: 'auto', minWidth: '240px' }}
            >
              {exams.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.class?.name} - {e.term})
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={resultColumns}
          data={results}
          loading={loading}
          emptyTitle="No results published yet"
          emptyDescription="Marks have not been recorded by faculty for this examination yet."
        />
      </Card>

      {/* Schedule Exam Modal */}
      <Modal isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} title="Schedule Examination" maxWidth="640px">
        <form onSubmit={handleSubmit(onCreateExam)}>
          <Input label="Examination Name" placeholder="e.g. Midterm Examination 2026" required {...register('name', { required: true })} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Class"
              required
              options={classes.map((c) => ({ label: c.name, value: c._id }))}
              {...register('class', { required: true })}
            />
            <Input label="Term" placeholder="e.g. Term 1" defaultValue="Term 1" required {...register('term', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Academic Year" defaultValue="2025-2026" required {...register('academicYear', { required: true })} />
            <Input label="Start Date" type="date" {...register('startDate')} />
          </div>

          {/* Subject Marks Structure */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Examination Subjects:</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => append({ subject: '', maxMarks: 100, passingMarks: 40 })}
              >
                + Add Subject
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                <Select
                  label={index === 0 ? 'Subject' : ''}
                  required
                  options={subjects
                    .filter((s) => !selectedClass || s.class?._id === selectedClass)
                    .map((s) => ({ label: `${s.name} (${s.code})`, value: s._id }))}
                  {...register(`subjects.${index}.subject`, { required: true })}
                />
                <Input
                  label={index === 0 ? 'Max Marks' : ''}
                  type="number"
                  defaultValue="100"
                  required
                  {...register(`subjects.${index}.maxMarks`, { required: true })}
                />
                <Input
                  label={index === 0 ? 'Passing' : ''}
                  type="number"
                  defaultValue="40"
                  required
                  {...register(`subjects.${index}.passingMarks`, { required: true })}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626', marginBottom: '1rem' }}
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsExamModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Schedule Exam</Button>
          </div>
        </form>
      </Modal>

      {/* Official Report Card Modal */}
      <Modal isOpen={!!reportCardData} onClose={() => setReportCardData(null)} title="Official Student Report Card" maxWidth="720px">
        {reportCardData && (
          <div className="printable-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '12px', border: '1px solid #d1d5db' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #1e3a8a', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h2 style={{ color: '#1e3a8a', fontSize: '1.75rem', margin: 0 }}>ALGIONS ACADEMY OF EXCELLENCE</h2>
              <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#4b5563' }}>Academic Progress & Performance Assessment Transcript</p>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Accredited Evaluation Laboratory • Session 2025-2026</span>
            </div>

            {/* Student Meta Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.95rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <div><strong>Student Name:</strong> {reportCardData.student.firstName} {reportCardData.student.lastName}</div>
              <div><strong>Admission No:</strong> {reportCardData.student.admissionNo}</div>
              <div><strong>Class & Section:</strong> {reportCardData.student.class?.name} - {reportCardData.student.section?.name}</div>
              <div><strong>Roll Number:</strong> {reportCardData.student.rollNumber}</div>
              <div><strong>Parent / Guardian:</strong> {reportCardData.student.guardian?.name || 'Authorized Family'}</div>
              <div><strong>Issued Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>

            {/* Results Table */}
            {reportCardData.results?.map((resObj) => (
              <div key={resObj._id} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.35rem', marginBottom: '0.5rem' }}>
                  {resObj.exam?.name} ({resObj.exam?.term})
                </h4>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.75rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9' }}>
                      <th style={{ padding: '0.5rem' }}>Subject</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Max Marks</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Marks Obtained</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Percentage</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Grade</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resObj.marks?.map((m) => (
                      <tr key={m._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.5rem' }}>{m.subject?.name}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{m.maxMarks}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>
                          {m.isAbsent ? 'Absent' : m.marksObtained}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{m.percentage}%</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 700 }}>{m.grade}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <Badge status={m.isPassed ? 'Passed' : 'Failed'} />
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td style={{ padding: '0.65rem' }}>Cumulative Aggregate</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>{resObj.totalMaxMarks}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>{resObj.totalMarksObtained}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center', color: '#1e3a8a' }}>{resObj.percentage}%</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>{resObj.grade}</td>
                      <td style={{ padding: '0.65rem', textAlign: 'center' }}>
                        <Badge status={resObj.isPassed ? 'Passed' : 'Failed'} />
                      </td>
                    </tr>
                  </tbody>
                </table>

                {resObj.remarks && (
                  <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#4b5563' }}>
                    <strong>Faculty Remarks:</strong> "{resObj.remarks}"
                  </p>
                )}
              </div>
            ))}

            {/* Grading Scale Reference */}
            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', fontSize: '0.8rem', color: '#6b7280' }}>
              <strong>Standard Institutional Grading Scale:</strong> A+ (90-100%), A (80-89%), B+ (75-79%), B (70-74%), C+ (60-69%), C (50-59%), D (40-49%), F (&lt;40% Fail).
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }} className="no-print">
              <Button variant="secondary" onClick={() => setReportCardData(null)}>
                Close
              </Button>
              <Button variant="primary" icon={<Printer size={16} />} onClick={() => window.print()}>
                Print / Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Award, Save, CheckCircle2 } from 'lucide-react';

export function EnterMarks() {
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);

  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({}); // { studentId: { marksObtained, isAbsent, remarks } }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Fetch teacher's assignments
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
      showToast(err.message || 'Failed to fetch assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch exams for selected class
  const fetchExams = async () => {
    if (!selectedAssignment?.class?._id) return;
    try {
      const res = await api.get(`/exams?classId=${selectedAssignment.class._id}`);
      const list = res.data || [];
      setExams(list);
      if (list.length > 0) {
        setSelectedExam(list[0]);
      } else {
        setSelectedExam(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Fetch students and existing marks for selected class & exam
  const fetchStudentsAndExistingMarks = async () => {
    if (!selectedAssignment || !selectedExam) return;
    setLoading(true);
    try {
      const [stdRes, resRes] = await Promise.all([
        api.get(`/academic/students?classId=${selectedAssignment.class._id}&sectionId=${selectedAssignment.section._id}&limit=100`),
        api.get(`/exams/results/list?examId=${selectedExam._id}&classId=${selectedAssignment.class._id}&sectionId=${selectedAssignment.section._id}`),
      ]);

      const studentList = stdRes.data || [];
      const existingResults = resRes.data || [];

      setStudents(studentList);

      const targetSubjectId = selectedAssignment.subject?._id?.toString();
      const map = {};

      studentList.forEach((st) => {
        const foundResult = existingResults.find((r) => r.student?._id === st._id);
        const subjectMark = foundResult?.marks?.find(
          (m) => m.subject?._id?.toString() === targetSubjectId || m.subject?.toString() === targetSubjectId
        );

        if (subjectMark) {
          map[st._id] = {
            marksObtained: subjectMark.marksObtained,
            isAbsent: subjectMark.isAbsent || false,
            remarks: foundResult.remarks || '',
          };
        } else {
          map[st._id] = {
            marksObtained: 75,
            isAbsent: false,
            remarks: '',
          };
        }
      });

      setMarksMap(map);
    } catch (err) {
      showToast(err.message || 'Failed to load marks roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedAssignment) {
      fetchExams();
    }
  }, [selectedAssignment]);

  useEffect(() => {
    if (selectedAssignment && selectedExam) {
      fetchStudentsAndExistingMarks();
    }
  }, [selectedAssignment, selectedExam]);

  const handleMarkChange = (studentId, value) => {
    const num = Number(value);
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: num,
      },
    }));
  };

  const handleAbsentToggle = (studentId, isAbsent) => {
    setMarksMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isAbsent,
        marksObtained: isAbsent ? 0 : prev[studentId]?.marksObtained || 0,
      },
    }));
  };

  // Find max marks for the selected subject in the exam
  const examSubjectConfig = selectedExam?.subjects?.find(
    (s) => s.subject?._id?.toString() === selectedAssignment?.subject?._id?.toString() ||
           s.subject?.toString() === selectedAssignment?.subject?._id?.toString()
  );
  const maxMarks = examSubjectConfig ? examSubjectConfig.maxMarks : 100;
  const passingMarks = examSubjectConfig ? examSubjectConfig.passingMarks : 40;

  const saveMarks = async () => {
    if (!selectedAssignment || !selectedExam) return;

    // Client validation
    for (const st of students) {
      const entry = marksMap[st._id];
      if (entry && !entry.isAbsent && entry.marksObtained > maxMarks) {
        showToast(
          `Marks for ${st.firstName} (${entry.marksObtained}) cannot exceed maximum marks (${maxMarks})`,
          'error'
        );
        return;
      }
    }

    setSaving(true);
    try {
      // Save marks for each student
      let successCount = 0;
      for (const st of students) {
        const entry = marksMap[st._id];
        if (entry) {
          await api.post('/exams/marks', {
            exam: selectedExam._id,
            student: st._id,
            class: selectedAssignment.class._id,
            section: selectedAssignment.section._id,
            marks: [
              {
                subject: selectedAssignment.subject._id,
                marksObtained: entry.isAbsent ? 0 : Number(entry.marksObtained),
                maxMarks,
                passingMarks,
                isAbsent: Boolean(entry.isAbsent),
              },
            ],
            remarks: entry.remarks || '',
          });
          successCount++;
        }
      }

      showToast(`Successfully published marks for ${successCount} students!`);
      fetchStudentsAndExistingMarks();
    } catch (err) {
      showToast(err.message || 'Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Examination Marks Entry</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Record and update student assessment scores for your authorized courses. Enforces automatic grading policy calculation.
          </p>
        </div>

        <Button variant="primary" onClick={saveMarks} loading={saving} icon={<Save size={16} />}>
          Publish Marks
        </Button>
      </div>

      {/* Select Assignment & Exam Controls */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem' }}>Select Teaching Assignment</label>
            <select
              value={selectedAssignment?._id || ''}
              onChange={(e) => {
                const found = assignments.find((a) => a._id === e.target.value);
                if (found) setSelectedAssignment(found);
              }}
            >
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.class?.name} - {a.section?.name} | {a.subject?.name} ({a.subject?.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem' }}>Select Scheduled Examination</label>
            <select
              value={selectedExam?._id || ''}
              onChange={(e) => {
                const found = exams.find((ex) => ex._id === e.target.value);
                if (found) setSelectedExam(found);
              }}
            >
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name} ({ex.term})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Marking Criteria</span>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <Badge variant="info">Max: {maxMarks} Marks</Badge>
              <Badge variant="warning">Passing: {passingMarks} Marks</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Marks Table */}
      <Card>
        {loading ? (
          <Spinner text="Loading examination roster..." />
        ) : !selectedExam ? (
          <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
            No examinations scheduled for this class yet.
          </p>
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
                  <th style={{ width: '180px' }}>Marks Scored (Max {maxMarks})</th>
                  <th style={{ width: '120px' }}>Absent?</th>
                  <th style={{ width: '120px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st) => {
                  const data = marksMap[st._id] || { marksObtained: 0, isAbsent: false };
                  const isPassing = !data.isAbsent && data.marksObtained >= passingMarks;

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
                        <input
                          type="number"
                          min="0"
                          max={maxMarks}
                          value={data.isAbsent ? 0 : data.marksObtained}
                          disabled={data.isAbsent}
                          onChange={(e) => handleMarkChange(st._id, e.target.value)}
                          style={{
                            maxWidth: '120px',
                            fontWeight: 700,
                            color: data.marksObtained > maxMarks ? '#dc2626' : '#111827',
                          }}
                        />
                        {data.marksObtained > maxMarks && (
                          <span style={{ color: '#dc2626', fontSize: '0.75rem', display: 'block' }}>
                            Exceeds {maxMarks}!
                          </span>
                        )}
                      </td>
                      <td>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={data.isAbsent}
                            onChange={(e) => handleAbsentToggle(st._id, e.target.checked)}
                            style={{ width: 'auto' }}
                          />
                          <span style={{ fontSize: '0.85rem' }}>Absent</span>
                        </label>
                      </td>
                      <td>
                        <Badge status={isPassing ? 'Passed' : 'Failed'}>
                          {data.isAbsent ? 'Absent' : isPassing ? 'Passing' : 'Failing'}
                        </Badge>
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


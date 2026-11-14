import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Plus, Trash2, ClipboardCheck, GraduationCap } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function TeacherAssignments() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const { register, handleSubmit, reset, watch } = useForm();
  const selectedClass = watch('class');

  const fetchDropdowns = async () => {
    try {
      const [tRes, cRes, sRes, subRes] = await Promise.all([
        api.get('/academic/teachers?limit=100'),
        api.get('/academic/classes'),
        api.get('/academic/sections'),
        api.get('/academic/subjects'),
      ]);
      setTeachers(tRes.data || []);
      setClasses(cRes.data || []);
      setSections(sRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic/assignments');
      setAssignments(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchAssignments();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/assignments', data);
      showToast('Teacher assigned successfully!');
      setIsModalOpen(false);
      reset();
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Failed to assign teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Revoke this teaching assignment?')) return;
    try {
      await api.delete(`/academic/assignments/${id}`);
      showToast('Assignment revoked');
      fetchAssignments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Faculty Member',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#111827' }}>
            {row.teacher?.firstName} {row.teacher?.lastName}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            ID: {row.teacher?.employeeId}
          </span>
        </div>
      ),
    },
    { header: 'Class', accessor: (row) => row.class?.name || '-' },
    { header: 'Section', accessor: (row) => row.section?.name || '-' },
    {
      header: 'Subject Taught',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#1e3a8a' }}>
          {row.subject?.name} ({row.subject?.code})
        </span>
      ),
    },
    { header: 'Academic Year', accessor: 'academicYear' },
    {
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          style={{ color: '#dc2626' }}
          onClick={() => handleDelete(row._id)}
          title="Revoke Assignment"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Faculty Teaching Assignments</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Delegate class, section, and subject authority to teachers. Strictly controls attendance and grading authorization.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          + Assign Teacher
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={assignments} loading={loading} />
      </Card>

      {/* Assignment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Assign Teacher to Subject & Class">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Select
            label="Select Teacher"
            required
            options={teachers.map((t) => ({
              label: `${t.firstName} ${t.lastName} (${t.employeeId})`,
              value: t._id,
            }))}
            {...register('teacher', { required: true })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Class"
              required
              options={classes.map((c) => ({ label: c.name, value: c._id }))}
              {...register('class', { required: true })}
            />
            <Select
              label="Section"
              required
              options={sections
                .filter((s) => !selectedClass || s.class?._id === selectedClass)
                .map((s) => ({ label: s.name, value: s._id }))}
              {...register('section', { required: true })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Subject"
              required
              options={subjects
                .filter((sub) => !selectedClass || sub.class?._id === selectedClass)
                .map((sub) => ({ label: `${sub.name} (${sub.code})`, value: sub._id }))}
              {...register('subject', { required: true })}
            />
            <Input label="Academic Year" defaultValue="2025-2026" required {...register('academicYear', { required: true })} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Establish Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


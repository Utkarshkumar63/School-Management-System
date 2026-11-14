import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Plus, Trash2, Edit, Sliders } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function GradingRules() {
  const { showToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchRules = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exams/grading/rules');
      setRules(res.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch grading scale', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/exams/grading/rules', {
        ...data,
        minPercentage: Number(data.minPercentage),
        maxPercentage: Number(data.maxPercentage),
        gradePoint: Number(data.gradePoint),
        isPassing: data.isPassing === 'true' || data.isPassing === true,
      });
      showToast('Grading rule established successfully');
      setIsModalOpen(false);
      reset();
      fetchRules();
    } catch (err) {
      showToast(err.message || 'Failed to create grading rule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grading tier?')) return;
    try {
      await api.delete(`/exams/grading/rules/${id}`);
      showToast('Rule removed');
      fetchRules();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const columns = [
    {
      header: 'Grade Letter',
      accessor: 'grade',
      render: (row) => (
        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e3a8a' }}>
          {row.grade}
        </span>
      ),
    },
    {
      header: 'Percentage Range',
      render: (row) => `${row.minPercentage}% - ${row.maxPercentage}%`,
    },
    { header: 'Grade Point (GPA)', accessor: 'gradePoint' },
    { header: 'Descriptor', accessor: 'description' },
    {
      header: 'Pass Status',
      accessor: 'isPassing',
      render: (row) => (
        <Badge status={row.isPassing ? 'Passed' : 'Failed'}>
          {row.isPassing ? 'Passing' : 'Failing'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      width: '100px',
      render: (row) => (
        <button
          className="btn btn-secondary btn-sm"
          style={{ color: '#dc2626' }}
          onClick={() => handleDelete(row._id)}
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
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Grading Policy Engine</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Stored in DB & fully editable by admin. Automatically drives marks evaluation, GPA, and report cards.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          + Add Grading Rule
        </Button>
      </div>

      <Card>
        <Table columns={columns} data={rules} loading={loading} />
      </Card>

      {/* Add Grading Rule Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Configure Grading Tier">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Grade Name" placeholder="e.g. A+ Honor" required {...register('name', { required: true })} />
            <Input label="Grade Letter" placeholder="e.g. A+" required {...register('grade', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Min Percentage" type="number" step="0.1" placeholder="90" required {...register('minPercentage', { required: true })} />
            <Input label="Max Percentage" type="number" step="0.1" placeholder="100" required {...register('maxPercentage', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Grade Point" type="number" step="0.1" placeholder="4.0" required {...register('gradePoint', { required: true })} />
            <Select
              label="Is Passing?"
              options={[
                { label: 'Yes - Passing Grade', value: 'true' },
                { label: 'No - Failing Grade', value: 'false' },
              ]}
              {...register('isPassing')}
            />
          </div>

          <Input label="Evaluation Descriptor" placeholder="e.g. Outstanding Academic Merit" {...register('description')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Establish Rule</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Plus, Users, Mail, Phone, BookOpen, Edit, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function TeachersList() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register: regAdd, handleSubmit: handleAdd, reset: resetAdd } = useForm();
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit, setValue: setEditValue } = useForm();

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  const fetchTeachers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/academic/teachers?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      setTeachers(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err.message || 'Failed to fetch teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(1);
  }, [search]);

  const onAddSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/teachers', data);
      showToast('Faculty member registered successfully!');
      setIsAddOpen(false);
      resetAdd();
      fetchTeachers(1);
    } catch (err) {
      showToast(err.message || 'Failed to register teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (teacher) => {
    setEditTeacher(teacher);
    setEditValue('firstName', teacher.firstName);
    setEditValue('lastName', teacher.lastName);
    setEditValue('phone', teacher.phone);
    setEditValue('qualification', teacher.qualification || '');
    setEditValue('specialization', teacher.specialization || '');
  };

  const onEditSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.put(`/academic/teachers/${editTeacher._id}`, data);
      showToast('Teacher profile updated successfully!');
      setEditTeacher(null);
      resetEdit();
      fetchTeachers(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to update teacher', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member? Any active teaching assignments will also be revoked.')) return;
    try {
      await api.delete(`/academic/teachers/${id}`);
      showToast('Teacher deleted successfully');
      fetchTeachers(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to delete teacher', 'error');
    }
  };

  const columns = [
    { header: 'Employee ID', accessor: 'employeeId', width: '130px' },
    {
      header: 'Faculty Name',
      accessor: (row) => `${row.firstName} ${row.lastName}`,
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#111827' }}>
            {row.firstName} {row.lastName}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            {row.qualification || 'Educator'}
          </span>
        </div>
      ),
    },
    { header: 'Specialization', accessor: (row) => row.specialization || '-' },
    {
      header: 'Contact Info',
      render: (row) => (
        <div style={{ fontSize: '0.85rem' }}>
          <div><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />{row.email}</div>
          <div><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Joining Date',
      accessor: (row) => (row.joiningDate ? new Date(row.joiningDate).toLocaleDateString() : '-'),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => <Badge status={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      header: 'Actions',
      width: '110px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openEditModal(row)}
            title="Edit Teacher"
          >
            <Edit size={14} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: '#dc2626' }}
            onClick={() => handleDelete(row._id)}
            title="Delete Teacher"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Faculty & Teaching Staff</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            View and manage appointed instructors and academic departmental leaders.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} icon={<Plus size={16} />}>
          + Add Teacher
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={teachers}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search faculty by name, employee ID, email..."
          pagination={pagination}
          onPageChange={(p) => fetchTeachers(p)}
        />
      </Card>

      {/* Add Teacher Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="+ Add New Faculty Member">
        <form onSubmit={handleAdd(onAddSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="First Name" required {...regAdd('firstName', { required: true })} />
            <Input label="Last Name" required {...regAdd('lastName', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Employee ID" placeholder="EMP-T..." required {...regAdd('employeeId', { required: true })} />
            <Input label="Email Address" type="email" required {...regAdd('email', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Initial Password" type="password" placeholder="Defaults to Teacher@123" {...regAdd('password')} />
            <Input label="Contact Phone" required {...regAdd('phone', { required: true })} />
          </div>

          <Input label="Highest Academic Qualification" placeholder="e.g. M.Sc. Mathematics, Cambridge" {...regAdd('qualification')} />
          <Input label="Subject Specialization" placeholder="e.g. Calculus & Statistics" {...regAdd('specialization')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              + Add Teacher
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal isOpen={!!editTeacher} onClose={() => setEditTeacher(null)} title="Edit Faculty Profile">
        <form onSubmit={handleEdit(onEditSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="First Name" required {...regEdit('firstName', { required: true })} />
            <Input label="Last Name" required {...regEdit('lastName', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Contact Phone" required {...regEdit('phone', { required: true })} />
            <Input label="Highest Academic Qualification" {...regEdit('qualification')} />
          </div>

          <Input label="Subject Specialization" {...regEdit('specialization')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setEditTeacher(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


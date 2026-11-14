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
import { Plus, Link as LinkIcon, Users, UserCheck, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function GuardiansList() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [guardians, setGuardians] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [linkModalData, setLinkModalData] = useState(null); // guardian obj
  const [submitting, setSubmitting] = useState(false);

  const { register: regAdd, handleSubmit: handleAdd, reset: resetAdd } = useForm();
  const { register: regLink, handleSubmit: handleLink, reset: resetLink } = useForm();

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  const fetchGuardians = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/academic/guardians?page=${page}&limit=10&search=${encodeURIComponent(search)}`);
      setGuardians(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err.message || 'Failed to fetch guardians', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/academic/students?limit=100');
      setAllStudents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGuardians(1);
    fetchStudents();
  }, [search]);

  const onAddSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/guardians', data);
      showToast('Guardian registered successfully!');
      setIsAddOpen(false);
      resetAdd();
      fetchGuardians(1);
    } catch (err) {
      showToast(err.message || 'Failed to register guardian', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onLinkSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/guardians/link', {
        guardianId: linkModalData._id,
        studentId: data.studentId,
      });
      showToast('Student successfully linked to guardian!');
      setLinkModalData(null);
      resetLink();
      fetchGuardians(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to link student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guardian? Children will be unlinked.')) return;
    try {
      await api.delete(`/academic/guardians/${id}`);
      showToast('Guardian removed successfully');
      fetchGuardians(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to delete guardian', 'error');
    }
  };

  const columns = [
    {
      header: 'Guardian Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#111827' }}>{row.name}</span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            Relationship: {row.relationship || 'Guardian'}
          </span>
        </div>
      ),
    },
    { header: 'Email Address', accessor: 'email' },
    { header: 'Phone Number', accessor: 'phone' },
    {
      header: 'Linked Students (Children)',
      render: (row) => (
        <div>
          {row.students && row.students.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {row.students.map((s) => (
                <Badge key={s._id} variant="info">
                  {s.firstName} {s.lastName} ({s.admissionNo})
                </Badge>
              ))}
            </div>
          ) : (
            <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No children linked</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      width: '160px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<LinkIcon size={14} />}
            onClick={() => setLinkModalData(row)}
          >
            Link Child
          </Button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: '#dc2626' }}
            onClick={() => handleDelete(row._id)}
            title="Delete Guardian"
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
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Guardians & Parents Directory</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Manage guardian profiles and associate multiple children per family household.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} icon={<Plus size={16} />}>
          + Add Guardian
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={guardians}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search guardians by name, email, phone..."
          pagination={pagination}
          onPageChange={(p) => fetchGuardians(p)}
        />
      </Card>

      {/* Add Guardian Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register Parent / Legal Guardian">
        <form onSubmit={handleAdd(onAddSubmit)}>
          <Input label="Full Name" placeholder="e.g. Eleanor Vance" required {...regAdd('name', { required: true })} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Email Address" type="email" required {...regAdd('email', { required: true })} />
            <Input label="Phone Number" required {...regAdd('phone', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Relationship"
              options={[
                { label: 'Father', value: 'Father' },
                { label: 'Mother', value: 'Mother' },
                { label: 'Legal Guardian', value: 'Legal Guardian' },
                { label: 'Other', value: 'Other' },
              ]}
              {...regAdd('relationship')}
            />
            <Input label="Occupation" placeholder="e.g. Architect" {...regAdd('occupation')} />
          </div>

          <Input label="Default Password" type="password" placeholder="Defaults to Guardian@123" {...regAdd('password')} />
          <Input label="Residential Address" placeholder="Street Address, City" {...regAdd('address')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Create Guardian Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Link Student Modal */}
      <Modal
        isOpen={!!linkModalData}
        onClose={() => setLinkModalData(null)}
        title={`Link Student to ${linkModalData?.name}`}
      >
        <form onSubmit={handleLink(onLinkSubmit)}>
          <p style={{ fontSize: '0.95rem', color: '#4b5563', marginBottom: '1rem' }}>
            Select an active student in the school to establish guardian custody and account access.
          </p>

          <Select
            label="Select Student"
            required
            options={allStudents.map((s) => ({
              label: `${s.firstName} ${s.lastName} (${s.admissionNo} - ${s.class?.name || 'Class'})`,
              value: s._id,
            }))}
            {...regLink('studentId', { required: true })}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setLinkModalData(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Confirm Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


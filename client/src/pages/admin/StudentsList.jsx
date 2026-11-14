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
import { Plus, Trash2, Edit, UserPlus, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function StudentsList() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [guardians, setGuardians] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register: regAdd, handleSubmit: handleAdd, reset: resetAdd } = useForm();
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit, setValue: setEditValue } = useForm();

  // Auto-open modal if directed from Quick Action
  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsAddOpen(true);
    }
  }, [searchParams]);

  const fetchClassesAndSections = async () => {
    try {
      const [clsRes, secRes, grdRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/sections'),
        api.get('/academic/guardians?limit=50'),
      ]);
      setClasses(clsRes.data || []);
      setSections(secRes.data || []);
      setGuardians(grdRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/academic/students?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      if (selectedClass) url += `&classId=${selectedClass}`;
      if (selectedSection) url += `&sectionId=${selectedSection}`;

      const res = await api.get(url);
      setStudents(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err.message || 'Failed to fetch students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndSections();
  }, []);

  useEffect(() => {
    fetchStudents(1);
  }, [search, selectedClass, selectedSection]);

  const onAddSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.post('/academic/students', formData);
      showToast('Student enrolled successfully!');
      setIsAddOpen(false);
      resetAdd();
      fetchStudents(1);
    } catch (err) {
      showToast(err.message || 'Failed to add student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (student) => {
    setEditStudent(student);
    setEditValue('firstName', student.firstName);
    setEditValue('lastName', student.lastName);
    setEditValue('admissionNo', student.admissionNo);
    setEditValue('rollNumber', student.rollNumber);
    setEditValue('class', student.class?._id || student.class);
    setEditValue('section', student.section?._id || student.section);
    setEditValue('gender', student.gender || 'Male');
    setEditValue('contactNumber', student.contactNumber || '');
    setEditValue('address', student.address || '');
    setEditValue('guardian', student.guardian?._id || student.guardian || '');
  };

  const onEditSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/academic/students/${editStudent._id}`, formData);
      showToast('Student updated successfully!');
      setEditStudent(null);
      resetEdit();
      fetchStudents(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to update student', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;
    try {
      await api.delete(`/academic/students/${id}`);
      showToast('Student deleted successfully');
      fetchStudents(pagination.page);
    } catch (err) {
      showToast(err.message || 'Failed to delete student', 'error');
    }
  };

  const columns = [
    { header: 'Admission No', accessor: 'admissionNo', width: '130px' },
    {
      header: 'Full Name',
      accessor: (row) => `${row.firstName} ${row.lastName}`,
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#111827' }}>
            {row.firstName} {row.lastName}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            Roll No: {row.rollNumber}
          </span>
        </div>
      ),
    },
    { header: 'Class', accessor: (row) => row.class?.name || '-' },
    { header: 'Section', accessor: (row) => row.section?.name || '-' },
    {
      header: 'Guardian',
      accessor: (row) => row.guardian?.name || 'Not Linked',
      render: (row) => (
        <span>{row.guardian ? `${row.guardian.name} (${row.guardian.relationship || 'Guardian'})` : <Badge variant="neutral">Unlinked</Badge>}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      render: (row) => <Badge status={row.isActive ? 'Active' : 'Inactive'} />,
    },
    {
      header: 'Actions',
      width: '130px',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setViewStudent(row)}
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openEditModal(row)}
            title="Edit Student"
          >
            <Edit size={14} />
          </button>
          <button
            className="btn btn-secondary btn-sm"
            style={{ color: '#dc2626' }}
            onClick={() => handleDelete(row._id)}
            title="Delete Student"
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
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Student Management</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Maintain enrollment, classroom section assignments, and guardian associations.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} icon={<Plus size={16} />}>
          + Add Student
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={students}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by name, admission no, roll..."
          pagination={pagination}
          onPageChange={(p) => fetchStudents(p)}
          filterComponent={
            <>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
                style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
              >
                <option value="">All Sections</option>
                {sections
                  .filter((s) => !selectedClass || s.class?._id === selectedClass)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </>
          }
        />
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="+ Add New Student (Enrollment Form)">
        <form onSubmit={handleAdd(onAddSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="First Name" required {...regAdd('firstName', { required: true })} />
            <Input label="Last Name" required {...regAdd('lastName', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Admission Number" placeholder="ADM-2026-..." required {...regAdd('admissionNo', { required: true })} />
            <Input label="Roll Number" placeholder="e.g. 01" required {...regAdd('rollNumber', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Class"
              required
              options={classes.map((c) => ({ label: c.name, value: c._id }))}
              {...regAdd('class', { required: true })}
            />
            <Select
              label="Section"
              required
              options={sections.map((s) => ({ label: `${s.name} (${s.class?.name || ''})`, value: s._id }))}
              {...regAdd('section', { required: true })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Date of Birth" type="date" required {...regAdd('dateOfBirth', { required: true })} />
            <Select
              label="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              {...regAdd('gender')}
            />
          </div>

          <Select
            label="Guardian (Optional)"
            placeholder="Select a guardian..."
            options={guardians.map((g) => ({ label: `${g.name} (${g.email})`, value: g._id }))}
            {...regAdd('guardian')}
          />

          <Input label="Address" {...regAdd('address')} />
          <Input label="Emergency Contact Number" {...regAdd('contactNumber')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              + Add Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={!!editStudent} onClose={() => setEditStudent(null)} title="Edit Student Profile">
        <form onSubmit={handleEdit(onEditSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="First Name" required {...regEdit('firstName', { required: true })} />
            <Input label="Last Name" required {...regEdit('lastName', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Admission Number" required {...regEdit('admissionNo', { required: true })} />
            <Input label="Roll Number" required {...regEdit('rollNumber', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Class"
              required
              options={classes.map((c) => ({ label: c.name, value: c._id }))}
              {...regEdit('class', { required: true })}
            />
            <Select
              label="Section"
              required
              options={sections.map((s) => ({ label: `${s.name} (${s.class?.name || ''})`, value: s._id }))}
              {...regEdit('section', { required: true })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select
              label="Gender"
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
              {...regEdit('gender')}
            />
            <Select
              label="Guardian"
              placeholder="Select a guardian..."
              options={guardians.map((g) => ({ label: `${g.name} (${g.email})`, value: g._id }))}
              {...regEdit('guardian')}
            />
          </div>

          <Input label="Address" {...regEdit('address')} />
          <Input label="Emergency Contact Number" {...regEdit('contactNumber')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setEditStudent(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Student Modal */}
      <Modal isOpen={!!viewStudent} onClose={() => setViewStudent(null)} title="Student Profile Details">
        {viewStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                {viewStudent.firstName[0]}
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{viewStudent.firstName} {viewStudent.lastName}</h3>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Admission No: {viewStudent.admissionNo} | Roll: {viewStudent.rollNumber}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.95rem' }}>
              <div><strong>Class:</strong> {viewStudent.class?.name || '-'}</div>
              <div><strong>Section:</strong> {viewStudent.section?.name || '-'}</div>
              <div><strong>Gender:</strong> {viewStudent.gender || '-'}</div>
              <div><strong>Date of Birth:</strong> {viewStudent.dateOfBirth ? new Date(viewStudent.dateOfBirth).toLocaleDateString() : '-'}</div>
              <div><strong>Contact:</strong> {viewStudent.contactNumber || '-'}</div>
              <div><strong>Status:</strong> <Badge status={viewStudent.isActive ? 'Active' : 'Inactive'} /></div>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.75rem' }}>
              <h4 style={{ marginBottom: '0.35rem' }}>Guardian Information</h4>
              {viewStudent.guardian ? (
                <div style={{ fontSize: '0.9rem', color: '#374151' }}>
                  <p><strong>Name:</strong> {viewStudent.guardian.name} ({viewStudent.guardian.relationship})</p>
                  <p><strong>Email:</strong> {viewStudent.guardian.email}</p>
                  <p><strong>Phone:</strong> {viewStudent.guardian.phone}</p>
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No guardian linked to this student record.</p>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button variant="secondary" onClick={() => setViewStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


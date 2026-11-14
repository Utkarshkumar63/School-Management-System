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
import { Plus, Trash2, BookOpen, Layers, BookCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function ClassesAndSubjects() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'sections' | 'subjects'

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register: regClass, handleSubmit: handleClass, reset: resetClass } = useForm();
  const { register: regSec, handleSubmit: handleSec, reset: resetSec } = useForm();
  const { register: regSub, handleSubmit: handleSub, reset: resetSub } = useForm();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
    if (searchParams.get('openAdd') === 'true') {
      if (tab === 'sections') setIsSectionModalOpen(true);
      else if (tab === 'subjects') setIsSubjectModalOpen(true);
      else setIsClassModalOpen(true);
    }
  }, [searchParams]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [clsRes, secRes, subRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/sections'),
        api.get('/academic/subjects'),
      ]);
      setClasses(clsRes.data || []);
      setSections(secRes.data || []);
      setSubjects(subRes.data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch academic data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const onAddClass = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/classes', { ...data, order: Number(data.order) || 1 });
      showToast('Class created successfully');
      setIsClassModalOpen(false);
      resetClass();
      fetchAll();
    } catch (err) {
      showToast(err.message || 'Failed to create class', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onAddSection = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/sections', { ...data, capacity: Number(data.capacity) || 40 });
      showToast('Section created successfully');
      setIsSectionModalOpen(false);
      resetSec();
      fetchAll();
    } catch (err) {
      showToast(err.message || 'Failed to create section', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const onAddSubject = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/academic/subjects', { ...data, credits: Number(data.credits) || 3 });
      showToast('Subject created successfully');
      setIsSubjectModalOpen(false);
      resetSub();
      fetchAll();
    } catch (err) {
      showToast(err.message || 'Failed to create subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure? Deleting a class requires that no students are enrolled in it.')) return;
    try {
      await api.delete(`/academic/classes/${id}`);
      showToast('Class deleted');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSection = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/academic/sections/${id}`);
      showToast('Section deleted');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      await api.delete(`/academic/subjects/${id}`);
      showToast('Subject deleted');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Academic Administration</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Configure institutional classes, classroom sections, and course curriculum subjects.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {activeTab === 'classes' && (
            <Button onClick={() => setIsClassModalOpen(true)} icon={<Plus size={16} />}>
              + Create Class
            </Button>
          )}
          {activeTab === 'sections' && (
            <Button onClick={() => setIsSectionModalOpen(true)} icon={<Plus size={16} />}>
              + Create Section
            </Button>
          )}
          {activeTab === 'subjects' && (
            <Button onClick={() => setIsSubjectModalOpen(true)} icon={<Plus size={16} />}>
              + Create Subject
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(229, 231, 235, 0.8)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('classes')}
        >
          <Layers size={14} /> Classes ({classes.length})
        </button>
        <button
          className={`btn ${activeTab === 'sections' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('sections')}
        >
          <BookOpen size={14} /> Sections ({sections.length})
        </button>
        <button
          className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('subjects')}
        >
          <BookCheck size={14} /> Subjects ({subjects.length})
        </button>
      </div>

      {/* Tab 1: Classes */}
      {activeTab === 'classes' && (
        <Card title="Classes / Grades Roster">
          <Table
            columns={[
              { header: 'Class Name', accessor: 'name' },
              { header: 'Class Code', accessor: 'code' },
              { header: 'Display Order', accessor: 'order' },
              {
                header: 'Status',
                accessor: 'isActive',
                render: (row) => <Badge status={row.isActive ? 'Active' : 'Inactive'} />,
              },
              {
                header: 'Actions',
                render: (row) => (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626' }}
                    onClick={() => handleDeleteClass(row._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                ),
              },
            ]}
            data={classes}
            loading={loading}
          />
        </Card>
      )}

      {/* Tab 2: Sections */}
      {activeTab === 'sections' && (
        <Card title="Classroom Sections Roster">
          <Table
            columns={[
              { header: 'Section Name', accessor: 'name' },
              { header: 'Assigned Class', accessor: (row) => row.class?.name || '-' },
              { header: 'Student Capacity', accessor: 'capacity' },
              {
                header: 'Status',
                accessor: 'isActive',
                render: (row) => <Badge status={row.isActive ? 'Active' : 'Inactive'} />,
              },
              {
                header: 'Actions',
                render: (row) => (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626' }}
                    onClick={() => handleDeleteSection(row._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                ),
              },
            ]}
            data={sections}
            loading={loading}
          />
        </Card>
      )}

      {/* Tab 3: Subjects */}
      {activeTab === 'subjects' && (
        <Card title="Curriculum Subjects Roster">
          <Table
            columns={[
              { header: 'Subject Name', accessor: 'name' },
              { header: 'Course Code', accessor: 'code' },
              { header: 'Target Class', accessor: (row) => row.class?.name || '-' },
              { header: 'Credits', accessor: 'credits' },
              {
                header: 'Type',
                accessor: 'isElective',
                render: (row) => (row.isElective ? <Badge variant="warning">Elective</Badge> : <Badge variant="info">Core</Badge>),
              },
              {
                header: 'Actions',
                render: (row) => (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#dc2626' }}
                    onClick={() => handleDeleteSubject(row._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                ),
              },
            ]}
            data={subjects}
            loading={loading}
          />
        </Card>
      )}

      {/* Create Class Modal */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Create New Class">
        <form onSubmit={handleClass(onAddClass)}>
          <Input label="Class Name" placeholder="e.g. Grade 12" required {...regClass('name', { required: true })} />
          <Input label="Class Code" placeholder="e.g. G12" required {...regClass('code', { required: true })} />
          <Input label="Display Sequence Order" type="number" defaultValue="4" {...regClass('order')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsClassModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Create Class</Button>
          </div>
        </form>
      </Modal>

      {/* Create Section Modal */}
      <Modal isOpen={isSectionModalOpen} onClose={() => setIsSectionModalOpen(false)} title="Create Classroom Section">
        <form onSubmit={handleSec(onAddSection)}>
          <Input label="Section Name" placeholder="e.g. Section C" required {...regSec('name', { required: true })} />
          <Select
            label="Class"
            required
            options={classes.map((c) => ({ label: c.name, value: c._id }))}
            {...regSec('class', { required: true })}
          />
          <Input label="Maximum Capacity" type="number" defaultValue="35" {...regSec('capacity')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsSectionModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Create Section</Button>
          </div>
        </form>
      </Modal>

      {/* Create Subject Modal */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Create Course Subject">
        <form onSubmit={handleSub(onAddSubject)}>
          <Input label="Subject Name" placeholder="e.g. Chemistry" required {...regSub('name', { required: true })} />
          <Input label="Subject Code" placeholder="e.g. CHEM-10" required {...regSub('code', { required: true })} />
          <Select
            label="Target Class"
            required
            options={classes.map((c) => ({ label: c.name, value: c._id }))}
            {...regSub('class', { required: true })}
          />
          <Input label="Academic Credits" type="number" defaultValue="3" {...regSub('credits')} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsSubjectModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Create Subject</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


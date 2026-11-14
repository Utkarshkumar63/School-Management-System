import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ShieldAlert, Clock, Eye, User, Laptop } from 'lucide-react';

export function AuditLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Selected Log Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/audit/logs?page=${page}&limit=15&search=${encodeURIComponent(search)}`;
      if (actionFilter) url += `&action=${actionFilter}`;
      if (roleFilter) url += `&role=${roleFilter}`;

      const res = await api.get(url);
      setLogs(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err.message || 'Failed to fetch audit records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [search, actionFilter, roleFilter]);

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      width: '180px',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: '#111827' }}>
            {new Date(row.timestamp).toLocaleDateString()}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            {new Date(row.timestamp).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Actor',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{row.actorName || 'System'}</span>
          <span style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280' }}>
            IP: {row.ipAddress || 'Internal'}
          </span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => <Badge status={row.role} />,
    },
    {
      header: 'Action Executed',
      accessor: 'action',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>
          {row.action}
        </span>
      ),
    },
    {
      header: 'Target Entity',
      render: (row) => (
        <span>
          <strong>{row.entity}</strong>
          {row.entityId && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> #{row.entityId.slice(-6)}</span>}
        </span>
      ),
    },
    {
      header: 'Details',
      width: '100px',
      render: (row) => (
        <Button size="sm" variant="secondary" icon={<Eye size={14} />} onClick={() => setSelectedLog(row)}>
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Immutable Audit Log Trail</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Comprehensive forensic records of logins, grading updates, attendance marks, fee invoices, and security changes.
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search by actor name, action, or entity ID..."
          pagination={pagination}
          onPageChange={(p) => fetchLogs(p)}
          filterComponent={
            <>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="TEACHER">TEACHER</option>
                <option value="GUARDIAN">GUARDIAN</option>
                <option value="SYSTEM">SYSTEM</option>
              </select>

              <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                <option value="">All Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="ATTENDANCE_MARK">ATTENDANCE_MARK</option>
                <option value="ATTENDANCE_BATCH_MARK">ATTENDANCE_BATCH_MARK</option>
                <option value="MARKS_ENTRY">MARKS_ENTRY</option>
                <option value="CREATE_INVOICE">CREATE_INVOICE</option>
                <option value="PAYMENT_RECORD">PAYMENT_RECORD</option>
                <option value="ASSIGN_TEACHER">ASSIGN_TEACHER</option>
              </select>
            </>
          }
        />
      </Card>

      {/* Audit Detail Modal */}
      <Modal isOpen={!!selectedLog} onClose={() => setSelectedLog(null)} title="Audit Event Forensic Detail" maxWidth="640px">
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
              <div><strong>Action:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedLog.action}</span></div>
              <div><strong>Role:</strong> <Badge status={selectedLog.role} /></div>
              <div><strong>Actor:</strong> {selectedLog.actorName}</div>
              <div><strong>IP Address:</strong> {selectedLog.ipAddress || 'Internal'}</div>
              <div><strong>Entity:</strong> {selectedLog.entity}</div>
              <div><strong>Entity ID:</strong> {selectedLog.entityId || 'N/A'}</div>
              <div style={{ gridColumn: 'span 2' }}>
                <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '0.35rem' }}>Payload / Delta State:</h4>
              <pre
                style={{
                  background: '#1f2937',
                  color: '#f9fafb',
                  padding: '1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <Button variant="secondary" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


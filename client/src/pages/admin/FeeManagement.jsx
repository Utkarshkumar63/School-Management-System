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
import { Plus, CreditCard, IndianRupee, Receipt, CheckCircle, AlertTriangle, Layers, BookOpen, FileText, Info, ShieldCheck } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

export function FeeManagement() {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'structures' | 'payments'

  const [invoices, setInvoices] = useState([]);
  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reconciliation, setReconciliation] = useState(null);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showOfflinePay, setShowOfflinePay] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (searchParams.get('openAdd') === 'true') {
      setIsInvoiceModalOpen(true);
    }
  }, [searchParams]);

  // Forms
  const { register: regStruct, control: ctrlStruct, handleSubmit: handleStruct, reset: resetStruct } = useForm({
    defaultValues: { items: [{ title: 'Tuition Fee', amount: 1500 }] },
  });
  const { fields: structItems, append: appendStructItem, remove: removeStructItem } = useFieldArray({
    control: ctrlStruct,
    name: 'items',
  });

  const { register: regInv, control: ctrlInv, handleSubmit: handleInv, reset: resetInv } = useForm({
    defaultValues: { items: [{ title: 'Tuition Fee', amount: 1500 }] },
  });
  const { fields: invItems, append: appendInvItem, remove: removeInvItem } = useFieldArray({
    control: ctrlInv,
    name: 'items',
  });

  const { register: regBatch, handleSubmit: handleBatch, reset: resetBatch } = useForm();
  const { register: regPay, handleSubmit: handlePay, reset: resetPay } = useForm();

  const fetchDropdowns = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/students?limit=100'),
      ]);
      setClasses(cRes.data || []);
      setStudents(sRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/fees/invoices?page=${page}&limit=10&search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      setInvoices(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStructures = async () => {
    try {
      const res = await api.get('/fees/structures');
      setStructures(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await api.get('/fees/payments?limit=20');
      setPayments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReconciliation = async () => {
    try {
      const res = await api.get('/fees/reconciliation');
      setReconciliation(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchStructures();
    fetchReconciliation();
  }, []);

  useEffect(() => {
    if (activeTab === 'invoices') fetchInvoices(1);
    else if (activeTab === 'structures') fetchStructures();
    else if (activeTab === 'payments') fetchPayments();
  }, [activeTab, search, statusFilter]);

  // Create Fee Structure
  const onCreateStructure = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/fees/structures', {
        ...data,
        items: data.items.map((i) => ({ title: i.title, amount: Number(i.amount) })),
      });
      showToast('Fee structure established');
      setIsStructureModalOpen(false);
      resetStruct();
      fetchStructures();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Create Single Invoice
  const onCreateInvoice = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/fees/invoices', {
        ...data,
        items: data.items.map((i) => ({ title: i.title, amount: Number(i.amount) })),
      });
      showToast('Invoice issued and posted to fee ledger');
      setIsInvoiceModalOpen(false);
      resetInv();
      fetchInvoices(1);
      fetchReconciliation();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Batch Invoices
  const onBatchSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await api.post('/fees/invoices/batch', data);
      showToast(res.message || 'Batch invoices issued successfully');
      setIsBatchModalOpen(false);
      resetBatch();
      fetchInvoices(1);
      fetchReconciliation();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Record Payment
  const onPaymentSubmit = async (data) => {
    setSubmitting(true);
    try {
      const idempotencyKey = `idemp-pay-${viewInvoice._id}-${Date.now()}`;
      const res = await api.post('/fees/payments', {
        invoice: viewInvoice._id,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod || 'Cash',
        idempotencyKey,
        notes: data.notes || '',
      });

      showToast(res.message || 'Counter receipt recorded successfully');
      setViewInvoice(null);
      setShowOfflinePay(false);
      resetPay();
      fetchInvoices(pagination.page);
      fetchReconciliation();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceColumns = [
    {
      header: 'Invoice No',
      accessor: 'invoiceNumber',
      render: (row) => <span style={{ fontWeight: 700, color: '#1e3a8a' }}>{row.invoiceNumber}</span>,
    },
    {
      header: 'Student',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 700 }}>
            {row.student?.firstName} {row.student?.lastName}
          </span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            Adm: {row.student?.admissionNo} • {row.student?.class?.name}
          </span>
        </div>
      ),
    },
    {
      header: 'Total Invoiced',
      render: (row) => <strong>₹{row.totalAmount?.toLocaleString()}</strong>,
    },
    {
      header: 'Paid Amount',
      render: (row) => <span style={{ color: '#059669', fontWeight: 600 }}>₹{row.paidAmount?.toLocaleString()}</span>,
    },
    {
      header: 'Outstanding Balance',
      render: (row) => (
        <span style={{ color: row.outstandingAmount > 0 ? '#dc2626' : '#059669', fontWeight: 700 }}>
          ₹{row.outstandingAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Actions',
      width: '140px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={<FileText size={14} />}
            onClick={() => {
              setViewInvoice(row);
              setShowOfflinePay(false);
            }}
          >
            View Slip
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Fee Management & Financial Ledger</h1>
          <p style={{ color: '#4b5563', fontSize: '1rem' }}>
            Manage fee structures, issue student invoices, record idempotent payments, and verify ledger balance reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => setIsStructureModalOpen(true)} icon={<Plus size={16} />}>
            + Create Fee Structure
          </Button>
          <Button variant="secondary" onClick={() => setIsBatchModalOpen(true)} icon={<Layers size={16} />}>
            + Batch Issue Invoices
          </Button>
          <Button variant="primary" onClick={() => setIsInvoiceModalOpen(true)} icon={<Plus size={16} />}>
            + Create Invoice
          </Button>
        </div>
      </div>

      {/* Ledger Reconciliation Banner */}
      {reconciliation && (
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            background: reconciliation.isReconciled ? 'rgba(236, 253, 245, 0.85)' : 'rgba(254, 242, 242, 0.85)',
            border: `1px solid ${reconciliation.isReconciled ? '#a7f3d0' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {reconciliation.isReconciled ? (
              <CheckCircle size={28} color="#059669" />
            ) : (
              <AlertTriangle size={28} color="#dc2626" />
            )}
            <div>
              <h3 style={{ margin: 0, color: reconciliation.isReconciled ? '#065f46' : '#991b1b', fontSize: '1.15rem' }}>
                System Ledger Audit: {reconciliation.isReconciled ? '100% Mathematically Reconciled' : 'Discrepancy Detected'}
              </h3>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.875rem', color: '#4b5563' }}>
                Invoiced: <strong>₹{reconciliation.totalInvoiced.toLocaleString()}</strong> | Paid: <strong>₹{reconciliation.totalPaymentsReceived.toLocaleString()}</strong> | Net Ledger Balance: <strong>₹{reconciliation.ledger.outstanding.toLocaleString()}</strong>
              </p>
            </div>
          </div>
          <Badge variant={reconciliation.isReconciled ? 'success' : 'danger'}>
            {reconciliation.isReconciled ? 'Balanced Ledger' : 'Reconciliation Required'}
          </Badge>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(229, 231, 235, 0.8)', paddingBottom: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('invoices')}
        >
          <Receipt size={14} /> Student Invoices
        </button>
        <button
          className={`btn ${activeTab === 'structures' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('structures')}
        >
          <BookOpen size={14} /> Fee Structures ({structures.length})
        </button>
        <button
          className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={14} /> Payment Transactions
        </button>
      </div>

      {/* Tab 1: Invoices */}
      {activeTab === 'invoices' && (
        <Card title="Issued Student Invoices">
          <Table
            columns={invoiceColumns}
            data={invoices}
            loading={loading}
            searchQuery={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by invoice number..."
            pagination={pagination}
            onPageChange={(p) => fetchInvoices(p)}
            filterComponent={
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Fully Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            }
          />
        </Card>
      )}

      {/* Tab 2: Structures */}
      {activeTab === 'structures' && (
        <Card title="Configured Fee Structures">
          <Table
            columns={[
              { header: 'Structure Name', accessor: 'name' },
              { header: 'Target Class', accessor: (row) => row.class?.name || '-' },
              { header: 'Academic Term', accessor: (row) => `${row.academicYear} (${row.term})` },
              {
                header: 'Total Amount',
                render: (row) => <strong>₹{row.totalAmount?.toLocaleString()}</strong>,
              },
              {
                header: 'Due Date',
                render: (row) => (row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '-'),
              },
              {
                header: 'Line Items',
                render: (row) => (
                  <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                    {row.items?.map((i) => `${i.title} (₹${i.amount})`).join(', ')}
                  </span>
                ),
              },
            ]}
            data={structures}
            loading={loading}
          />
        </Card>
      )}

      {/* Tab 3: Payments */}
      {activeTab === 'payments' && (
        <Card title="Payment Transaction History">
          <Table
            columns={[
              { header: 'Receipt No', accessor: 'paymentNumber', render: (row) => <strong>{row.paymentNumber}</strong> },
              {
                header: 'Student',
                render: (row) => `${row.student?.firstName} ${row.student?.lastName} (${row.student?.admissionNo})`,
              },
              { header: 'Invoice Ref', accessor: (row) => row.invoice?.invoiceNumber || '-' },
              {
                header: 'Amount Paid',
                render: (row) => <strong style={{ color: '#059669' }}>₹{row.amount?.toLocaleString()}</strong>,
              },
              { header: 'Method', accessor: 'paymentMethod' },
              {
                header: 'Idempotency Key',
                accessor: 'idempotencyKey',
                render: (row) => <code style={{ fontSize: '0.75rem' }}>{row.idempotencyKey}</code>,
              },
              {
                header: 'Timestamp',
                render: (row) => (row.paidAt ? new Date(row.paidAt).toLocaleString() : '-'),
              },
            ]}
            data={payments}
            loading={loading}
          />
        </Card>
      )}

      {/* Invoice Details & Optional Counter Receipt Modal */}
      <Modal
        isOpen={!!viewInvoice}
        onClose={() => {
          setViewInvoice(null);
          setShowOfflinePay(false);
        }}
        title={`Invoice Slip: ${viewInvoice?.invoiceNumber}`}
        maxWidth="650px"
      >
        {viewInvoice && (
          <div>
            {/* Header / Student Info */}
            <div
              style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.15rem' }}>
                    {viewInvoice.student?.firstName} {viewInvoice.student?.lastName}
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    Admission No: <strong>{viewInvoice.student?.admissionNo}</strong> • Class: <strong>{viewInvoice.student?.class?.name || 'Class'}</strong>
                  </p>
                </div>
                <Badge status={viewInvoice.status} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Due Date</span>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.9rem', fontWeight: 600 }}>
                    {viewInvoice.dueDate ? new Date(viewInvoice.dueDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Total Invoiced</span>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>
                    ₹{viewInvoice.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Amount Paid</span>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: '#059669' }}>
                    ₹{viewInvoice.paidAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Balance Due</span>
                  <p style={{ margin: '0.1rem 0 0', fontSize: '0.95rem', fontWeight: 700, color: viewInvoice.outstandingAmount > 0 ? '#dc2626' : '#059669' }}>
                    ₹{viewInvoice.outstandingAmount?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Billable Line Items */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#374151' }}>Billable Items Breakdown</h4>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Description</th>
                      <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewInvoice.items?.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: idx !== viewInvoice.items.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <td style={{ padding: '0.5rem 0.75rem' }}>{item.title}</td>
                        <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>₹{item.amount?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Parent Responsibility Note */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: 'rgba(30, 58, 138, 0.05)',
                border: '1px solid rgba(30, 58, 138, 0.15)',
                marginBottom: '1rem',
              }}
            >
              <Info size={18} color="#1e3a8a" />
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e3a8a' }}>
                <strong>Parent Payment Notice:</strong> Fee payments are authorized and submitted by parents/guardians directly via the <em>Guardian Portal → Child Fees</em>.
              </p>
            </div>

            {/* Optional Offline Counter Collection Section */}
            {viewInvoice.outstandingAmount > 0 && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                {!showOfflinePay ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Receipt size={14} />}
                    onClick={() => setShowOfflinePay(true)}
                  >
                    Record In-Person Offline Receipt (Accounts Counter)
                  </Button>
                ) : (
                  <form onSubmit={handlePay(onPaymentSubmit)}>
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                        Accounts Desk: Record In-Person Offline Fee Collection
                      </span>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#78350f' }}>
                        Use this form only when a parent pays in cash or submits a cheque physically at the school administration office.
                      </p>
                    </div>

                    <Input
                      label="Collected Amount (₹)"
                      type="number"
                      step="0.01"
                      max={viewInvoice.outstandingAmount}
                      defaultValue={viewInvoice.outstandingAmount}
                      helperText={`Cannot exceed remaining outstanding balance of ₹${viewInvoice.outstandingAmount}.`}
                      required
                      {...regPay('amount', { required: true })}
                    />

                    <Select
                      label="Payment Instrument"
                      options={[
                        { label: 'Cash (Collected at Accounts Office)', value: 'Cash' },
                        { label: 'Bank Cheque / Demand Draft', value: 'Bank Transfer' },
                        { label: 'POS Card Machine', value: 'Credit Card' },
                      ]}
                      {...regPay('paymentMethod')}
                    />

                    <Input
                      label="Counter Receipt No / Reference"
                      placeholder="e.g. CASH-REC-2025-01 / Cheque #459201"
                      {...regPay('notes')}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                      <Button variant="secondary" size="sm" onClick={() => setShowOfflinePay(false)}>
                        Cancel Offline Entry
                      </Button>
                      <Button type="submit" variant="primary" size="sm" loading={submitting}>
                        Record Counter Receipt
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => { setViewInvoice(null); setShowOfflinePay(false); }}>
                Close Slip
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Fee Structure Modal */}
      <Modal isOpen={isStructureModalOpen} onClose={() => setIsStructureModalOpen(false)} title="Create Fee Structure" maxWidth="600px">
        <form onSubmit={handleStruct(onCreateStructure)}>
          <Input label="Structure Name" placeholder="e.g. Grade 10 Term 1 Comprehensive Fee" required {...regStruct('name', { required: true })} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Select label="Class" required options={classes.map((c) => ({ label: c.name, value: c._id }))} {...regStruct('class', { required: true })} />
            <Input label="Academic Year" defaultValue="2025-2026" required {...regStruct('academicYear', { required: true })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Term" defaultValue="Term 1" required {...regStruct('term', { required: true })} />
            <Input label="Due Date" type="date" required {...regStruct('dueDate', { required: true })} />
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>Fee Line Items:</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => appendStructItem({ title: '', amount: 100 })}
              >
                + Add Line Item
              </button>
            </div>

            {structItems.map((field, idx) => (
              <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Input placeholder="Item title (e.g. Tuition)" required {...regStruct(`items.${idx}.title`, { required: true })} />
                <Input type="number" placeholder="Amount (₹)" required {...regStruct(`items.${idx}.amount`, { required: true })} />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626', marginBottom: '1rem' }}
                  onClick={() => removeStructItem(idx)}
                  disabled={structItems.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsStructureModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Establish Structure</Button>
          </div>
        </form>
      </Modal>

      {/* Issue Single Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Issue Student Invoice" maxWidth="600px">
        <form onSubmit={handleInv(onCreateInvoice)}>
          <Select
            label="Select Student"
            required
            options={students.map((s) => ({
              label: `${s.firstName} ${s.lastName} (${s.admissionNo} - ${s.class?.name || ''})`,
              value: s._id,
            }))}
            {...regInv('student', { required: true })}
          />

          <Input label="Payment Due Date" type="date" required {...regInv('dueDate', { required: true })} />

          <div style={{ marginTop: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700 }}>Billable Items:</span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => appendInvItem({ title: '', amount: 100 })}
              >
                + Add Item
              </button>
            </div>

            {invItems.map((field, idx) => (
              <div key={field.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Input placeholder="Description" required {...regInv(`items.${idx}.title`, { required: true })} />
                <Input type="number" placeholder="Amount (₹)" required {...regInv(`items.${idx}.amount`, { required: true })} />
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626', marginBottom: '1rem' }}
                  onClick={() => removeInvItem(idx)}
                  disabled={invItems.length === 1}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Issue Invoice</Button>
          </div>
        </form>
      </Modal>

      {/* Batch Invoices Modal */}
      <Modal isOpen={isBatchModalOpen} onClose={() => setIsBatchModalOpen(false)} title="Batch Generate Class Invoices">
        <form onSubmit={handleBatch(onBatchSubmit)}>
          <Select
            label="Target Class"
            required
            options={classes.map((c) => ({ label: c.name, value: c._id }))}
            {...regBatch('class', { required: true })}
          />

          <Select
            label="Fee Structure Template"
            required
            options={structures.map((s) => ({ label: `${s.name} (₹${s.totalAmount})`, value: s._id }))}
            {...regBatch('feeStructure', { required: true })}
          />

          <Input label="Due Date" type="date" required {...regBatch('dueDate', { required: true })} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={submitting}>Generate for Entire Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Table } from '../../components/ui/Table.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { IndianRupee, CreditCard, Receipt, CheckCircle, ShieldCheck, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function ChildFees() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(searchParams.get('studentId') || '');

  const [invoices, setInvoices] = useState([]);
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment Modal
  const [payInvoice, setPayInvoice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  const fetchChildren = async () => {
    try {
      const res = await api.get('/dashboard/guardian');
      const kids = res.data?.children?.map((c) => c.student) || [];
      setChildren(kids);
      if (kids.length > 0 && !selectedStudentId) {
        setSelectedStudentId(kids[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentFinancials = async () => {
    if (!selectedStudentId) return;
    setLoading(true);
    try {
      const [invRes, ledRes] = await Promise.all([
        api.get(`/fees/invoices?studentId=${selectedStudentId}`),
        api.get(`/fees/ledger/${selectedStudentId}`),
      ]);
      setInvoices(invRes.data || []);
      setLedger(ledRes.data || null);
    } catch (err) {
      showToast(err.message || 'Failed to load financial records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      setSearchParams({ studentId: selectedStudentId });
      fetchStudentFinancials();
    }
  }, [selectedStudentId]);

  const onProcessPayment = async (data) => {
    setSubmitting(true);
    try {
      const idempotencyKey = `idemp-guardian-${payInvoice._id}-${Date.now()}`;
      const res = await api.post('/fees/payments', {
        invoice: payInvoice._id,
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod || 'Online Simulator',
        idempotencyKey,
        notes: 'Simulated payment by parent/guardian portal',
      });

      showToast(res.message || 'Payment successfully authorized and confirmed!');
      setPayInvoice(null);
      reset();
      fetchStudentFinancials();
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceColumns = [
    {
      header: 'Invoice No',
      accessor: 'invoiceNumber',
      render: (r) => <strong style={{ color: '#1e3a8a' }}>{r.invoiceNumber}</strong>,
    },
    {
      header: 'Description',
      render: (r) => (
        <div>
          <span style={{ fontWeight: 600 }}>{r.feeStructure?.name || 'Tuition Invoice'}</span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#6b7280' }}>
            {r.items?.map((i) => i.title).join(', ')}
          </span>
        </div>
      ),
    },
    { header: 'Due Date', render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-') },
    { header: 'Invoiced Amount', render: (r) => <strong>₹{r.totalAmount?.toLocaleString()}</strong> },
    { header: 'Amount Paid', render: (r) => <span style={{ color: '#059669', fontWeight: 600 }}>₹{r.paidAmount?.toLocaleString()}</span> },
    {
      header: 'Outstanding Balance',
      render: (r) => (
        <strong style={{ color: r.outstandingAmount > 0 ? '#dc2626' : '#059669' }}>
          ₹{r.outstandingAmount?.toLocaleString()}
        </strong>
      ),
    },
    { header: 'Status', accessor: 'status', render: (r) => <Badge status={r.status} /> },
    {
      header: 'Action',
      render: (r) => (
        <div>
          {r.status !== 'Paid' && r.status !== 'Cancelled' ? (
            <Button
              size="sm"
              variant="primary"
              icon={<IndianRupee size={14} />}
              onClick={() => setPayInvoice(r)}
            >
              Pay Now
            </Button>
          ) : (
            <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 700 }}>
              Settled
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#1e3a8a', fontSize: '1.85rem' }}>Fee Invoices & Payment Portal</h1>
        <p style={{ color: '#4b5563', fontSize: '1rem' }}>
          Review issued academic invoices, submit simulated payments, and inspect the real-time financial ledger balance.
        </p>
      </div>

      {/* Child Switcher */}
      {children.length > 1 && (
        <Card style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Select Child:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              style={{ width: 'auto', minWidth: '220px' }}
            >
              {children.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.firstName} {c.lastName} ({c.class?.name || 'Class'})
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Ledger Balance Summary Cards */}
      {ledger && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <Card hover={false} style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Invoiced Charges</span>
            <h3 style={{ fontSize: '1.85rem', color: '#1e3a8a', margin: '0.2rem 0' }}>
              ₹{ledger.totalDebits?.toLocaleString()}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>Academic fees applied</span>
          </Card>

          <Card hover={false} style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Payments Made</span>
            <h3 style={{ fontSize: '1.85rem', color: '#059669', margin: '0.2rem 0' }}>
              ₹{ledger.totalCredits?.toLocaleString()}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#059669' }}>Credited to account</span>
          </Card>

          <Card hover={false} style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Net Outstanding Due</span>
            <h3 style={{ fontSize: '1.85rem', color: ledger.netBalance > 0 ? '#dc2626' : '#059669', margin: '0.2rem 0' }}>
              ₹{ledger.netBalance?.toLocaleString()}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#4b5563' }}>
              {ledger.netBalance === 0 ? 'Account fully settled' : 'Payment required'}
            </span>
          </Card>
        </div>
      )}

      {/* Invoices List */}
      <Card title="Billing Invoices">
        <Table columns={invoiceColumns} data={invoices} loading={loading} />
      </Card>

      {/* Complete Financial Ledger Table */}
      <Card title="Fee Ledger Account Statement (Audit Reconciled)">
        {loading ? (
          <Spinner text="Loading ledger..." />
        ) : !ledger || !ledger.entries?.length ? (
          <p style={{ color: '#6b7280', padding: '1.5rem', textAlign: 'center' }}>No ledger transactions recorded yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Transaction Type</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'right' }}>Debit (+)</th>
                  <th style={{ textAlign: 'right' }}>Credit (-)</th>
                  <th style={{ textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.entries.map((entry) => (
                  <tr key={entry._id}>
                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                    <td>
                      <Badge variant={entry.entryType === 'INVOICE' ? 'info' : 'success'}>
                        {entry.entryType}
                      </Badge>
                    </td>
                    <td>{entry.description}</td>
                    <td style={{ textAlign: 'right', color: entry.debit ? '#111827' : '#9ca3af' }}>
                      {entry.debit ? `₹${entry.debit.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', color: entry.credit ? '#059669' : '#9ca3af', fontWeight: 600 }}>
                      {entry.credit ? `₹${entry.credit.toLocaleString()}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e3a8a' }}>
                      ₹{entry.runningBalance?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Simulated Payment Modal */}
      <Modal
        isOpen={!!payInvoice}
        onClose={() => setPayInvoice(null)}
        title={`Authorize Payment for ${payInvoice?.invoiceNumber}`}
      >
        {payInvoice && (
          <form onSubmit={handleSubmit(onProcessPayment)}>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ShieldCheck size={20} color="#059669" />
                <span style={{ fontWeight: 700, color: '#065f46' }}>Secure Payment Simulator (No real charges)</span>
              </div>
              <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>
                <strong>Invoice:</strong> {payInvoice.invoiceNumber} • {payInvoice.feeStructure?.name || 'Academic Fee'}
              </p>
              <p style={{ margin: '0.2rem 0', fontSize: '1.05rem', color: '#dc2626', fontWeight: 700 }}>
                <strong>Outstanding Due:</strong> ₹{payInvoice.outstandingAmount}
              </p>
            </div>

            <Input
              label="Payment Amount (₹)"
              type="number"
              step="0.01"
              max={payInvoice.outstandingAmount}
              defaultValue={payInvoice.outstandingAmount}
              helperText={`You can pay the full amount or make a partial installment (up to ₹${payInvoice.outstandingAmount}).`}
              required
              {...register('amount', { required: true })}
            />

            <Select
              label="Simulated Payment Instrument"
              options={[
                { label: 'Online Simulator (Instant Approval)', value: 'Online Simulator' },
                { label: 'Simulated Credit Card', value: 'Credit Card' },
                { label: 'Simulated Bank Transfer', value: 'Bank Transfer' },
              ]}
              {...register('paymentMethod')}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button variant="secondary" onClick={() => setPayInvoice(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={submitting} icon={<CreditCard size={16} />}>
                Confirm Simulated Payment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}


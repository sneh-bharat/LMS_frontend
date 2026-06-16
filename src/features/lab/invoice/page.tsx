'use client';

import React, { useState } from 'react';
import { InlineButton as Button, InlineInput as Input, InlineFormGroup as FormGroup, InlineModal as Modal, InlineTable as Table } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LabInvoice {
  id: number;
  invoiceNumber: string;
  patientName: string;
  unit: string;
  test: string;
  amount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Delivered';
  date: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_INVOICES: LabInvoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    patientName: 'Rajesh Kumar',
    unit: 'Hematology',
    test: 'Complete Blood Count (CBC)',
    amount: 450,
    status: 'Completed',
    date: '19-03-2026',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2026-002',
    patientName: 'Priya Sharma',
    unit: 'Clinical Biochemistry',
    test: 'Lipid Profile',
    amount: 800,
    status: 'Processing',
    date: '19-03-2026',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2026-003',
    patientName: 'Amit Patel',
    unit: 'Microbiology',
    test: 'Urine Culture',
    amount: 600,
    status: 'Pending',
    date: '19-03-2026',
  },
];

const INVOICE_COLS = [
  { key: 'invoiceNumber', label: 'Invoice No.' },
  { key: 'patientName', label: 'Patient Name' },
  { key: 'unit', label: 'Unit' },
  { key: 'test', label: 'Test' },
  { key: 'amount', label: 'Amount (₹)' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

const UNITS = [
  'Hematology',
  'Clinical Biochemistry',
  'Microbiology',
  'Immunology',
  'Pathology',
  'Serology',
  'Endocrinology',
];

const TESTS = [
  'Complete Blood Count (CBC)',
  'Lipid Profile',
  'Urine Culture',
  'Liver Function Test (LFT)',
  'Kidney Function Test (KFT)',
  'Thyroid Profile',
  'Blood Culture',
  'COVID-19 RT-PCR',
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LabInvoice['status'] }) {
  const map: Record<string, React.CSSProperties> = {
    Pending: { background: '#fef9c3', color: '#b45309' },
    Processing: { background: '#dbeafe', color: '#1d4ed8' },
    Completed: { background: '#dcfce7', color: '#16a34a' },
    Delivered: { background: '#e0e7ff', color: '#4338ca' },
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        ...map[status],
      }}
    >
      {status}
    </span>
  );
}

// ─── Create/Edit Invoice Modal ────────────────────────────────────────────────
function CreateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  editingInvoice,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (invoice: LabInvoice) => void;
  editingInvoice: LabInvoice | null;
}) {
  const [formData, setFormData] = useState<LabInvoice>(
    editingInvoice || {
      id: 0,
      invoiceNumber: '',
      patientName: '',
      unit: '',
      test: '',
      amount: 0,
      status: 'Pending',
      date: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (editingInvoice) {
      setFormData(editingInvoice);
    } else {
      setFormData({
        id: 0,
        invoiceNumber: '',
        patientName: '',
        unit: '',
        test: '',
        amount: 0,
        status: 'Pending',
        date: '',
      });
    }
    setErrors({});
  }, [editingInvoice]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice Number is required';
    if (!formData.patientName.trim()) newErrors.patientName = 'Patient Name is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';
    if (!formData.test) newErrors.test = 'Test is required';
    if (formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';
    if (!formData.date) newErrors.date = 'Date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      id: 0,
      invoiceNumber: '',
      patientName: '',
      unit: '',
      test: '',
      amount: 0,
      status: 'Pending',
      date: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}>
      <div style={{ display: 'grid', gap: 16 }} suppressHydrationWarning>
        {/* Invoice Number and Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Invoice Number *">
            <Input
              value={formData.invoiceNumber}
              onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
              placeholder="INV-2026-001"
              disabled={!!editingInvoice}
              style={{ borderColor: errors.invoiceNumber ? '#ef4444' : undefined }}
            />
            {errors.invoiceNumber && (
              <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>
                {errors.invoiceNumber}
              </span>
            )}
          </FormGroup>
          <FormGroup label="Date *">
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{ borderColor: errors.date ? '#ef4444' : undefined }}
            />
            {errors.date && (
              <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>
                {errors.date}
              </span>
            )}
          </FormGroup>
        </div>

        {/* Patient Name */}
        <FormGroup label="Patient Name *">
          <Input
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            placeholder="Enter patient name"
            style={{ borderColor: errors.patientName ? '#ef4444' : undefined }}
          />
          {errors.patientName && (
            <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>
              {errors.patientName}
            </span>
          )}
        </FormGroup>

        {/* Unit and Test */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Unit *">
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: errors.unit ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: 5,
                fontSize: 13,
                fontFamily: 'inherit',
              }}
              suppressHydrationWarning
            >
              <option value="">Select Unit</option>
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            {errors.unit && (
              <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>
                {errors.unit}
              </span>
            )}
          </FormGroup>

          <FormGroup label="Test *">
            <select
              value={formData.test}
              onChange={(e) => setFormData({ ...formData, test: e.target.value })}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: errors.test ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: 5,
                fontSize: 13,
                fontFamily: 'inherit',
              }}
              suppressHydrationWarning
            >
              <option value="">Select Test</option>
              {TESTS.map((test) => (
                <option key={test} value={test}>
                  {test}
                </option>
              ))}
            </select>
            {errors.test && (
              <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>
                {errors.test}
              </span>
            )}
          </FormGroup>
        </div>

        {/* Amount and Status */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Amount (₹) *">
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
              placeholder="450"
              style={{ borderColor: errors.amount ? '#ef4444' : undefined }}
            />
            {errors.amount && (
              <span style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'block' }}>
                {errors.amount}
              </span>
            )}
          </FormGroup>
          <FormGroup label="Status">
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as LabInvoice['status'] })}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: 5,
                fontSize: 13,
                fontFamily: 'inherit',
              }}
              suppressHydrationWarning
            >
              {(['Pending', 'Processing', 'Completed', 'Delivered'] as const).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FormGroup>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <Button onClick={handleClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="primary">
            {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LabInvoicePage() {
  const [invoices, setInvoices] = useState<LabInvoice[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<LabInvoice | null>(null);

  const filteredInvoices = invoices.filter(
    (inv) =>
      (inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        inv.test.toLowerCase().includes(search.toLowerCase())) &&
      (unitFilter === 'All' || inv.unit === unitFilter) &&
      (statusFilter === 'All' || inv.status === statusFilter)
  );

  const handleSubmitInvoice = (invoice: LabInvoice) => {
    if (editingInvoice) {
      setInvoices(invoices.map((inv) => (inv.id === editingInvoice.id ? { ...invoice, id: editingInvoice.id } : inv)));
      setEditingInvoice(null);
    } else {
      const newInvoice: LabInvoice = {
        ...invoice,
        id: Math.max(...invoices.map((inv) => inv.id), 0) + 1,
      };
      setInvoices([...invoices, newInvoice]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (invoice: LabInvoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  };

  // Transform data for table with JSX elements
  const tableData = filteredInvoices.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    patientName: inv.patientName,
    unit: inv.unit,
    test: inv.test,
    amount: `₹${inv.amount}`,
    status: <StatusBadge status={inv.status} />,
    action: (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={() => handleEdit(inv)}
          style={{
            border: 'none',
            background: 'none',
            color: '#16a34a',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(inv.id)}
          style={{
            border: 'none',
            background: 'none',
            color: '#dc2626',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
            textDecoration: 'underline',
          }}
        >
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <div suppressHydrationWarning>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #e8edf3',
          background: '#fff',
          borderRadius: '8px 8px 0 0',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Lab Invoices</h1>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200, fontSize: 13 }}
          />
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 5,
              fontSize: 13,
            }}
            suppressHydrationWarning
          >
            <option value="All">All Units</option>
            {UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: 5,
              fontSize: 13,
            }}
            suppressHydrationWarning
          >
            <option value="All">All Status</option>
            {(['Pending', 'Processing', 'Completed', 'Delivered'] as const).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button onClick={() => setIsModalOpen(true)}>+ Create Invoice</Button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '0 0 8px 8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <Table columns={INVOICE_COLS} data={tableData as any} emptyMessage="No invoices found." />
        </div>
      </div>

      {/* Modal */}
      <CreateInvoiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
        }}
        onSubmit={handleSubmitInvoice}
        editingInvoice={editingInvoice}
      />
    </div>
  );
}
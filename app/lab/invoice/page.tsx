'use client';

import { useState } from 'react';
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
];

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: LabInvoice['status'] }) {
  const map: Record<string, React.CSSProperties> = {
    Pending:   { background: '#fef9c3', color: '#b45309' },
    Processing: { background: '#dbeafe', color: '#1d4ed8' },
    Completed: { background: '#dcfce7', color: '#16a34a' },
    Delivered: { background: '#e0e7ff', color: '#4338ca' },
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, ...map[status],
    }}>
      {status}
    </span>
  );
}

// ─── Invoice Details Modal ────────────────────────────────────────────────────
function InvoiceDetailsModal({
  isOpen,
  onClose,
  invoice,
}: {
  isOpen: boolean;
  onClose: () => void;
  invoice: LabInvoice | null;
}) {
  if (!invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details">
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <FormGroup label="Invoice Number">
            <div style={{ padding: '6px 10px', background: '#f9fafb', borderRadius: 5, fontSize: 13 }}>{invoice.invoiceNumber}</div>
          </FormGroup>
          <FormGroup label="Date">
            <div style={{ padding: '6px 10px', background: '#f9fafb', borderRadius: 5, fontSize: 13 }}>{invoice.date}</div>
          </FormGroup>
          <FormGroup label="Patient Name">
            <div style={{ padding: '6px 10px', background: '#f9fafb', borderRadius: 5, fontSize: 13 }}>{invoice.patientName}</div>
          </FormGroup>
          <FormGroup label="Unit">
            <div style={{ padding: '6px 10px', background: '#f9fafb', borderRadius: 5, fontSize: 13 }}>{invoice.unit}</div>
          </FormGroup>
          <FormGroup label="Test" style={{ gridColumn: '1 / -1' }}>
            <div style={{ padding: '6px 10px', background: '#f9fafb', borderRadius: 5, fontSize: 13 }}>{invoice.test}</div>
          </FormGroup>
          <FormGroup label="Amount">
            <div style={{ padding: '6px 10px', background: '#f9fafb', borderRadius: 5, fontSize: 13, fontWeight: 600 }}>₹{invoice.amount}</div>
          </FormGroup>
          <FormGroup label="Status">
            <StatusBadge status={invoice.status} />
          </FormGroup>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16, marginTop: 8 }}>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LabInvoicePage() {
  const [invoices, setInvoices] = useState<LabInvoice[]>(INITIAL_INVOICES);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<LabInvoice | null>(null);

  const filtered = invoices.filter(inv =>
    inv.patientName.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.test.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (invoice: LabInvoice) => {
    setSelectedInvoice(invoice);
  };

  const tableData = filtered.map(inv => ({
    ...inv,
    status: <StatusBadge status={inv.status} />,
    action: (
      <button
        onClick={() => handleViewDetails(inv)}
        style={{
          border: 'none',
          background: 'none',
          color: '#2563eb',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'underline',
        }}
      >
        View
      </button>
    ),
  }));

  return (
    <>
      {/* Invoice Details Modal */}
      <InvoiceDetailsModal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        invoice={selectedInvoice}
      />

      {/* Page card */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: '1px solid #e8edf3',
          flexWrap: 'wrap',
          gap: 10,
        }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Lab Invoices</h1>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Search */}
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoices..."
              style={{ width: 200, fontSize: 13 }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ padding: '20px', overflowX: 'auto' }}>
          <Table
            columns={[...INVOICE_COLS, { key: 'action', label: 'Action' }]}
            data={tableData as any}
            emptyMessage="No invoices found."
          />
        </div>
      </div>
    </>
  );
}

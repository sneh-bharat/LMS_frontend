'use client';

import { useState } from 'react';
import {
  InlineButton as Button,
  InlineInput as Input,
  InlineFormGroup as FormGroup,
  InlineModal as Modal,
  InlineTable as Table,
  ReferrerCard,
} from '@/components/ui';


// ─── Types ────────────────────────────────────────────────────────────────────
interface Referrer {
  id: number;
  name: string;
  mobile: string;
  address: string;
  centre: string;
  marketingAssociate: string;
  status: 'Active' | 'Inactive';
  showOnPrint: 'Hide All' | 'Show All';
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_REFERRERS: Referrer[] = [
  {
    id: 1,
    name: 'A K DAS',
    mobile: '0000000000',
    address: '',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active',
    showOnPrint: 'Hide All',
  },
  {
    id: 2,
    name: 'DR RAMADAS LANKA',
    mobile: '9848834451',
    address: 'KPHB COLONY HYDERABAD 500072',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active',
    showOnPrint: 'Hide All',
  },
  {
    id: 3,
    name: 'JOYDEB DAS',
    mobile: '0000000000',
    address: '',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active',
    showOnPrint: 'Hide All',
  },
];

const COMMISSION_COLS = [
  { key: 'category', label: 'Category' },
  { key: 'investigation', label: 'Investigation' },
  { key: 'mrp', label: 'MRP' },
  { key: 'comm', label: 'Comm(%)' },
  { key: 'value', label: 'Value' },
  { key: 'action', label: 'Action' },
];

// ─── Add Referrer Modal ─────────────────────────────────────────────────────--
function AddReferrerModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (r: Referrer) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    address: '',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active' as 'Active' | 'Inactive',
    showOnPrint: 'Hide All' as 'Hide All' | 'Show All',
  });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    onAdd({ id: Date.now(), ...form });
    setForm({ name: '', mobile: '', address: '', centre: 'HO(IP)', marketingAssociate: '', status: 'Active', showOnPrint: 'Hide All' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Referrer">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 20 }}>
        <FormGroup label="Name" style={{ gridColumn: '1' }}>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter name" />
        </FormGroup>
        <FormGroup label="Show on Print" style={{ gridColumn: '2' }}>
          <select value={form.showOnPrint} onChange={e => setForm(f => ({ ...f, showOnPrint: e.target.value as any }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Hide All</option>
            <option>Show All</option>
          </select>
        </FormGroup>
        <FormGroup label="Mobile Number">
          <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile number" />
        </FormGroup>
        <FormGroup label="Address">
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Address" />
        </FormGroup>
        <FormGroup label="Associated Centre">
          <select value={form.centre} onChange={e => setForm(f => ({ ...f, centre: e.target.value }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>HO(IP)</option>
            <option>HO(OP)</option>
            <option>Branch A</option>
          </select>
        </FormGroup>
        <FormGroup label="Marketing Associate">
          <select value={form.marketingAssociate} onChange={e => setForm(f => ({ ...f, marketingAssociate: e.target.value }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option value="">Select Associate</option>
            <option>Associate 1</option>
            <option>Associate 2</option>
          </select>
        </FormGroup>
        <FormGroup label="Status">
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormGroup>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAdd}>Add</Button>
      </div>
    </Modal>
  );
}

// ─── Edit Referrer Modal ──────────────────────────────────────────────────────
function EditReferrerModal({
  isOpen,
  onClose,
  referrer,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  referrer: Referrer | null;
  onUpdate: (r: Referrer) => void;
}) {
  const [form, setForm] = useState<Referrer | null>(referrer);

  // sync when referrer prop changes
  if (referrer && form?.id !== referrer.id) setForm(referrer);

  if (!form) return null;

  const handleUpdate = () => {
    onUpdate(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Referrer Details">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 20 }}>
        <FormGroup label="Name">
          <Input value={form.name} onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)} />
        </FormGroup>
        <FormGroup label="Show on Print">
          <select value={form.showOnPrint} onChange={e => setForm(f => f ? { ...f, showOnPrint: e.target.value as any } : f)}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Hide All</option>
            <option>Show All</option>
          </select>
        </FormGroup>
        <FormGroup label="Mobile Number">
          <Input value={form.mobile} onChange={e => setForm(f => f ? { ...f, mobile: e.target.value } : f)} />
        </FormGroup>
        <FormGroup label="Address">
          <Input value={form.address} onChange={e => setForm(f => f ? { ...f, address: e.target.value } : f)} />
        </FormGroup>
        <FormGroup label="Associated Centre">
          <select value={form.centre} onChange={e => setForm(f => f ? { ...f, centre: e.target.value } : f)}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>HO(IP)</option>
            <option>HO(OP)</option>
            <option>Branch A</option>
          </select>
        </FormGroup>
        <FormGroup label="Marketing Associate">
          <select value={form.marketingAssociate} onChange={e => setForm(f => f ? { ...f, marketingAssociate: e.target.value } : f)}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option value="">Select Associate</option>
            <option>Associate 1</option>
            <option>Associate 2</option>
          </select>
        </FormGroup>
        <FormGroup label="Status">
          <select value={form.status} onChange={e => setForm(f => f ? { ...f, status: e.target.value as any } : f)}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormGroup>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleUpdate}>Update</Button>
      </div>
    </Modal>
  );
}

// ─── Commission Modal ─────────────────────────────────────────────────────────
function CommissionModal({
  isOpen,
  onClose,
  referrerName,
}: {
  isOpen: boolean;
  onClose: () => void;
  referrerName: string;
}) {
  const [copyFrom, setCopyFrom] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Commission Configuration">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <select
          value={copyFrom}
          onChange={e => setCopyFrom(e.target.value)}
          style={{ border: '1.5px solid #d1d5db', borderRadius: 5, padding: '6px 10px', fontSize: 13, color: '#444', outline: 'none' }}
        >
          <option value="">Copy Commission</option>
          {INITIAL_REFERRERS.filter(r => r.name !== referrerName).map(r => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
        <Button variant="danger">Remove</Button>
      </div>

      <Table
        columns={COMMISSION_COLS}
        data={[]}
        emptyMessage="No commission records found."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReferrerListPage() {
  const [referrers, setReferrers] = useState<Referrer[]>(INITIAL_REFERRERS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Referrer | null>(null);
  const [commTarget, setCommTarget] = useState<Referrer | null>(null);

  const filtered = referrers.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Modals */}
      <AddReferrerModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={r => setReferrers(prev => [...prev, r])}
      />
      <EditReferrerModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        referrer={editTarget}
        onUpdate={updated =>
          setReferrers(prev => prev.map(r => r.id === updated.id ? updated : r))
        }
      />
      <CommissionModal
        isOpen={!!commTarget}
        onClose={() => setCommTarget(null)}
        referrerName={commTarget?.name ?? ''}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22a06b" strokeWidth="2.2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Referrer list</h1>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Commission Configuration */}
            <Button variant="ghost" size="sm"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
              Commission Configuration
            </Button>

            {/* Add Referrer */}
            <Button variant="primary" size="sm"
              onClick={() => setAddOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Referrer
            </Button>

            {/* Search */}
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Referrer Name"
              style={{ width: 160, fontSize: 13 }}
            />
          </div>
        </div>

        {/* ── Grid ── */}
        <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, gridColumn: '1/-1' }}>No referrers found.</p>
          ) : (
            filtered.map(r => (
              <ReferrerCard
                key={r.id}
                referrer={r}
                onEdit={() => setEditTarget(r)}
                onCommission={() => setCommTarget(r)}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
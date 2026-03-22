'use client';

import { useState } from 'react';
import { InlineButton as Button, InlineInput as Input, InlineFormGroup as FormGroup, InlineModal as Modal, InlineTable as Table } from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LabUnit {
  id: number;
  name: string;
  code: string;
  description: string;
  status: 'Active' | 'Inactive';
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_UNITS: LabUnit[] = [
  {
    id: 1,
    name: 'Hematology',
    code: 'HEM',
    description: 'Blood and blood-forming tissues',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Clinical Biochemistry',
    code: 'BIO',
    description: 'Chemical analysis of body fluids',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Microbiology',
    code: 'MIC',
    description: 'Bacteria, viruses, and fungi identification',
    status: 'Active',
  },
];

const UNIT_COLS = [
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Unit Name' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status' },
];

// ─── Add Unit Modal ───────────────────────────────────────────────────────────
function AddUnitModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (u: LabUnit) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const handleAdd = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    onAdd({ id: Date.now(), ...form });
    setForm({ name: '', code: '', description: '', status: 'Active' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Lab Unit">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px', marginBottom: 20 }}>
        <FormGroup label="Unit Code" style={{ gridColumn: '1' }}>
          <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g., HEM" />
        </FormGroup>
        <FormGroup label="Status" style={{ gridColumn: '2' }}>
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
            style={{ width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none' }}>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </FormGroup>
        <FormGroup label="Unit Name" style={{ gridColumn: '1 / -1' }}>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter unit name" />
        </FormGroup>
        <FormGroup label="Description" style={{ gridColumn: '1 / -1' }}>
          <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
        </FormGroup>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleAdd}>Add Unit</Button>
      </div>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LabUnitsPage() {
  const [units, setUnits] = useState<LabUnit[]>(INITIAL_UNITS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const filtered = units.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={u => setUnits(prev => [...prev, u])}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2">
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>Lab Units Management</h1>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {/* Add Unit */}
            <Button variant="primary" size="sm"
              onClick={() => setAddOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Unit
            </Button>

            {/* Search */}
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search units..."
              style={{ width: 180, fontSize: 13 }}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ padding: '20px' }}>
          <Table
            columns={UNIT_COLS}
            data={filtered.map(u => ({
              ...u,
              action: u.status === 'Active' ? '✓' : '✗'
            }))}
            emptyMessage="No lab units found."
          />
        </div>
      </div>
    </>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Inline UI Primitives ─────────────────────────────────────────────────────

function Button({
  children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'dark';
  size?: 'sm' | 'md'; style?: React.CSSProperties; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    border: 'none', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: size === 'sm' ? '5px 11px' : '7px 16px',
    fontSize: size === 'sm' ? 12 : 13, opacity: disabled ? 0.6 : 1,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#2563eb', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db' },
    success:   { background: '#16a34a', color: '#fff' },
    danger:    { background: '#dc2626', color: '#fff' },
    dark:      { background: '#4b5563', color: '#fff' },
    ghost:     { background: 'none', color: '#2563eb', padding: 0 },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Input({
  value, onChange, placeholder = '', style = {},
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; style?: React.CSSProperties;
}) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{ border: '1.5px solid #d1d5db', borderRadius: 5, padding: '6px 10px',
        fontSize: 13, color: '#444', outline: 'none', width: '100%',
        boxSizing: 'border-box' as const, ...style }} />
  );
}

function FormGroup({ label, children, style = {} }: {
  label: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, width = 580 }: {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; width?: number;
}) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width, maxWidth: '95vw',
        padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        maxHeight: '92vh', overflowY: 'auto' as const }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 22, color: '#666', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Investigation {
  id: number;
  category: string;
  subCategory: string;
  name: string;
  container?: string;
  tat: string;
  cost: number;
  point: number;
  mrp: number;
  status: 'Active' | 'Inactive';
}

interface Parameter {
  id: number;
  name: string;
  method?: string;
  unit?: string;
  priority: number;
  checked: boolean;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE: Investigation[] = [
  { id: 1, category: 'Pathology', subCategory: 'ALLRGY', name: 'ASO TITRE (ASO)', tat: '0 Day', cost: 0, point: 0, mrp: 200, status: 'Active' },
  { id: 2, category: 'Pathology', subCategory: 'CYTOLOGY', name: 'CERVICAL/VAGINAL (SMEAR SENT)', tat: '3 Day', cost: 0, point: 0, mrp: 600, status: 'Active' },
  { id: 3, category: 'Pathology', subCategory: 'IMMUNOLOGY', name: '1, 25 (OH) VITAMIN D3', container: 'Clot (Powdered glass)', tat: '0 Day', cost: 144, point: 0, mrp: 1200, status: 'Active' },
  { id: 4, category: 'Pathology', subCategory: 'IMMUNOLOGY', name: '17 OH PROGESTERONE', container: 'Clot (Powdered glass)', tat: '1 Day', cost: 0, point: 0, mrp: 2000, status: 'Active' },
  { id: 5, category: 'Pathology', subCategory: 'IMMUNOLOGY', name: '17-KETOSTEROIDS-24HRS URINE', tat: '7 Day', cost: 0, point: 0, mrp: 3000, status: 'Active' },
  { id: 6, category: 'Pathology', subCategory: 'CLINI PATHO', name: '24 HOURS URINE CITRATE', tat: '5 Day', cost: 0, point: 0, mrp: 1500, status: 'Active' },
];

const SAMPLE_PARAMS: Parameter[] = [
  { id: 1, name: 'Impression', unit: '', priority: 9999998, checked: true },
  { id: 2, name: 'Instrument', unit: '', priority: 9999999, checked: true },
  { id: 3, name: 'Serum Antistreptolysin O (Qualitative)', method: 'Immunoturbidimetry', unit: 'IU/mL', priority: 999999, checked: true },
];

const CATEGORIES = ['All', 'Pathology', 'Radiology', 'Microbiology'];
const STATUSES   = ['Active', 'Inactive'];

// ─── Investigation Type Modal (Add Investigation) ─────────────────────────────
function InvestigationTypeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Investigation Type" width={480}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: 8, padding: '18px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          General
        </button>
        <button style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none',
          borderRadius: 8, padding: '18px 0', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
          Profile package
        </button>
      </div>
      <div style={{ borderTop: '1px solid #e8edf3', paddingTop: 14, display: 'flex',
        flexDirection: 'column' as const, gap: 6 }}>
        {[
          'General Investigation are like Glucose (F), X-Ray.',
          'Package Investigation are like Health Checkup Packages.',
        ].map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#555' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888"
              strokeWidth="2" style={{ marginTop: 2, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {t}
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── Parameter Modal ──────────────────────────────────────────────────────────
function ParameterModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [params, setParams] = useState<Parameter[]>(SAMPLE_PARAMS);
  const [search, setSearch] = useState('');

  const toggle = (id: number) =>
    setParams(prev => prev.map(p => p.id === id ? { ...p, checked: !p.checked } : p));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Parameter Configuration" width={680}>
      {/* Info banner */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6,
        padding: '12px 16px', marginBottom: 16, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 13, color: '#1e40af' }}>
        <span>Checked parameters will be part of the investigation. To add new parameter</span>
        <Button variant="primary" size="sm">click here</Button>
      </div>

      {/* Search */}
      <Input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Start typing..." style={{ marginBottom: 6 }} />
      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#6b7280' }}>
        You can easily find out parameters by typing few words into above textbox. On selection system will save automatically.
      </p>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ width: 40, padding: '8px 10px' }}></th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#374151' }}>Parameter</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#374151' }}>Unit</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#374151' }}>Priority</th>
          </tr>
        </thead>
        <tbody>
          {params.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '10px' }}>
                <input type="checkbox" checked={p.checked}
                  onChange={() => toggle(p.id)}
                  style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }} />
              </td>
              <td style={{ padding: '10px' }}>
                <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{p.name}</div>
                {p.method && <div style={{ fontSize: 11, color: '#6b7280' }}>{p.method}</div>}
              </td>
              <td style={{ padding: '10px', color: '#444' }}>{p.unit}</td>
              <td style={{ padding: '10px', color: '#444' }}>{p.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20,
        borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="dark" onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}

// ─── B2B Price Modal ──────────────────────────────────────────────────────────
function B2BPriceModal({ isOpen, onClose, investigation }: {
  isOpen: boolean; onClose: () => void; investigation: Investigation | null;
}) {
  const [rows, setRows] = useState([{ id: 1, centre: '', price: '' }]);
  const addRow = () => setRows(r => [...r, { id: Date.now(), centre: '', price: '' }]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`B2B Price — ${investigation?.name ?? ''}`} width={560}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#374151' }}>Centre / B2B Party</th>
            <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600, color: '#374151' }}>Price</th>
            <th style={{ width: 60, padding: '8px 10px' }}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 10px' }}>
                <Input value={row.centre}
                  onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, centre: e.target.value } : r))}
                  placeholder="Select centre" />
              </td>
              <td style={{ padding: '8px 10px' }}>
                <Input value={row.price}
                  onChange={e => setRows(prev => prev.map(r => r.id === row.id ? { ...r, price: e.target.value } : r))}
                  placeholder="0.00" />
              </td>
              <td style={{ padding: '8px 10px' }}>
                <Button variant="danger" size="sm"
                  onClick={() => setRows(prev => prev.filter(r => r.id !== row.id))}>×</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="success" size="sm" onClick={addRow}>+ Add Row</Button>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10,
        marginTop: 20, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>
    </Modal>
  );
}

// ─── Add/Edit Investigation Modal ─────────────────────────────────────────────
function InvestigationFormModal({ isOpen, onClose, initial, onSave }: {
  isOpen: boolean; onClose: () => void;
  initial?: Investigation | null;
  onSave: (inv: Omit<Investigation, 'id'>) => void;
}) {
  const blank = { category: 'Pathology', subCategory: '', name: '', container: '',
    tat: '0 Day', cost: 0, point: 0, mrp: 0, status: 'Active' as const };
  const [form, setForm] = useState(initial ? { ...initial } : blank);
  useEffect(() => { setForm(initial ? { ...initial } : blank); }, [initial, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={initial ? 'Edit Investigation' : 'Add Investigation'} width={640}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
        <FormGroup label="Category">
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={selectStyle}>
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Sub Category">
          <Input value={form.subCategory} onChange={e => setForm(f => ({ ...f, subCategory: e.target.value }))} placeholder="Sub category" />
        </FormGroup>
        <FormGroup label="Investigation Name" style={{ gridColumn: '1 / -1' }}>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Investigation name" />
        </FormGroup>
        <FormGroup label="Container">
          <Input value={form.container ?? ''} onChange={e => setForm(f => ({ ...f, container: e.target.value }))} placeholder="Container" />
        </FormGroup>
        <FormGroup label="TAT">
          <Input value={form.tat} onChange={e => setForm(f => ({ ...f, tat: e.target.value }))} placeholder="e.g. 1 Day" />
        </FormGroup>
        <FormGroup label="Cost">
          <Input value={String(form.cost)} onChange={e => setForm(f => ({ ...f, cost: Number(e.target.value) || 0 }))} placeholder="0.00" />
        </FormGroup>
        <FormGroup label="MRP">
          <Input value={String(form.mrp)} onChange={e => setForm(f => ({ ...f, mrp: Number(e.target.value) || 0 }))} placeholder="0.00" />
        </FormGroup>
        <FormGroup label="Status">
          <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
            style={selectStyle}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </FormGroup>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10,
        borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={() => { onSave(form); onClose(); }}>
          {initial ? 'Update' : 'Add'}
        </Button>
      </div>
    </Modal>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 10px', fontSize: 13, color: '#444', outline: 'none', background: '#fff',
};

// ─── Manage Dropdown ──────────────────────────────────────────────────────────
function ManageDropdown({ inv, onEdit, onB2B, onParameter }: {
  inv: Investigation;
  onEdit: () => void; onB2B: () => void; onParameter: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ background: '#4b5563', color: '#fff', border: 'none', borderRadius: 5,
          padding: '5px 12px', fontSize: 12, fontWeight: 500, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5"
            fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Manage
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff',
          border: '1px solid #e2e8f0', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 200, minWidth: 140, overflow: 'hidden' }}>
          {[
            { label: 'Edit',       action: onEdit },
            { label: 'B2B Price',  action: onB2B },
            { label: 'Parameter',  action: onParameter },
            { label: 'Impression', action: () => {} },
            { label: 'Template',   action: () => {} },
          ].map(({ label, action }) => (
            <button key={label}
              onClick={() => { action(); setOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 16px', fontSize: 13, background: 'none', border: 'none',
                cursor: 'pointer', color: '#374151',
                borderBottom: label === 'B2B Price' ? '1px solid #e8edf3' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvestigationListPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>(SAMPLE);
  const [search, setSearch]       = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  const [typeModal, setTypeModal]     = useState(false);
  const [formModal, setFormModal]     = useState(false);
  const [editTarget, setEditTarget]   = useState<Investigation | null>(null);
  const [b2bTarget, setB2BTarget]     = useState<Investigation | null>(null);
  const [paramTarget, setParamTarget] = useState<Investigation | null>(null);

  const filtered = investigations.filter(inv =>
    (catFilter === 'All' || inv.category === catFilter) &&
    inv.status === statusFilter &&
    inv.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (data: Omit<Investigation, 'id'>) =>
    setInvestigations(prev => [...prev, { id: Date.now(), ...data }]);

  const handleUpdate = (data: Omit<Investigation, 'id'>) =>
    setInvestigations(prev =>
      prev.map(inv => inv.id === editTarget?.id ? { ...inv, ...data } : inv));

  return (
    <>
      {/* Modals */}
      <InvestigationTypeModal isOpen={typeModal} onClose={() => setTypeModal(false)} />
      <InvestigationFormModal isOpen={formModal} onClose={() => setFormModal(false)}
        onSave={handleAdd} />
      <InvestigationFormModal isOpen={!!editTarget} onClose={() => setEditTarget(null)}
        initial={editTarget} onSave={handleUpdate} />
      <B2BPriceModal isOpen={!!b2bTarget} onClose={() => setB2BTarget(null)}
        investigation={b2bTarget} />
      <ParameterModal isOpen={!!paramTarget} onClose={() => setParamTarget(null)} />

      {/* Page shell */}
      <div style={{ background: '#fff', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #e8edf3', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#16a34a" strokeWidth="2.2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
              Investigation List
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="secondary" size="sm">Express Edit</Button>
            <Button variant="primary" size="sm"
              onClick={() => setTypeModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Investigation
            </Button>
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Investigation Name" style={{ width: 180 }} />
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', background: '#f8fafc', borderBottom: '1px solid #e8edf3' }}>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            style={{ ...selectStyle, width: 160 }}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ ...selectStyle, width: 130 }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Name', 'TAT', 'Cost', 'Point', 'MRP', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', fontWeight: 600, color: '#374151',
                    textAlign: h === '#' || h === 'Actions' ? 'center' : 'left',
                    whiteSpace: 'nowrap' as const,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                    No investigations found.
                  </td>
                </tr>
              ) : filtered.map((inv, idx) => (
                <tr key={inv.id}
                  style={{ borderBottom: '1px solid #f0f0f0',
                    background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#555', width: 40 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 500, marginBottom: 2 }}>
                      {inv.category} · {inv.subCategory}
                    </div>
                    <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 13 }}>{inv.name}</div>
                    {inv.container && (
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{inv.container}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#444', whiteSpace: 'nowrap' as const }}>{inv.tat}</td>
                  <td style={{ padding: '12px 14px', color: '#444' }}>{inv.cost.toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', color: '#444' }}>{inv.point.toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', color: '#444' }}>{inv.mrp.toFixed(2)}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <ManageDropdown
                      inv={inv}
                      onEdit={() => setEditTarget(inv)}
                      onB2B={() => setB2BTarget(inv)}
                      onParameter={() => setParamTarget(inv)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState } from 'react';

// ─── Inline UI Primitives ─────────────────────────────────────────────────────

function Button({
  children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'dark';
  size?: 'sm' | 'md'; style?: React.CSSProperties; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    border: 'none', borderRadius: 5,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: size === 'sm' ? '5px 10px' : '7px 16px',
    fontSize: size === 'sm' ? 12 : 13,
    opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap' as const,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#2563eb', color: '#fff' },
    secondary: { background: '#5a6474', color: '#fff' },
    danger:    { background: '#dc2626', color: '#fff' },
    dark:      { background: '#374151', color: '#fff' },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Input({
  value, onChange, placeholder = '', style = {}, type = 'text',
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; style?: React.CSSProperties; type?: string;
}) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{
        border: '1.5px solid #d1d5db', borderRadius: 5,
        padding: '7px 10px', fontSize: 13, color: '#444',
        outline: 'none', width: '100%',
        boxSizing: 'border-box' as const, ...style,
      }} />
  );
}

function FormGroup({ label, children, style = {} }: {
  label: string; children: React.ReactNode; style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
    </div>
  );
}

const sel: React.CSSProperties = {
  border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 8px', fontSize: 13, color: '#444',
  outline: 'none', background: '#fff', cursor: 'pointer', width: '100%',
};

function Modal({ isOpen, onClose, title, children, width = 560 }: {
  isOpen: boolean; onClose: () => void; title: string;
  children: React.ReactNode; width?: number;
}) {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, width, maxWidth: '96vw',
        padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        maxHeight: '95vh', overflowY: 'auto' as const,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 22, color: '#666', lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Patient {
  id: number;
  uhid: number;
  title: string;
  name: string;
  branch: string;
  gender: string;
  age: string;
  dob: { month: string; day: string };
  contact: string;
  email: string;
  country: string;
  mobile: string;
  nationality: string;
  docType: string;
  docNumber: string;
  address: string;
  diseases: string[];
  drugAllergy: string;
  regCharges: boolean;
  payMode: string;
}

const DISEASES = ['Diabetes', 'Hypertension', 'Anaemia', 'Thyroid', 'Arthritis', 'Asthma'];
const MONTHS   = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const DAYS     = Array.from({ length: 31 }, (_, i) => String(i + 1));
const TITLES   = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby'];
const GENDERS  = ['Male', 'Female', 'Other'];
const DOC_TYPES = ['Please Select', 'Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License'];
const NATIONALITIES = ['IND-India', 'USA-United States', 'UK-United Kingdom', 'Other'];
const PAY_MODES = ['Cash', 'Card', 'UPI', 'Online'];
const BRANCHES  = ['With mobile number', 'Without mobile number'];
const SHOW_ALL  = ['Show All', 'Male', 'Female'];

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE_PATIENTS: Patient[] = [
  { id: 1, uhid: 69, title: 'Dr.',   name: 'Mohib Ahmed',             branch: 'Customer Support & Quality Assurance', gender: 'Male',   age: '50 Y', dob: { month: '1',  day: '1'  }, contact: '+(91)9934362019', email: '', country: 'IND +91', mobile: '9934362019', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 2, uhid: 65, title: 'Ms.',   name: 'Srabanti',                branch: 'Customer Support & Quality Assurance', gender: 'Female', age: '44 Y', dob: { month: '2',  day: '5'  }, contact: '+(91)8617269047', email: '', country: 'IND +91', mobile: '8617269047', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 3, uhid: 63, title: 'Mr.',   name: 'Saber',                   branch: 'Customer Support & Quality Assurance', gender: 'Male',   age: '45 Y', dob: { month: '3',  day: '10' }, contact: '+(91)9848834451', email: '', country: 'IND +91', mobile: '9848834451', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 4, uhid: 62, title: 'Ms.',   name: 'Sravani',                 branch: 'Customer Support & Quality Assurance', gender: 'Female', age: '23 Y', dob: { month: '4',  day: '15' }, contact: '+(91)8099734907', email: '', country: 'IND +91', mobile: '8099734907', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 5, uhid: 61, title: 'Ms.',   name: 'Ankitha',                 branch: 'Customer Support & Quality Assurance', gender: 'Female', age: '30 Y', dob: { month: '5',  day: '20' }, contact: '+(91)9848834451', email: '', country: 'IND +91', mobile: '9848834451', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 6, uhid: 60, title: 'Baby',  name: 'Bharathi',               branch: 'Customer Support & Quality Assurance', gender: 'Female', age: '9 Y',  dob: { month: '6',  day: '3'  }, contact: '+(91)7396220280', email: '', country: 'IND +91', mobile: '7396220280', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 7, uhid: 59, title: 'Mr.',   name: 'Akhil',                   branch: 'Customer Support & Quality Assurance', gender: 'Male',   age: '30 Y', dob: { month: '7',  day: '8'  }, contact: '+(91)9966948800', email: '', country: 'IND +91', mobile: '9966948800', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 8, uhid: 58, title: 'Smt.',  name: 'Sandhya',                branch: 'Customer Support & Quality Assurance', gender: 'Female', age: '45 Y', dob: { month: '8',  day: '12' }, contact: '+(91)9848834431', email: '', country: 'IND +91', mobile: '9848834431', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 9, uhid: 57, title: 'Mr.',   name: 'MOHAMMED BURHANUDDIN SABER', branch: 'Customer Support & Quality Assurance', gender: 'Male', age: '45 Y', dob: { month: '9', day: '18' }, contact: '+(91)9059483933', email: '', country: 'IND +91', mobile: '9059483933', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
];

// ─── Registration Form Modal ──────────────────────────────────────────────────
function PatientRegistrationModal({
  isOpen, onClose, initial, onSave,
}: {
  isOpen: boolean; onClose: () => void;
  initial?: Patient | null;
  onSave: (p: Omit<Patient, 'id' | 'uhid' | 'age' | 'contact'>) => void;
}) {
  const blank = {
    title: 'Ms.', name: '', branch: 'Customer Support & Quality Assurance',
    gender: 'Female', dob: { month: '2', day: '16' },
    country: 'IND +91', mobile: '', email: '', nationality: 'IND-India',
    docType: 'Please Select', docNumber: '', address: '',
    diseases: [] as string[], drugAllergy: '',
    regCharges: true, payMode: 'Cash',
  };

  const [form, setForm] = useState(initial
    ? { title: initial.title, name: initial.name, branch: initial.branch,
        gender: initial.gender, dob: initial.dob, country: initial.country,
        mobile: initial.mobile, email: initial.email, nationality: initial.nationality,
        docType: initial.docType || 'Please Select', docNumber: initial.docNumber,
        address: initial.address, diseases: initial.diseases, drugAllergy: initial.drugAllergy,
        regCharges: initial.regCharges, payMode: initial.payMode }
    : blank);

  const [ageInput, setAgeInput] = useState(initial?.age?.replace(' Y','') ?? '28');

  const toggleDisease = (d: string) =>
    setForm(f => ({
      ...f,
      diseases: f.diseases.includes(d)
        ? f.diseases.filter(x => x !== d)
        : [...f.diseases, d],
    }));

  const handleSave = () => { onSave(form); onClose(); };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Patient Registration" width={620}>
      {/* Row 1: Title + Patient Name */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, marginBottom: 14 }}>
        <FormGroup label="Title">
          <select value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={sel}>
            {TITLES.map(t => <option key={t}>{t}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Patient name">
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Patient name" />
        </FormGroup>
      </div>

      {/* Row 2: Country + Mobile + Age + Month + Day + Gender */}
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 60px 80px 80px 100px', gap: 10, marginBottom: 14 }}>
        <FormGroup label="Country">
          <select value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} style={sel}>
            <option>IND +91</option><option>USA +1</option><option>UK +44</option>
          </select>
        </FormGroup>
        <FormGroup label="Mobile Number">
          <Input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="Mobile" />
        </FormGroup>
        <FormGroup label="Age 🎂">
          <Input value={ageInput} onChange={e => setAgeInput(e.target.value)} placeholder="Age" />
        </FormGroup>
        <FormGroup label="Month">
          <select value={form.dob.month} onChange={e => setForm(f => ({ ...f, dob: { ...f.dob, month: e.target.value } }))} style={sel}>
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Day">
          <select value={form.dob.day} onChange={e => setForm(f => ({ ...f, dob: { ...f.dob, day: e.target.value } }))} style={sel}>
            {DAYS.map(d => <option key={d}>{d}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Gender">
          <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={sel}>
            {GENDERS.map(g => <option key={g}>{g}</option>)}
          </select>
        </FormGroup>
      </div>

      {/* Row 3: Email + Nationality */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <FormGroup label="Email ID">
          <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="email@example.com" type="email" />
        </FormGroup>
        <FormGroup label="Nationality">
          <select value={form.nationality} onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))} style={sel}>
            {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
          </select>
        </FormGroup>
      </div>

      {/* Row 4: Document Type + Document Number */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <FormGroup label="Document Type">
          <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} style={sel}>
            {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Document Number">
          <Input value={form.docNumber} onChange={e => setForm(f => ({ ...f, docNumber: e.target.value }))}
            placeholder="Document Number" />
        </FormGroup>
      </div>

      {/* Row 5: Address */}
      <FormGroup label="Address" style={{ marginBottom: 14 }}>
        <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          placeholder="Address" />
      </FormGroup>

      {/* Row 6: Pre existing disease */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
          Pre existing disease
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '8px 16px' }}>
          {DISEASES.map(d => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.diseases.includes(d)}
                onChange={() => toggleDisease(d)}
                style={{ width: 14, height: 14, accentColor: '#2563eb', cursor: 'pointer' }} />
              {d}
            </label>
          ))}
        </div>
      </div>

      {/* Row 7: Drug Allergy */}
      <FormGroup label="Drug Allergy" style={{ marginBottom: 14 }}>
        <Input value={form.drugAllergy}
          onChange={e => setForm(f => ({ ...f, drugAllergy: e.target.value }))}
          placeholder="Please mention if you have any drug allergy" />
      </FormGroup>

      {/* Row 8: Registration Charges */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 6,
        padding: '10px 14px', marginBottom: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1e40af', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.regCharges}
            onChange={e => setForm(f => ({ ...f, regCharges: e.target.checked }))}
            style={{ width: 15, height: 15, accentColor: '#2563eb' }} />
          Patient Registration Charges (Valid for 60 months): – 0
        </label>
        <select value={form.payMode} onChange={e => setForm(f => ({ ...f, payMode: e.target.value }))}
          style={{ ...sel, width: 90 }}>
          {PAY_MODES.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10,
        borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSave}>Save</Button>
      </div>
    </Modal>
  );
}

// ─── Split Edit+Arrow button ──────────────────────────────────────────────────
function EditSplitButton({ onEdit }: { onEdit: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button onClick={onEdit} style={{
        background: '#2563eb', color: '#fff', border: 'none',
        borderRadius: '5px 0 0 5px', padding: '5px 12px',
        fontSize: 12, fontWeight: 500, cursor: 'pointer',
      }}>Edit</button>
      <button onClick={() => setOpen(o => !o)} style={{
        background: '#1d4ed8', color: '#fff', border: 'none',
        borderRadius: '0 5px 5px 0', padding: '5px 7px',
        fontSize: 11, cursor: 'pointer', borderLeft: '1px solid rgba(255,255,255,0.3)',
      }}>▾</button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, background: '#fff',
          border: '1px solid #e2e8f0', borderRadius: 5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 120,
        }}>
          {['View', 'Delete'].map(a => (
            <button key={a} onClick={() => setOpen(false)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '8px 14px', fontSize: 13, background: 'none',
              border: 'none', cursor: 'pointer', color: '#374151',
            }}>{a}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FindRegisterPatientPage() {
  const [patients, setPatients]     = useState<Patient[]>(SAMPLE_PATIENTS);
  const [search, setSearch]         = useState('');
  const [mobileFilter, setMobile]   = useState('With mobile number');
  const [genderFilter, setGender]   = useState('Show All');
  const [branchFilter, setBranch]   = useState('Show All');
  const [statusFilter, setStatus]   = useState('Show All');
  const [searchType, setSearchType] = useState('Mobile Number');
  const [regOpen, setRegOpen]       = useState(false);
  const [editTarget, setEditTarget] = useState<Patient | null>(null);

  const filtered = patients.filter(p => {
    const nameMatch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.includes(search);
    const genderMatch = genderFilter === 'Show All' || p.gender === genderFilter;
    return nameMatch && genderMatch;
  });

  const handleAdd = (data: Omit<Patient, 'id' | 'uhid' | 'age' | 'contact'>) => {
    const newId = Math.max(...patients.map(p => p.uhid)) + 1;
    setPatients(prev => [{
      ...data,
      id: Date.now(), uhid: newId,
      age: '0 Y',
      contact: `+(91)${data.mobile}`,
    }, ...prev]);
  };

  const handleUpdate = (data: Omit<Patient, 'id' | 'uhid' | 'age' | 'contact'>) => {
    if (!editTarget) return;
    setPatients(prev => prev.map(p => p.id === editTarget.id
      ? { ...p, ...data, contact: `+(91)${data.mobile}` }
      : p));
  };

  return (
    <>
      <PatientRegistrationModal
        isOpen={regOpen} onClose={() => setRegOpen(false)} onSave={handleAdd} />
      <PatientRegistrationModal
        isOpen={!!editTarget} onClose={() => setEditTarget(null)}
        initial={editTarget} onSave={handleUpdate} />

      <div style={{ background: '#fff', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #e8edf3',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 7c1.93 0 3.5-1.57 3.5-3.5S13.93 3 12 3 8.5 4.57 8.5 6.5 10.07 10 12 10zm7 9H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
              Patient Information
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
            <Button variant="primary" onClick={() => setRegOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Patient
            </Button>

            {/* Search type + input */}
            <select value={searchType} onChange={e => setSearchType(e.target.value)}
              style={{ ...sel, width: 150 }}>
              <option>Mobile Number</option>
              <option>Patient Name</option>
              <option>UHID</option>
            </select>
            <Input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Type here" style={{ width: 150 }} />
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', borderBottom: '1px solid #e8edf3',
          background: '#f8fafc', flexWrap: 'wrap' as const,
        }}>
          <select value={mobileFilter} onChange={e => setMobile(e.target.value)}
            style={{ ...sel, minWidth: 180 }}>
            <option>With mobile number</option>
            <option>Without mobile number</option>
          </select>
          <select value={genderFilter} onChange={e => setGender(e.target.value)}
            style={{ ...sel, minWidth: 120 }}>
            {SHOW_ALL.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={branchFilter} onChange={e => setBranch(e.target.value)}
            style={{ ...sel, minWidth: 120 }}>
            <option>Show All</option>
            <option>Customer Support & Quality Assurance</option>
          </select>
          <select value={statusFilter} onChange={e => setStatus(e.target.value)}
            style={{ ...sel, minWidth: 120 }}>
            <option>Show All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Patient Name (UHID)', 'Branch/B2b', 'Gen', 'Age & DOB', 'Contact', 'Action'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 14px', fontWeight: 600, color: '#374151',
                    textAlign: i === 0 || i >= 5 ? 'center' : 'left',
                    whiteSpace: 'nowrap' as const,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
                    No patients found.
                  </td>
                </tr>
              ) : filtered.map((p, idx) => (
                <tr key={p.id} style={{
                  borderBottom: '1px solid #f0f0f0',
                  background: idx % 2 === 0 ? '#fff' : '#fafafa',
                }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#555', width: 36 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontWeight: 600, color: '#1a1a2e' }}>
                      {p.title} {p.name}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: 12 }}> ({p.uhid})</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 12 }}>
                    {p.branch}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#444' }}>
                    {p.gender === 'Male' ? 'Male' : 'Female'}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#444', whiteSpace: 'nowrap' as const }}>
                    {p.age}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', color: '#444', whiteSpace: 'nowrap' as const }}>
                    {p.contact}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <EditSplitButton onEdit={() => setEditTarget(p)} />
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
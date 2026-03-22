'use client';

import { useState } from 'react';

// ─── Shared style constants ───────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%', border: '1px solid #cfd8e3', borderRadius: 4,
  padding: '6px 8px', fontSize: 13, color: '#333',
  outline: 'none', background: '#fff',
  boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selectBase: React.CSSProperties = { ...inputBase, cursor: 'pointer' };
const labelSm: React.CSSProperties = {
  fontSize: 12, fontWeight: 500, color: '#374151', marginBottom: 3,
  display: 'block',
};
const readonlyInput: React.CSSProperties = {
  ...inputBase, background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed',
};
const sectionRow: React.CSSProperties = {
  display: 'grid', gap: 12, marginBottom: 12,
};

// ─── Types ───────────────────────────────────────────────────────────────────
interface Investigation {
  id: number;
  name: string;
  mrp: number;
  category: string;
}

interface FormState {
  country: string;
  mobile: string;
  title: string;
  patientName: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  address: string;
  email: string;
  diagnosis: string;
  nationality: string;
  drugAllergy: string;
  lmpDate: string;
  height: string;
  weight: string;
  diseases: string[];
  referredDoctor: string;
  referrer: string;
  processing: string;
  emergencyCharge: string;
  phlebotomist: string;
  phlebotomistCharge: string;
  contrast: string;
  discount: string;
  discountType: string;
  discountBy: string;
  payment: string;
  paymentMode: string;
  srfId: string;
  advanceBooking: boolean;
}

const DISEASES = ['Diabetes', 'Hypertension', 'Anaemia', 'Thyroid', 'Arthritis', 'Asthma'];
const TITLES   = ['', 'Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby', 'M/s'];
const GENDERS  = ['', 'Male', 'Female', 'Other'];
const MONTHS   = Array.from({ length: 13 }, (_, i) => String(i));
const DAYS     = Array.from({ length: 32 }, (_, i) => String(i));
const PROCESSING = ['Normal', 'Urgent', 'STAT'];
const PAY_MODES  = ['Cash', 'Card', 'UPI', 'Online', 'Credit'];
const PHLEBS     = ['', 'Phlebotomist 1', 'Phlebotomist 2', 'Phlebotomist 3'];
const DISC_TYPES = ['--', '%', 'Flat'];
const DISC_BY    = ['N/A', 'Doctor', 'Manager', 'Admin'];
const NATIONALITIES = ['IND-India', 'USA-United States', 'UK-United Kingdom', 'UAE', 'Other'];

const BLANK: FormState = {
  country: 'IND +91', mobile: '', title: '', patientName: '',
  age: '', month: '0', day: '0', gender: '',
  address: '', email: '', diagnosis: '', nationality: 'IND-India',
  drugAllergy: '', lmpDate: '', height: '', weight: '',
  diseases: [], referredDoctor: '', referrer: '',
  processing: 'Normal', emergencyCharge: '',
  phlebotomist: '', phlebotomistCharge: '', contrast: '',
  discount: '0', discountType: '--', discountBy: 'N/A',
  payment: '', paymentMode: 'Cash', srfId: '', advanceBooking: false,
};

const SAMPLE_INVESTIGATIONS: Investigation[] = [
  { id: 1, name: 'CBC (Complete Blood Count)', mrp: 350,  category: 'Haematology' },
  { id: 2, name: 'Lipid Profile',              mrp: 600,  category: 'Biochemistry' },
  { id: 3, name: 'Thyroid Profile (T3,T4,TSH)', mrp: 800, category: 'Immunology'  },
  { id: 4, name: 'Blood Sugar Fasting',         mrp: 120,  category: 'Biochemistry' },
  { id: 5, name: 'Urine Routine',               mrp: 150,  category: 'Clinical Pathology' },
];

// ─── Add Investigations Modal ─────────────────────────────────────────────────
function AddInvestigationsModal({ isOpen, onClose, onAdd }: {
  isOpen: boolean; onClose: () => void;
  onAdd: (inv: Investigation[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAdd = () => {
    onAdd(SAMPLE_INVESTIGATIONS.filter(i => selected.includes(i.id)));
    setSelected([]); setSearch('');
    onClose();
  };

  if (!isOpen) return null;
  const filtered = SAMPLE_INVESTIGATIONS.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 560, maxWidth: '95vw', padding: 22, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' as const }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Add Investigations</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666' }}>×</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search investigation…"
          style={{ ...inputBase, marginBottom: 12 }} />
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ width: 40, padding: '8px' }}></th>
              <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>Investigation</th>
              <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 600 }}>Category</th>
              <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 600 }}>MRP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                onClick={() => toggle(inv.id)}>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggle(inv.id)}
                    style={{ width: 15, height: 15, accentColor: '#2563eb' }} />
                </td>
                <td style={{ padding: '8px 10px' }}>{inv.name}</td>
                <td style={{ padding: '8px 10px', color: '#6b7280' }}>{inv.category}</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 500 }}>₹{inv.mrp}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16, borderTop: '1px solid #e8edf3', paddingTop: 14 }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 5, border: '1.5px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleAdd} disabled={selected.length === 0}
            style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: selected.length ? '#16a34a' : '#d1fae5', color: '#fff', fontSize: 13, fontWeight: 600, cursor: selected.length ? 'pointer' : 'not-allowed' }}>
            Add {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Referred Doctor Modal ────────────────────────────────────────────────────
function ReferredDoctorModal({ isOpen, onClose, onSelect }: {
  isOpen: boolean; onClose: () => void; onSelect: (name: string) => void;
}) {
  const doctors = ['Dr. Rajan Mehta', 'Dr. Priya Sharma', 'Dr. Suresh Kumar', 'Dr. Anita Nair', 'Dr. Kavitha Rao'];
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 400, maxWidth: '95vw', padding: 22, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Referred Doctor</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666' }}>×</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctor…" style={{ ...inputBase, marginBottom: 10 }} />
        <div style={{ maxHeight: 220, overflowY: 'auto' as const }}>
          {doctors.filter(d => d.toLowerCase().includes(search.toLowerCase())).map(d => (
            <div key={d} onClick={() => { onSelect(d); onClose(); }}
              style={{ padding: '9px 12px', cursor: 'pointer', borderRadius: 5, fontSize: 13, color: '#1e293b' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Add Referrer Modal ───────────────────────────────────────────────────────
function AddReferrerModal({ isOpen, onClose, onSelect }: {
  isOpen: boolean; onClose: () => void; onSelect: (name: string) => void;
}) {
  const referrers = ['A K DAS', 'DR RAMADAS LANKA', 'JOYDEB DAS'];
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 400, maxWidth: '95vw', padding: 22, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Add Referrer</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666' }}>×</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search referrer…" style={{ ...inputBase, marginBottom: 10 }} />
        <div style={{ maxHeight: 220, overflowY: 'auto' as const }}>
          {referrers.filter(r => r.toLowerCase().includes(search.toLowerCase())).map(r => (
            <div key={r} onClick={() => { onSelect(r); onClose(); }}
              style={{ padding: '9px 12px', cursor: 'pointer', borderRadius: 5, fontSize: 13, color: '#1e293b' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#eff6ff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiagnosticBookingPage() {
  const [form, setForm]                     = useState<FormState>(BLANK);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [addInvOpen, setAddInvOpen]         = useState(false);
  const [refDocOpen, setRefDocOpen]         = useState(false);
  const [referrerOpen, setReferrerOpen]     = useState(false);

  const set = (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleDisease = (d: string) =>
    setForm(f => ({
      ...f,
      diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d],
    }));

  const addInvestigations = (inv: Investigation[]) => {
    setInvestigations(prev => {
      const existing = new Set(prev.map(i => i.id));
      return [...prev, ...inv.filter(i => !existing.has(i.id))];
    });
  };

  const removeInvestigation = (id: number) =>
    setInvestigations(prev => prev.filter(i => i.id !== id));

  // Computed totals
  const amount       = investigations.reduce((s, i) => s + i.mrp, 0);
  const emergency    = Number(form.emergencyCharge) || 0;
  const phlebCharge  = Number(form.phlebotomistCharge) || 0;
  const contrast     = Number(form.contrast) || 0;
  const totalAmount  = amount + emergency + phlebCharge + contrast;
  const discVal      = form.discountType === '%'
    ? (totalAmount * (Number(form.discount) || 0)) / 100
    : Number(form.discount) || 0;
  const totalDue     = Math.max(0, totalAmount - discVal);
  const balance      = totalDue - (Number(form.payment) || 0);

  const handleNext = () => {
    if (!form.mobile) { alert('Please enter mobile number.'); return; }
    if (!form.patientName.trim()) { alert('Patient name is required.'); return; }
    console.log('Booking payload:', { ...form, investigations, amount, totalAmount, totalDue });
    alert('Booking confirmed! Check console for payload.');
  };

  return (
    <>
      <AddInvestigationsModal isOpen={addInvOpen} onClose={() => setAddInvOpen(false)} onAdd={addInvestigations} />
      <ReferredDoctorModal    isOpen={refDocOpen} onClose={() => setRefDocOpen(false)} onSelect={name => setForm(f => ({ ...f, referredDoctor: name }))} />
      <AddReferrerModal       isOpen={referrerOpen} onClose={() => setReferrerOpen(false)} onSelect={name => setForm(f => ({ ...f, referrer: name }))} />

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Page Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e8edf3', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}></span>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Diagnostic Booking</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Invoice icon */}
            <button style={{ background: '#6b7280', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </button>
            {/* Transfer icon */}
            <button style={{ background: '#6b7280', border: 'none', borderRadius: 5, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
            </button>
            {/* Branch badge */}
            <span style={{ background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 13, padding: '5px 12px', borderRadius: 5 }}>HO(IP)</span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 0 }}>

          {/* ═══ LEFT COLUMN ═══ */}
          <div style={{ padding: '16px 20px', borderRight: '1px solid #e8edf3' }}>

            {/* Row 1: Country + Mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, marginBottom: 4, alignItems: 'end' }}>
              <div>
                <label style={labelSm}>Country</label>
                <select value={form.country} onChange={set('country')} style={selectBase}>
                  <option>IND +91</option><option>USA +1</option><option>UK +44</option><option>UAE +971</option>
                </select>
              </div>
              <div>
                <label style={labelSm}>Mobile Number</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input value={form.mobile} onChange={set('mobile')} placeholder=""
                    style={{ ...inputBase, flex: 1 }} />
                  {/* Toggle */}
                  <div onClick={() => setForm(f => ({ ...f, advanceBooking: !f.advanceBooking }))}
                    style={{
                      width: 36, height: 20, borderRadius: 20, cursor: 'pointer', flexShrink: 0,
                      background: form.advanceBooking ? '#2563eb' : '#d1d5db',
                      position: 'relative', transition: 'background 0.2s',
                    }}>
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 2,
                      left: form.advanceBooking ? 18 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b' }}>
                  Booking without number put <strong>00</strong>
                </p>
              </div>
            </div>
            <p style={{ margin: '0 0 12px 172px', fontSize: 11, color: '#2563eb' }}>
              Information will show based on mobile number
            </p>

            {/* Row 2: Title + Patient Name + Age + Month + Day + Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 60px 70px 70px 120px', gap: 10, marginBottom: 12, alignItems: 'end' }}>
              <div>
                <label style={labelSm}>Title</label>
                <select value={form.title} onChange={set('title')} style={selectBase}>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSm}>Patient name</label>
                <input value={form.patientName} onChange={set('patientName')} style={inputBase} />
              </div>
              <div>
                <label style={labelSm}>Age 🎂</label>
                <input value={form.age} onChange={set('age')} style={inputBase} />
              </div>
              <div>
                <label style={labelSm}>Month</label>
                <select value={form.month} onChange={set('month')} style={selectBase}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSm}>Day</label>
                <select value={form.day} onChange={set('day')} style={selectBase}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSm}>Gender</label>
                <select value={form.gender} onChange={set('gender')} style={selectBase}>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Address + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelSm}>Address</label>
                <input value={form.address} onChange={set('address')} style={inputBase} />
              </div>
              <div>
                <label style={labelSm}>Email Address</label>
                <input type="email" value={form.email} onChange={set('email')} style={inputBase} />
              </div>
            </div>

            {/* Row 4: Diagnosis + Nationality */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 12, marginBottom: 12, alignItems: 'end' }}>
              <div>
                <label style={labelSm}>Diagnosis</label>
                <input value={form.diagnosis} onChange={set('diagnosis')} style={inputBase} />
              </div>
              <div>
                <label style={{ ...labelSm, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Nationality
                  <span style={{ background: '#2563eb', color: '#fff', borderRadius: '50%', width: 14, height: 14, fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>i</span>
                </label>
                <select value={form.nationality} onChange={set('nationality')} style={selectBase}>
                  {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>

            {/* Row 5: Drug Allergy + LMP Date + Height + Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px 80px', gap: 12, marginBottom: 12, alignItems: 'end' }}>
              <div>
                <label style={labelSm}>Drug Allergy</label>
                <input value={form.drugAllergy} onChange={set('drugAllergy')}
                  placeholder="Please mention if you have any drug allergy" style={inputBase} />
              </div>
              <div>
                <label style={labelSm}>LMP Date</label>
                <input type="date" value={form.lmpDate} onChange={set('lmpDate')} style={inputBase} />
              </div>
              <div>
                <label style={labelSm}>Height</label>
                <input value={form.height} onChange={set('height')} placeholder="cm" style={inputBase} />
              </div>
              <div>
                <label style={labelSm}>Weight</label>
                <input value={form.weight} onChange={set('weight')} placeholder="kg" style={inputBase} />
              </div>
            </div>

            {/* Pre Existing Disease */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelSm}>Pre Existing Disease</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '6px 20px', marginTop: 4 }}>
                {DISEASES.map(d => (
                  <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.diseases.includes(d)}
                      onChange={() => toggleDisease(d)}
                      style={{ width: 14, height: 14, accentColor: '#2563eb' }} />
                    {d}
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              <button onClick={() => setRefDocOpen(true)} style={{
                background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5,
                padding: '8px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Referred Doctor
              </button>
              <button onClick={() => setAddInvOpen(true)} style={{
                background: '#16a34a', color: '#fff', border: 'none', borderRadius: 5,
                padding: '8px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Investigations
              </button>
              <button onClick={() => setReferrerOpen(true)} style={{
                background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 5,
                padding: '8px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Referrer
              </button>
              <button onClick={() => setForm(f => ({ ...f, advanceBooking: !f.advanceBooking }))} style={{
                background: '#0891b2', color: '#fff', border: 'none', borderRadius: 5,
                padding: '8px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Advance Booking?
              </button>
            </div>

            {/* Selected doctor / referrer chips */}
            {form.referredDoctor && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 5, padding: '5px 10px', marginBottom: 8, fontSize: 12, color: '#1d4ed8', display: 'flex', justifyContent: 'space-between' }}>
                <span>👨‍⚕️ Referred Doctor: <strong>{form.referredDoctor}</strong></span>
                <button onClick={() => setForm(f => ({ ...f, referredDoctor: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}>×</button>
              </div>
            )}
            {form.referrer && (
              <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 5, padding: '5px 10px', marginBottom: 8, fontSize: 12, color: '#854d0e', display: 'flex', justifyContent: 'space-between' }}>
                <span>🔗 Referrer: <strong>{form.referrer}</strong></span>
                <button onClick={() => setForm(f => ({ ...f, referrer: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}>×</button>
              </div>
            )}

            {/* Investigations table */}
            {investigations.length > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ textAlign: 'left', padding: '7px 12px', fontWeight: 600, fontSize: 12, color: '#374151' }}>#</th>
                      <th style={{ textAlign: 'left', padding: '7px 12px', fontWeight: 600, fontSize: 12, color: '#374151' }}>Investigation</th>
                      <th style={{ textAlign: 'right', padding: '7px 12px', fontWeight: 600, fontSize: 12, color: '#374151' }}>MRP</th>
                      <th style={{ width: 40, padding: '7px 8px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {investigations.map((inv, idx) => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '7px 12px', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '7px 12px', color: '#1e293b' }}>{inv.name}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', color: '#1e293b', fontWeight: 500 }}>₹{inv.mrp}</td>
                        <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                          <button onClick={() => removeInvestigation(inv.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14 }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Note */}
            <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 10px' }}>
              Upto 5 investigations can accomodate in A5 size invoice
            </p>
            <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 5, padding: '8px 12px', fontSize: 12, color: '#1e40af', marginBottom: 14 }}>
              Other than HOIP based on admin settings concession will show on Patient Copy - Invoice only.
            </div>

            {/* SRF ID */}
            <div>
              <label style={labelSm}>
                SRF-ID{' '}
                <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 400 }}>(COVID RT-PCR Booking)</span>
              </label>
              <input value={form.srfId} onChange={set('srfId')} style={{ ...inputBase, maxWidth: 320 }} />
            </div>

            {/* Bottom pink bar placeholder */}
            <div style={{ height: 32, background: '#fce7f3', borderRadius: 5, marginTop: 20 }} />
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div style={{ padding: '16px 20px' }}>

            {/* Processing */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Processing</label>
              <select value={form.processing} onChange={set('processing')} style={selectBase}>
                {PROCESSING.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Amount (readonly) */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Amount</label>
              <input value={amount || 0} readOnly style={readonlyInput} />
            </div>

            {/* Emergency Charge */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Emergency Charge</label>
              <input type="number" value={form.emergencyCharge} onChange={set('emergencyCharge')}
                placeholder="0" style={inputBase} />
            </div>

            {/* (+) Phlebotomist */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>(+) Phlebotomist</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
                <select value={form.phlebotomist} onChange={set('phlebotomist')} style={selectBase}>
                  {PHLEBS.map(p => <option key={p} value={p}>{p || 'Select'}</option>)}
                </select>
                <input type="number" value={form.phlebotomistCharge} onChange={set('phlebotomistCharge')}
                  placeholder="0" style={inputBase} />
              </div>
            </div>

            {/* (+) Contrast */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>(+) Contrast</label>
              <input type="number" value={form.contrast} onChange={set('contrast')}
                placeholder="0" style={inputBase} />
            </div>

            {/* Total Amount (readonly) */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Total Amount</label>
              <input value={totalAmount || 0} readOnly style={readonlyInput} />
            </div>

            {/* (-) Discount */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>(-) Discount</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
                <input type="number" value={form.discount} onChange={set('discount')}
                  placeholder="0" style={inputBase} />
                <select value={form.discountType} onChange={set('discountType')} style={selectBase}>
                  {DISC_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Discount By */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Discount By</label>
              <select value={form.discountBy} onChange={set('discountBy')} style={selectBase}>
                {DISC_BY.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Total Due (readonly) */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Total Due</label>
              <input value={totalDue} readOnly style={readonlyInput} />
            </div>

            {/* Balance (readonly) */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelSm}>Balance</label>
              <input value={balance} readOnly style={readonlyInput} />
            </div>

            {/* Payment */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelSm}>Payment</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 8 }}>
                <input type="number" value={form.payment} onChange={set('payment')}
                  placeholder="Amount" style={inputBase} />
                <select value={form.paymentMode} onChange={set('paymentMode')} style={selectBase}>
                  {PAY_MODES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              style={{
                width: '100%', background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: 6, padding: '11px',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState, useRef } from 'react';

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 6,
  padding: '8px 10px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5, display: 'block',
};

// ─── Categories list (from screenshot Image 3) ────────────────────────────────
const CATEGORIES = [
  'ALLERGY', 'CANCER MARKER', 'CLINI PATHO', 'COAGULATION PROFILE',
  'COLONOSCOPY', 'COVID RT-PCR', 'CT SCAN', 'CYTOLOGY', 'DENTAL',
  'ECG', 'ECHOCARDIOGRAPHY', 'EEG', 'ENDOCRINOLOGY', 'ENDOSCOPY',
  'EYE', 'FNAC', 'HAEMATOLOGY', 'HISTOPATHOLOGY', 'IMMUNOLOGY',
  'IVF', 'MICROBIOLOGY', 'MRI', 'NEUROLOGY', 'ORTHOPEDICS',
  'PATHOLOGY', 'PFT', 'RADIOLOGY', 'SEROLOGY', 'ULTRASOUND', 'X-RAY',
];

const STATUSES      = ['Active', 'Inactive'];
const REVIEWERS     = ['Select Reviewer', 'Dr. Rajan Mehta', 'Dr. Priya Sharma', 'Dr. Suresh Kumar'];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Signature {
  id: number;
  doctorName: string;
  positionX: number;
  positionY: number;
  width: number;
  category: string;
  status: 'Active' | 'Inactive';
  reviewer: string;
  imageUrl: string | null;       // base64 or URL
  signText: string;              // fallback handwritten-style text
}

// ─── Sample data ─────────────────────────────────────────────────────────────
const SAMPLE: Signature[] = [
  {
    id: 1, doctorName: 'Test Approver', positionX: 155, positionY: 255, width: 40,
    category: 'RADIOLOGY', status: 'Active', reviewer: '',
    imageUrl: null,
    signText: 'Chy\nDR. SOUVIK GHOSH\nMBBS, MD\nConsultant Radiologist',
  },
  {
    id: 2, doctorName: 'Testing', positionX: 155, positionY: 255, width: 40,
    category: 'RADIOLOGY', status: 'Active', reviewer: '',
    imageUrl: null,
    signText: '𝓜\nDr. Manish Kr. Jha\nMBBS,MD (Radiodiagnosis)\nWBMC Reg No. 77237',
  },
  {
    id: 3, doctorName: 'Testing Demo', positionX: 155, positionY: 255, width: 40,
    category: 'RADIOLOGY', status: 'Active', reviewer: '',
    imageUrl: null,
    signText: 'Md. Mofiajul Mondal\nDr. MD MOFIJUL MONDAL\nMBBS, MS\nPG. CERT. USG\nWBMC 66637',
  },
];

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sig: Omit<Signature, 'id' | 'imageUrl' | 'signText'>) => void;
  initial?: Signature | null;
}

function SignatureModal({ isOpen, onClose, onSave, initial }: ModalProps) {
  const blank = {
    doctorName: '', positionX: 155, positionY: 220, width: 40,
    category: '', status: 'Active' as const, reviewer: '',
  };
  const [form, setForm] = useState(initial
    ? { doctorName: initial.doctorName, positionX: initial.positionX, positionY: initial.positionY, width: initial.width, category: initial.category, status: initial.status, reviewer: initial.reviewer }
    : blank
  );

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: k === 'positionX' || k === 'positionY' || k === 'width' ? Number(e.target.value) : e.target.value }));

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 10, width: 460, maxWidth: '95vw', padding: 26, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
            {initial ? 'Edit Signature' : 'Add New Signature'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666', lineHeight: 1 }}>×</button>
        </div>

        {/* Doctor Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Doctor Name</label>
          <input value={form.doctorName} onChange={set('doctorName')} placeholder="DR. DAS" style={inp} />
        </div>

        {/* Position X / Y / Width */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Position X</label>
            <input type="number" value={form.positionX} onChange={set('positionX')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Position Y</label>
            <input type="number" value={form.positionY} onChange={set('positionY')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Width/Size</label>
            <input type="number" value={form.width} onChange={set('width')} style={inp} />
          </div>
        </div>

        {/* Category / Status / Report Reviewer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          <div>
            <label style={lbl}>Category</label>
            <select value={form.category} onChange={set('category')} style={{ ...selS, size: 8 } as React.CSSProperties}>
              <option value="">Select</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={set('status')} style={selS}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Report Reviewer</label>
            <select value={form.reviewer} onChange={set('reviewer')} style={selS}>
              {REVIEWERS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
          <button onClick={onClose} style={{
            padding: '8px 20px', borderRadius: 6, border: 'none',
            background: '#4b5563', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>Cancel</button>
          <button
            onClick={() => {
              if (!form.doctorName.trim()) return;
              onSave(form as any);
              onClose();
            }}
            style={{
              padding: '8px 20px', borderRadius: 6, border: 'none',
              background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Signature Card ───────────────────────────────────────────────────────────
function SignatureCard({
  sig, onEdit, onDelete, onUpload,
}: {
  sig: Signature;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const lines = sig.signText.split('\n');
  const [firstLine, ...rest] = lines;

  return (
    <div style={{
      background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '16px 18px',
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {/* Document icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#2563eb"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{sig.doctorName}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
            Position X={sig.positionX}; Y={sig.positionY}; Width={sig.width}
          </div>
        </div>

        {/* Active badge */}
        <span style={{
          background: sig.status === 'Active' ? '#16a34a' : '#6b7280',
          color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '2px 10px', borderRadius: 20,
        }}>{sig.status}</span>
      </div>

      {/* Signature area */}
      <div style={{
        border: '1px solid #e2e8f0', borderRadius: 6,
        padding: '12px 16px', marginTop: 10, minHeight: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, background: '#fafafa',
      }}>
        <div style={{ flex: 1 }}>
          {sig.imageUrl ? (
            <img src={sig.imageUrl} alt="signature" style={{ maxHeight: 80, maxWidth: '100%', objectFit: 'contain' }} />
          ) : sig.signText ? (
            <div>
              {/* First line: cursive style */}
              <div style={{ fontFamily: "'Segoe Script', 'Dancing Script', cursive", fontSize: 22, color: '#1a1a2e', lineHeight: 1.2 }}>
                {firstLine}
              </div>
              {/* Rest: normal styled text */}
              {rest.map((line, i) => (
                <div key={i} style={{ fontSize: i === 0 ? 12 : 11, fontWeight: i === 0 ? 700 : 500, color: '#1e293b', lineHeight: 1.4 }}>
                  {line}
                </div>
              ))}
            </div>
          ) : (
            /* No image & no text — show Upload button */
            <>
              <input type="file" accept="image/*" ref={fileRef} style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} />
              <button onClick={() => fileRef.current?.click()} style={{
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: 6, padding: '8px 18px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Upload
              </button>
            </>
          )}
        </div>

        {/* Delete icon */}
        <button onClick={onDelete} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, flexShrink: 0 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>

      {/* Edit button — bottom right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={onEdit} style={{
          background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 5,
          padding: '4px 16px', fontSize: 12, fontWeight: 500,
          color: '#374151', cursor: 'pointer',
        }}>Edit</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SignatureManagementPage() {
  const [signatures, setSignatures] = useState<Signature[]>(SAMPLE);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Signature | null>(null);
  const [search, setSearch]         = useState('');

  const filtered = signatures.filter(s =>
    s.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (data: Omit<Signature, 'id' | 'imageUrl' | 'signText'>) => {
    setSignatures(prev => [...prev, {
      id: Date.now(),
      imageUrl: null,
      signText: '',
      ...data,
    }]);
  };

  const handleEdit = (data: Omit<Signature, 'id' | 'imageUrl' | 'signText'>) => {
    if (!editTarget) return;
    setSignatures(prev => prev.map(s =>
      s.id === editTarget.id ? { ...s, ...data } : s
    ));
    setEditTarget(null);
  };

  const handleDelete = (id: number) =>
    setSignatures(prev => prev.filter(s => s.id !== id));

  const handleUpload = (id: number, file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      setSignatures(prev => prev.map(s =>
        s.id === id ? { ...s, imageUrl: e.target?.result as string, signText: '' } : s
      ));
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Add Modal */}
      <SignatureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAdd}
      />

      {/* Edit Modal */}
      <SignatureModal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget}
      />

      <div style={{
        background: '#f0f4f8', minHeight: '100%', padding: 0,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}>

        {/* ── Header bar ── */}
        <div style={{
          background: '#fff', borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          padding: '13px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563eb"><path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zm17.71-10.46a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Signatures</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search doctor…"
              style={{ ...inp, width: 200 }} />
            <button onClick={() => { setEditTarget(null); setModalOpen(true); }} style={{
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 6, padding: '8px 16px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add New Signature
            </button>
          </div>
        </div>

        {/* ── 2-column card grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#fff', borderRadius: 8 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✍️</div>
            No signatures found. Click <strong>Add New Signature</strong> to create one.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 20,
          }}>
            {filtered.map(sig => (
              <SignatureCard
                key={sig.id}
                sig={sig}
                onEdit={() => setEditTarget(sig)}
                onDelete={() => handleDelete(sig.id)}
                onUpload={file => handleUpload(sig.id, file)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
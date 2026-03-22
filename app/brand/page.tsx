'use client';

import { useState, useRef } from 'react';

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 10px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block',
};

// ─── Data ────────────────────────────────────────────────────────────────────
const BRANCHES = [
  'Customer Support & Quality Assurance',
  'Credit Franchise', 'Cash', 'Credit',
  'wallet flexibility', 'Wallet', 'sv prasad hospital',
];
const DEPARTMENTS = ['All', 'Eye', 'Pathology', 'Radiology', 'Cardiology', 'Microbiology', 'Neurology', 'Dental'];
const QR_OPTIONS  = ['Show', 'Hide'];

// ─── Types ───────────────────────────────────────────────────────────────────
interface BrandingRow {
  id: number;
  department: string;
  templateUrl: string | null;
  branch: string;
  qrStatus: string;
  posX: number;
  posY: number;
  padTop: number;
  padLeft: number;
  padFooter: number;
}

const INITIAL_ROWS: BrandingRow[] = [
  {
    id: 1, department: 'All', branch: 'Customer Support & Quality Assurance',
    // small placeholder gradient image to simulate a template already uploaded (as seen in screenshot)
    templateUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="48"><rect width="120" height="48" fill="%23e2e8f0"/><rect y="0" width="120" height="8" fill="%234ade80"/><rect y="40" width="120" height="8" fill="%234ade80"/></svg>',
    qrStatus: 'Show', posX: 90, posY: 90, padTop: 45, padLeft: 30, padFooter: 20,
  },
];

// ─── Template Upload Modal ────────────────────────────────────────────────────
function TemplateUploadModal({
  isOpen, onClose, onUpload,
}: {
  isOpen: boolean; onClose: () => void; onUpload: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile]   = useState<File | null>(null);

  if (!isOpen) return null;

  const handleUpload = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      onUpload(e.target?.result as string);
      onClose();
      setFile(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 460, maxWidth: '95vw', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Template Upload</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666', lineHeight: 1 }}>×</button>
        </div>

        {/* File chooser row */}
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 5, overflow: 'hidden', marginBottom: 10 }}>
          <input type="file" accept=".jpg,.jpeg" ref={fileRef} style={{ display: 'none' }}
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <button onClick={() => fileRef.current?.click()} style={{
            padding: '7px 14px', border: 'none', borderRight: '1px solid #d1d5db',
            background: '#f3f4f6', cursor: 'pointer', fontSize: 13, color: '#374151',
            whiteSpace: 'nowrap' as const, flexShrink: 0,
          }}>Choose file</button>
          <span style={{ padding: '7px 12px', fontSize: 13, color: '#6b7280', flex: 1 }}>
            {file ? file.name : 'No file chosen'}
          </span>
        </div>

        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 18px' }}>Select only .JPG template file</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleUpload} disabled={!file} style={{
            background: file ? '#0891b2' : '#a5f3fc', color: '#fff',
            border: 'none', borderRadius: 6, padding: '8px 22px',
            fontSize: 13, fontWeight: 600, cursor: file ? 'pointer' : 'not-allowed',
          }}>Upload</button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Modal ───────────────────────────────────────────────────────────
function SettingsModal({
  isOpen, onClose, row, onSave,
}: {
  isOpen: boolean; onClose: () => void; row: BrandingRow | null; onSave: (r: BrandingRow) => void;
}) {
  const [form, setForm] = useState<BrandingRow>(row ?? INITIAL_ROWS[0]);

  // Sync when row prop changes
  if (isOpen && row && form.id !== row.id) setForm(row);
  if (!isOpen || !row) return null;

  const s = (k: keyof BrandingRow) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({
        ...f,
        [k]: ['posX', 'posY', 'padTop', 'padLeft', 'padFooter'].includes(String(k))
          ? Number(e.target.value) : e.target.value,
      }));

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 500, maxWidth: '95vw', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Settings</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666', lineHeight: 1 }}>×</button>
        </div>

        {/* Branch + Department */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Branch/B2B</label>
            <select value={form.branch} onChange={s('branch')} style={selS}>
              {BRANCHES.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Department</label>
            <select value={form.department} onChange={s('department')} style={selS}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* QR + Pos X + Pos Y */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={lbl}>QR Code Status</label>
            <select value={form.qrStatus} onChange={s('qrStatus')} style={selS}>
              {QR_OPTIONS.map(q => <option key={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Position X</label>
            <input type="number" value={form.posX} onChange={s('posX')}
              style={{ ...inp, border: '2px solid #16a34a' }} />
          </div>
          <div>
            <label style={lbl}>Position Y</label>
            <input type="number" value={form.posY} onChange={s('posY')}
              style={{ ...inp, border: '2px solid #16a34a' }} />
          </div>
        </div>

        {/* Padding Top + Left + Footer */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={lbl}>Padding Top</label>
            <input type="number" value={form.padTop} onChange={s('padTop')}
              style={{ ...inp, border: '2px solid #16a34a' }} />
          </div>
          <div>
            <label style={lbl}>Padding Left</label>
            <input type="number" value={form.padLeft} onChange={s('padLeft')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Padding Footer</label>
            <input type="number" value={form.padFooter} onChange={s('padFooter')} style={inp} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 14 }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#4b5563', color: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BrandingPage() {
  const [rows, setRows]             = useState<BrandingRow[]>(INITIAL_ROWS);
  const [selectedBranch, setBranch] = useState(BRANCHES[0]);
  const [uploadId, setUploadId]     = useState<number | null>(null);
  const [settingsRow, setSettings]  = useState<BrandingRow | null>(null);

  const handleAdd = () => {
    setRows(prev => [...prev, {
      id: Date.now(), department: 'All', branch: selectedBranch,
      templateUrl: null, qrStatus: 'Show',
      posX: 90, posY: 90, padTop: 45, padLeft: 30, padFooter: 20,
    }]);
  };

  return (
    <>
      <TemplateUploadModal
        isOpen={uploadId !== null}
        onClose={() => setUploadId(null)}
        onUpload={url => {
          setRows(prev => prev.map(r => r.id === uploadId ? { ...r, templateUrl: url } : r));
          setUploadId(null);
        }}
      />
      <SettingsModal
        isOpen={!!settingsRow}
        onClose={() => setSettings(null)}
        row={settingsRow}
        onSave={updated => setRows(prev => prev.map(r => r.id === updated.id ? updated : r))}
      />

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'visible' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 20px', borderBottom: '1px solid #e8edf3',
          flexWrap: 'wrap', gap: 10,
        }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#16a34a">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Report Page Branding</h1>
          </div>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Invoice Branding link */}
            <button style={{
              background: 'none', border: 'none', color: '#dc2626',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
            }}>
              Invoice Branding
            </button>

            {/* Branch selector — native select styled to match screenshot */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              {/* ▶ prefix icon overlaid on left of select */}
              <span style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', fontSize: 11,
                color: '#374151', pointerEvents: 'none', zIndex: 1,
              }}>▶</span>
              <select
                value={selectedBranch}
                onChange={e => setBranch(e.target.value)}
                suppressHydrationWarning
                style={{
                  border: '1.5px solid #d1d5db', borderRadius: 5,
                  padding: '7px 32px 7px 24px', fontSize: 13,
                  color: '#374151', outline: 'none', background: '#fff',
                  cursor: 'pointer', minWidth: 250,
                  appearance: 'none' as const,
                  WebkitAppearance: 'none' as const,
                  fontFamily: 'inherit',
                }}
              >
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              {/* Chevron on right */}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.5"
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>

            {/* Add button */}
            <button
              onClick={handleAdd}
              style={{
                background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: 5, padding: '7px 18px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '10px 16px', fontWeight: 600, color: '#374151', textAlign: 'center', width: 50 }}>#</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'left', width: 160 }}>Department</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Template</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: 'left', width: 160 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No branding records. Select a branch and click <strong>Add</strong>.
                </td>
              </tr>
            ) : rows.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
                {/* # */}
                <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>

                {/* Department */}
                <td style={{ padding: '14px', fontWeight: 500, color: '#1e293b' }}>{row.department}</td>

                {/* Template */}
                <td style={{ padding: '12px 14px', minHeight: 56, verticalAlign: 'middle' }}>
                  {row.templateUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img
                        src={row.templateUrl} alt="template"
                        style={{ height: 52, width: 'auto', maxWidth: 130, borderRadius: 4, border: '1px solid #e2e8f0', objectFit: 'cover', display: 'block' }}
                      />
                      <button onClick={() => setUploadId(row.id)} style={{
                        background: '#dc2626', color: '#fff', border: 'none',
                        borderRadius: 5, padding: '6px 14px', fontSize: 12,
                        fontWeight: 500, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                        </svg>
                        Change Template
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setUploadId(row.id)} style={{
                      background: '#16a34a', color: '#fff', border: 'none',
                      borderRadius: 5, padding: '7px 16px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      Upload Template
                    </button>
                  )}
                </td>

                {/* Action */}
                <td style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSettings(row)} style={{
                      background: '#2563eb', color: '#fff', border: 'none',
                      borderRadius: 5, padding: '5px 14px', fontSize: 12,
                      fontWeight: 500, cursor: 'pointer',
                    }}>Settings</button>
                    <button onClick={() => setRows(prev => prev.filter(r => r.id !== row.id))} style={{
                      background: '#dc2626', color: '#fff', border: 'none',
                      borderRadius: 5, padding: '5px 14px', fontSize: 12,
                      fontWeight: 500, cursor: 'pointer',
                    }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </>
  );
}
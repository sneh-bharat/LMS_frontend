'use client';

import { useState } from 'react';

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 9px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RefParam {
  id: number;
  name: string;
  range: string;
  category: string;
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const INITIAL_PARAMS: RefParam[] = [
  { id: 1,  name: 'HAEMOGLOBIN',                     range: 'Male:13 - 17\nFemale:12 - 16',  category: 'HAEMATOLOGY'        },
  { id: 2,  name: 'PACKED CELL VOLUME (Haematocret)', range: '42 - 52',                       category: 'HAEMATOLOGY'        },
  { id: 3,  name: 'MCV',                              range: '80 - 100',                      category: 'HAEMATOLOGY'        },
  { id: 4,  name: 'MCH',                              range: '27 - 32',                       category: 'HAEMATOLOGY'        },
  { id: 5,  name: 'MCHC',                             range: '31.5 - 34.5',                   category: 'HAEMATOLOGY'        },
  { id: 6,  name: 'RBC COUNT',                        range: '4.5 - 5.5',                     category: 'HAEMATOLOGY'        },
  { id: 7,  name: 'PLATELET COUNT',                   range: '1,50,000 - 4,00,000',           category: 'HAEMATOLOGY'        },
  { id: 8,  name: 'WBC COUNT (TLC)',                  range: '4000 - 11000',                  category: 'HAEMATOLOGY'        },
  { id: 9,  name: 'NEUTROPHILS',                      range: '40 - 70',                       category: 'HAEMATOLOGY'        },
  { id: 10, name: 'LYMPHOCYTES',                      range: '20 - 40',                       category: 'HAEMATOLOGY'        },
  { id: 11, name: 'MONOCYTES',                        range: '2 - 10',                        category: 'HAEMATOLOGY'        },
  { id: 12, name: 'EOSINOPHILS',                      range: '1 - 6',                         category: 'HAEMATOLOGY'        },
  { id: 13, name: 'BASOPHILS',                        range: '0 - 1',                         category: 'HAEMATOLOGY'        },
  { id: 14, name: 'ESR',                              range: 'Male:0 - 15\nFemale:0 - 20',    category: 'HAEMATOLOGY'        },
  { id: 15, name: 'BLOOD SUGAR FASTING',              range: '70 - 100',                      category: 'BIOCHEMISTRY'       },
  { id: 16, name: 'BLOOD SUGAR POST PRANDIAL',        range: '< 140',                         category: 'BIOCHEMISTRY'       },
  { id: 17, name: 'HbA1c',                            range: '< 5.7',                         category: 'BIOCHEMISTRY'       },
  { id: 18, name: 'UREA',                             range: '15 - 40',                       category: 'BIOCHEMISTRY'       },
  { id: 19, name: 'CREATININE',                       range: 'Male:0.7 - 1.2\nFemale:0.5 - 1.0', category: 'BIOCHEMISTRY'  },
  { id: 20, name: 'URIC ACID',                        range: 'Male:3.5 - 7.2\nFemale:2.6 - 6.0', category: 'BIOCHEMISTRY'  },
];

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({
  isOpen, onClose, param, onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  param: RefParam | null;
  onSave: (id: number, range: string) => void;
}) {
  const [value, setValue] = useState(param?.range ?? '');

  // Sync value when param changes
  if (isOpen && param && value !== param.range && param.range !== '') {
    // only sync on open, not on every render
  }

  if (!isOpen || !param) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 8,
        width: 480, maxWidth: '95vw',
        padding: 24,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
            Edit – Reference Range Value
          </h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 22, color: '#666', lineHeight: 1,
          }}>×</button>
        </div>

        {/* Blue dot indicator */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: '#2563eb', marginBottom: 10,
        }} />

        {/* Textarea */}
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={4}
          style={{ ...inp, resize: 'vertical' as const, marginBottom: 4 }}
        />

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          marginTop: 16, borderTop: '1px solid #e8edf3', paddingTop: 14,
        }}>
          <button onClick={onClose} style={{
            padding: '7px 18px', borderRadius: 5, border: 'none',
            background: '#4b5563', color: '#fff', fontSize: 13,
            fontWeight: 500, cursor: 'pointer',
          }}>Close</button>
          <button onClick={() => { onSave(param.id, value); onClose(); }} style={{
            padding: '7px 18px', borderRadius: 5, border: 'none',
            background: '#2563eb', color: '#fff', fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}>Save changes</button>
        </div>
      </div>
    </div>
  );
}

// ─── Parameter Card ───────────────────────────────────────────────────────────
function ParamCard({ param, onEdit }: { param: RefParam; onEdit: () => void }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 8,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column' as const,
      minHeight: 90,
    }}>
      {/* Card content */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
        {/* Document icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb"
          style={{ marginTop: 2, flexShrink: 0 }}>
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
        </svg>

        <div style={{ flex: 1 }}>
          {/* Parameter name */}
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 4, lineHeight: 1.3 }}>
            {param.name}
          </div>

          {/* Range value */}
          {param.range && (
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
              {param.range.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit button — bottom right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
        <button onClick={onEdit} style={{
          background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: 5, padding: '4px 16px', fontSize: 12,
          fontWeight: 500, cursor: 'pointer',
        }}>Edit</button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReferenceValuePage() {
  const [params, setParams]   = useState<RefParam[]>(INITIAL_PARAMS);
  const [search, setSearch]   = useState('');
  const [editTarget, setEdit] = useState<RefParam | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = params.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.range.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenEdit = (p: RefParam) => {
    setEditValue(p.range);
    setEdit(p);
  };

  const handleSave = (id: number, range: string) => {
    setParams(prev => prev.map(p => p.id === id ? { ...p, range } : p));
  };

  return (
    <>
      {/* Edit Modal */}
      {editTarget && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 8,
            width: 480, maxWidth: '95vw',
            padding: 24,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
                Edit – Refferance Range Value
              </h3>
              <button onClick={() => setEdit(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 22, color: '#666', lineHeight: 1,
              }}>×</button>
            </div>

            {/* Blue dot */}
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#2563eb', marginBottom: 10,
            }} />

            {/* Textarea */}
            <textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              rows={4}
              style={{ ...inp, resize: 'vertical' as const }}
            />

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: 10,
              marginTop: 16, borderTop: '1px solid #e8edf3', paddingTop: 14,
            }}>
              <button onClick={() => setEdit(null)} style={{
                padding: '7px 18px', borderRadius: 5, border: 'none',
                background: '#4b5563', color: '#fff', fontSize: 13,
                fontWeight: 500, cursor: 'pointer',
              }}>Close</button>
              <button onClick={() => { handleSave(editTarget.id, editValue); setEdit(null); }} style={{
                padding: '7px 18px', borderRadius: 5, border: 'none',
                background: '#2563eb', color: '#fff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Shell */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 20px', borderBottom: '1px solid #e8edf3',
        }}>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
            Reference Value
          </h1>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="to search press ctrl+F"
            style={{ ...inp, width: 220, fontSize: 12, color: '#6b7280' }}
          />
        </div>

        {/* ── Card Grid ── */}
        <div style={{ padding: '20px', background: '#f0f4f8' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', background: '#fff', borderRadius: 8 }}>
              No parameters found.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14,
            }}>
              {filtered.map(p => (
                <ParamCard
                  key={p.id}
                  param={p}
                  onEdit={() => handleOpenEdit(p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
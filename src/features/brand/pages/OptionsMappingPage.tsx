'use client';

import { useState } from 'react';
import { ExpressionTemplatePage } from '../components/ExpressionTemplatePage';
import { HematologyConfigPage } from '../components/HematologyConfigPage';

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

// ─── Types ────────────────────────────────────────────────────────────────────
interface Template {
  id: number; title: string; applicableFor: string; content: string;
}
interface Investigation {
  id: number; name: string; category: string; subCategory: string;
  templates: Template[]; configured: boolean;
  configParams: string[];  // selected parameter names
}

// ─── Static data ─────────────────────────────────────────────────────────────
const CATEGORIES  = ['All', 'Pathology', 'Radiology', 'Microbiology', 'Biochemistry'];
const STATUSES    = ['All', 'Configured', 'Not Configured'];
const INITIAL_INVESTIGATIONS: Investigation[] = [
  { id: 1,  name: 'ASO TITRE (ASO)',                          category: 'Pathology', subCategory: 'ALLERGY',    templates: [], configured: false, configParams: [] },
  { id: 2,  name: 'CERVICAL/VAGINAL (SMEAR SENT)',            category: 'Pathology', subCategory: 'CYTOLOGY',   templates: [], configured: false, configParams: [] },
  { id: 3,  name: '1, 25 (OH) VITAMIN D3',                   category: 'Pathology', subCategory: 'IMMUNOLOGY', templates: [], configured: false, configParams: [] },
  { id: 4,  name: 'ABL (9Q34)/BCR(22Q11)-T(9;22)(Q34;Q11)',  category: 'Pathology', subCategory: 'SPECIAL',    templates: [], configured: false, configParams: [] },
  { id: 5,  name: 'ABNORMAL CELL',                            category: 'Pathology', subCategory: 'HAEMATOLOGY', templates: [], configured: true, configParams: ['Hb', 'TLC', 'RBC'] },
  { id: 6,  name: 'ABSCESS FOR APPENDIX C/S',                 category: 'Pathology', subCategory: 'MICROBIOLOGY', templates: [], configured: false, configParams: [] },
  { id: 7,  name: 'ACRIDINE ORANGE STAIN',                    category: 'Pathology', subCategory: 'HAEMATOLOGY', templates: [], configured: false, configParams: [] },
  { id: 8,  name: 'ANTI-HBS ANTIBODY (QUALITATIVE)',          category: 'Pathology', subCategory: 'SEROLOGY',   templates: [], configured: false, configParams: [] },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
type View = 'list' | 'template' | 'config';

export default function OptionsMappingPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>(INITIAL_INVESTIGATIONS);
  const [search, setSearch]     = useState('');
  const [catFilter, setCat]     = useState('All');
  const [statFilter, setStat]   = useState('All');
  const [view, setView]         = useState<View>('list');
  const [activeInv, setActive]  = useState<Investigation | null>(null);

  const filtered = investigations.filter(inv =>
    (catFilter === 'All' || inv.category === catFilter) &&
    (statFilter === 'All' ||
      (statFilter === 'Configured' && inv.configured) ||
      (statFilter === 'Not Configured' && !inv.configured)
    ) &&
    inv.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleBack = (updated: Investigation) => {
    setInvestigations(prev => prev.map(i => i.id === updated.id ? updated : i));
    setView('list');
    setActive(null);
  };

  // Sub-page routing
  if (view === 'template' && activeInv) {
    return <ExpressionTemplatePage inv={activeInv} onBack={handleBack} />;
  }
  if (view === 'config' && activeInv) {
    return <HematologyConfigPage inv={activeInv} onBack={handleBack} />;
  }

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #e8edf3',
        flexWrap: 'wrap', gap: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
          Investigation &amp; Option Mapping list
        </h1>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Investigation name"
          style={{ ...inp, width: 220 }}
        />
      </div>

      {/* ── Filter bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 20px', background: '#f8fafc',
        borderBottom: '1px solid #e8edf3', justifyContent: 'flex-end',
        flexWrap: 'wrap',
      }}>
        <select value={catFilter} onChange={e => setCat(e.target.value)} style={{ ...selS, width: 160 }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statFilter} onChange={e => setStat(e.target.value)} style={{ ...selS, width: 160 }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '11px 14px 11px 20px', fontWeight: 600, color: '#1e293b', textAlign: 'left', fontSize: 13 }}>Investigation Name</th>
            <th style={{ padding: '11px 14px', fontWeight: 600, color: '#1e293b', textAlign: 'left', fontSize: 13, width: 220 }}>Template</th>
            <th style={{ padding: '11px 14px', fontWeight: 600, color: '#1e293b', textAlign: 'left', fontSize: 13, width: 160 }}>Input</th>
            <th style={{ padding: '11px 14px', fontWeight: 600, color: '#1e293b', textAlign: 'center', fontSize: 13, width: 80 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                No investigations found.
              </td>
            </tr>
          ) : filtered.map((inv, idx) => (
            <tr key={inv.id} style={{
              borderBottom: '1px solid #f0f4f8',
              background: idx % 2 === 0 ? '#fff' : '#fafbfc',
            }}>
              {/* Investigation Name */}
              <td style={{ padding: '13px 14px 13px 20px', verticalAlign: 'top' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{inv.name}</div>
                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                  {inv.category}, {inv.subCategory}
                </div>
              </td>

              {/* Template buttons */}
              <td style={{ padding: '13px 14px', verticalAlign: 'top' }}>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 7 }}>
                  {/* Add New Template */}
                  <button
                    onClick={() => { setActive(inv); setView('template'); }}
                    style={{
                      background: '#fff', border: '1.5px solid #2563eb',
                      color: '#2563eb', borderRadius: 5,
                      padding: '5px 12px', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add New Template
                  </button>

                  {/* Config Interpretation */}
                  <button
                    onClick={() => { setActive(inv); setView('template'); }}
                    style={{
                      background: '#fff', border: '1.5px solid #2563eb',
                      color: '#2563eb', borderRadius: 5,
                      padding: '5px 12px', fontSize: 12, fontWeight: 500,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                    </svg>
                    Config Interpretation
                  </button>
                </div>
              </td>

              {/* Input / Configure */}
              <td style={{ padding: '13px 14px', verticalAlign: 'top' }}>
                {inv.configured ? (
                  <button
                    onClick={() => { setActive(inv); setView('config'); }}
                    style={{
                      background: '#16a34a', color: '#fff', border: 'none',
                      borderRadius: 5, padding: '6px 14px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Configure
                  </button>
                ) : null}
              </td>

              {/* Status icon */}
              <td style={{ padding: '13px 14px', textAlign: 'center', verticalAlign: 'top' }}>
                {inv.configured ? (
                  <span style={{ fontSize: 18, color: '#16a34a' }}>✅</span>
                ) : (
                  <span style={{ fontSize: 18, color: '#dc2626' }}>⚠️</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
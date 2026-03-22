'use client';

import { useState } from 'react';
import { ReferenceRangeForm } from './ReferenceRangeForm';
import { DefaultValueEditor } from './DefaultValueEditor';
import { ParameterModal } from './ParameterModal';
import { AddParameterModal } from './AddParameterModal';
import { OptionsMenu } from './OptionsMenu';

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 9px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };
const sectionWrap: React.CSSProperties = {
  background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RangeRow {
  id: number; gender: string; ageType: string;
  minAge: string; maxAge: string; minRange: string; maxRange: string;
  refRange: string;
}

interface Parameter {
  id: number; name: string; nabl: string; specimenType: string;
  method: string; unit: string; type: string; priority: string;
  isRequired: string; validation: string; left: string;
  bottom: string; top: string; interface1: string;
  interface2: string; calc: string; paramCode: string;
}

interface PathologyParam {
  id: number; sn: number; name: string; unit: string;
  inputType: string; priority: number;
  linked: number; isHeader: boolean;
  ranges: RangeRow[]; defaultValue: string;
  parameters: Parameter[];
}

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE: PathologyParam[] = [
  {
    id: 1, sn: 1, name: 'Creatine Phosphokinase-MM', unit: 'u/l', inputType: 'txt',
    priority: 1, linked: 2, isHeader: false, defaultValue: '',
    ranges: [
      { id: 1, gender: 'Male', ageType: 'Days', minAge: '1', maxAge: '120', minRange: '39', maxRange: '308', refRange: '' },
      { id: 2, gender: 'Female', ageType: 'Days', minAge: '1', maxAge: '120', minRange: '26', maxRange: '192', refRange: '' },
    ],
    parameters: [],
  },
  {
    id: 2, sn: 2, name: 'Hepatitis A virus IgG', unit: '', inputType: 'op',
    priority: 1, linked: 1, isHeader: false, defaultValue: '',
    ranges: [
      { id: 1, gender: 'Both', ageType: 'Year', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: 'Non Reactive\nReactive' },
    ],
    parameters: [],
  },
  {
    id: 3, sn: 3, name: 'Hepatitis A virus IgM', unit: '', inputType: 'op',
    priority: 1, linked: 2, isHeader: false, defaultValue: '',
    ranges: [
      { id: 1, gender: 'Both', ageType: 'Year', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: 'Non Reactive\nReactive' },
    ],
    parameters: [],
  },
  {
    id: 4, sn: 4, name: 'Maternal Screening - Quadruple Marker', unit: '', inputType: 'textarea',
    priority: 1, linked: 1, isHeader: false, defaultValue: '',
    ranges: [], parameters: [],
  },
  {
    id: 5, sn: 5, name: 'Haemoglobin A', unit: '%', inputType: 'txt',
    priority: 1, linked: 0, isHeader: false, defaultValue: '',
    ranges: [], parameters: [],
  },
];

const BLANK_RANGE: Omit<RangeRow, 'id'> = {
  gender: 'Male', ageType: 'Days', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: '',
};
const BLANK_PARAM: Omit<Parameter, 'id'> = {
  name: '', nabl: 'NA', specimenType: 'N/A', method: '', unit: '',
  type: 'Input Box', priority: '', isRequired: 'N/A',
  validation: 'Alphanumeric', left: '0', bottom: '0', top: '0',
  interface1: 'Instrument 1', interface2: 'Instrument 2', calc: 'No', paramCode: '',
};

// ─── Sample Data ──────────────────────────────────────────────────────────────
type View = 'list' | 'range' | 'default';

export default function PathologyParameterPage() {
  const [params, setParams]     = useState<PathologyParam[]>(SAMPLE);
  const [view, setView]         = useState<View>('list');
  const [activeParam, setActive] = useState<PathologyParam | null>(null);
  const [search, setSearch]     = useState('');
  const [paramModal, setParamModal] = useState(false);
  const [addRowModal, setAddRowModal] = useState(false);
  const [optionsTarget, setOptionsTarget] = useState<PathologyParam | null>(null);

  const filtered = params.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleBack = (updated: PathologyParam) => {
    setParams(prev => prev.map(p => p.id === updated.id ? updated : p));
    setView('list');
  };

  const deleteParam = (id: number) => setParams(prev => prev.filter(p => p.id !== id));

  const addParam = (data: Omit<PathologyParam, 'id' | 'ranges' | 'parameters' | 'defaultValue'>) => {
    setParams(prev => [...prev, { id: Date.now(), ...data, ranges: [], parameters: [], defaultValue: '' }]);
  };

  const addRange = (range: RangeRow) => {
    if (activeParam) {
      const updated = { ...activeParam, ranges: [...activeParam.ranges, range] };
      setParams(prev => prev.map(p => p.id === activeParam.id ? updated : p));
      setActive(updated);
    }
  };

  const deleteRange = (id: number) => {
    if (activeParam) {
      const updated = { ...activeParam, ranges: activeParam.ranges.filter(r => r.id !== id) };
      setParams(prev => prev.map(p => p.id === activeParam.id ? updated : p));
      setActive(updated);
    }
  };

  const saveDefaultValue = (value: string) => {
    if (activeParam) {
      const updated = { ...activeParam, defaultValue: value };
      setParams(prev => prev.map(p => p.id === activeParam.id ? updated : p));
      setActive(updated);
    }
    setView('list');
  };

  // Render sub-pages using new components
  if (view === 'range' && activeParam) {
    return (
      <ReferenceRangeForm 
        param={activeParam} 
        onAddRange={addRange}
        onDeleteRange={deleteRange}
      />
    );
  }
  
  if (view === 'default' && activeParam) {
    return (
      <DefaultValueEditor 
        param={activeParam} 
        onSave={saveDefaultValue}
      />
    );
  }

  return (
    <>
      <ParameterModal isOpen={paramModal} onClose={() => setParamModal(false)}
        onSave={p => { if (optionsTarget) setParams(prev => prev.map(param => param.id === optionsTarget.id ? { ...param, parameters: [...param.parameters, p] } : param)); }} />
      <AddParameterModal isOpen={addRowModal} onClose={() => setAddRowModal(false)} onSave={addParam} />

      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px', borderBottom: '1px solid #e8edf3', flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#2563eb"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z"/></svg>
            Pathology Parameter
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search parameter…"
              style={{ ...inp, width: 200 }} />
            <button onClick={() => setAddRowModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Parameter
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['SN', 'Parameter Name', 'Unit', 'Type', 'Priority', 'Action'].map((h, i) => (
                  <th key={`${h}-${i}`} style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', textAlign: i === 0 || i === 5 ? 'center' : 'left', whiteSpace: 'nowrap' as const, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No parameters found.</td></tr>
              ) : filtered.map((p, idx) => (
                <>
                  {p.isHeader ? (
                    <tr key={`header-${p.id}`} style={{ background: '#f1f5f9' }}>
                      <td colSpan={6} style={{ padding: '8px 14px', fontWeight: 700, color: '#1e293b', fontSize: 13 }}>
                        {p.name}
                      </td>
                    </tr>
                  ) : (
                    <tr key={`row-${p.id}`} style={{ borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b', width: 40 }}>{p.sn <= SAMPLE.length ? idx + 1 : p.sn}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 500, color: '#2563eb' }}>
                          {p.linked > 0 ? '>> * ' : ''}{p.name}
                        </span>
                        {p.linked > 0 && (
                          <div style={{ fontSize: 11, color: '#16a34a', marginTop: 2 }}>{p.linked} Investigations Linked</div>
                        )}
                        {/* Range pills */}
                        {p.ranges.map(r => (
                          <div key={`range-${p.id}-${r.id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                            <span style={{ fontSize: 14 }}>{r.gender === 'Male' ? '🚹' : r.gender === 'Female' ? '🚺' : '👤'}</span>
                            <span style={{ fontSize: 11, color: '#92400e', background: '#fef9c3', padding: '1px 8px', borderRadius: 4 }}>
                              {r.minAge} Days ~ {r.maxAge} Years &nbsp; {r.minRange}{r.minRange ? 'u/L' : ''} ~ {r.maxRange}{r.maxRange ? 'u/L' : ''}
                              {r.refRange && r.refRange.split('|').map((v, vi) => <span key={`ref-${p.id}-${r.id}-${vi}`} style={{ display: 'block', color: '#374151' }}>{v.trim()}</span>)}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{p.unit}</td>
                      <td style={{ padding: '10px 14px', color: '#475569' }}>{p.inputType}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#475569' }}>{p.priority}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        {/* Range button (for txt/% types) */}
                        {(p.inputType === 'txt' || p.inputType === '%') && (
                          <button onClick={() => { setActive(p); setView('range'); }}
                            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 6 }}>
                            Range
                          </button>
                        )}
                        {/* Default button (for textarea) */}
                        {p.inputType === 'textarea' && (
                          <button onClick={() => { setActive(p); setView('default'); }}
                            style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', marginRight: 6 }}>
                            Default
                          </button>
                        )}
                        <OptionsMenu
                          param={p}
                          onRange={() => { setActive(p); setView('range'); }}
                          onDefault={() => { setActive(p); setView('default'); }}
                          onOptions={() => { setOptionsTarget(p); setParamModal(true); }}
                          onDelete={() => deleteParam(p.id)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
'use client';

import { useState } from 'react';

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

const BLANK_RANGE: Omit<RangeRow, 'id'> = {
  gender: 'Male', ageType: 'Days', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: '',
};

// ─── Reference Range Form Component ──────────────────────────────────────────
export function ReferenceRangeForm({ 
  param, 
  onAddRange, 
  onDeleteRange 
}: { 
  param: PathologyParam; 
  onAddRange: (range: RangeRow) => void;
  onDeleteRange: (id: number) => void;
}) {
  const [ranges] = useState<RangeRow[]>(param.ranges);
  const [form, setForm] = useState({ ...BLANK_RANGE });
  
  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = () => {
    onAddRange({ id: Date.now(), ...form });
    setForm({ ...BLANK_RANGE });
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#1e293b' }}>
        {param.name} – Reference Range
      </h2>

      {/* Existing ranges table */}
      <div style={{ ...sectionWrap, marginBottom: 24 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {['#', 'Gender', 'Age Group', 'Ref Range', 'Action'].map((h, i) => (
                <th key={`${h}-${i}`} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#374151' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranges.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No ranges defined yet.</td></tr>
            ) : ranges.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>{i + 1}</td>
                <td style={{ padding: '10px 14px' }}>{r.gender}</td>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                  {r.minAge} {r.ageType} To {r.maxAge} Years
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {r.refRange || `${r.minRange}–${r.maxRange}`}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => onDeleteRange(r.id)} style={{
                    background: '#dc2626', color: '#fff', border: 'none',
                    borderRadius: 5, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add range form */}
      <div style={{ ...sectionWrap, padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 110px 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 14, alignItems: 'end' }}>
          <div>
            <label style={lbl}>Gender</label>
            <select value={form.gender} onChange={s('gender')} style={selS}>
              <option>Male</option><option>Female</option><option>Both</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Age Type</label>
            <select value={form.ageType} onChange={s('ageType')} style={selS}>
              <option>Days</option><option>Month</option><option>Year</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Min Age</label>
            <input value={form.minAge} onChange={s('minAge')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Max Age</label>
            <input value={form.maxAge} onChange={s('maxAge')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Min Range</label>
            <input value={form.minRange} onChange={s('minRange')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Max Range</label>
            <input value={form.maxRange} onChange={s('maxRange')} style={inp} />
          </div>
        </div>

        <div style={{ marginBottom: 6 }}>
          <label style={lbl}>Reference Range (Optional) – It will show on report irrespective of Min &amp; Max Range.</label>
          <textarea value={form.refRange} onChange={s('refRange')} rows={4}
            style={{ ...inp, resize: 'vertical' as const }} />
        </div>
        <p style={{ fontSize: 11, color: '#dc2626', margin: '0 0 14px' }}>for new line use | sign</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleAdd} style={{
            background: '#2563eb', color: '#fff', border: 'none',
            borderRadius: 5, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

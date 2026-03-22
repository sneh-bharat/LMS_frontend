'use client';

import { useState } from 'react';

interface PathologyParam {
  id: number; sn: number; name: string; unit: string;
  inputType: string; priority: number;
  linked: number; isHeader: boolean;
  ranges: any[]; defaultValue: string;
  parameters: any[];
}

const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 9px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };
const sectionWrap: React.CSSProperties = {
  background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
};

// ─── Default Value Editor Component ──────────────────────────────────────────
export function DefaultValueEditor({ 
  param, 
  onSave 
}: { 
  param: PathologyParam; 
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(param.defaultValue);

  return (
    <div style={{ padding: '20px 24px' }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 600, color: '#1e293b' }}>
        {param.name} – Default Value
      </h2>
      <div style={{ ...sectionWrap }}>
        {/* Menu bar */}
        <div style={{ display: 'flex', gap: 16, padding: '8px 14px', borderBottom: '1px solid #e2e8f0', fontSize: 13, color: '#374151' }}>
          {['File','Edit','View','Insert','Format'].map((m, i) => (
            <button key={`menu-${i}`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', padding: '2px 4px' }}>{m}</button>
          ))}
        </div>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' as const, background: '#fafafa' }}>
          {['↩','↪'].map((t, i) => (
            <button key={`undo-${i}`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', fontSize: 14, color: '#555', borderRadius: 3 }}>{t}</button>
          ))}
          <select style={{ ...selS, width: 110, fontSize: 12 }}><option>Paragraph</option><option>Heading 1</option><option>Heading 2</option></select>
          {['B','I','U','⊞','≡','🖼'].map((t, i) => (
            <button key={`tool-${i}`} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 7px', fontSize: 13, color: '#374151', borderRadius: 3, fontWeight: t==='B'?700:'normal', fontStyle: t==='I'?'italic':'normal' }}>{t}</button>
          ))}
        </div>
        {/* Editor area */}
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          rows={10}
          style={{ width: '100%', border: 'none', outline: 'none', padding: '14px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' as const, boxSizing: 'border-box' as const }}
          placeholder="Enter default value..."
        />
        {/* Status bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 12px', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0', background: '#fafafa' }}>
          <span>p</span>
          <span>Press Alt+0 for help</span>
          <span>{value.trim().split(/\s+/).filter(Boolean).length} words &nbsp; 🔎 tiny</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => onSave(value)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Confirm</button>
      </div>
    </div>
  );
}

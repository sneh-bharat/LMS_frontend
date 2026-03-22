'use client';

import { useState } from 'react';

// ─── Add Parameter Modal Component ───────────────────────────────────────────
export function AddParameterModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (p: { sn: number; name: string; unit: string; inputType: string; priority: number; linked: number; isHeader: boolean }) => void;
}) {
  const [form, setForm] = useState({ sn: '', name: '', unit: '', inputType: 'txt', priority: '1', linked: 0, isHeader: false });
  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));
    
  const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };
  const inp: React.CSSProperties = {
    width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
    padding: '7px 9px', fontSize: 13, color: '#333', outline: 'none',
    background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
  };
  const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };

  if (!isOpen) return null;
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 480, maxWidth: '95vw', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Add Pathology Parameter</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666' }}>×</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Parameter Name *</label>
            <input value={form.name} onChange={s('name')} style={inp} placeholder="Parameter name" />
          </div>
          <div>
            <label style={lbl}>Unit</label>
            <input value={form.unit} onChange={s('unit')} style={inp} placeholder="e.g. mg/dL" />
          </div>
          <div>
            <label style={lbl}>Input Type</label>
            <select value={form.inputType} onChange={s('inputType')} style={selS}>
              <option value="txt">txt</option>
              <option value="op">op</option>
              <option value="textarea">textarea</option>
              <option value="%">%</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Priority</label>
            <input value={form.priority} onChange={s('priority')} type="number" style={inp} />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isHeader} onChange={e => setForm(f => ({ ...f, isHeader: e.target.checked }))}
              style={{ width: 15, height: 15, accentColor: '#2563eb' }} />
            Is Header (section title)
          </label>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 14 }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 5, border: '1.5px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => {
            if (!form.name.trim()) return;
            onSave({ sn: Date.now(), name: form.name, unit: form.unit, inputType: form.inputType, priority: Number(form.priority) || 1, linked: 0, isHeader: form.isHeader });
            setForm({ sn: '', name: '', unit: '', inputType: 'txt', priority: '1', linked: 0, isHeader: false });
            onClose();
          }} style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create</button>
        </div>
      </div>
    </div>
  );
}

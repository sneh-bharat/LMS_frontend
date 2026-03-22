'use client';

import { useState } from 'react';

interface Parameter {
  id: number; name: string; nabl: string; specimenType: string;
  method: string; unit: string; type: string; priority: string;
  isRequired: string; validation: string; left: string;
  bottom: string; top: string; interface1: string;
  interface2: string; calc: string; paramCode: string;
}

const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 9px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' };

const BLANK_PARAM: Omit<Parameter, 'id'> = {
  name: '', nabl: 'NA', specimenType: 'N/A', method: '', unit: '',
  type: 'Input Box', priority: '', isRequired: 'N/A',
  validation: 'Alphanumeric', left: '0', bottom: '0', top: '0',
  interface1: 'Instrument 1', interface2: 'Instrument 2', calc: 'No', paramCode: '',
};

// ─── Parameter Modal Component ───────────────────────────────────────────────
export function ParameterModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void; onSave: (p: Parameter) => void;
}) {
  const [form, setForm] = useState({ ...BLANK_PARAM });
  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  if (!isOpen) return null;
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, width: 480, maxWidth: '95vw', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', maxHeight: '92vh', overflowY: 'auto' as const }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Parameter</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#666' }}>×</button>
        </div>

        {/* Row 1: Parameter Name + NABL */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Parameter Name</label>
            <input value={form.name} onChange={s('name')} style={inp} />
          </div>
          <div>
            <label style={lbl}>NABL</label>
            <select value={form.nabl} onChange={s('nabl')} style={selS}>
              <option>NA</option><option>Yes</option><option>No</option>
            </select>
          </div>
        </div>

        {/* Row 2: Specimen + Method + Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Specimen Type</label>
            <select value={form.specimenType} onChange={s('specimenType')} style={selS}>
              <option>N/A</option><option>Blood</option><option>Urine</option><option>Serum</option><option>Plasma</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Method</label>
            <input value={form.method} onChange={s('method')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Unit</label>
            <input value={form.unit} onChange={s('unit')} style={inp} />
          </div>
        </div>

        {/* Row 3: Type + Priority + Is Required */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Type</label>
            <select value={form.type} onChange={s('type')} style={selS}>
              <option>Input Box</option><option>Dropdown</option><option>Textarea</option><option>Checkbox</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Priority</label>
            <input value={form.priority} onChange={s('priority')} style={inp} />
          </div>
          <div>
            <label style={lbl}>Is Required</label>
            <select value={form.isRequired} onChange={s('isRequired')} style={selS}>
              <option>N/A</option><option>Yes</option><option>No</option>
            </select>
          </div>
        </div>

        {/* Row 4: Validation + Left + Bottom + Top */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px 70px 70px', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={lbl}>Validation</label>
            <select value={form.validation} onChange={s('validation')} style={selS}>
              <option>Alphanumeric</option><option>Numeric</option><option>Text</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Left</label>
            <select value={form.left} onChange={s('left')} style={selS}>
              {['0','1','2','3','4','5'].map((v, i) => <option key={`left-${i}`}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Bottom</label>
            <select value={form.bottom} onChange={s('bottom')} style={selS}>
              {['0','1','2','3','4','5'].map((v, i) => <option key={`bottom-${i}`}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Top</label>
            <select value={form.top} onChange={s('top')} style={selS}>
              {['0','1','2','3','4','5'].map((v, i) => <option key={`top-${i}`}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Row 5: Interface1 + Interface2 + Calc + Param Code */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 1fr', gap: 12, marginBottom: 20 }}>
          <div>
            <label style={lbl}>Interface 1</label>
            <input value={form.interface1} onChange={s('interface1')} placeholder="Instrument 1" style={inp} />
          </div>
          <div>
            <label style={lbl}>Interface 2</label>
            <input value={form.interface2} onChange={s('interface2')} placeholder="Instrument 2" style={inp} />
          </div>
          <div>
            <label style={lbl}>Calc</label>
            <select value={form.calc} onChange={s('calc')} style={selS}>
              <option>No</option><option>Yes</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Param Code</label>
            <input value={form.paramCode} onChange={s('paramCode')} placeholder="Code" style={inp} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
          <button onClick={onClose} style={{ padding: '7px 18px', borderRadius: 5, border: '1.5px solid #d1d5db', background: '#fff', fontSize: 13, cursor: 'pointer' }}>Close</button>
          <button onClick={() => { onSave({ id: Date.now(), ...form }); setForm({ ...BLANK_PARAM }); onClose(); }}
            style={{ padding: '7px 18px', borderRadius: 5, border: 'none', background: '#2563eb', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create</button>
        </div>
      </div>
    </div>
  );
}

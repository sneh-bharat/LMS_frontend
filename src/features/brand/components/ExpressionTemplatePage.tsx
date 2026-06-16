'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Template {
  id: number; title: string; applicableFor: string; content: string;
}
interface Investigation {
  id: number; name: string; category: string; subCategory: string;
  templates: Template[]; configured: boolean;
  configParams: string[];
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '7px 10px', fontSize: 13, color: '#333', outline: 'none',
  background: '#fff', boxSizing: 'border-box' as const, fontFamily: 'inherit',
};
const selS: React.CSSProperties = { ...inp, cursor: 'pointer' };
const lbl: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block',
};

const APPLICABLE = ['Male', 'Female', 'Both'];

// ─── Component ────────────────────────────────────────────────────────────────
export function ExpressionTemplatePage({
  inv, onBack,
}: {
  inv: Investigation;
  onBack: (updated: Investigation) => void;
}) {
  const [templates, setTemplates] = useState<Template[]>(inv.templates);
  const [title, setTitle]         = useState('');
  const [applicable, setApplicable] = useState('Male');
  const [content, setContent]     = useState('');

  const handleConfirm = () => {
    if (!title.trim()) return;
    setTemplates(prev => [...prev, { id: Date.now(), title, applicableFor: applicable, content }]);
    setTitle(''); setContent('');
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderRadius: 8, padding: '14px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 400, color: '#1e293b' }}>
          Expression Template Management.
        </h2>
        <span style={{
          background: '#2563eb', color: '#fff', fontWeight: 700,
          fontSize: 13, padding: '6px 16px', borderRadius: 5,
        }}>
          {inv.name}
        </span>
      </div>

      {/* Existing templates */}
      {templates.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Title', 'Applicable For', 'Action'].map((h, i) => (
                  <th key={`${h}-${i}`} style={{ padding: '9px 14px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templates.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '9px 14px', color: '#64748b' }}>{i + 1}</td>
                  <td style={{ padding: '9px 14px', fontWeight: 500 }}>{t.title}</td>
                  <td style={{ padding: '9px 14px', color: '#475569' }}>{t.applicableFor}</td>
                  <td style={{ padding: '9px 14px' }}>
                    <button onClick={() => setTemplates(prev => prev.filter(x => x.id !== t.id))}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form card */}
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        {/* Title + Applicable For */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={lbl}>Template Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} style={inp} />
          </div>
          <div>
            <label style={lbl}>Applicable For</label>
            <select value={applicable} onChange={e => setApplicable(e.target.value)} style={selS}>
              {APPLICABLE.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* TinyMCE-style editor */}
        <div style={{ border: '1.5px solid #d1d5db', borderRadius: 6, overflow: 'hidden' }}>
          {/* Menu bar */}
          <div style={{ display: 'flex', gap: 14, padding: '6px 12px', borderBottom: '1px solid #e2e8f0', background: '#fafafa' }}>
            {['File', 'Edit', 'View', 'Insert', 'Format'].map((m, i) => (
              <button key={`${m}-${i}`} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', padding: '2px 4px' }}>{m}</button>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '5px 10px', borderBottom: '1px solid #e2e8f0',
            background: '#fafafa', flexWrap: 'wrap' as const,
          }}>
            {/* Undo / Redo */}
            {['↩', '↪'].map((t, i) => (
              <button key={`undo-${i}`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 5px', fontSize: 14, color: '#555' }}>{t}</button>
            ))}
            
            {/* Paragraph select */}
            <select style={{ ...selS, width: 110, fontSize: 12, margin: '0 4px' }}>
              <option>Paragraph</option><option>Heading 1</option><option>Heading 2</option>
            </select>
            
            {/* Divider */}
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            
            {/* Format buttons */}
            {[
              { label: 'B', style: { fontWeight: 700 } },
              { label: 'I', style: { fontStyle: 'italic' } },
              { label: 'U', style: { textDecoration: 'underline' } },
            ].map((t, i) => (
              <button key={`fmt-${i}`} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 7px', fontSize: 13, color: '#374151', borderRadius: 3, ...t.style }}>{t.label}</button>
            ))}
            
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            
            {/* Copy/paste */}
            {['⧉', '⧊'].map((t, i) => (
              <button key={`copy-${i}`} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 6px', fontSize: 12, color: '#374151', borderRadius: 3 }}>{t}</button>
            ))}
            
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            
            {/* Table */}
            <button style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 6px', fontSize: 12, color: '#374151', borderRadius: 3 }}>⊞▾</button>
            
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            
            {/* Alignment */}
            {['⚌','⚍','⚎','⚏'].map((t, i) => (
              <button key={`align-${i}`} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 5px', fontSize: 12, color: '#374151', borderRadius: 3 }}>{t}</button>
            ))}
            
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            
            {/* Lists */}
            {['•≡▾','1.≡▾'].map((t, i) => (
              <button key={`list-${i}`} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 5px', fontSize: 10, color: '#374151', borderRadius: 3 }}>{t}</button>
            ))}
            
            {['⇤','⇥'].map((t, i) => (
              <button key={`indent-${i}`} style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 5px', fontSize: 13, color: '#374151', borderRadius: 3 }}>{t}</button>
            ))}
            
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            
            {/* Image / Color */}
            <button style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 6px', fontSize: 12, color: '#374151', borderRadius: 3 }}>🖼</button>
            <button style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 6px', fontSize: 12, color: '#374151', borderRadius: 3 }}>A▾</button>
            <button style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 6px', fontSize: 12, color: '#374151', borderRadius: 3 }}>✏▾</button>
            
            <span style={{ width: 1, height: 18, background: '#d1d5db', margin: '0 4px', display: 'inline-block' }} />
            <button style={{ background: 'none', border: '1px solid #e2e8f0', cursor: 'pointer', padding: '3px 6px', fontSize: 12, color: '#374151', borderRadius: 3 }}>?</button>
          </div>

          {/* Content area */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={10}
            style={{
              width: '100%', border: 'none', outline: 'none',
              padding: '14px', fontSize: 13, fontFamily: 'inherit',
              resize: 'vertical' as const, boxSizing: 'border-box' as const,
              background: '#fff',
            }}
          />

          {/* Status bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '4px 12px', fontSize: 11, color: '#94a3b8',
            borderTop: '1px solid #e2e8f0', background: '#fafafa',
          }}>
            <span>p</span>
            <span>Press Alt+0 for help</span>
            <span>{content.trim().split(/\s+/).filter(Boolean).length} words &nbsp; 🔎 tiny</span>
          </div>
        </div>
      </div>

      {/* Page footer */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={handleConfirm} style={{
          background: '#2563eb', color: '#fff', border: 'none',
          borderRadius: 5, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Confirm</button>
        <button onClick={() => onBack({ ...inv, templates })} style={{
          background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db',
          borderRadius: 5, padding: '8px 18px', fontSize: 13, cursor: 'pointer',
        }}>← Back</button>
      </div>
    </div>
  );
}

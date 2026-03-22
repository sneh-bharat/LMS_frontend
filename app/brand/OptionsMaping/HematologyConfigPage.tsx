'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Investigation {
  id: number; name: string; category: string; subCategory: string;
  templates: any[]; configured: boolean;
  configParams: string[];
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const HEMATOLOGY_PARAMS = [
  'Pre Value Text:',
  'Hb', 'TLC', 'PCV (Haematocrot)', 'RBC', 'MCV', 'MCH', 'MCHC', 'Platelets', 'MP',
  'ESR', 'Blood Group', 'Antigen F (p.falciparum)', 'Antigen V (P.vivax)', 'BT', 'CT',
  'P Time', 'INR', 'AP. TT./P.T.TK.',
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const tableStyle: React.CSSProperties = {
  background: '#1e293b', borderRadius: 8,
  overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
};

// ─── Component ────────────────────────────────────────────────────────────────
export function HematologyConfigPage({
  inv, onBack,
}: {
  inv: Investigation;
  onBack: (updated: Investigation) => void;
}) {
  const [selected, setSelected] = useState<string[]>(inv.configParams);

  const toggle = (param: string) =>
    setSelected(prev =>
      prev.includes(param) ? prev.filter(p => p !== param) : [...prev, param]
    );

  // Split into two columns: first half left, second half right
  const leftParams  = HEMATOLOGY_PARAMS.slice(0, Math.ceil(HEMATOLOGY_PARAMS.length / 2));
  const rightParams = HEMATOLOGY_PARAMS.slice(Math.ceil(HEMATOLOGY_PARAMS.length / 2));

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderRadius: 8, padding: '14px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>
          Hematology Input Management.
        </h2>
        <span style={{
          background: '#2563eb', color: '#fff', fontWeight: 700,
          fontSize: 13, padding: '6px 16px', borderRadius: 5,
          letterSpacing: '0.02em',
        }}>
          {inv.name}
        </span>
      </div>

      {/* Dark table */}
      <div style={tableStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, color: '#e2e8f0' }}>
          <tbody>
            {/* First row: Pre Value Text spanning full width */}
            <tr style={{ borderBottom: '1px solid #334155' }}>
              <td style={{ padding: '12px 18px', fontWeight: 500, width: '45%' }}>
                Pre Value Text:
              </td>
              <td style={{ padding: '12px 10px', width: 40 }}>
                <input type="checkbox"
                  checked={selected.includes('Pre Value Text:')}
                  onChange={() => toggle('Pre Value Text:')}
                  style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#2563eb' }}
                />
              </td>
              <td colSpan={2} />
            </tr>

            {/* Two-column parameter rows */}
            {leftParams.slice(1).map((param, i) => {
              const right = rightParams[i];
              return (
                <tr key={`param-${i}`} style={{ borderBottom: '1px solid #334155' }}>
                  <td style={{ padding: '11px 18px', fontWeight: 400 }}>{param}</td>
                  <td style={{ padding: '11px 10px' }}>
                    <input type="checkbox"
                      checked={selected.includes(param)}
                      onChange={() => toggle(param)}
                      style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                  </td>
                  {right ? (
                    <>
                      <td style={{ padding: '11px 18px', fontWeight: 400 }}>{right}</td>
                      <td style={{ padding: '11px 10px' }}>
                        <input type="checkbox"
                          checked={selected.includes(right)}
                          onChange={() => toggle(right)}
                          style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#2563eb' }}
                        />
                      </td>
                    </>
                  ) : <><td /><td /></>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={() => onBack({ ...inv, configParams: selected, configured: selected.length > 0 })}
          style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Save
        </button>
        <button onClick={() => onBack(inv)}
          style={{ background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: 5, padding: '8px 18px', fontSize: 13, cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    </div>
  );
}

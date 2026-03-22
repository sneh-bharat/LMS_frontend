'use client';

import { useState } from 'react';

interface RangeRow {
  id: number; gender: string; ageType: string;
  minAge: string; maxAge: string; minRange: string; maxRange: string;
  refRange: string;
}

interface PathologyParam {
  id: number; sn: number; name: string; unit: string;
  inputType: string; priority: number;
  linked: number; isHeader: boolean;
  ranges: RangeRow[]; defaultValue: string;
  parameters: any[];
}

// ─── Options Dropdown Menu Component ─────────────────────────────────────────
export function OptionsMenu({ param, onRange, onDefault, onOptions, onDelete }: {
  param: PathologyParam;
  onRange: () => void; onDefault: () => void; onOptions: () => void; onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { label: 'Range',         action: onRange,   show: param.inputType === 'txt' || param.inputType === '%' },
    { label: 'Default',       action: onDefault, show: true },
    { label: 'Options',       action: onOptions, show: param.inputType === 'op' },
    { label: 'Delete',        action: onDelete,  show: true },
  ].filter(i => i.show);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 5, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
        Options
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '110%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 130, overflow: 'hidden' }}>
          {items.map((item, index) => (
            <button key={`${item.label}-${index}`} onClick={() => { item.action(); setOpen(false); }}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: item.label === 'Delete' ? '#dc2626' : '#374151', borderBottom: '1px solid #f0f0f0' }}>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

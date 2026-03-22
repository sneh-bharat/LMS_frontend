'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';

const PRICE_DATA = [
  { id: 1,  type: 'self', name: 'COLONOSCOPY',                                        days: 0, mrp: 3800.00, revenue: 3800.00 },
  { id: 2,  type: 'self', name: 'UPPER G.I ENDOSCOPY',                               days: 2, mrp: 2500.00, revenue: 2500.00 },
  { id: 3,  type: 'self', name: 'E. E. G',                                            days: 3, mrp: 800.00,  revenue: 800.00  },
  { id: 4,  type: 'self', name: 'EMG (R) UPPER AND LOWAR LIMB',                      days: 4, mrp: 900.00,  revenue: 900.00  },
  { id: 5,  type: 'self', name: 'EMG And NCV BOTH LOWER LIMB',                       days: 4, mrp: 2000.00, revenue: 2000.00 },
  { id: 6,  type: 'self', name: 'NCV 4 LIMB',                                        days: 4, mrp: 2800.00, revenue: 2800.00 },
  { id: 7,  type: 'self', name: 'NCV BOTH LOWER LIMB',                               days: 4, mrp: 1400.00, revenue: 1400.00 },
  { id: 8,  type: 'self', name: 'NCV BOTH UPPER LIMB',                               days: 4, mrp: 1400.00, revenue: 1400.00 },
  { id: 9,  type: 'self', name: 'NCV SINGLE LIMB',                                   days: 4, mrp: 700.00,  revenue: 700.00  },
  { id: 10, type: 'out',  name: 'ANA PROFILE',                                        days: 0, mrp: 2500.00, revenue: 2500.00 },
  { id: 11, type: 'self', name: 'ANAEMIA PROFILE',                                   days: 0, mrp: 1800.00, revenue: 1800.00 },
  { id: 12, type: 'self', name: 'BETTER PACKAGE FOR ADVANCED HEALTH CHECK UP (BHP-AHCU)', days: 0, mrp: 6450.00, revenue: 6450.00 },
];

const BRANCHES = ['HO(IP)', 'Cash', 'Credit', 'Credit Franchise', 'sv prasad hospital', 'Wallet', 'wallet flexibility'];

interface Props {
  /** called when user navigates back to the list */
  onBack: () => void;
}

export default function PriceListPage({ onBack }: Props) {
  const [branch, setBranch]     = useState('HO(IP)');
  const [filterA, setFilterA]   = useState('Show All');
  const [filterB, setFilterB]   = useState('Show All');
  const [showSelf, setShowSelf] = useState(true);
  const [showOut, setShowOut]   = useState(true);

  const visible = PRICE_DATA.filter(p =>
    (p.type === 'self' && showSelf) || (p.type === 'out' && showOut)
  );

  // ── shared select style ───────────────────────────────────────────────────
  const selStyle: React.CSSProperties = {
    border: '1px solid #c8c8c8',
    borderRadius: 4,
    padding: '6px 24px 6px 10px',
    fontSize: 13,
    color: '#333',
    background: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none',
    appearance: 'auto',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 0,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>

      {/* ── Top header bar ── */}
      <div style={{
        background: '#fff', border: '1px solid #e0e0e0',
        borderRadius: '8px 8px 0 0', borderBottom: 'none',
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
      }}>
        {/* ► HO(IP) Price List title */}
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, fontWeight: 600, fontSize: 16, color: '#222' }}>
          {/* Back / play arrow */}
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#333', display: 'flex' }}
            title="Back to list"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          {branch} Price List
        </span>

        {/* Branch selector */}
        <select style={{ ...selStyle, minWidth: 120 }} value={branch}
          onChange={e => setBranch(e.target.value)}>
          {BRANCHES.map(b => <option key={b}>► {b}</option>)}
        </select>

        {/* Show All A */}
        <select style={selStyle} value={filterA} onChange={e => setFilterA(e.target.value)}>
          <option>Show All</option><option>Self Lab</option><option>Outsource</option>
        </select>

        {/* Show All B */}
        <select style={selStyle} value={filterB} onChange={e => setFilterB(e.target.value)}>
          <option>Show All</option><option>Active</option><option>Inactive</option>
        </select>

        {/* Print */}
        <button style={{
          background: '#e53935', color: '#fff', border: 'none', borderRadius: 4,
          padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
          </svg>
          Print
        </button>

        {/* Excel */}
        <button style={{
          background: '#fff', color: '#1565c0', border: '1px solid #1565c0',
          borderRadius: 4, padding: '7px 14px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'inherit',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
          </svg>
          Excel
        </button>
      </div>

      {/* ── Checkbox filter row — Self Lab / Outsource ── */}
      <div style={{
        background: '#fff', border: '1px solid #e0e0e0',
        borderTop: '1px solid #eee', borderBottom: 'none',
        padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showSelf} onChange={e => setShowSelf(e.target.checked)}
            style={{ width: 14, height: 14, cursor: 'pointer' }} />
          Self Lab
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showOut} onChange={e => setShowOut(e.target.checked)}
            style={{ width: 14, height: 14, cursor: 'pointer' }} />
          Outsource
        </label>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: '#fff', border: '1px solid #e0e0e0',
        borderRadius: '0 0 8px 8px', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
              <th style={{ ...th, width: 56, textAlign: 'center' }}>#</th>
              <th style={{ ...th }}>Investigation</th>
              <th style={{ ...th, width: 80, textAlign: 'center' }}>Days</th>
              <th style={{ ...th, width: 110, textAlign: 'right' }}>MRP</th>
              <th style={{ ...th, width: 110, textAlign: 'right' }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, idx) => (
              <tr key={row.id}
                style={{ borderBottom: '1px solid #f0f0f0', background: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f5f9ff')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <td style={{ padding: '10px 14px', textAlign: 'center', color: idx + 1 >= 10 ? '#e57300' : '#1565c0', fontSize: 13 }}>
                  {idx + 1}
                </td>
                <td style={{ padding: '10px 14px', color: '#222', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Self / Outsource icon */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 16, height: 16, border: '1px solid #aaa',
                    borderRadius: 2, fontSize: 9, color: '#666', flexShrink: 0,
                  }}>
                    {row.type === 'out' ? '✕' : '↗'}
                  </span>
                  {row.name}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'center', color: '#555' }}>{row.days}</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#333', fontWeight: 500 }}>
                  {row.mrp.toFixed(2)}
                </td>
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#333', fontWeight: 500 }}>
                  {row.revenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: '11px 14px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: 13,
  color: '#333',
};
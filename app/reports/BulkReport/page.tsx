'use client';

import { useState, useRef } from 'react';

// ─── Inline UI Primitives ─────────────────────────────────────────────────────

function Button({
  children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md'; style?: React.CSSProperties; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    border: 'none', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: size === 'sm' ? '5px 12px' : '8px 18px',
    fontSize: size === 'sm' ? 12 : 13,
    opacity: disabled ? 0.65 : 1,
    whiteSpace: 'nowrap' as const, transition: 'background 0.15s, opacity 0.15s',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#16a34a', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db' },
    outline:   { background: '#fff', color: '#1a1a2e', border: '2px solid #1a1a2e', borderRadius: 5 },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── Select style ─────────────────────────────────────────────────────────────
const sel: React.CSSProperties = {
  border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '6px 10px', fontSize: 13, color: '#444',
  outline: 'none', background: '#fff', cursor: 'pointer',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportRow {
  id: number;
  patientName: string;
  investigation: string;
  status: 'Ready' | 'Pending' | 'Delivered';
  reportId: string;
  checked: boolean;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ReportRow['status'] }) {
  const map: Record<string, React.CSSProperties> = {
    Ready:     { background: '#dcfce7', color: '#16a34a' },
    Pending:   { background: '#fef9c3', color: '#b45309' },
    Delivered: { background: '#dbeafe', color: '#1d4ed8' },
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 600, ...map[status],
    }}>
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BulkReportPrintPage() {
  // ── Date default: 02-03-2026 ────────────────────────────────────────────────
  const [date, setDate]           = useState('2026-03-02');
  const [branding, setBranding]   = useState('Branding+Signature');
  const [payment, setPayment]     = useState('HO(IP)');
  const [dept, setDept]           = useState('All Departments');
  const [rows, setRows]           = useState<ReportRow[]>([]);
  const [searched, setSearched]   = useState(false);

  const allChecked  = rows.length > 0 && rows.every(r => r.checked);
  const someChecked = rows.some(r => r.checked);
  const selectedCount = rows.filter(r => r.checked).length;

  const toggleAll = () =>
    setRows(prev => prev.map(r => ({ ...r, checked: !allChecked })));
  const toggleRow = (id: number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, checked: !r.checked } : r));

  const handleSearch = () => setSearched(true);

  return (
    <div style={{
      background: '#fff', borderRadius: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
    }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid #e8edf3',
        flexWrap: 'wrap', gap: 12,
      }}>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
          Bulk Report Print
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Branding dropdown — outlined style matching screenshot */}
          <div style={{ position: 'relative' }}>
            <select
              value={branding}
              onChange={e => setBranding(e.target.value)}
              style={{
                ...sel,
                border: '2px solid #1a1a2e',
                borderRadius: 6,
                padding: '7px 32px 7px 12px',
                fontSize: 13,
                fontWeight: 500,
                color: '#1a1a2e',
                appearance: 'none' as const,
                WebkitAppearance: 'none' as const,
                minWidth: 170,
                background: '#fff',
              }}
            >
              <option value="Report Only">Report Only</option>
              <option value="Branding+Signature">Branding+Signature</option>
              <option value="With Signature">With Signature</option>
            </select>
            {/* Custom chevron */}
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#1a1a2e" strokeWidth="2.5"
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          {/* Download All button */}
          <Button
            variant="primary"
            disabled={!someChecked}
            onClick={() => alert(`Downloading ${selectedCount} report(s)…`)}
            style={{
              background: '#16a34a',
              fontSize: 13, fontWeight: 700,
              padding: '8px 20px', borderRadius: 6,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download All (Selected)
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 20px', borderBottom: '1px solid #e8edf3',
        background: '#f8fafc', flexWrap: 'wrap' as const,
        justifyContent: 'center',
      }}>
        {/* Date */}
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ ...sel, width: 170, paddingRight: 32 }}
          />
        </div>

        {/* Payment / Source */}
        <select value={payment} onChange={e => setPayment(e.target.value)}
          style={{ ...sel, minWidth: 200 }}>
          <option value="HO(IP)">HO(IP)</option>
          <option value="Cash">Cash</option>
          <option value="Credit">Credit</option>
          <option value="Credit Franchise">Credit Franchise</option>
          <option value="sv prasad hospital">sv prasad hospital</option>
          <option value="Wallet">Wallet</option>
          <option value="wallet flexibility">wallet flexibility</option>
        </select>

        {/* Department — hierarchical */}
        <select value={dept} onChange={e => setDept(e.target.value)}
          style={{ ...sel, minWidth: 220, flex: 1 }}>
          <option value="All Departments">All Departments</option>
          <optgroup label="Cardiology">
            <option value="ECG">ECG</option>
            <option value="ECHOCARDIOGRAPHY">ECHOCARDIOGRAPHY</option>
            <option value="PFT">PFT</option>
          </optgroup>
          <optgroup label="Dental">
            <option value="DENTAL">DENTAL</option>
          </optgroup>
          <optgroup label="Eye">
            <option value="EYE">EYE</option>
          </optgroup>
          <optgroup label="Gastroenterology">
            <option value="COLONOSCOPY">COLONOSCOPY</option>
            <option value="ENDOSCOPY">ENDOSCOPY</option>
          </optgroup>
          <optgroup label="Infertility">
            <option value="IVF">IVF</option>
          </optgroup>
          <optgroup label="Neurology">
            <option value="BEAR STUDY">BEAR STUDY</option>
            <option value="EEG">EEG</option>
            <option value="NCV EMG">NCV EMG</option>
          </optgroup>
          <optgroup label="Pathology">
            <option value="ALLERGY">ALLERGY</option>
            <option value="BIOCHEMISTRY">BIOCHEMISTRY</option>
            <option value="CLINICAL PATHOLOGY">CLINICAL PATHOLOGY</option>
            <option value="HAEMATOLOGY">HAEMATOLOGY</option>
            <option value="HISTOPATHOLOGY">HISTOPATHOLOGY</option>
            <option value="IMMUNOLOGY">IMMUNOLOGY</option>
            <option value="MICROBIOLOGY">MICROBIOLOGY</option>
            <option value="SEROLOGY">SEROLOGY</option>
          </optgroup>
          <optgroup label="Radiology">
            <option value="CT SCAN">CT SCAN</option>
            <option value="MRI">MRI</option>
            <option value="ULTRASOUND">ULTRASOUND</option>
            <option value="X-RAY">X-RAY</option>
          </optgroup>
        </select>

        <Button variant="secondary" size="sm" onClick={handleSearch}>Search</Button>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' as const }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>

              {/* Patient Name */}
              <th style={{
                textAlign: 'left', padding: '11px 16px',
                fontWeight: 700, color: '#1a1a2e', fontSize: 13,
              }}>
                Patient Name
              </th>

              {/* Checkbox — header */}
              <th style={{ width: 50, padding: '11px 10px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  style={{
                    width: 16, height: 16,
                    accentColor: '#2563eb', cursor: 'pointer',
                  }}
                />
              </th>

              {/* Investigation */}
              <th style={{
                textAlign: 'left', padding: '11px 14px',
                fontWeight: 700, color: '#1a1a2e', fontSize: 13,
              }}>
                Investigation
              </th>

              {/* Status */}
              <th style={{
                textAlign: 'center', padding: '11px 14px',
                fontWeight: 700, color: '#1a1a2e', fontSize: 13,
              }}>
                Status
              </th>

              {/* Report ID */}
              <th style={{
                textAlign: 'left', padding: '11px 16px',
                fontWeight: 700, color: '#1a1a2e', fontSize: 13,
              }}>
                Report ID
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '28px 16px',
                  fontSize: 13, color: '#555',
                  background: '#fff',
                  borderBottom: '1px solid #e8edf3',
                }}>
                  No report found for download. Please change search date.
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.id} style={{
                  borderBottom: '1px solid #f0f0f0',
                  background: idx % 2 === 0 ? '#fff' : '#fafafa',
                }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500, color: '#1a1a2e' }}>
                    {row.patientName}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={row.checked}
                      onChange={() => toggleRow(row.id)}
                      style={{ width: 16, height: 16, accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '10px 14px', color: '#444' }}>{row.investigation}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: '10px 16px', color: '#555', fontFamily: 'monospace' }}>
                    {row.reportId}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
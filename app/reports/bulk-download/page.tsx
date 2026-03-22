'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Inline UI Primitives ─────────────────────────────────────────────────────

function Button({
  children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md'; style?: React.CSSProperties; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    border: 'none', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: size === 'sm' ? '5px 12px' : '8px 18px',
    fontSize: size === 'sm' ? 12 : 13, opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap' as const,
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#16a34a', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db' },
    success:   { background: '#16a34a', color: '#fff' },
    danger:    { background: '#dc2626', color: '#fff' },
    ghost:     { background: 'none', color: '#2563eb', padding: 0, border: 'none' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportRow {
  id: number;
  patientName: string;
  investigation: string;
  status: 'Ready' | 'Pending' | 'Delivered';
  reportId: string;
  checked: boolean;
}

// ─── Select styles ────────────────────────────────────────────────────────────
const selectStyle: React.CSSProperties = {
  border: '1px solid #d1d5db', borderRadius: 5, padding: '6px 10px',
  fontSize: 13, color: '#444', outline: 'none', background: '#fff',
  cursor: 'pointer',
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ReportRow['status'] }) {
  const map: Record<string, React.CSSProperties> = {
    Ready:     { background: '#dcfce7', color: '#16a34a' },
    Pending:   { background: '#fef9c3', color: '#b45309' },
    Delivered: { background: '#dbeafe', color: '#1d4ed8' },
  };
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, ...map[status],
    }}>
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BulkReportDownloadPage() {
  // ── date default: today formatted as DD-MM-YYYY ───────────────────────────
  const today = new Date();
  const pad   = (n: number) => String(n).padStart(2, '0');
  const defaultDate = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

  const [date, setDate]             = useState(defaultDate);
  const [paymentFilter, setPayment] = useState('Credit');
  const [deptFilter, setDept]       = useState('All Departments');
  const [brandFilter, setBrand]     = useState('Branding+Signature');
  const [rows, setRows]             = useState<ReportRow[]>([]);
  const [searched, setSearched]     = useState(false);

  // Convert DD-MM-YYYY ↔ YYYY-MM-DD for native date input
  const toInputVal = (ddmmyyyy: string) => {
    const p = ddmmyyyy.split('-');
    return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : '';
  };
  const fromInputVal = (val: string) => {
    if (!val) return date;
    const [y, m, d] = val.split('-');
    return `${d}-${m}-${y}`;
  };

  const allChecked  = rows.length > 0 && rows.every(r => r.checked);
  const someChecked = rows.some(r => r.checked);

  const toggleAll  = () => setRows(prev => prev.map(r => ({ ...r, checked: !allChecked })));
  const toggleRow  = (id: number) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, checked: !r.checked } : r));

  const handleSearch = () => setSearched(true);
  // In a real app you'd fetch rows here; for now empty = "no report found"

  return (
    <div style={{ background: '#fff', borderRadius: 8,
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

      {/* ── Page Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', borderBottom: '1px solid #e8edf3',
        flexWrap: 'wrap', gap: 10,
      }}>
        <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
          Bulk Report Print
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Branding dropdown */}
          <div style={{ position: 'relative' }}>
            <select value={brandFilter} onChange={e => setBrand(e.target.value)}
              style={{ ...selectStyle, paddingRight: 28, appearance: 'none' as const }}>
              <option>Branding+Signature</option>
              <option>Branding Only</option>
              <option>No Branding</option>
            </select>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#555"
              strokeWidth="2.5" style={{ position: 'absolute', right: 9, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>

          {/* Download All */}
          <Button variant="primary"
            onClick={() => alert('Downloading selected reports…')}
            disabled={!someChecked}
            style={{ background: someChecked ? '#16a34a' : '#86efac', color: '#fff' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download All (Selected)
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 20px', borderBottom: '1px solid #e8edf3',
        flexWrap: 'wrap',
      }}>
        {/* Date picker */}
        <div style={{ position: 'relative' }}>
          <input
            type="date"
            value={toInputVal(date)}
            onChange={e => setDate(fromInputVal(e.target.value))}
            style={{ ...selectStyle, paddingRight: 32, width: 160 }}
          />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#666"
            strokeWidth="2" style={{ position: 'absolute', right: 8, top: '50%',
              transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>

        {/* Payment type */}
        <select value={paymentFilter} onChange={e => setPayment(e.target.value)}
          style={{ ...selectStyle, minWidth: 180 }}>
          <option value="HO(IP)">HO(IP)</option>
          <option value="Cash">Cash</option>
          <option value="Credit">Credit</option>
          <option value="Credit Franchise">Credit Franchise</option>
          <option value="sv prasad hospital">sv prasad hospital</option>
          <option value="Wallet">Wallet</option>
          <option value="wallet flexibility">wallet flexibility</option>
        </select>

        {/* Department — hierarchical with optgroup */}
        <select value={deptFilter} onChange={e => setDept(e.target.value)}
          style={{ ...selectStyle, minWidth: 200 }}>
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

        {/* Search trigger */}
        <Button variant="secondary" size="sm" onClick={handleSearch}>Search</Button>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' as const }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              {/* Checkbox all */}
              <th style={{ width: 44, padding: '10px 14px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
                />
              </th>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#374151' }}>
                Patient Name
              </th>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#374151' }}>
                Investigation
              </th>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#374151' }}>
                Status
              </th>
              <th style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: '#374151' }}>
                Report ID
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{
                  padding: '40px 20px', color: '#888', fontSize: 13,
                  background: '#f8fafc',
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
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={row.checked}
                      onChange={() => toggleRow(row.id)}
                      style={{ width: 15, height: 15, accentColor: '#2563eb', cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1a1a2e' }}>
                    {row.patientName}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#444' }}>{row.investigation}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: '10px 14px', color: '#555', fontFamily: 'monospace' }}>
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
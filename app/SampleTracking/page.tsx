'use client';

import { useState, useRef, useEffect } from 'react';

// ─── Inline UI Primitives ─────────────────────────────────────────────────────

function Button({
  children, onClick, variant = 'primary', size = 'md', style = {}, disabled = false,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md'; style?: React.CSSProperties; disabled?: boolean;
}) {
  const base: React.CSSProperties = {
    border: 'none', borderRadius: 5, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: size === 'sm' ? '5px 12px' : '7px 16px',
    fontSize: size === 'sm' ? 12 : 13, opacity: disabled ? 0.6 : 1,
    whiteSpace: 'nowrap' as const, transition: 'background 0.15s',
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: '#2563eb', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151', border: '1.5px solid #d1d5db' },
    ghost:     { background: 'none', color: '#2563eb', border: 'none', padding: 0 },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Input({
  value, onChange, onKeyDown, placeholder = '', style = {}, type = 'text', inputRef,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string; style?: React.CSSProperties; type?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <input
      ref={inputRef}
      type={type} value={value} onChange={onChange} onKeyDown={onKeyDown}
      placeholder={placeholder}
      style={{
        border: '1.5px solid #d1d5db', borderRadius: 5,
        padding: '6px 10px', fontSize: 13, color: '#444',
        outline: 'none', width: '100%',
        boxSizing: 'border-box' as const, ...style,
      }}
    />
  );
}

const sel: React.CSSProperties = {
  border: '1.5px solid #d1d5db', borderRadius: 5,
  padding: '6px 10px', fontSize: 13, color: '#444',
  outline: 'none', background: '#fff', cursor: 'pointer',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface SampleRow {
  barcode: string;
  patientName: string;
  investigation: string;
  collectedAt: string;
  collectedBy: string;
  status: 'Collected' | 'Pending' | 'Processing' | 'Dispatched' | 'Received';
  department: string;
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Collected:   { bg: '#dcfce7', color: '#15803d' },
  Pending:     { bg: '#fef9c3', color: '#854d0e' },
  Processing:  { bg: '#dbeafe', color: '#1d4ed8' },
  Dispatched:  { bg: '#f3e8ff', color: '#7c3aed' },
  Received:    { bg: '#e0f2fe', color: '#0369a1' },
};

// ─── Bulk Collection Modal ────────────────────────────────────────────────────
function BulkCollectionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [barcodes, setBarcodes] = useState('');
  const [status, setStatus]     = useState('Collected');

  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, width: 500, maxWidth: '95vw',
        padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>Bulk Collection</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#666' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
              Invoice Barcodes
            </label>
            <textarea
              value={barcodes}
              onChange={e => setBarcodes(e.target.value)}
              placeholder="Enter or paste barcodes, one per line"
              rows={6}
              style={{
                width: '100%', border: '1.5px solid #d1d5db', borderRadius: 5,
                padding: '8px 10px', fontSize: 13, color: '#444',
                outline: 'none', resize: 'vertical' as const,
                boxSizing: 'border-box' as const, fontFamily: 'inherit',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 5 }}>
              Update Status
            </label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...sel, width: '100%' }}>
              {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20, borderTop: '1px solid #e8edf3', paddingTop: 16 }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { alert(`Bulk update: ${barcodes.split('\n').filter(Boolean).length} items`); onClose(); }}>
            Update Collection
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SampleTrackingPage() {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const [barcode, setBarcode]         = useState('');
  const [statusFilter, setStatus]     = useState('All');
  const [selectedDate, setSelectedDate]               = useState('2026-03-02');
  const [deptFilter, setDeptFilter]   = useState('All');
  const [results, setResults]         = useState<SampleRow[] | null>(null);
  const [searched, setSearched]       = useState(false);
  const [bulkOpen, setBulkOpen]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input on mount
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleBarcodSearch = () => {
    if (!barcode.trim()) return;
    setSearched(true);
    // Simulate: return empty for demo (real app would fetch)
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBarcodSearch();
  };

  // Format date DD-MM-YYYY for display
  const displayDate = (() => {
    const parts = selectedDate.split('-');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : selectedDate;
  })();

  return (
    <>
      <BulkCollectionModal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} />

      <div style={{
        background: '#fff', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #e8edf3',
          flexWrap: 'wrap', gap: 10,
        }}>
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
            Sample Tracking
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
            {/* Bulk Collection */}
            <Button variant="ghost" onClick={() => setBulkOpen(true)}
              style={{ color: '#2563eb', fontSize: 13, fontWeight: 500 }}>
              Bulk Collection
            </Button>

            {/* Status filter */}
            <select value={statusFilter} onChange={e => setStatus(e.target.value)}
              style={{ ...sel, minWidth: 110 }}>
              <option value="All">Show All</option>
              {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
            </select>

            {/* Barcode search */}
            <Input
              value={barcode}
              onChange={e => setBarcode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Invoice Barcode"
              inputRef={inputRef}
              style={{ width: 180 }}
            />
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 20px', borderBottom: '1px solid #e8edf3',
          background: '#f8fafc', flexWrap: 'wrap' as const,
          justifyContent: 'flex-end',
        }}>
          {/* Department filter */}
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ ...sel, minWidth: 140 }}>
            <option value="All">All</option>
            <option>Pathology</option>
            <option>Radiology</option>
            <option>Biochemistry</option>
            <option>Microbiology</option>
            <option>Haematology</option>
          </select>

          {/* Date picker */}
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ ...sel, width: 160, paddingRight: 32 }}
            />
          </div>
        </div>

        {/* ── Content Area ── */}
        <div style={{ minHeight: 300, background: '#f0f4f8' }}>
          {!searched ? (
            // Initial state — prompt user
            <div style={{
              display: 'flex', flexDirection: 'column' as const,
              alignItems: 'center', justifyContent: 'center',
              padding: '52px 20px', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 10px', fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
                Type Invoice Barcode then press enter.
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b', maxWidth: 600, lineHeight: 1.7 }}>
                To maintain data intrigrity, presently we are not showing all data together.
                We are working on this for Next Gen &amp; better solution.{' '}
                <button
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#2563eb', fontSize: 13, fontWeight: 500, padding: 0,
                    textDecoration: 'none',
                  }}
                  onClick={() => alert('Sample Collection Report')}
                >
                  Sample Collection Report
                </button>
              </p>
            </div>
          ) : results && results.length === 0 ? (
            // Searched but no results
            <div style={{
              display: 'flex', flexDirection: 'column' as const,
              alignItems: 'center', justifyContent: 'center',
              padding: '52px 20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🔍</div>
              <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 600, color: '#1e293b' }}>
                No sample found for barcode <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>{barcode}</code>
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
                Please verify the barcode and try again.
              </p>
              <button
                onClick={() => { setSearched(false); setResults(null); setBarcode(''); setTimeout(() => inputRef.current?.focus(), 50); }}
                style={{
                  marginTop: 16, background: '#2563eb', color: '#fff', border: 'none',
                  borderRadius: 6, padding: '7px 18px', fontSize: 13, cursor: 'pointer',
                }}
              >
                Clear &amp; Search Again
              </button>
            </div>
          ) : (
            // Results table
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    {['#', 'Barcode', 'Patient Name', 'Investigation', 'Department', 'Collected At', 'Collected By', 'Status'].map((h, i) => (
                      <th key={h} style={{
                        padding: '10px 14px', fontWeight: 600, color: '#374151',
                        textAlign: i === 0 || i === 7 ? 'center' : 'left',
                        whiteSpace: 'nowrap' as const, fontSize: 12,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(results ?? [])
                    .filter(r => statusFilter === 'All' || r.status === statusFilter)
                    .filter(r => deptFilter === 'All' || r.department === deptFilter)
                    .map((row, idx) => (
                      <tr key={row.barcode} style={{
                        borderBottom: '1px solid #f0f0f0',
                        background: idx % 2 === 0 ? '#fff' : '#fafafa',
                      }}>
                        <td style={{ padding: '10px 14px', textAlign: 'center', color: '#94a3b8', width: 36 }}>{idx + 1}</td>
                        <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#1e293b', fontWeight: 600 }}>{row.barcode}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1e293b' }}>{row.patientName}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{row.investigation}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{row.department}</td>
                        <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' as const }}>{row.collectedAt}</td>
                        <td style={{ padding: '10px 14px', color: '#475569' }}>{row.collectedBy}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block', padding: '2px 10px',
                            borderRadius: 20, fontSize: 11, fontWeight: 600,
                            ...STATUS_COLORS[row.status],
                          }}>{row.status}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
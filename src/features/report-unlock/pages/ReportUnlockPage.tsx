'use client';

import { useState } from 'react';
import type { AccessLogEntry } from '../types/report-unlock.types';
import { AccessLogModal } from '../components/AccessLogModal';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportUnlockRequestPage() {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const defaultDate = `${pad(today.getDate())}-${pad(today.getMonth() + 1)}-${today.getFullYear()}`;

  const [date, setDate] = useState(defaultDate);
  const [reportId, setReportId] = useState('');
  const [searched, setSearched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [accessLogs] = useState<AccessLogEntry[]>([]);

  const handleSearch = () => setSearched(true);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) return;
    const [y, m, d] = raw.split('-');
    setDate(`${d}-${m}-${y}`);
  };

  const toInputValue = (ddmmyyyy: string) => {
    const parts = ddmmyyyy.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  return (
    <>
      <AccessLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        logs={accessLogs}
      />

      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: '1px solid #e8edf3',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>
            Report Unlock Request
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Access Log button */}
            <button
              onClick={() => setModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: '1.5px solid #3b82f6',
                borderRadius: 5,
                color: '#3b82f6',
                fontSize: 13,
                fontWeight: 500,
                padding: '5px 12px',
                cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="7" y1="12" x2="17" y2="12" />
                <line x1="10" y1="18" x2="14" y2="18" />
              </svg>
              Access Log
            </button>

            {/* Report ID input */}
            <input
              type="text"
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Report ID"
              style={{
                border: '1.5px solid #d1d5db',
                borderRadius: 5,
                padding: '5px 10px',
                fontSize: 13,
                color: '#444',
                outline: 'none',
                width: 130,
              }}
            />
          </div>
        </div>

        {/* ── Date + Search Controls ────────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #e8edf3',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="date"
              value={toInputValue(date)}
              onChange={handleDateChange}
              style={{
                border: '1.5px solid #d1d5db',
                borderRadius: 5,
                padding: '5px 36px 5px 10px',
                fontSize: 13,
                color: '#444',
                outline: 'none',
                background: '#fff',
                cursor: 'pointer',
                width: 160,
              }}
            />
          </div>

          <button
            onClick={handleSearch}
            style={{
              background: '#1d4ed8',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              padding: '6px 18px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>

        {/* ── Results Area ──────────────────────────────────────────────── */}
        <div style={{ padding: '20px' }}>
          {/* Always show the empty state (matches screenshot — no results) */}
          <div
            style={{
              background: '#ddeef5',
              borderRadius: 8,
              padding: '22px 24px',
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 12,
              minWidth: 280,
            }}
          >
            {/* Sad face icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5b8fa8"
              strokeWidth="1.8"
              style={{ flexShrink: 0, marginTop: 2 }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 15.5s1.5-2 4-2 4 2 4 2" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div>
              <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 15, color: '#2d4a5a' }}>
                Uhhh
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#4a6f82', lineHeight: 1.6 }}>
                No record found. Please try with
                <br />
                different search criteria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
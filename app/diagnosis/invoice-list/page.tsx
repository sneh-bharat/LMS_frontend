'use client';

import { useState, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS  — all dropdown options exactly as seen in screenshots
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_OPTIONS = [
  'Invoice Barcode',
  'Patient Name',
  'Mobile Number',
  'UHID',
  'Vial Barcode',
] as const;

const CENTRE_OPTIONS = [
  'Select centre',
  'HO(IP)',
  'Cash',
  'Credit',
  'Credit Franchise',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
] as const;

const STATUS_OPTIONS = [
  'All',
  'Adv Booking',
  'Adv Booking All',
  'Paid Invoices',
  'Due Invoices',
  'Urgent Processing',
] as const;

type SearchOption = (typeof SEARCH_OPTIONS)[number];
type CentreOption = (typeof CENTRE_OPTIONS)[number];
type StatusOption = (typeof STATUS_OPTIONS)[number];

// ─────────────────────────────────────────────────────────────────────────────
//  CUSTOM SELECT DROPDOWN
//  Native <select> can't match the blue-highlight style from the screenshots.
//  This renders a custom dropdown that looks identical.
// ─────────────────────────────────────────────────────────────────────────────
interface CustomSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  width?: number | string;
  minWidth?: number;
}

function CustomSelect<T extends string>({
  value,
  options,
  onChange,
  width = 'auto',
  minWidth = 120,
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{ position: 'relative', width, minWidth, flexShrink: 0 }}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
          border: '1px solid #c8c8c8',
          borderRadius: 4,
          padding: '7px 10px',
          background: '#fff',
          fontSize: 13,
          color: '#333',
          cursor: 'pointer',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </span>
        {/* Chevron */}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="#666"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {/* Dropdown list */}
      {open && (
        <ul
          style={{
            position: 'absolute',
            top: 'calc(100% + 2px)',
            left: 0,
            zIndex: 500,
            background: '#fff',
            border: '1px solid #c8c8c8',
            borderRadius: 4,
            boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
            minWidth: '100%',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            overflow: 'hidden',
          }}
        >
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <li
                key={opt}
                onClick={() => {
                  onChange(opt as T);
                  setOpen(false);
                }}
                style={{
                  padding: '9px 14px',
                  fontSize: 13,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: isSelected ? '#1565c0' : '#fff',
                  color: isSelected ? '#fff' : '#333',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLElement).style.background =
                      '#f0f4ff';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLElement).style.background = '#fff';
                }}
              >
                {opt}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DATE RANGE DISPLAY  (read-only for now — wire to a date picker if needed)
// ─────────────────────────────────────────────────────────────────────────────
function DateRangeDisplay({ value }: { value: string }) {
  return (
    <div
      style={{
        border: '1px solid #c8c8c8',
        borderRadius: 4,
        padding: '7px 10px',
        fontSize: 13,
        color: '#333',
        background: '#fff',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'default',
        flexShrink: 0,
      }}
    >
      <span>{value}</span>
      {/* Calendar icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#888">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3 3.9 3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INVOICE LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function InvoiceListPage() {
  const [searchBy, setSearchBy]   = useState<SearchOption>('UHID');
  const [searchText, setSearchText] = useState('');
  const [centre, setCentre]       = useState<CentreOption>('Select centre');
  const [status, setStatus]       = useState<StatusOption>('All');

  // Today's date range (matches screenshot format)
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  const dateRange = `${fmt(today)} - ${fmt(today)}`;

  // ── Shared card shell style ──────────────────────────────────────────────
  const borderCard = (extra: React.CSSProperties = {}): React.CSSProperties => ({
    background: '#fff',
    border: '1px solid #e0e0e0',
    ...extra,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >

      {/* ════════════════════════════════════════════════════════
          ROW 1 — title | UHID select | "Type here" input
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          ...borderCard({
            borderRadius: '8px 8px 0 0',
            borderBottom: 'none',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }),
        }}
      >
        {/* Icon + Title */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 16,
            fontWeight: 600,
            color: '#222',
            flex: 1,
            minWidth: 160,
          }}
        >
          {/* Green document icon — matches screenshot */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#43a047">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
          </svg>
          List of Invoices
        </span>

        {/* UHID / search-type custom select */}
        <CustomSelect<SearchOption>
          value={searchBy}
          options={SEARCH_OPTIONS}
          onChange={setSearchBy}
          minWidth={160}
        />

        {/* "Type here" text input */}
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Type here"
          style={{
            border: '1px solid #c8c8c8',
            borderRadius: 4,
            padding: '7px 11px',
            fontSize: 13,
            color: '#333',
            width: 200,
            outline: 'none',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
          onFocus={(e) => (e.target.style.borderColor = '#1565c0')}
          onBlur={(e)  => (e.target.style.borderColor = '#c8c8c8')}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          ROW 2 — Select centre | date range | All (status)
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          ...borderCard({
            borderTop: '1px solid #eeeeee',
            borderBottom: 'none',
            padding: '9px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
          }),
        }}
      >
        {/* Centre dropdown */}
        <CustomSelect<CentreOption>
          value={centre}
          options={CENTRE_OPTIONS}
          onChange={setCentre}
          minWidth={155}
        />

        {/* Date range */}
        <DateRangeDisplay value={dateRange} />

        {/* Status dropdown */}
        <CustomSelect<StatusOption>
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
          minWidth={140}
        />
      </div>

      {/* ════════════════════════════════════════════════════════
          TABLE
      ════════════════════════════════════════════════════════ */}
      <div
        style={{
          ...borderCard({
            borderRadius: '0 0 8px 8px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          }),
        }}
      >
        <table
          style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
              <Th style={{ width: 56, textAlign: 'center' }}>#</Th>
              <Th>Invoice &amp; Patient info</Th>
              <Th style={{ width: 180 }}>Ref Doctor</Th>
              <Th style={{ width: 120 }}>Amount</Th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={4}
                style={{ padding: '36px 18px', fontSize: 13 }}
              >
                {/* Empty state — matches "No record found." coloring */}
                No record found. Please try with{' '}
                <span style={{ color: '#1565c0' }}>different search</span> or{' '}
                <span style={{ color: '#e53935' }}>filter criteria</span>.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}

// ─── TH helper ────────────────────────────────────────────────────────────────
function Th({
  children,
  style = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <th
      style={{
        padding: '11px 16px',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: 13,
        color: '#333',
        background: '#fff',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </th>
  );
}
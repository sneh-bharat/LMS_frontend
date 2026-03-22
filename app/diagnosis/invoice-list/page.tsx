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
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          padding: '8px 12px',
          background: '#fff',
          fontSize: 12,
          fontWeight: 700,
          color: '#1e293b',
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
          fill="#94a3b8"
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
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 500,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 6,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            minWidth: '100%',
            margin: 0,
            padding: '4px',
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
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  borderRadius: 4,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  background: isSelected ? '#10b981' : '#fff',
                  color: isSelected ? '#fff' : '#475569',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (e.currentTarget as HTMLElement).style.background =
                      '#f8fafc';
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
        border: '1px solid #e2e8f0',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 700,
        color: '#1e293b',
        background: '#fff',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        cursor: 'default',
        flexShrink: 0,
      }}
    >
      <span>{value}</span>
      {/* Calendar icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#94a3b8">
        <path d="M19 3h-1V1h-2v2H8V1H6v2H5C3.89 3 3 3.9 3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  INVOICE LIST PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function InvoiceListPage() {
  const [searchBy, setSearchBy] = useState<SearchOption>('UHID');
  const [searchText, setSearchText] = useState('');
  const [centre, setCentre] = useState<CentreOption>('Select centre');
  const [status, setStatus] = useState<StatusOption>('All');

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
        className="bg-white rounded-t-xl border border-slate-200 border-b-0 p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm"
      >
        {/* Icon + Title */}
        <span
          className="flex items-center gap-2 text-base font-bold text-slate-900 flex-1 min-w-[200px]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#10b981">
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
          </svg>
          List of Invoices
        </span>

        <div className="flex items-center gap-2">
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
            placeholder="Search patient..."
            className="input-refined w-[200px] py-2 font-bold"
          />
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          ROW 2 — Select centre | date range | All (status)
      ════════════════════════════════════════════════════════ */}
      <div
        className="bg-slate-50 border border-slate-200 border-t-0 border-b-0 p-3 flex items-center justify-end gap-3 flex-wrap"
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
        className="bg-white rounded-b-xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <table
          className="w-full border-collapse"
        >
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <Th style={{ width: 56, textAlign: 'center' }}>#</Th>
              <Th>Invoice & Patient info</Th>
              <Th style={{ width: 180 }}>Ref Doctor</Th>
              <Th style={{ width: 120 }}>Amount</Th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td
                colSpan={4}
                className="px-6 py-12 text-sm text-slate-500"
              >
                {/* Empty state — matches "No record found." coloring */}
                No record found. Please try with{' '}
                <span className="text-emerald-600 font-bold">different search</span> or{' '}
                <span className="text-rose-500 font-bold">filter criteria</span>.
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
        padding: '12px 16px',
        textAlign: 'left',
        fontWeight: 700,
        fontSize: 11,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: 'transparent',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </th>
  );
}
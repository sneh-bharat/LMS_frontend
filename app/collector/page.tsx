'use client';

import { useState } from 'react';
import AddCollectorModal from './AddCollectorModal';

// ── Seed data matching the screenshot exactly ─────────────────────────────────
const SEED = [
  { id: 1, name: 'Biswajit Thakur', mobile: '8240978301', address: 'Hrc road',    centre: 'HO(IP)',  status: 'Active', priceShow: 'Yes' },
  { id: 2, name: 'PARTHA DAS',      mobile: '9071119895', address: 'H.R.C. ROAD', centre: 'HO(IP)',  status: 'Active', priceShow: 'Yes' },
  { id: 3, name: 'Rabi santra',     mobile: '8240611662', address: 'Hrc road',    centre: 'HO(IP)',  status: 'Active', priceShow: 'Yes' },
  { id: 4, name: 'Reek das',        mobile: '6289153360', address: 'Hrc road',    centre: 'HO(IP)',  status: 'Active', priceShow: 'Yes' },
];

const CENTRES = [
  'Select centre',
  'Cash',
  'Credit',
  'Credit Franchise',
  'HO(IP)',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CollectorPage() {
  const [collectors, setCollectors]     = useState(SEED);
  const [modal, setModal]               = useState(null); // null | { mode: 'add' | 'edit', data?: collector }
  const [centreFilter, setCentreFilter] = useState('Select centre');
  const [nameSearch, setNameSearch]     = useState('');

  // ── Derived list ──────────────────────────────────────────────────────────
  const visible = collectors.filter((c) => {
    const matchCentre = centreFilter === 'Select centre' || c.centre === centreFilter;
    const matchName   = !nameSearch || c.name.toLowerCase().includes(nameSearch.toLowerCase());
    return matchCentre && matchName;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleSave = (form) => {
    if (modal.mode === 'add') {
      setCollectors((prev) => [...prev, { ...form, id: Date.now() }]);
    } else {
      setCollectors((prev) =>
        prev.map((c) => (c.id === modal.data.id ? { ...c, ...form } : c))
      );
    }
    setModal(null);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const pageWrap = {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  };

  const topCard = {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px 8px 0 0',
    borderBottom: 'none',
    padding: '12px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  };

  const filterRow = {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderTop: '1px solid #eeeeee',
    borderBottom: 'none',
    padding: '9px 18px',
    display: 'flex',
    justifyContent: 'flex-end',
  };

  const tableWrap = {
    background: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '0 0 8px 8px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
  };

  return (
    <div style={pageWrap}>

      {/* ══ TOP HEADER ROW ══ */}
      <div style={topCard}>

        {/* Title: icon + "Collector list" */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 16,
            fontWeight: 600,
            color: '#222',
            flex: 1,
            minWidth: 160,
          }}
        >
          {/* People icon — same green as in screenshot */}
          <svg width="19" height="19" viewBox="0 0 24 24" fill="#43a047">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
          </svg>
          Collector list
        </span>

        {/* + Add Collector button — blue, matches screenshot */}
        <button
          onClick={() => setModal({ mode: 'add' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: '#1565c0',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          {/* small plus icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Collector
        </button>

        {/* Collector Name search input */}
        <input
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          placeholder="Collector Name"
          style={{
            border: '1px solid #d0d0d0',
            borderRadius: 4,
            padding: '7px 11px',
            fontSize: 13,
            color: '#333',
            width: 170,
            outline: 'none',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#1565c0')}
          onBlur={(e)  => (e.target.style.borderColor = '#d0d0d0')}
        />
      </div>

      {/* ══ FILTER ROW — "Select centre" dropdown, right-aligned ══ */}
      <div style={filterRow}>
        <select
          value={centreFilter}
          onChange={(e) => setCentreFilter(e.target.value)}
          style={{
            border: '1px solid #d0d0d0',
            borderRadius: 4,
            padding: '7px 28px 7px 10px',
            fontSize: 13,
            color: centreFilter === 'Select centre' ? '#888' : '#333',
            background: '#fff',
            cursor: 'pointer',
            minWidth: 180,
            outline: 'none',
            fontFamily: 'inherit',
            appearance: 'auto',
          }}
        >
          {CENTRES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* ══ TABLE ══ */}
      <div style={tableWrap}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13.5,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid #e0e0e0',
                background: '#fff',
              }}
            >
              {/* Columns match screenshot exactly */}
              <Th style={{ width: 56, textAlign: 'center' }}>#</Th>
              <Th>Name</Th>
              <Th>Mobile No &amp; Address</Th>
              <Th style={{ width: 100, textAlign: 'center' }}>Action</Th>
            </tr>
          </thead>

          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    color: '#9e9e9e',
                    fontSize: 13,
                  }}
                >
                  No record found.
                </td>
              </tr>
            ) : (
              visible.map((col, idx) => (
                <tr
                  key={col.id}
                  style={{
                    borderBottom: '1px solid #eeeeee',
                    background: '#fff',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = '#f5f9ff')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = '#fff')
                  }
                >
                  {/* # — number, center, muted */}
                  <td
                    style={{
                      padding: '13px 16px',
                      textAlign: 'center',
                      color: '#999',
                      fontSize: 13,
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* Name — green dot + name */}
                  <td style={{ padding: '13px 16px' }}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                      }}
                    >
                      {/* Green status dot */}
                      <span
                        style={{
                          display: 'inline-block',
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background:
                            col.status === 'Active' ? '#43a047' : '#bdbdbd',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: '#222', fontWeight: 500 }}>
                        {col.name}
                      </span>
                    </span>
                  </td>

                  {/* Mobile No & Address — combined in one cell */}
                  <td style={{ padding: '13px 16px', color: '#555' }}>
                    {col.mobile} {col.address}
                  </td>

                  {/* Action — green Edit button */}
                  <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                    <button
                      onClick={() => setModal({ mode: 'edit', data: col })}
                      style={{
                        background: '#43a047',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '5px 18px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ══ MODAL ══ */}
      {modal && (
        <AddCollectorModal
          onClose={() => setModal(null)}
          onSave={handleSave}
          initialData={modal.mode === 'edit' ? modal.data : undefined}
        />
      )}
    </div>
  );
}

// ── Table header cell helper ──────────────────────────────────────────────────
function Th({ children, style = {} }) {
  return (
    <th
      style={{
        padding: '11px 16px',
        textAlign: 'left',
        fontWeight: 600,
        fontSize: 13,
        color: '#333',
        background: '#fff',
        ...style,
      }}
    >
      {children}
    </th>
  );
}
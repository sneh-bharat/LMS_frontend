'use client';

import { useState } from 'react';
import { Printer, ChevronDown, Search, AlertCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LedgerRecord {
  sl: number;
  date: string;
  inv: string;
  doctor: string;
  patientName: string;
  investigation: string;
  price: number;
  oChrg: number;
  paid: number;
  dis: number;
  due: number;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const B2B_OPTIONS = [
  'HO(IP)',
  'Cash',
  'Credit',
  'Credit Franchise',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

const SAMPLE_RECORDS: Record<string, LedgerRecord[]> = {
  'HO(IP)': [
    {
      sl: 1, date: '2026-03-02', inv: 'TL-INV-101', doctor: 'Dr. Sharma',
      patientName: 'Ramesh Kumar', investigation: 'CBC + LFT',
      price: 1200, oChrg: 150, paid: 1000, dis: 100, due: 250,
    },
    {
      sl: 2, date: '2026-03-02', inv: 'TL-INV-102', doctor: 'Dr. Patel',
      patientName: 'Sunita Devi', investigation: 'Thyroid Profile',
      price: 800, oChrg: 0, paid: 800, dis: 0, due: 0,
    },
    {
      sl: 3, date: '2026-03-02', inv: 'TL-INV-103', doctor: 'Dr. Verma',
      patientName: 'Mohammed Ali', investigation: 'Lipid Profile + HbA1c',
      price: 1500, oChrg: 200, paid: 1200, dis: 150, due: 350,
    },
  ],
  'Cash': [
    {
      sl: 1, date: '2026-03-02', inv: 'TL-INV-201', doctor: 'Dr. Singh',
      patientName: 'Priya Mehta', investigation: 'Urine Routine',
      price: 300, oChrg: 0, paid: 300, dis: 0, due: 0,
    },
  ],
  'Credit': [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

function calcTotals(records: LedgerRecord[]) {
  return records.reduce(
    (acc, r) => ({
      price: acc.price + r.price,
      oChrg: acc.oChrg + r.oChrg,
      paid: acc.paid + r.paid,
      dis: acc.dis + r.dis,
      due: acc.due + r.due,
    }),
    { price: 0, oChrg: 0, paid: 0, dis: 0, due: 0 }
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const FranchiseLedger = () => {
  const [b2b, setB2b] = useState('HO(IP)');
  const [startDate, setStartDate] = useState('2026-03-02');
  const [endDate, setEndDate] = useState('2026-03-02');
  const [showResult, setShowResult] = useState(false);
  const [dateError, setDateError] = useState('');

  const validateAndSearch = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 5) {
      setDateError('Date range should not be more than 5 days');
      return;
    }
    if (end < start) {
      setDateError('End date cannot be before start date');
      return;
    }
    setDateError('');
    setShowResult(true);
  };

  const records: LedgerRecord[] = SAMPLE_RECORDS[b2b] ?? [];
  const totals = calcTotals(records);

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* ── Header Section ── */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-blue-600">Franchise</span> Ledger
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                View and print B2B franchise ledger records by date range.
              </p>
            </div>
            {showResult && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-all shadow-lg hover:shadow-xl print:hidden"
              >
                <Printer size={18} /> Print
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* ── Filter Form Card ── */}
        {!showResult && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-base font-bold text-slate-700 uppercase tracking-wide">Search Criteria</h2>
            </div>
            <div className="px-8 py-8 space-y-6">

              {/* Select B2B */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                  Select B2B
                </label>
                <div className="relative">
                  <select
                    value={b2b}
                    onChange={(e) => setB2b(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer text-sm"
                  >
                    {B2B_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Date range */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Date</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setDateError(''); setShowResult(false); }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-sm"
                  />
                  <span className="text-slate-400 font-semibold text-sm">–</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setDateError(''); setShowResult(false); }}
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-sm"
                  />
                </div>
                {dateError ? (
                  <div className="flex items-center gap-1.5 mt-2 text-rose-600">
                    <AlertCircle size={14} />
                    <p className="text-xs font-medium">{dateError}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-2">Date range should not be more than 5 days</p>
                )}
              </div>

              {/* Print / Search button */}
              <button
                onClick={validateAndSearch}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg text-sm tracking-wide flex items-center justify-center gap-2"
              >
                <Search size={18} /> Search Ledger
              </button>
            </div>
          </div>
        )}

        {/* ── Results View ── */}
        {showResult && (
          <>
            {/* Back + info bar */}
            <div className="flex items-center justify-between mb-6 print:hidden">
              <button
                onClick={() => setShowResult(false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all text-sm"
              >
                ← Back to Search
              </button>
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-sm">
                <span className="font-bold text-slate-900">{b2b}</span>
                <span className="text-slate-400">·</span>
                <span>{startDate} – {endDate}</span>
              </div>
            </div>

            {/* Ledger Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

              {/* Card Header */}
              <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
                <p className="text-sm font-bold text-slate-800">
                  {b2b} ({startDate === endDate ? startDate : `${startDate} – ${endDate}`})
                </p>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      {['SL', 'Date', 'Inv', 'Doctor', 'Patient Name', 'Investigation', 'Price', 'O.Chrg', 'Paid', 'Dis', 'Due'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-5 bg-yellow-50">
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <AlertCircle size={16} className="text-yellow-500" />
                            No record found. Please try with different search criteria.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.sl} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-medium">{r.sl}</td>
                          <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.date}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">
                              {r.inv}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{r.doctor}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.patientName}</td>
                          <td className="px-4 py-3 text-slate-700">{r.investigation}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{fmt(r.price)}</td>
                          <td className="px-4 py-3 text-slate-600">{fmt(r.oChrg)}</td>
                          <td className="px-4 py-3 text-green-700 font-semibold">{fmt(r.paid)}</td>
                          <td className="px-4 py-3 text-blue-600 font-semibold">{fmt(r.dis)}</td>
                          <td className="px-4 py-3 font-bold text-rose-600">{fmt(r.due)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  {/* Totals row */}
                  <tfoot>
                    <tr className="bg-blue-50 border-t-2 border-blue-200">
                      <td colSpan={6} className="px-4 py-3 text-sm font-bold text-slate-800">Total</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">{fmt(totals.price)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-700">{records.length ? fmt(totals.oChrg) : ''}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-700">{fmt(totals.paid)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">{fmt(totals.dis)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-rose-600">{fmt(totals.due)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Summary cards below table */}
            {records.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 print:hidden">
                {[
                  { label: 'Total Price', value: totals.price, color: 'text-slate-900', bg: 'bg-white' },
                  { label: 'Other Charges', value: totals.oChrg, color: 'text-slate-700', bg: 'bg-white' },
                  { label: 'Total Paid', value: totals.paid, color: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Discount', value: totals.dis, color: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Total Due', value: totals.due, color: 'text-rose-700', bg: 'bg-rose-50' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4`}>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>₹{fmt(s.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { background: white; }
          .bg-gradient-to-br { background: white; }
          .border-b { border-bottom: 1px solid #e2e8f0; }
          .shadow-sm { box-shadow: none; }
        }
      `}</style>
    </div>
  );
};

export default FranchiseLedger;
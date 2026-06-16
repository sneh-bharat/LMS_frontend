'use client';

import { useMemo, useState } from 'react';
import { AlertCircle, ChevronDown, Printer, Search } from 'lucide-react';
import type { FranchiseLedgerRecord } from '../types/accounts.types';
import {
  B2B_OPTIONS,
  SAMPLE_LEDGER_RECORDS,
  calcLedgerTotals,
} from '../constants/franchise-ledger';

const fmt = (n: number) => n.toLocaleString('en-IN', { minimumFractionDigits: 0 });

/** B2B franchise ledger — search by B2B + date range, view and print results. */
export function FranchiseLedgerPage() {
  const [b2b, setB2b] = useState('HO(IP)');
  const [startDate, setStartDate] = useState('2026-03-02');
  const [endDate, setEndDate] = useState('2026-03-02');
  const [showResult, setShowResult] = useState(false);
  const [dateError, setDateError] = useState('');

  const records: FranchiseLedgerRecord[] = SAMPLE_LEDGER_RECORDS[b2b] ?? [];
  const totals = useMemo(() => calcLedgerTotals(records), [records]);

  const validateAndSearch = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 5) return setDateError('Date range should not be more than 5 days');
    if (end < start) return setDateError('End date cannot be before start date');
    setDateError('');
    setShowResult(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900">
                <span className="text-[#FF671F]">Franchise</span> Ledger
              </h1>
              <p className="max-w-2xl text-base text-slate-600">
                View and print B2B franchise ledger records by date range.
              </p>
            </div>
            {showResult && (
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-rose-600 hover:shadow-xl print:hidden"
              >
                <Printer size={18} /> Print
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {!showResult && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-8 py-6">
              <h2 className="text-base font-bold uppercase tracking-wide text-slate-700">Search Criteria</h2>
            </div>
            <div className="space-y-6 px-8 py-8">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Select B2B</label>
                <div className="relative">
                  <select
                    value={b2b}
                    onChange={(e) => setB2b(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {B2B_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Date</label>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setDateError('');
                      setShowResult(false);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-slate-400">–</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setDateError('');
                      setShowResult(false);
                    }}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {dateError ? (
                  <div className="mt-2 flex items-center gap-1.5 text-rose-600">
                    <AlertCircle size={14} />
                    <p className="text-xs font-medium">{dateError}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-500">Date range should not be more than 5 days</p>
                )}
              </div>

              <button
                onClick={validateAndSearch}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                <Search size={18} /> Search Ledger
              </button>
            </div>
          </div>
        )}

        {showResult && (
          <>
            <div className="mb-6 flex items-center justify-between print:hidden">
              <button
                onClick={() => setShowResult(false)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
              >
                ← Back to Search
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
                <span className="font-bold text-slate-900">{b2b}</span>
                <span className="text-slate-400">·</span>
                <span>
                  {startDate} – {endDate}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-100 px-6 py-4">
                <p className="text-sm font-bold text-slate-800">
                  {b2b} ({startDate === endDate ? startDate : `${startDate} – ${endDate}`})
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {['SL', 'Date', 'Inv', 'Doctor', 'Patient Name', 'Investigation', 'Price', 'O.Chrg', 'Paid', 'Dis', 'Due'].map((h) => (
                        <th key={h} className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="bg-yellow-50 px-4 py-5">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <AlertCircle size={16} className="text-yellow-500" />
                            No record found. Please try with different search criteria.
                          </div>
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.sl} className="transition-colors hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-500">{r.sl}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-600">{r.date}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">{r.inv}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{r.doctor}</td>
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{r.patientName}</td>
                          <td className="px-4 py-3 text-slate-700">{r.investigation}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{fmt(r.price)}</td>
                          <td className="px-4 py-3 text-slate-600">{fmt(r.oChrg)}</td>
                          <td className="px-4 py-3 font-semibold text-green-700">{fmt(r.paid)}</td>
                          <td className="px-4 py-3 font-semibold text-blue-600">{fmt(r.dis)}</td>
                          <td className="px-4 py-3 font-bold text-rose-600">{fmt(r.due)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-blue-200 bg-blue-50">
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

            {records.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5 print:hidden">
                {[
                  { label: 'Total Price', value: totals.price, color: 'text-slate-900', bg: 'bg-white' },
                  { label: 'Other Charges', value: totals.oChrg, color: 'text-slate-700', bg: 'bg-white' },
                  { label: 'Total Paid', value: totals.paid, color: 'text-green-700', bg: 'bg-green-50' },
                  { label: 'Discount', value: totals.dis, color: 'text-blue-700', bg: 'bg-blue-50' },
                  { label: 'Total Due', value: totals.due, color: 'text-rose-700', bg: 'bg-rose-50' },
                ].map((s) => (
                  <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4`}>
                    <p className="mb-1 text-xs font-semibold uppercase text-slate-500">{s.label}</p>
                    <p className={`text-xl font-bold ${s.color}`}>₹{fmt(s.value)}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FranchiseLedgerPage;

'use client';

import { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  FileText, 
  Calendar as CalendarIcon, 
  Filter,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import Input from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
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

export default function InvoiceListPage() {
  const [searchBy, setSearchBy] = useState<string>('UHID');
  const [searchText, setSearchText] = useState('');
  const [centre, setCentre] = useState<string>('Select centre');
  const [status, setStatus] = useState<string>('All');

  // Today's date range
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  const dateRange = `${fmt(today)} - ${fmt(today)}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ════════════════════════════════════════════════════════
          ROW 1 — Header & Search
      ════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <FileText size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">List of Invoices</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Manage patient billing and transaction history</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 md:max-w-xl">
            <div className="w-48">
              <Select value={searchBy} onValueChange={(val) => setSearchBy(val || '')}>
                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs font-bold uppercase tracking-wider">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search patient record..."
                className="pl-10 h-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            ROW 2 — Filters
        ════════════════════════════════════════════════════════ */}
        <div className="bg-slate-50/50 p-3 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2">
            <Building2 size={14} className="text-slate-400" />
            <Select value={centre} onValueChange={(v) => setCentre(v || '')}>
              <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent>
                {CENTRE_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 h-9 px-3 border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <CalendarIcon size={14} className="text-slate-400" />
            <span>{dateRange}</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <Select value={status} onValueChange={(v) => setStatus(v || '')}>
              <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            TABLE
        ════════════════════════════════════════════════════════ */}
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-16">#</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Invoice & Patient info</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ref Doctor</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="group hover:bg-slate-50 transition-colors">
                <td colSpan={5} className="px-6 py-20">
                  <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <Search size={32} />
                    </div>
                    <div>
                      <h3 className="text-slate-900 font-bold text-sm mb-1">No record found.</h3>
                      <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                        Please try with <span className="text-emerald-600 font-bold">different search</span> terms or <span className="text-rose-500 font-bold">filter criteria</span>.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
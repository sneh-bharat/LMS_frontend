'use client';

import { FileText, Search, Building2, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Input from '@/components/ui/input';
import { SEARCH_OPTIONS, CENTRE_OPTIONS, STATUS_OPTIONS } from './constants';

export default function InvoiceHeader() {
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  const dateRange = `${fmt(today)} - ${fmt(today)}`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Row 1: Header & Search */}
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">
              Diagnosis & Billing List of Invoices
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              Manage patient billing and transaction history
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 md:max-w-xl">
          <div className="w-48">
            <Select defaultValue="Invoice Barcode">
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                {SEARCH_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-xs font-bold uppercase tracking-wider">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <Input
              placeholder="Type here"
              className="pl-10 h-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Row 2: Filters */}
      <div className="bg-slate-50/50 p-3 flex flex-wrap items-center justify-end gap-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-slate-400" />
          <Select defaultValue="Select centre">
            <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
              <SelectValue placeholder="Centre" />
            </SelectTrigger>
            <SelectContent>
              {CENTRE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">
                  {opt}
                </SelectItem>
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
          <Select defaultValue="All">
            <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

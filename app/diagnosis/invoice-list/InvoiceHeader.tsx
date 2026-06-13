'use client';

import {
  Search,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  STATUS_OPTIONS,
  PROCESSING_TYPE_FILTER_OPTIONS,
  type InvoiceProcessingTypeFilter,
  type InvoiceSearchBy,
  type InvoiceStatusFilter,
} from './constants';

export interface InvoiceFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchBy: InvoiceSearchBy;
  onSearchByChange: (value: InvoiceSearchBy) => void;
  status: InvoiceStatusFilter;
  onStatusChange: (value: InvoiceStatusFilter) => void;
  processingType: InvoiceProcessingTypeFilter;
  onProcessingTypeChange: (value: InvoiceProcessingTypeFilter) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  dateRangeInvalid?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
  flashApiMessage?: string | null;
}

export default function InvoiceFilters({
  search,
  onSearchChange,
  searchBy,
  onSearchByChange,
  status,
  onStatusChange,
  processingType,
  onProcessingTypeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  dateRangeInvalid,
  onRefresh,
  isRefreshing,
  isLoading,
  flashApiMessage,
}: InvoiceFiltersProps) {
  const searchPlaceholder =
    searchBy === 'Order Number'
      ? 'Search by order number…'
      : searchBy === 'Patient Name'
        ? 'Search by patient name…'
        : 'Search by patient name or order number…';

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none"
            size={16}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all"
            disabled={isLoading}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh"
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all disabled:opacity-40 shrink-0"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {/* Row 2, Item 1: Status */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Payment Status
          </label>
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(value as InvoiceStatusFilter)}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 hover:bg-white transition-all font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2, Item 2: Processing Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Order processing type
          </label>
          <Select
            value={processingType}
            onValueChange={(value) => onProcessingTypeChange(value as InvoiceProcessingTypeFilter)}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 hover:bg-white transition-all font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500">
              <SelectValue placeholder="Select order processing type" />
            </SelectTrigger>
            <SelectContent>
              {PROCESSING_TYPE_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2, Item 3: Date Range */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Reception Date Range
          </label>
          <div className={cn(
            "flex items-center gap-2 h-11 px-3 border rounded-xl bg-white/80 shadow-none overflow-hidden transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500",
            dateRangeInvalid ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
          )}>
            <CalendarIcon size={16} className="text-slate-400 shrink-0" aria-hidden />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="bg-transparent text-[11px] font-black text-slate-700 uppercase tracking-wider border-0 p-0 min-w-0 w-full focus:outline-none focus:ring-0"
              aria-label="Start date"
              disabled={isLoading}
              max={endDate || undefined}
            />
            <span className="text-slate-300 font-bold">/</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="bg-transparent text-[11px] font-black text-slate-700 uppercase tracking-wider border-0 p-0 min-w-0 w-full focus:outline-none focus:ring-0"
              aria-label="End date"
              disabled={isLoading}
              min={startDate || undefined}
            />
          </div>
        </div>
      </div>

      {flashApiMessage ? (
        <div className="mx-4 mb-4 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-300">
          {flashApiMessage}
        </div>
      ) : null}
    </div>
  );
}


'use client';

import {
  Search,
  Calendar as CalendarIcon,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SEARCH_OPTIONS,
  SEARCH_TYPE_PLACEHOLDER,
  STATUS_OPTIONS,
  PROCESSING_TYPE_FILTER_OPTIONS,
  type InvoiceProcessingTypeFilter,
  type InvoiceSearchBy,
  type InvoiceSearchType,
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
    searchBy === SEARCH_TYPE_PLACEHOLDER
      ? 'Select type of search first…'
      : searchBy === 'Patient Name'
        ? 'Search by patient name…'
        : 'Search by order number…';

  return (
    <div className="w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white  backdrop-blur-xl p-4 shadow-sm border-t-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Row 1, Item 1: Search Type */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Search Type
          </label>
          <Select
            value={searchBy}
            onValueChange={(value) => onSearchByChange(
              value === SEARCH_TYPE_PLACEHOLDER
                ? SEARCH_TYPE_PLACEHOLDER
                : (value as InvoiceSearchType)
            )}
          >
            <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white/80 hover:bg-white transition-all font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEARCH_TYPE_PLACEHOLDER} disabled>Select Type</SelectItem>
              {SEARCH_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 1, Item 2: Search Input */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
            Search Value
          </label>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={16}
              aria-hidden
            />
            <Input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-11 h-11 rounded-xl border-slate-200 bg-white/80 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 font-bold shadow-none"
              disabled={isLoading}
            />
          </div>
        </div>

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

        {/* Row 2, Item 3: Date Range & Refresh */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Reception Date Range
            </label>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isLoading || isRefreshing}
                className="text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
                title="Refresh list"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
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
        <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-300">
          {flashApiMessage}
        </div>
      ) : null}
    </div>
  );
}


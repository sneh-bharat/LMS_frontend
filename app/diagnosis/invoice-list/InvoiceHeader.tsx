'use client';

import {
  Search,
  Building2,
  Calendar as CalendarIcon,
  Filter,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/button';
import {
  SEARCH_OPTIONS,
  SEARCH_TYPE_PLACEHOLDER,
  SELECT_BRANCH_LABEL,
  STATUS_OPTIONS,
  PROCESSING_TYPE_FILTER_OPTIONS,
  type InvoiceBranchOption,
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
  branchOptions: InvoiceBranchOption[];
  selectedBranchId: number | null;
  onBranchChange: (branchId: number | null) => void;
  isLoadingBranches?: boolean;
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
  branchOptions,
  selectedBranchId,
  onBranchChange,
  isLoadingBranches,
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
      : searchBy === 'Patient ID'
        ? 'Search by patient ID (numeric)…'
        : 'Search by order number…';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
      <div className="relative flex-1 group w-full min-w-0">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
          size={18}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          aria-label="Search invoices"
          disabled={isLoading}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
        <div className="relative flex-1 sm:min-w-[160px] group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          <select
            value={searchBy}
            onChange={(e) => {
              const value = e.target.value;
              onSearchByChange(
                value === SEARCH_TYPE_PLACEHOLDER
                  ? SEARCH_TYPE_PLACEHOLDER
                  : (value as InvoiceSearchType)
              );
            }}
            className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            aria-label="Type of search"
            disabled={isLoading}
          >
            <option value={SEARCH_TYPE_PLACEHOLDER}>Type</option>
            {SEARCH_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        <div className="relative flex-1 sm:min-w-[140px] group">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          <select
            value={selectedBranchId ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              onBranchChange(value === '' ? null : Number.parseInt(value, 10));
            }}
            className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            aria-label="Branch filter"
            disabled={isLoading || isLoadingBranches}
          >
            <option value="">{SELECT_BRANCH_LABEL}</option>
            {branchOptions.map((branch) => (
              <option key={branch.branchId} value={String(branch.branchId)}>
                {branch.branchName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        <div className="relative flex-1 sm:min-w-[140px] group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as InvoiceStatusFilter)}
            className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            aria-label="Invoice status"
            disabled={isLoading}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        <div className="relative flex-1 sm:min-w-[150px] group">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          <select
            value={processingType}
            onChange={(e) => onProcessingTypeChange(e.target.value as InvoiceProcessingTypeFilter)}
            className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            aria-label="Processing type"
            disabled={isLoading}
          >
            {PROCESSING_TYPE_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
        </div>

        <div
          className={`flex items-center gap-2 h-10 px-2 border rounded-lg bg-slate-50 shrink-0 ${
            dateRangeInvalid ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200'
          }`}
          title="Filter orders by date range"
        >
          <CalendarIcon size={14} className="text-slate-400 shrink-0" aria-hidden />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-transparent text-[10px] font-bold text-slate-700 uppercase tracking-wider border-0 p-0 min-w-0 w-[7.5rem] focus:outline-none focus:ring-0"
            aria-label="Start date"
            disabled={isLoading}
            max={endDate || undefined}
          />
          <span className="text-slate-300 text-[10px] font-bold">–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-transparent text-[10px] font-bold text-slate-700 uppercase tracking-wider border-0 p-0 min-w-0 w-[7.5rem] focus:outline-none focus:ring-0"
            aria-label="End date"
            disabled={isLoading}
            min={startDate || undefined}
          />
        </div>

        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200 shrink-0"
            onClick={onRefresh}
            disabled={isLoading || isRefreshing}
            title="Refresh list"
          >
            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          </Button>
        ) : null}
      </div>

      {flashApiMessage ? (
        <span className="text-xs font-medium text-emerald-700 lg:ml-auto shrink-0 animate-in fade-in duration-300">
          {flashApiMessage}
        </span>
      ) : null}
    </div>
  );
}


'use client';

import {
  Search,
  Calendar as CalendarIcon,
  RefreshCw,
  Hash,
  User,
  ClipboardList,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Zap,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SEARCH_OPTIONS,
  SEARCH_TYPE_PLACEHOLDER,
  DEFAULT_PROCESSING_TYPE_FILTER,
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

const SEARCH_TYPE_TABS: {
  value: (typeof SEARCH_OPTIONS)[number];
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'Order Number', label: 'Order #', icon: <Hash size={14} /> },
  { value: 'Patient Name', label: 'Patient', icon: <User size={14} /> },
];

const STATUS_TABS: {
  value: InvoiceStatusFilter;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: 'Order Status',
    label: 'All',
    icon: <ClipboardList size={14} />,
    activeClass: 'bg-slate-800 text-white shadow-sm',
  },
  {
    value: 'PENDING',
    label: 'Pending',
    icon: <Clock size={14} />,
    activeClass: 'bg-amber-600 text-white shadow-sm',
  },
  {
    value: 'IN_PROGRESS',
    label: 'In Progress',
    icon: <Loader2 size={14} />,
    activeClass: 'bg-teal-600 text-white shadow-sm',
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    icon: <CheckCircle2 size={14} />,
    activeClass: 'bg-emerald-600 text-white shadow-sm',
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    icon: <XCircle size={14} />,
    activeClass: 'bg-sky-600 text-white shadow-sm',
  },
];

const PROCESSING_TABS: {
  value: InvoiceProcessingTypeFilter;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    value: 'Order processing type',
    label: 'All',
    icon: <Activity size={14} />,
    activeClass: 'bg-slate-800 text-white shadow-sm',
  },
  {
    value: 'Routine',
    label: 'Routine',
    icon: <ClipboardList size={14} />,
    activeClass: 'bg-teal-600 text-white shadow-sm',
  },
  {
    value: 'Urgent',
    label: 'Urgent',
    icon: <Zap size={14} />,
    activeClass: 'bg-amber-600 text-white shadow-sm',
  },
  {
    value: 'Emergency',
    label: 'Emergency',
    icon: <AlertTriangle size={14} />,
    activeClass: 'bg-rose-600 text-white shadow-sm',
  },
  {
    value: 'Normal',
    label: 'Normal',
    icon: <CheckCircle2 size={14} />,
    activeClass: 'bg-sky-600 text-white shadow-sm',
  },
];

function tabButtonClass(isActive: boolean, activeClass: string) {
  return cn(
    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all',
    isActive ? activeClass : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
  );
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
      ? 'Search by order number (exact match)…'
      : searchBy === 'Patient Name'
        ? 'Search by patient name…'
        : 'Select search type below, then search…';

  const isOrderNumberSearch = searchBy === 'Order Number';
  const isPatientNameSearch = searchBy === 'Patient Name';
  const isStatusFilter = status !== 'Order Status';
  const isProcessingFilter = processingType !== DEFAULT_PROCESSING_TYPE_FILTER;

  const activeSearchLabel =
    isOrderNumberSearch && search.trim()
      ? 'Searching by order number'
      : isPatientNameSearch && search.trim()
        ? 'Searching by patient name'
        : isStatusFilter
          ? `Status: ${status.replace('_', ' ')}`
          : isProcessingFilter
            ? `Processing: ${processingType}`
            : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Top row: search */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors pointer-events-none"
            size={16}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:bg-white transition-all"
            aria-label="Search invoices"
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
            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all disabled:opacity-40 shrink-0"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? 'animate-spin' : ''}
              aria-hidden
            />
          </button>
        )}
      </div>

      {/* Bottom row: filter tabs + date range */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50/60">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
          Search
        </span>

        {SEARCH_TYPE_TABS.map(({ value, label, icon }) => {
          const isActive = searchBy === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                onSearchByChange(isActive ? SEARCH_TYPE_PLACEHOLDER : value);
                if (isActive) onSearchChange('');
              }}
              className={tabButtonClass(
                isActive,
                value === 'Order Number'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-teal-600 text-white shadow-sm'
              )}
            >
              {icon}
              {label}
            </button>
          );
        })}

        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
          Status
        </span>

        {STATUS_TABS.map(({ value, label, icon, activeClass }) => (
          <button
            key={value}
            type="button"
            onClick={() => onStatusChange(value)}
            className={tabButtonClass(status === value, activeClass)}
          >
            {icon}
            {label}
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
          Type
        </span>

        {PROCESSING_TABS.map(({ value, label, icon, activeClass }) => (
          <button
            key={value}
            type="button"
            onClick={() => onProcessingTypeChange(value)}
            className={tabButtonClass(processingType === value, activeClass)}
          >
            {icon}
            {label}
          </button>
        ))}

        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        <div
          className={cn(
            'inline-flex items-center gap-2 h-8 px-2.5 rounded-lg border bg-white text-[11px] font-bold uppercase tracking-wide transition-all',
            dateRangeInvalid
              ? 'border-rose-400 bg-rose-50/40'
              : 'border-slate-200 hover:border-slate-300'
          )}
        >
          <CalendarIcon size={13} className="text-slate-400 shrink-0" aria-hidden />
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-transparent text-slate-700 border-0 p-0 min-w-0 w-[7.5rem] focus:outline-none focus:ring-0"
            aria-label="Start date"
            disabled={isLoading}
            max={endDate || undefined}
          />
          <span className="text-slate-300">/</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-transparent text-slate-700 border-0 p-0 min-w-0 w-[7.5rem] focus:outline-none focus:ring-0"
            aria-label="End date"
            disabled={isLoading}
            min={startDate || undefined}
          />
        </div>

        {activeSearchLabel && (
          <span className="ml-auto text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-3 py-1 rounded-lg">
            {activeSearchLabel}
          </span>
        )}
      </div>

      {flashApiMessage ? (
        <div className="mx-4 mb-4 px-4 py-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-300">
          {flashApiMessage}
        </div>
      ) : null}
    </div>
  );
}

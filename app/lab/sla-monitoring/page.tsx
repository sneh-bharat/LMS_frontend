'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  AlertCircle,
  Eye,
  Loader2,
  Shield,
  Timer,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { useSlaMonitoring } from '@/app/Apis/SlaManagement/useSlaMonitoring';
import type { SlaMonitoringRecord, SlaPriority, SlaStatus } from '@/app/Apis/SlaManagement/SlamonitoringApi';

const PAGE_SIZE = 10;
const STATUS_FILTERS: Array<'All' | SlaStatus> = ['All', 'ON_TRACK', 'NEAR_BREACH', 'BREACHED'];
const PRIORITY_FILTERS: Array<'All' | SlaPriority> = ['All', 'ROUTINE', 'URGENT', 'STAT', 'NORMAL'];

function PriorityBadge({ priority }: { priority: SlaPriority }) {
  const tone =
    priority === 'STAT' || priority === 'URGENT'
      ? 'bg-[#FEECEC] text-rose-700'
      : priority === 'NORMAL'
        ? 'bg-sky-50 text-sky-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <Badge variant="secondary" className={`px-2.5 py-1 text-[10px] font-bold border-0 ${tone}`}>
      {priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: SlaStatus }) {
  const config = {
    ON_TRACK: { variant: 'success' as const, icon: <CheckCircle size={10} />, label: 'On Track' },
    NEAR_BREACH: { variant: 'warning' as const, icon: <Clock size={10} />, label: 'Near Breach' },
    BREACHED: { variant: 'danger' as const, icon: <XCircle size={10} />, label: 'Breached' },
  };
  const { variant, icon, label } = config[status];

  return (
    <Badge variant={variant} className="gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase">
      {icon}
      {label}
    </Badge>
  );
}

function formatRemainingMinutes(minutes: number): string {
  if (minutes < 0) {
    const overdue = Math.abs(minutes);
    if (overdue >= 60) {
      const hours = Math.floor(overdue / 60);
      const mins = overdue % 60;
      return mins > 0 ? `-${hours}h ${mins}m` : `-${hours}h`;
    }
    return `-${overdue}m`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function formatDateTime(value: string): string {
  if (!value || value === '—') return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function SlaMonitoringPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | SlaStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | SlaPriority>('All');
  const [pageNo, setPageNo] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SlaMonitoringRecord | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useSlaMonitoring();
  const records: SlaMonitoringRecord[] = data?.data ?? [];
  const isRefreshing = isFetching && !isLoading;
  const errorMessage = error?.message ?? 'Failed to load SLA monitoring data.';

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      void refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  useEffect(() => {
    setPageNo(0);
  }, [search, statusFilter, priorityFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((row) => {
      const matchesSearch =
        !q ||
        row.sampleId.toLowerCase().includes(q) ||
        row.patientName.toLowerCase().includes(q) ||
        row.testName.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || row.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [records, search, statusFilter, priorityFilter]);

  const stats = useMemo(
    () => ({
      total: records.length,
      onTrack: records.filter((r) => r.status === 'ON_TRACK').length,
      nearBreach: records.filter((r) => r.status === 'NEAR_BREACH').length,
      breached: records.filter((r) => r.status === 'BREACHED').length,
    }),
    [records]
  );

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const pageRows = filtered.slice(pageNo * PAGE_SIZE, pageNo * PAGE_SIZE + PAGE_SIZE);

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(result.error?.message ?? errorMessage);
    }
  };

  const statCards = [
    { label: 'Total Samples', value: stats.total, icon: Activity, tone: 'text-[#006D77]', bg: 'bg-teal-50' },
    { label: 'On Track', value: stats.onTrack, icon: CheckCircle, tone: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Near Breach', value: stats.nearBreach, icon: Clock, tone: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Breached', value: stats.breached, icon: XCircle, tone: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#006D77] flex items-center justify-center text-white shadow-lg shadow-teal-200 shrink-0">
            <Activity size={18} className="sm:hidden" />
            <Activity size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1 leading-tight">
              <span className="text-[#006D77]">SLA</span>{' '}
              <span className="text-[#FF671F]">Monitoring</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl">
              Live tracking of sample turnaround times — monitor on-track, near-breach, and breached SLAs.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
          <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <RefreshCcw
              size={14}
              className={`text-slate-500 ${autoRefresh && isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className="text-xs font-bold text-slate-600">
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </span>
            <button
              type="button"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="text-[10px] font-bold text-[#006D77] hover:text-[#005a63] uppercase tracking-wider"
            >
              Toggle
            </button>
          </div>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-6 font-bold"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
          >
            <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.tone} />
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${card.tone}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Control bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 group w-full min-w-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by sample ID, patient, test..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-[9rem] lg:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | SlaStatus)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status === 'All'
                    ? 'All statuses'
                    : status === 'ON_TRACK'
                      ? 'On Track'
                      : status === 'NEAR_BREACH'
                        ? 'Near Breach'
                        : 'Breached'}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
          <div className="relative flex-1 sm:min-w-[9rem] lg:w-40">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as 'All' | SlaPriority)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {PRIORITY_FILTERS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority === 'All' ? 'All priorities' : priority}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">{errorMessage}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto font-bold"
            onClick={() => void handleRefresh()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="px-4 sm:px-6 py-16 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#006D77]" />
              <span className="text-sm font-semibold">Loading SLA monitoring data…</span>
            </div>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="px-4 sm:px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                <Activity size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 tracking-tight">No SLA records found</p>
                <p className="text-xs font-medium text-slate-400">
                  {records.length === 0
                    ? 'No samples are currently being tracked for SLA compliance.'
                    : 'Try adjusting your search or filters.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {pageRows.map((row) => (
                <div key={row.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <StatusBadge status={row.status} />
                        <PriorityBadge priority={row.priority} />
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{row.sampleId}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{row.patientName}</p>
                      <p className="text-xs text-slate-600 mt-1 font-medium">{row.testName}</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Due</p>
                          <p className="font-bold text-slate-800 mt-0.5">{formatDateTime(row.dueAt)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Remaining</p>
                          <p
                            className={`font-bold mt-0.5 font-mono ${
                              row.remainingMinutes < 0
                                ? 'text-rose-600'
                                : row.status === 'NEAR_BREACH'
                                  ? 'text-amber-600'
                                  : 'text-emerald-600'
                            }`}
                          >
                            {formatRemainingMinutes(row.remainingMinutes)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(row)}
                      className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-[#006D77]"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Sample ID
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Patient
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Test
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Received
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Due
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Remaining
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 lg:px-6 py-4">
                        <span className="text-sm font-bold text-slate-900">{row.sampleId}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-700 max-w-[140px]">
                        <span className="block truncate">{row.patientName}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-slate-600 max-w-[160px]">
                        <span className="block truncate">{row.testName}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <PriorityBadge priority={row.priority} />
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span className="font-medium whitespace-nowrap">{formatDateTime(row.receivedAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Timer size={13} className="text-slate-400 shrink-0" />
                          <span className="font-medium whitespace-nowrap">{formatDateTime(row.dueAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`text-sm font-bold font-mono ${
                            row.remainingMinutes < 0
                              ? 'text-rose-600'
                              : row.status === 'NEAR_BREACH'
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                          }`}
                        >
                          {formatRemainingMinutes(row.remainingMinutes)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRecord(row)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-[#006D77]"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoading && filtered.length > 0 ? (
          <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>
                Showing {pageRows.length} of {totalElements} records
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
              <span className="text-[#FF671F] hidden sm:inline">Live SLA Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-1 text-[10px] font-bold"
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                disabled={pageNo === 0}
              >
                Prev
              </Button>
              <span className="px-4 py-1 text-xs font-bold text-slate-600">
                Page {pageNo + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-1 text-[10px] font-bold"
                onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
                disabled={pageNo + 1 >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Detail modal */}
      {selectedRecord ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-200">
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900">SLA Details</h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{selectedRecord.sampleId}</p>
              </div>
              <StatusBadge status={selectedRecord.status} />
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Patient</p>
                  <p className="font-bold text-slate-900 mt-1">{selectedRecord.patientName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</p>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedRecord.priority} />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test</p>
                <p className="font-bold text-slate-900 mt-1">{selectedRecord.testName}</p>
              </div>
              <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Received At</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">
                    {formatDateTime(selectedRecord.receivedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due At</p>
                  <p className="font-semibold text-slate-800 text-sm mt-1">
                    {formatDateTime(selectedRecord.dueAt)}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div
                  className={`rounded-xl p-4 border ${
                    selectedRecord.status === 'BREACHED'
                      ? 'bg-rose-50 border-rose-200'
                      : selectedRecord.status === 'NEAR_BREACH'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Timer
                      size={18}
                      className={
                        selectedRecord.status === 'BREACHED'
                          ? 'text-rose-600'
                          : selectedRecord.status === 'NEAR_BREACH'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                      }
                    />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Time Remaining
                      </p>
                      <p
                        className={`text-lg font-black font-mono ${
                          selectedRecord.remainingMinutes < 0
                            ? 'text-rose-600'
                            : selectedRecord.status === 'NEAR_BREACH'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                        }`}
                      >
                        {formatRemainingMinutes(selectedRecord.remainingMinutes)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
              <Button
                type="button"
                variant="gradient"
                className="w-full font-bold"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

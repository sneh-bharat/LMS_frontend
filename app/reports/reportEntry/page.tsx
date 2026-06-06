'use client';

/**
 * Result Entry — listing page.
 * Matches the Referring Doctors directory layout / theme.
 * List data: GET `/api/v1/result-entry` (paginated).
 */
import { useMemo, useState } from 'react';
import {
  FlaskConical,
  Search,
  Filter,
  ChevronDown,
  Phone,
  Loader,
  RefreshCw,
  Database,
  AlertCircle,
  Eye,
  Printer,
  ClipboardEdit,
  CheckCircle2,
  MoreHorizontal,
  UserPlus,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResultStatus = 'PENDING' | 'COMPLETED' | 'VERIFIED';

export interface ResultEntry {
  id: number;
  patientId: string;        // e.g. "P1001"
  patientName: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  mobile: string;
  testName: string;
  sampleType: string;       // e.g. "Blood", "Serum", "Urine"
  collectionDate: string;   // display string e.g. "03-Jun-26"
  status: ResultStatus;
  branchName?: string;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ResultStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  VERIFIED: 'Verified',
};

const STATUS_CLASS: Record<ResultStatus, string> = {
  PENDING:
    'bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold',
  COMPLETED:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold',
  VERIFIED:
    'bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold',
};

// ─── Row Actions ─────────────────────────────────────────────────────────────

function ResultActions({
  row,
  onView,
  onEnter,
  onEdit,
  onVerify,
  onPrint,
}: {
  row: ResultEntry;
  onView: (row: ResultEntry) => void;
  onEnter: (row: ResultEntry) => void;
  onEdit: (row: ResultEntry) => void;
  onVerify: (row: ResultEntry) => void;
  onPrint: (row: ResultEntry) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Result actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-52 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        {/* View — always visible */}
        <DropdownMenuItem
          onClick={() => onView(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View Result
        </DropdownMenuItem>

        {/* Enter — only for PENDING */}
        {row.status === 'PENDING' && (
          <DropdownMenuItem
            onClick={() => onEnter(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
          >
            <ClipboardEdit size={14} />
            Enter Result
          </DropdownMenuItem>
        )}

        {/* Edit — for COMPLETED */}
        {row.status === 'COMPLETED' && (
          <DropdownMenuItem
            onClick={() => onEdit(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-sky-600 focus:bg-sky-50 focus:text-sky-700"
          >
            <ClipboardEdit size={14} />
            Edit Result
          </DropdownMenuItem>
        )}

        {/* Verify — for COMPLETED */}
        {row.status === 'COMPLETED' && (
          <DropdownMenuItem
            onClick={() => onVerify(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-violet-600 focus:bg-violet-50 focus:text-violet-700"
          >
            <CheckCircle2 size={14} />
            Verify
          </DropdownMenuItem>
        )}

        {/* Print — for COMPLETED + VERIFIED */}
        {(row.status === 'COMPLETED' || row.status === 'VERIFIED') && (
          <DropdownMenuItem
            onClick={() => onPrint(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700"
          >
            <Printer size={14} />
            Print Report
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Mock data (replace with real API hook) ───────────────────────────────────

const MOCK_ROWS: ResultEntry[] = [
  {
    id: 1, patientId: 'P1001', patientName: 'John Doe',    gender: 'Male',   age: 35, mobile: '9876543210',
    testName: 'CBC',           sampleType: 'Blood', collectionDate: '03-Jun-26', status: 'PENDING',
  },
  {
    id: 2, patientId: 'P1002', patientName: 'Sarah Smith',  gender: 'Female', age: 28, mobile: '9712345678',
    testName: 'Lipid Profile', sampleType: 'Blood', collectionDate: '03-Jun-26', status: 'COMPLETED',
  },
  {
    id: 3, patientId: 'P1003', patientName: 'Mike Roy',    gender: 'Male',   age: 42, mobile: '9823456789',
    testName: 'LFT',           sampleType: 'Serum', collectionDate: '03-Jun-26', status: 'VERIFIED',
  },
  {
    id: 4, patientId: 'P1004', patientName: 'Anita Sharma', gender: 'Female', age: 31, mobile: '9934567890',
    testName: 'RFT',           sampleType: 'Blood', collectionDate: '03-Jun-26', status: 'PENDING',
  },
  {
    id: 5, patientId: 'P1005', patientName: 'Ravi Kumar',  gender: 'Male',   age: 55, mobile: '9645678901',
    testName: 'Urine R/E',     sampleType: 'Urine', collectionDate: '03-Jun-26', status: 'COMPLETED',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ResultEntryPage() {
  // ── pagination / filter state ──────────────────────────────────────────────
  const [pageNo, setPageNo]       = useState(0);
  const [searchBy, setSearchBy]   = useState<'Name' | 'Mobile'>('Name');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResultStatus | 'ALL'>('ALL');

  // ── drawer / dialog state ──────────────────────────────────────────────────
  // Replace `null` with your actual drawer/modal state types as needed.
  const [viewRow,   setViewRow]   = useState<ResultEntry | null>(null);
  const [enterRow,  setEnterRow]  = useState<ResultEntry | null>(null);
  const [editRow,   setEditRow]   = useState<ResultEntry | null>(null);



  const isLoading   = false;
  const isFetching  = false;
  const isError     = false;
  const error: Error | null = null;
  const refetch     = () => toast.info('Refreshed');

  const rows          = MOCK_ROWS;
  const totalPages    = 1;
  const totalElements = MOCK_ROWS.length;
  const canPrev       = pageNo > 0;
  const canNext       = pageNo + 1 < totalPages;

  // ── client-side filter ────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSearch =
        !t ||
        (searchBy === 'Mobile'
          ? r.mobile.includes(t)
          : r.patientName.toLowerCase().includes(t) ||
            r.patientId.toLowerCase().includes(t));
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, searchText, searchBy, statusFilter]);

  // ── action handlers ───────────────────────────────────────────────────────
  const handleView   = (row: ResultEntry) => setViewRow(row);
  const handleEnter  = (row: ResultEntry) => setEnterRow(row);
  const handleEdit   = (row: ResultEntry) => setEditRow(row);
  const handleVerify = (row: ResultEntry) => toast.success(`Verified: ${row.patientName} — ${row.testName}`);
  const handlePrint  = (row: ResultEntry) => toast.info(`Printing report for ${row.patientName}`);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Result <span className="text-emerald-600">Entry</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Enter, review and verify diagnostic lab results for registered patients.
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-4">

        {/* Search input */}
        <div className="relative flex-1 group w-full min-w-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
            aria-hidden
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={searchBy === 'Mobile' ? 'Search by mobile…' : 'Search by patient name or ID…'}
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search results"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          {/* Status filter */}
          <div className="relative flex-1 sm:min-w-[150px] group">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ResultStatus | 'ALL');
                setPageNo(0);
              }}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Filter by status"
              disabled={isLoading}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>

          {/* Refresh */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200 shrink-0"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            title="Refresh list"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto font-bold"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="text-slate-400 animate-spin" size={32} />
          <p className="text-slate-600 font-medium">Loading result entries…</p>
        </div>

      /* ── Empty ── */
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium">
          No result entries found for this filter or page.
        </div>

      /* ── Table ── */
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-14">
                    #
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Patient Info
                  </th>
                
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Test Details
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Collection Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-slate-500 font-medium text-sm"
                    >
                      No matches on this page for your search. Clear search or change page.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-6 py-5 text-center">
                        <Badge
                          variant="secondary"
                          className="px-2 py-0.5 border-slate-200 text-[10px] font-bold font-mono"
                        >
                          {row.id}
                        </Badge>
                      </td>

                      {/* Patient Info */}
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                            <FlaskConical size={18} aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                              {row.patientName}
                              <span className="font-semibold text-slate-400 ml-2 text-xs">
                                {row.gender}, {row.age} yrs
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              PID: {row.patientId}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs mt-1">
                              <Phone size={12} className="text-emerald-500 shrink-0" aria-hidden />
                              {row.mobile}
                            </div>  
                            
                          </div>
                        </div>
                      </td>

                      {/* Test Details */}
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-900 text-sm tracking-tight">
                          {row.testName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Sample: {row.sampleType}
                        </div>
                      </td>

                      {/* Collection Date */}
                      <td className="px-6 py-5 text-center text-xs font-mono font-bold text-slate-600">
                        {row.collectionDate}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 text-center">
                        <Badge className={STATUS_CLASS[row.status]}>
                          {STATUS_LABEL[row.status]}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-center">
                        <ResultActions
                          row={row}
                          onView={handleView}
                          onEnter={handleEnter}
                          onEdit={handleEdit}
                          onVerify={handleVerify}
                          onPrint={handlePrint}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination footer ── */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
              <span>
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
                <span className="text-slate-400 mx-2">·</span>
                {totalElements} total
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200"
                disabled={!canPrev || isFetching}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200"
                disabled={!canNext || isFetching}
                onClick={() => setPageNo((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
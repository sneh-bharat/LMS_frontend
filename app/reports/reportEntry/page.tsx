'use client'

/**
 * Result Entry — listing page.
 * Matches the Referring Doctors directory layout / theme.
 * List data: GET `/api/v1/result-entry` (paginated).
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import Button from '@/components/ui/button'
import Badge from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  fetchReportList,
  type ResultListApiResponse
} from '@/app/Apis/Report/reportApi'
import EnterResultDrawer from './reportEntry'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResultStatus = 'PENDING' | 'DRAFT' | 'COMPLETED' | 'VERIFIED'

export interface ResultEntry {
  id: number
  orderId: number
  orderNumber: string
  orderItemId: number
  testId: number
  patientId: string
  patientName: string
  gender: string
  age: number
  mobile: string
  // grouped tests
  tests: {
    orderItemId: number
    testId: number
    testName: string
    testCode: string
    testNameShort: string
    sampleType: string
    isCritical: boolean
    remarks: string | null
    resultStatus: ResultStatus
  }[]
  // legacy flat fields (keep for actions/drawer compat, derived from first test)
  testName: string
  testCode: string
  testNameShort: string
  sampleType: string
  collectionDate: string
  collectionTime: string
  priority: string
  isEmergency: boolean
  status: ResultStatus
  branchName?: string
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ResultStatus, string> = {
  PENDING: 'Pending',
  DRAFT: 'Draft',
  COMPLETED: 'Completed',
  VERIFIED: 'Verified'
}

const STATUS_CLASS: Record<ResultStatus, string> = {
  PENDING:
    'bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold',
  DRAFT:
    'bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold',
  COMPLETED:
    'bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold',
  VERIFIED: 'bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold'
}

// ─── Status normaliser ────────────────────────────────────────────────────────

function normalizeStatus (raw: string): ResultStatus {
  const upper = (raw || '').toUpperCase()
  if (upper === 'COMPLETED' || upper === 'VERIFIED' || upper === 'DRAFT')
    return upper as ResultStatus
  return 'PENDING' // default fallback
}

// ─── Row Actions ─────────────────────────────────────────────────────────────
function ResultActions ({
  row,
  onView,
  onEnter,
  onEdit,
  onVerify,
  onPrint
}: {
  row: ResultEntry
  onView: (row: ResultEntry) => void
  onEnter: (row: ResultEntry, test: ResultEntry['tests'][number]) => void
  onEdit: (row: ResultEntry) => void
  onVerify: (row: ResultEntry) => void
  onPrint: (row: ResultEntry) => void
}) {
  const hasPending   = row.tests.some(t => t.resultStatus === 'PENDING' || t.resultStatus === 'DRAFT')
  const hasCompleted = row.tests.some(t => t.resultStatus === 'COMPLETED')
  const allVerified  = row.tests.every(t => t.resultStatus === 'VERIFIED')
  const canPrint     = row.tests.some(t => t.resultStatus === 'COMPLETED' || t.resultStatus === 'VERIFIED')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type='button'
            className='p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600'
            aria-label='Result actions'
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align='end'
        className='min-w-52 p-1.5 rounded-2xl border-slate-100 shadow-2xl'
      >
        {/* View — always visible */}
        <DropdownMenuItem
          onClick={() => onView(row)}
          className='rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700'
        >
          <Eye size={14} />
          View Result
        </DropdownMenuItem>

        {/* Enter — show each PENDING/DRAFT test as a sub-item */}
        {hasPending && row.tests
          .filter(t => t.resultStatus === 'PENDING' || t.resultStatus === 'DRAFT')
          .map((t) => (
            <DropdownMenuItem
              key={t.orderItemId}
              onClick={() => onEnter(row, t)}
              className='rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700'
            >
              <ClipboardEdit size={14} />
              Enter: {t.testNameShort || t.testName}
            </DropdownMenuItem>
          ))
        }

        {/* Edit — any test is COMPLETED */}
        {hasCompleted && (
          <DropdownMenuItem
            onClick={() => onEdit(row)}
            className='rounded-lg py-2.5 text-xs font-black uppercase text-sky-600 focus:bg-sky-50 focus:text-sky-700'
          >
            <ClipboardEdit size={14} />
            Edit Result
          </DropdownMenuItem>
        )}

        {/* Verify — any COMPLETED, not all VERIFIED yet */}
        {hasCompleted && !allVerified && (
          <DropdownMenuItem
            onClick={() => onVerify(row)}
            className='rounded-lg py-2.5 text-xs font-black uppercase text-violet-600 focus:bg-violet-50 focus:text-violet-700'
          >
            <CheckCircle2 size={14} />
            Verify
          </DropdownMenuItem>
        )}

        {/* Print — any COMPLETED or VERIFIED */}
        {canPrint && (
          <DropdownMenuItem
            onClick={() => onPrint(row)}
            className='rounded-lg py-2.5 text-xs font-black uppercase text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700'
          >
            <Printer size={14} />
            Print Report
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export default function ResultEntryPage () {
  // ── pagination / filter state ──────────────────────────────────────────────
  const [pageNo, setPageNo] = useState(0)
  const [searchBy, setSearchBy] = useState<'Name' | 'Mobile'>('Name')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<ResultStatus | 'ALL'>('ALL')

  // ── drawer / dialog state ──────────────────────────────────────────────────
 
  const [viewRow, setViewRow] = useState<ResultEntry | null>(null)
  const [enterRow, setEnterRow] = useState<ResultEntry | null>(null)
  const [enterTest, setEnterTest] = useState<ResultEntry['tests'][number] | null>(null)
  const [editRow, setEditRow] = useState<ResultEntry | null>(null)


  // ── API query ──────────────────────────────────────────────────────────────
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch
  } = useQuery<ResultListApiResponse>({
    queryKey: ['report-result-list', pageNo, PAGE_SIZE],
    queryFn: () => fetchReportList({ pageNo, pageSize: PAGE_SIZE }),
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false
  })

 
  // ── map API response to ResultEntry[] (one row per order, tests grouped) ──
const rows: ResultEntry[] = useMemo(() => {
   const page = apiResponse?.data
  const content = apiResponse?.data?.content ?? []
  return content.map((item: any) => ({
    id: item.orderId ?? 0,
    orderId: item.orderId ?? 0,
    orderNumber: item.orderNumber ?? '',
    orderItemId: 0, // not applicable at order level
    testId: 0,      // not applicable at order level
    patientId: item.patientCode ?? `ID-${item.patientId ?? 0}`,
    patientName: item.patientName ?? '',
    gender:
      (item.gender ?? 'OTHER').charAt(0).toUpperCase() +
      (item.gender ?? 'other').slice(1).toLowerCase(),
    age: item.age ?? 0,
    mobile: item.mobile ?? item.phone ?? '',
    // Keep all tests as-is for rendering
    tests: (Array.isArray(item.tests) ? item.tests : []).map((t: any) => ({
      orderItemId: t.orderItemId ?? 0,
      testId: t.testId ?? 0,
      testName: t.testName ?? '',
      testCode: t.testCode ?? '',
      testNameShort: t.testNameShort ?? '',
      sampleType: t.vialType ?? '',
      isCritical: t.isCritical ?? false,
      remarks: t.remarks ?? null,
      resultStatus: normalizeStatus(t.resultStatus ?? ''),
    })),
    // Derive overall row status from tests
    status: normalizeStatus(
      (() => {
        const statuses = (item.tests ?? []).map((t: any) => t.resultStatus ?? '')
        if (statuses.every((s: string) => s === 'VERIFIED')) return 'VERIFIED'
        if (statuses.every((s: string) => s === 'COMPLETED' || s === 'VERIFIED')) return 'COMPLETED'
        if (statuses.some((s: string) => s === 'DRAFT')) return 'DRAFT'
        return item.orderStatus ?? 'PENDING'
      })()
    ),
    collectionDate: item.collectionDate ?? '',
    collectionTime: item.collectionTime ?? '',
    priority: item.priority ?? 'ROUTINE',
    isEmergency: item.isEmergency ?? false,
    branchName: item.branchName,
    sampleType: '',
    testName: '',
    testCode: '',
    testNameShort: '',
  }))
}, [apiResponse])

  const totalPages = apiResponse?.data?.totalPages ?? 1
  const totalElements = apiResponse?.data?.totalElements ?? 0
  const canPrev = pageNo > 0
  const canNext = pageNo + 1 < totalPages

  // ── client-side filter ────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const t = searchText.trim().toLowerCase()
    return rows.filter(r => {
      const matchSearch =
        !t ||
        (searchBy === 'Mobile'
          ? r.mobile.includes(t)
          : r.patientName.toLowerCase().includes(t) ||
            r.patientId.toLowerCase().includes(t))
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [rows, searchText, searchBy, statusFilter])

  // ── action handlers ───────────────────────────────────────────────────────
  const handleView = (row: ResultEntry) => setViewRow(row)
  const handleEnter = (row: ResultEntry, test: ResultEntry['tests'][number]) => {
    setEnterRow(row)
    setEnterTest(test)
  }
  const handleEdit = (row: ResultEntry) => setEditRow(row)
  const handleVerify = (row: ResultEntry) =>
    toast.success(`Verified: ${row.patientName} — ${row.testName}`)
  const handlePrint = (row: ResultEntry) =>
  toast.info(`Printing report for ${row.patientName}`)
  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      {/* ── Header ── */}
      <div className='flex flex-col xl:flex-row xl:items-center justify-between gap-6'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900 tracking-tight mb-1'>
            Result <span className='text-emerald-600'>Entry</span>
          </h1>
          <p className='text-slate-500 text-sm font-medium max-w-xl'>
            Enter, review and verify diagnostic lab results for registered
            patients.
          </p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className='bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-4'>
        {/* Search input */}
        <div className='relative flex-1 group w-full min-w-0'>
          <Search
            className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors'
            size={18}
            aria-hidden
          />
          <input
            type='search'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder={
              searchBy === 'Mobile'
                ? 'Search by mobile…'
                : 'Search by patient name or ID…'
            }
            className='input-refined w-full py-2.5 pl-12 pr-4 font-bold'
            aria-label='Search results'
            disabled={isLoading}
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0'>
          {/* Status filter */}
          <div className='relative flex-1 sm:min-w-[150px] group'>
            <Calendar
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
              size={14}
            />
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as ResultStatus | 'ALL')
                setPageNo(0)
              }}
              className='input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none'
              aria-label='Filter by status'
              disabled={isLoading}
            >
              <option value='ALL'>All Status</option>
              <option value='PENDING'>Pending</option>
              <option value='COMPLETED'>Completed</option>
              <option value='VERIFIED'>Verified</option>
            </select>
            <ChevronDown
              className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none'
              size={14}
            />
          </div>

          {/* Refresh */}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-lg p-2.5 border-slate-200 shrink-0'
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            title='Refresh list'
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {isError && (
        <div className='bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800'>
          <AlertCircle size={18} className='shrink-0' aria-hidden />
          <span>
            {(error as any)?.message ?? 'Failed to load result entries.'}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='ml-auto font-bold'
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Loading ── */}
      {isLoading ? (
        <div className='bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4'>
          <Loader className='text-slate-400 animate-spin' size={32} />
          <p className='text-slate-600 font-medium'>Loading result entries…</p>
        </div>
      ) : /* ── Empty ── */
      rows.length === 0 ? (
        <div className='bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium'>
          No result entries found for this filter or page.
        </div>
      ) : (
        /* ── Table ── */
        <div className='bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-slate-50 border-b border-slate-200'>
                  <th className='px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-14'>
                    #
                  </th>
                  <th className='px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
                    Patient Info
                  </th>

                  <th className='px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
                    Test Details
                  </th>
                  <th className='px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center'>
                    Collection Date
                  </th>
                  <th className='px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center'>
                    Status
                  </th>
                  <th className='px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center'>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-slate-100'>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className='px-6 py-10 text-center text-slate-500 font-medium text-sm'
                    >
                      No matches on this page for your search. Clear search or
                      change page.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => (
                    <tr
                      key={`${row.patientId}-${row.testName}-${index}`}
                      className='hover:bg-slate-50 transition-colors group'
                    >
                      {/* # */}
                      <td className='px-6 py-5 text-center'>
                        <Badge
                          variant='secondary'
                          className='px-2 py-0.5 border-slate-200 text-[10px] font-bold font-mono'
                        >
                          {pageNo * PAGE_SIZE + index + 1}
                        </Badge>
                      </td>

                      {/* Patient Info */}
                      <td className='px-6 py-5'>
                        <div className='flex items-start gap-3'>
                          <div className='w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0'>
                            <FlaskConical size={18} aria-hidden />
                          </div>
                          <div className='min-w-0'>
                            <div className='font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors'>
                              {row.patientName}
                              <span className='font-semibold text-slate-400 ml-2 text-xs'>
                                {row.gender}, {row.age} yrs
                              </span>
                            </div>
                            <div className='text-[11px] text-slate-400 font-mono mt-0.5'>
                              PID: {row.patientId}
                            </div>
                            {/* Patient Info — replace the phone row */}
                            <div className='flex items-center gap-1.5 mt-1'>
                              <Badge className='text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 border-slate-200'>
                                {row.orderNumber}
                              </Badge>
                              {row.isEmergency && (
                                <Badge className='text-[9px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 border-red-200'>
                                  EMERGENCY
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                     {/* Test Details */}
                            <td className="px-6 py-5">
                              <div className="flex flex-col gap-2.5">
                                {row.tests.map((t, i) => (
                                  <div key={t.orderItemId} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                                        {t.testName}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <span className="text-[10px] font-mono text-slate-400">{t.testCode}</span>
                                        <Badge className={STATUS_CLASS[t.resultStatus]}>
                                          {STATUS_LABEL[t.resultStatus]}
                                        </Badge>
                                        {t.isCritical && (
                                          <Badge className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold">
                                            CRITICAL
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>

                      {/* Collection Date */}
                      <td className='px-6 py-5 text-center text-xs font-mono font-bold text-slate-600'>
                        {row.collectionDate}
                      </td>

                      {/* Status */}
                      <td className='px-6 py-5 text-center'>
                        <Badge className={STATUS_CLASS[row.status]}>
                          {STATUS_LABEL[row.status]}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className='px-6 py-5 text-center'>
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
          <div className='bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='flex items-center gap-2 text-xs text-slate-500 font-medium'>
              <Database
                size={14}
                className='text-emerald-600 shrink-0'
                aria-hidden
              />
              <span>
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
                <span className='text-slate-400 mx-2'>·</span>
                {totalElements} total
              </span>
            </div>
            <div className='flex items-center gap-2 justify-end'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='font-bold border-slate-200'
                disabled={!canPrev || isFetching}
                onClick={() => setPageNo(p => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                className='font-bold border-slate-200'
                disabled={!canNext || isFetching}
                onClick={() => setPageNo(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Enter Result Drawer ── */}
      <EnterResultDrawer
        isOpen={!!enterRow}
        onClose={() => { setEnterRow(null); setEnterTest(null) }}
        row={enterRow}
        selectedTest={enterTest}
      />
    </div>
  )
}

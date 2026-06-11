"use client";

/**
 * Result Entry — redesigned listing page.
 * Card-based layout: each order is a card with a compact test pill row.
 */
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FlaskConical,
  Search,
  Loader,
  RefreshCw,
  Database,
  AlertCircle,
  Eye,
  Printer,
  ClipboardEdit,
  CheckCircle2,
  MoreHorizontal,
  Calendar,
  ChevronDown,
  Zap,
  User,
  TestTube2,
  BadgeAlert,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  fetchReportList,
  type ResultListApiResponse,
} from "@/app/Apis/Report/reportApi";
import EnterResultDrawer from "./reportEntry";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResultStatus = "PENDING" | "DRAFT" | "COMPLETED" | "VERIFIED";

export interface ResultEntry {
  id: number;
  orderId: number;
  orderNumber: string;
  orderItemId: number;
  testId: number;
  patientId: string;
  patientName: string;
  gender: string;
  age: number;
  mobile: string;
  tests: {
    orderItemId: number;
    testId: number;
    testName: string;
    testCode: string;
    testNameShort: string;
    sampleType: string;
    isCritical: boolean;
    remarks: string | null;
    resultStatus: ResultStatus;
  }[];
  testName: string;
  testCode: string;
  testNameShort: string;
  sampleType: string;
  collectionDate: string;
  collectionTime: string;
  priority: string;
  isEmergency: boolean;
  status: ResultStatus;
  branchName?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ResultStatus,
  { label: string; pill: string; dot: string }
> = {
  PENDING: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  DRAFT: {
    label: "Draft",
    pill: "bg-orange-50 text-orange-700 border border-orange-200",
    dot: "bg-orange-400",
  },
  COMPLETED: {
    label: "Completed",
    pill: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  VERIFIED: {
    label: "Verified",
    pill: "bg-sky-50 text-sky-700 border border-sky-200",
    dot: "bg-sky-500",
  },
};

function normalizeStatus(raw: string): ResultStatus {
  const u = (raw || "").toUpperCase();
  if (u === "COMPLETED" || u === "VERIFIED" || u === "DRAFT")
    return u as ResultStatus;
  return "PENDING";
}

// ─── Test pill ────────────────────────────────────────────────────────────────

function TestPill({ test }: { test: ResultEntry["tests"][number] }) {
  const cfg = STATUS_CONFIG[test.resultStatus];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.pill}`}
      title={test.testName}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {test.testNameShort || test.testName}
      {test.isCritical && (
        <BadgeAlert size={10} className="text-red-500 shrink-0" />
      )}
    </span>
  );
}

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
  onEnter: (row: ResultEntry, test: ResultEntry["tests"][number]) => void;
  onEdit: (row: ResultEntry) => void;
  onVerify: (row: ResultEntry) => void;
  onPrint: (row: ResultEntry) => void;
}) {
  const pendingTests = row.tests.filter(
    (t) => t.resultStatus === "PENDING" || t.resultStatus === "DRAFT",
  );
  const hasCompleted = row.tests.some((t) => t.resultStatus === "COMPLETED");
  const allVerified = row.tests.every((t) => t.resultStatus === "VERIFIED");
  const canPrint = row.tests.some(
    (t) => t.resultStatus === "COMPLETED" || t.resultStatus === "VERIFIED",
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Result actions"
          >
            <MoreHorizontal size={18} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="w-72 p-2 rounded-2xl border border-slate-100 shadow-2xl bg-white"
      >
        {/* ── Patient context header ── */}
        <div className="px-3 py-2.5 mb-1 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[11px] font-black text-slate-700 truncate">
            {row.patientName}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {row.orderNumber}
          </p>
        </div>

        {/* ── View ── */}
        <DropdownMenuItem
          onClick={() => onView(row)}
          className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer focus:bg-emerald-50 group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-200 transition-colors">
            <Eye size={13} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 group-hover:text-emerald-700">
              View Result
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              See all entered results
            </p>
          </div>
        </DropdownMenuItem>

        {/* ── Enter Results section ── */}
        {pendingTests.length > 0 && (
          <>
            <div className="px-3 pt-3 pb-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Enter Results — {pendingTests.length} pending
              </p>
            </div>
            {pendingTests.map((t) => {
              const cfg = STATUS_CONFIG[t.resultStatus];
              return (
                <DropdownMenuItem
                  key={t.orderItemId}
                  onClick={() => onEnter(row, t)}
                  className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-amber-50 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-200 transition-colors">
                    <ClipboardEdit size={13} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700 truncate leading-tight">
                      {t.testName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[9px] text-slate-400">
                        {t.testCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${cfg.pill}`}
                      >
                        <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      {t.isCritical && (
                        <span className="text-[9px] font-black text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                          CRITICAL
                        </span>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </>
        )}

        {/* ── Divider before secondary actions ── */}
        {(hasCompleted || canPrint) && (
          <div className="my-1.5 border-t border-slate-100" />
        )}

        {/* ── Edit ── */}
        {hasCompleted && (
          <DropdownMenuItem
            onClick={() => onEdit(row)}
            className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-sky-50 group"
          >
            <div className="w-7 h-7 rounded-lg bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-200 transition-colors">
              <ClipboardEdit size={13} className="text-sky-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 group-hover:text-sky-700">
                Edit Result
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Modify entered values
              </p>
            </div>
          </DropdownMenuItem>
        )}

        {/* ── Verify ── */}
        {hasCompleted && !allVerified && (
          <DropdownMenuItem
            onClick={() => onVerify(row)}
            className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-violet-50 group"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
              <CheckCircle2 size={13} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 group-hover:text-violet-700">
                Verify Result
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Mark as verified
              </p>
            </div>
          </DropdownMenuItem>
        )}

        {/* ── Print ── */}
        {canPrint && (
          <DropdownMenuItem
            onClick={() => onPrint(row)}
            className="rounded-xl px-3 py-2 gap-3 cursor-pointer focus:bg-indigo-50 group"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-200 transition-colors">
              <Printer size={13} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 group-hover:text-indigo-700">
                Print Report
              </p>
              <p className="text-[10px] text-slate-400 font-medium">
                Download or print PDF
              </p>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  row,
  index,
  pageNo,
  pageSize,
  onView,
  onEnter,
  onEdit,
  onVerify,
  onPrint,
}: {
  row: ResultEntry;
  index: number;
  pageNo: number;
  pageSize: number;
  onView: (r: ResultEntry) => void;
  onEnter: (r: ResultEntry, t: ResultEntry["tests"][number]) => void;
  onEdit: (r: ResultEntry) => void;
  onVerify: (r: ResultEntry) => void;
  onPrint: (r: ResultEntry) => void;
}) {
  const cfg = STATUS_CONFIG[row.status];
  const testCount = row.tests.length;
  const pendingCount = row.tests.filter(
    (t) => t.resultStatus === "PENDING" || t.resultStatus === "DRAFT",
  ).length;
  const verifiedCount = row.tests.filter(
    (t) => t.resultStatus === "VERIFIED",
  ).length;
  const completedCount = row.tests.filter(
    (t) => t.resultStatus === "COMPLETED",
  ).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group overflow-hidden">
      {/* ── Top strip: order meta ── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-3">
          {/* Serial */}
          <span className="text-[10px] font-black text-slate-400 font-mono w-5 text-center">
            {pageNo * pageSize + index + 1}
          </span>

          {/* Order number */}
          <span className="font-mono text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            {row.orderNumber}
          </span>

          {row.isEmergency && (
            <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              <Zap size={10} /> EMERGENCY
            </span>
          )}

          {row.priority !== "ROUTINE" && (
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full uppercase">
              {row.priority}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Collection date */}
          {row.collectionDate && (
            <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <Calendar size={11} className="text-emerald-500" />
              {row.collectionDate}
            </span>
          )}

          {/* Overall status pill */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${cfg.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>

          {/* Actions */}
          <ResultActions
            row={row}
            onView={onView}
            onEnter={onEnter}
            onEdit={onEdit}
            onVerify={onVerify}
            onPrint={onPrint}
          />
        </div>
      </div>

      {/* ── Body: patient + tests ── */}
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
          <FlaskConical size={20} />
        </div>

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
              {row.patientName}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {row.gender}, {row.age} yrs
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              PID: {row.patientId}
            </span>
          </div>

          {/* Test pills row */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {row.tests.map((t) => (
              <TestPill key={t.orderItemId} test={t} />
            ))}
          </div>
        </div>

        {/* Test count summary */}
        <div className="shrink-0 flex flex-col items-end gap-1 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {testCount} test{testCount !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                {pendingCount} pending
              </span>
            )}
            {completedCount > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                {completedCount} done
              </span>
            )}
            {verifiedCount > 0 && (
              <span className="text-[10px] font-bold text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-md">
                {verifiedCount} verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ResultEntryPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchBy, setSearchBy] = useState<"Name" | "Mobile">("Name");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "ALL">("ALL");

  const [enterRow, setEnterRow] = useState<ResultEntry | null>(null);
  const [enterTest, setEnterTest] = useState<
    ResultEntry["tests"][number] | null
  >(null);
  const [editRow, setEditRow] = useState<ResultEntry | null>(null);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<ResultListApiResponse>({
    queryKey: ["report-result-list", pageNo, PAGE_SIZE],
    queryFn: () => fetchReportList({ pageNo, pageSize: PAGE_SIZE }),
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const rows: ResultEntry[] = useMemo(() => {
    const content = apiResponse?.data?.content ?? [];
    return content.map((item: any) => ({
      id: item.orderId ?? 0,
      orderId: item.orderId ?? 0,
      orderNumber: item.orderNumber ?? "",
      orderItemId: 0,
      testId: 0,
      patientId: item.patientCode ?? `ID-${item.patientId ?? 0}`,
      patientName: item.patientName ?? "",
      gender:
        (item.gender ?? "OTHER").charAt(0).toUpperCase() +
        (item.gender ?? "other").slice(1).toLowerCase(),
      age: item.age ?? 0,
      mobile: item.mobile ?? item.phone ?? "",
      tests: (Array.isArray(item.tests) ? item.tests : []).map((t: any) => ({
        orderItemId: t.orderItemId ?? 0,
        testId: t.testId ?? 0,
        testName: t.testName ?? "",
        testCode: t.testCode ?? "",
        testNameShort: t.testNameShort ?? "",
        sampleType: t.vialType ?? "",
        isCritical: t.isCritical ?? false,
        remarks: t.remarks ?? null,
        resultStatus: normalizeStatus(t.resultStatus ?? ""),
      })),
      status: normalizeStatus(
        (() => {
          const statuses = (item.tests ?? []).map(
            (t: any) => t.resultStatus ?? "",
          );
          if (statuses.every((s: string) => s === "VERIFIED"))
            return "VERIFIED";
          if (
            statuses.every((s: string) => s === "COMPLETED" || s === "VERIFIED")
          )
            return "COMPLETED";
          if (statuses.some((s: string) => s === "DRAFT")) return "DRAFT";
          return item.orderStatus ?? "PENDING";
        })(),
      ),
      collectionDate: item.collectionDate ?? "",
      collectionTime: item.collectionTime ?? "",
      priority: item.priority ?? "ROUTINE",
      isEmergency: item.isEmergency ?? false,
      branchName: item.branchName,
      sampleType: "",
      testName: "",
      testCode: "",
      testNameShort: "",
    }));
  }, [apiResponse]);

  const totalPages = apiResponse?.data?.totalPages ?? 1;
  const totalElements = apiResponse?.data?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = pageNo + 1 < totalPages;

  const filteredRows = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSearch =
        !t ||
        (searchBy === "Mobile"
          ? r.mobile.includes(t)
          : r.patientName.toLowerCase().includes(t) ||
            r.patientId.toLowerCase().includes(t));
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, searchText, searchBy, statusFilter]);

  const handleView = (row: ResultEntry) =>
    toast.info(`Viewing: ${row.patientName}`);
  const handleEnter = (
    row: ResultEntry,
    test: ResultEntry["tests"][number],
  ) => {
    setEnterRow(row);
    setEnterTest(test);
  };
  const handleEdit = (row: ResultEntry) => setEditRow(row);
  const handleVerify = (row: ResultEntry) =>
    toast.success(`Verified: ${row.patientName}`);
  const handlePrint = (row: ResultEntry) =>
    toast.info(`Printing: ${row.patientName}`);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.status === "PENDING").length;
    const draft = rows.filter((r) => r.status === "DRAFT").length;
    const completed = rows.filter((r) => r.status === "COMPLETED").length;
    const verified = rows.filter((r) => r.status === "VERIFIED").length;
    return { pending, draft, completed, verified };
  }, [rows]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Result <span className="text-emerald-600">Entry</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Enter, review and verify diagnostic lab results for registered
            patients.
          </p>
        </div>

        {/* Quick stats */}
        {!isLoading && rows.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {stats.pending > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-black text-amber-700">
                  {stats.pending} Pending
                </span>
              </div>
            )}
            {stats.draft > 0 && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-xs font-black text-orange-700">
                  {stats.draft} Draft
                </span>
              </div>
            )}
            {stats.completed > 0 && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-black text-emerald-700">
                  {stats.completed} Completed
                </span>
              </div>
            )}
            {stats.verified > 0 && (
              <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 px-3 py-2 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span className="text-xs font-black text-sky-700">
                  {stats.verified} Verified
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={16}
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={
              searchBy === "Mobile"
                ? "Search by mobile…"
                : "Search by patient name or ID…"
            }
            className="input-refined w-full py-2.5 pl-11 pr-4 font-bold text-sm"
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-2.5 shrink-0">
          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ResultStatus | "ALL");
                setPageNo(0);
              }}
              className="input-refined py-2.5 pl-4 pr-9 text-[11px] font-bold uppercase tracking-wider appearance-none min-w-[130px]"
              disabled={isLoading}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
              <option value="VERIFIED">Verified</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={13}
            />
          </div>

          {/* Refresh */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-xl px-3 border-slate-200 shrink-0"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </Button>
        </div>
      </div>

      {/* ── Error ── */}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            {(error as any)?.message ?? "Failed to load result entries."}
          </span>
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <Loader className="text-emerald-500 animate-spin" size={28} />
          </div>
          <p className="text-slate-500 font-semibold text-sm">
            Loading result entries…
          </p>
        </div>
      ) : rows.length === 0 ? (
        /* ── Empty ── */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <TestTube2 className="text-slate-300" size={28} />
          </div>
          <p className="text-slate-600 font-bold">No result entries found</p>
          <p className="text-slate-400 text-sm">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        /* ── Cards ── */
        <div className="space-y-3">
          {filteredRows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500 font-semibold text-sm">
                No matches for your search on this page.
              </p>
            </div>
          ) : (
            filteredRows.map((row, index) => (
              <OrderCard
                key={`${row.orderId}-${index}`}
                row={row}
                index={index}
                pageNo={pageNo}
                pageSize={PAGE_SIZE}
                onView={handleView}
                onEnter={handleEnter}
                onEdit={handleEdit}
                onVerify={handleVerify}
                onPrint={handlePrint}
              />
            ))
          )}

          {/* ── Pagination ── */}
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Database size={13} className="text-emerald-500" />
              <span>
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
                <span className="text-slate-300 mx-2">·</span>
                {totalElements} total entries
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200 rounded-xl text-xs"
                disabled={!canPrev || isFetching}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
              >
                ← Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200 rounded-xl text-xs"
                disabled={!canNext || isFetching}
                onClick={() => setPageNo((p) => p + 1)}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Enter Result Drawer ── */}
      <EnterResultDrawer
        isOpen={!!enterRow}
        onClose={() => {
          setEnterRow(null);
          setEnterTest(null);
        }}
        row={enterRow}
        selectedTest={enterTest}
      />
    </div>
  );
}

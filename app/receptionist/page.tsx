// ReceptionistListPage.jsx  — full replacement

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Database,
  Eye,
  Loader,
  Mail,
  MonitorCheck,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  getReceptionistName,
  getReceptionistStatusLabel,
  getReceptionistVerifiedLabel,
  isReceptionistActive,
  type Receptionist,
} from "@/app/Apis/receptionist/ReceptionistsApi";
import {
  useReceptionistsList,
  useActiveReceptionistsList,
  useVerifiedReceptionistsList,
  useReceptionistByUsername,
  useReceptionistsByBranch, // ← add this hook (see Step 1)
} from "@/app/Apis/receptionist/useReceptionists";
import { branchApi, type Branch } from "@/app/Apis/branch/branchApi";
import AddReceptionistModal from "./AddReceptionistModal";
import ReceptionistDetails from "./ReceptionistDetails";

const PAGE_SIZE = 10;

type FilterMode = "all" | "active" | "verified";

const FILTER_TABS: {
  mode: FilterMode;
  label: string;
  icon: React.ReactNode;
}[] = [
  { mode: "all", label: "All", icon: <Users size={14} /> },
  { mode: "active", label: "Active", icon: <UserCheck size={14} /> },
  { mode: "verified", label: "Verified", icon: <ShieldCheck size={14} /> },
];

// ─── Receptionist row actions ─────────────────────────────────────────────────
function ReceptionistActions({
  receptionist,
  onView,
}: {
  receptionist: Receptionist;
  onView: (r: Receptionist) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Receptionist actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-44 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => onView(receptionist)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-teal-600 focus:bg-teal-50 focus:text-teal-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Branch dropdown ──────────────────────────────────────────────────────────
function BranchDropdown({
  selectedBranchId,
  onSelect,
  disabled,
}: {
  selectedBranchId: number | null;
  onSelect: (id: number | null) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await branchApi.getAllBranches({
          pageNo: 0,
          pageSize: 200,
        });
        const list = res?.data?.content ?? [];
        if (!cancelled) setBranches(list);
      } catch {
        if (!cancelled) toast.error("Failed to load branches.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedLabel =
    branches.find((b) => b.id === selectedBranchId)?.branchName ?? null;

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 h-10 pl-3 pr-3 rounded-xl border text-sm font-semibold transition-all
          ${
            selectedBranchId !== null
              ? "bg-violet-600 border-violet-600 text-white shadow-sm"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
          } disabled:opacity-40`}
      >
        <Building2 size={14} aria-hidden />
        <span className="max-w-35 truncate">{selectedLabel ?? "Branch"}</span>
        {selectedBranchId !== null ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear branch filter"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(null);
              setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onSelect(null);
                setOpen(false);
              }
            }}
            className="ml-0.5 rounded-full hover:bg-violet-500 p-0.5 transition-colors"
          >
            <X size={11} />
          </span>
        ) : (
          <ChevronDown
            size={13}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full mt-1.5 z-20 min-w-52 max-h-64 
                    overflow-y-auto bg-white border border-slate-200 rounded-2xl 
                    shadow-2xl py-1.5"
          >
            {/* ✅ Loading state */}
            {loading ? (
              <p className="px-4 py-3 text-xs text-slate-400 font-medium flex items-center gap-2">
                <Loader size={12} className="animate-spin" />
                Loading branches…
              </p>
            ) : branches.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-400 font-medium">
                No branches found
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(null);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold 
                       text-slate-500 hover:bg-slate-50 transition-colors 
                       uppercase tracking-wide"
                >
                  All branches
                </button>
                <div className="border-t border-slate-100 my-1" />
                {branches.map((branch) => (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => {
                      onSelect(branch.id);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold 
                          transition-colors ${
                            selectedBranchId === branch.id
                              ? "bg-violet-50 text-violet-700"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2
                        size={13}
                        className={
                          selectedBranchId === branch.id
                            ? "text-violet-500"
                            : "text-slate-400"
                        }
                      />
                      {branch.branchName}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReceptionistListPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewReceptionist, setViewReceptionist] = useState<Receptionist | null>(
    null,
  );
  const [deleteReceptionist, setDeleteReceptionist] =
    useState<Receptionist | null>(null);

  const isUsernameApiSearch = debouncedSearch.length > 0;
  const isBranchFilter = selectedBranchId !== null && !isUsernameApiSearch;

  // ── Debounce ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setPageNo(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPageNo(0);
  }, [filterMode]);
  useEffect(() => {
    setPageNo(0);
  }, [selectedBranchId]);

  // ── Queries ────────────────────────────────────────────────────────────────
  const {
    data: allData,
    isLoading: isAllLoading,
    isError: isAllError,
    error: allError,
    refetch: refetchAll,
    isFetching: isAllFetching,
  } = useReceptionistsList(
    { page: pageNo, size: PAGE_SIZE },
    {
      enabled: !isUsernameApiSearch && !isBranchFilter && filterMode === "all",
    },
  );

  const {
    data: activeData,
    isLoading: isActiveLoading,
    isError: isActiveError,
    error: activeError,
    refetch: refetchActive,
    isFetching: isActiveFetching,
  } = useActiveReceptionistsList({
    page: pageNo,
    size: PAGE_SIZE,
    enabled: !isUsernameApiSearch && !isBranchFilter && filterMode === "active",
  });

  const {
    data: verifiedData,
    isLoading: isVerifiedLoading,
    isError: isVerifiedError,
    error: verifiedError,
    refetch: refetchVerified,
    isFetching: isVerifiedFetching,
  } = useVerifiedReceptionistsList({
    page: pageNo,
    size: PAGE_SIZE,
    enabled:
      !isUsernameApiSearch && !isBranchFilter && filterMode === "verified",
  });

  const {
    data: receptionistByUsernameResponse,
    isLoading: isUsernameLoading,
    isError: isUsernameNotFound,
    refetch: refetchByUsername,
    isFetching: isUsernameFetching,
  } = useReceptionistByUsername(debouncedSearch, {
    enabled: isUsernameApiSearch,
  });

  const {
    data: branchReceptionistResponse,
    isLoading: isBranchLoading,
    isError: isBranchError,
    error: branchError,
    refetch: refetchByBranch,
    isFetching: isBranchFetching,
  } = useReceptionistsByBranch(
    selectedBranchId,
    { page: pageNo, size: PAGE_SIZE },
    { enabled: isBranchFilter },
  );

  // ── Derived state ──────────────────────────────────────────────────────────
  const activePageData =
    filterMode === "all"
      ? allData?.data
      : filterMode === "active"
        ? activeData?.data
        : verifiedData?.data;

  const rows = useMemo(() => {
    if (isUsernameApiSearch) {
      if (isUsernameNotFound) return [];
      const r = receptionistByUsernameResponse?.data;
      return r ? [r] : [];
    }
    if (isBranchFilter) {
      return branchReceptionistResponse?.data?.content ?? [];
    }
    return activePageData?.content ?? [];
  }, [
    isUsernameApiSearch,
    isUsernameNotFound,
    receptionistByUsernameResponse?.data,
    isBranchFilter,
    branchReceptionistResponse?.data,
    activePageData?.content,
  ]);

  const isLoading = isUsernameApiSearch
    ? isUsernameLoading
    : isBranchFilter
      ? isBranchLoading
      : filterMode === "all"
        ? isAllLoading
        : filterMode === "active"
          ? isActiveLoading
          : isVerifiedLoading;

  const isFetching = isUsernameApiSearch
    ? isUsernameFetching
    : isBranchFilter
      ? isBranchFetching
      : filterMode === "all"
        ? isAllFetching
        : filterMode === "active"
          ? isActiveFetching
          : isVerifiedFetching;

  const isError = isUsernameApiSearch
    ? false
    : isBranchFilter
      ? isBranchError
      : filterMode === "all"
        ? isAllError
        : filterMode === "active"
          ? isActiveError
          : isVerifiedError;

  const error = isBranchFilter
    ? branchError
    : filterMode === "all"
      ? allError
      : filterMode === "active"
        ? activeError
        : verifiedError;

  const totalPages =
    isUsernameApiSearch || isBranchFilter
      ? 1
      : (activePageData?.totalPages ?? 0);
  const totalElements = isUsernameApiSearch
    ? rows.length
    : isBranchFilter
      ? (branchReceptionistResponse?.data?.totalElements ?? rows.length)
      : (activePageData?.totalElements ?? 0);
  const canPrev = !isUsernameApiSearch && !isBranchFilter && pageNo > 0;
  const canNext =
    !isUsernameApiSearch && !isBranchFilter && activePageData
      ? !activePageData.last
      : false;

  const handleRefresh = () => {
    if (isUsernameApiSearch) {
      void refetchByUsername();
      return;
    }
    if (isBranchFilter) {
      void refetchByBranch();
      return;
    }
    if (filterMode === "all") void refetchAll();
    else if (filterMode === "active") void refetchActive();
    else void refetchVerified();
  };

  const handleFormSuccess = () => handleRefresh();

  const handleConfirmDelete = () => {
    if (!deleteReceptionist) return;
    toast.error("Delete receptionist is not available yet.");
    setDeleteReceptionist(null);
  };

  // Which "context label" to show in the filter bar
  const activeSearchLabel = isUsernameApiSearch
    ? "Searching by username"
    : isBranchFilter
      ? "Filtered by branch"
      : null;

  return (
    <>
      <AddReceptionistModal
        isOpen={addModalOpen}
        onSuccess={handleFormSuccess}
        onClose={() => setAddModalOpen(false)}
      />
      <ReceptionistDetails
        isOpen={Boolean(viewReceptionist)}
        receptionist={viewReceptionist}
        onClose={() => setViewReceptionist(null)}
      />
      <DeleteAlertDialog
        isOpen={Boolean(deleteReceptionist)}
        onClose={() => setDeleteReceptionist(null)}
        onConfirm={handleConfirmDelete}
        title="Delete receptionist"
        description={`Are you sure you want to delete ${deleteReceptionist ? getReceptionistName(deleteReceptionist) : "this receptionist"}? This action cannot be undone.`}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ── Page header ── */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Receptionist <span className="text-teal-600">Management</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              View and manage receptionist accounts and desk assignments.
            </p>
          </div>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8 font-bold"
            onClick={() => setAddModalOpen(true)}
          >
            <UserPlus size={16} aria-hidden />
            New receptionist
          </Button>
        </div>

        {/* ── Search + filter bar ── */}
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by username (exact match)…"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 focus:bg-white transition-all"
                aria-label="Search by username"
                disabled={isLoading}
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading || isFetching}
              title="Refresh"
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition-all disabled:opacity-40 shrink-0"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
                aria-hidden
              />
            </button>
          </div>

          {/* Bottom row: filter tabs + branch dropdown */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
              Filter
            </span>

            {/* Status filter tabs */}
            {FILTER_TABS.map(({ mode, label, icon }) => {
              const isActive =
                filterMode === mode && !isUsernameApiSearch && !isBranchFilter;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setFilterMode(mode);
                    setSearchText("");
                    setSelectedBranchId(null); // clear branch when switching tab
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                    isActive
                      ? mode === "all"
                        ? "bg-slate-800 text-white shadow-sm"
                        : mode === "active"
                          ? "bg-teal-600 text-white shadow-sm"
                          : "bg-sky-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-700"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

            {/* Branch dropdown */}
            <BranchDropdown
              selectedBranchId={selectedBranchId}
              onSelect={(id) => {
                setSelectedBranchId(id);
                setSearchText("");
              }}
              disabled={isLoading}
            />

            {/* Active search/filter label */}
            {activeSearchLabel && (
              <span className="ml-auto text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-3 py-1 rounded-lg">
                {activeSearchLabel}
              </span>
            )}
          </div>
        </div>

        {/* ── Error banner ── */}
        {isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" aria-hidden />
            <span className="font-medium">
              {error instanceof Error
                ? error.message
                : "Failed to load receptionists."}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto font-bold"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── Table ── */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
            <Loader
              className="text-slate-400 animate-spin"
              size={32}
              aria-hidden
            />
            <p className="text-slate-600 font-medium">Loading receptionists…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center space-y-2">
            <p className="text-slate-600 font-semibold">
              {isUsernameApiSearch
                ? `No receptionist found with username "${debouncedSearch}".`
                : isBranchFilter
                  ? "No receptionists found for this branch."
                  : filterMode === "active"
                    ? "No active receptionists found."
                    : filterMode === "verified"
                      ? "No verified receptionists found."
                      : "No receptionists found."}
            </p>
            <p className="text-slate-400 text-sm">
              {isBranchFilter
                ? "Try selecting a different branch or clear the branch filter."
                : "Try switching the filter above."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Receptionist name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Username
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Email
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Desk
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Verified
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: Receptionist) => {
                    const active = isReceptionistActive(row);
                    const verified = row.isVerified === true;
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shrink-0">
                              <MonitorCheck size={18} aria-hidden />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center h-10">
                              <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-teal-700 transition-colors">
                                {getReceptionistName(row)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-700 font-mono">
                          {row.username?.trim() || "—"}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                            <Mail
                              size={12}
                              className="text-teal-500 shrink-0"
                              aria-hidden
                            />
                            {row.email?.trim() || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                          {row.deskNumber?.trim() || "—"}
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold uppercase tracking-wide"
                          >
                            {row.role?.trim() || "—"}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={verified ? "default" : "secondary"}
                            className={
                              verified
                                ? "bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold"
                                : "text-[10px] font-bold"
                            }
                          >
                            {getReceptionistVerifiedLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={active ? "default" : "secondary"}
                            className={
                              active
                                ? "bg-teal-600 hover:bg-teal-600 text-white text-[10px] font-bold"
                                : "text-[10px] font-bold"
                            }
                          >
                            {getReceptionistStatusLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <ReceptionistActions
                            receptionist={row}
                            onView={(r) => setViewReceptionist(r)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination — hidden when branch/username filter active */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Database
                  size={14}
                  className="text-teal-600 shrink-0"
                  aria-hidden
                />
                <span>
                  {isUsernameApiSearch || isBranchFilter
                    ? `${totalElements} result${totalElements !== 1 ? "s" : ""}`
                    : `Page ${pageNo + 1} of ${Math.max(totalPages, 1)} · ${totalElements} total`}
                </span>
              </div>
              {!isUsernameApiSearch && !isBranchFilter && (
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
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
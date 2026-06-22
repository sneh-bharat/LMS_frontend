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
  MoreHorizontal,
  Pencil,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
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
import { branchApi, type Branch } from "@/app/Apis/branch/branchApi";
import {
  getBranchManagerName,
  getBranchManagerPhone,
  getBranchManagerStatusLabel,
  getBranchManagerVerifiedLabel,
  isBranchManagerActive,
  type BranchManager,
  useBranchManagersList,
  useActiveBranchManagersList,
  useVerifiedBranchManagersList,
  useBranchManagerByUsername,
  useBranchManagerByBranchId,
  useDeleteBranchManager,
  useVerifyBranchManager,
  useActivateBranchManager,
} from "../services/branch-manager.service";
import AddBranchManagerModal from "../components/AddBranchManagerModal";
import EditBranchManagerModal from "../components/EditBranchManagerModal";
import BranchManagerDetails from "../components/BranchManagerDetails";
import BranchDropdown from "@/components/common/BranchDropdown";
import AddButton from "@/components/common/AddButton";

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

// ─── Actions ──────────────────────────────────────────────────────────────────
function BranchManagerActions({
  manager,
  onView,
  onEdit,
  onDelete,
  onVerify,
  onActivate,
}: {
  manager: BranchManager;
  onView: (m: BranchManager) => void;
  onEdit: (m: BranchManager) => void;
  onDelete: (m: BranchManager) => void;
  onVerify: (m: BranchManager) => void;
  onActivate: (m: BranchManager) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Branch manager actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-48 p-1.5 rounded-2xl border border-slate-200 shadow-xl bg-white"
      >
        <DropdownMenuItem
          onClick={() => onView(manager)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 shrink-0">
            <Eye size={13} />
          </span>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(manager)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-50 text-green-500 shrink-0">
            <Pencil size={13} />
          </span>
          Edit
        </DropdownMenuItem>
        {!manager.isVerified && (
          <DropdownMenuItem
            onClick={() => onVerify(manager)}
            className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-sky-50 focus:text-sky-700 cursor-pointer"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-sky-50 text-sky-500 shrink-0">
              <ShieldCheck size={13} />
            </span>
            Verify
          </DropdownMenuItem>
        )}
        {!manager.isActive && (
          <DropdownMenuItem
            onClick={() => onActivate(manager)}
            className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
              <Zap size={13} />
            </span>
            Activate
          </DropdownMenuItem>
        )}
        <div className="h-px bg-slate-100 mx-1 my-1" />
        <DropdownMenuItem
          onClick={() => onDelete(manager)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-500 shrink-0">
            <Trash2 size={13} />
          </span>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BranchManagerPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editManagerId, setEditManagerId] = useState<number | null>(null);
  const [viewManager, setViewManager] = useState<BranchManager | null>(null);
  const [deleteManager, setDeleteManager] = useState<BranchManager | null>(
    null,
  );

  const isUsernameApiSearch = debouncedSearch.length > 0;
  const isBranchFilter = selectedBranchId !== null && !isUsernameApiSearch;

  const deleteMutation = useDeleteBranchManager();
  const verifyMutation = useVerifyBranchManager();
  const activateMutation = useActivateBranchManager();

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
  } = useBranchManagersList(
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
  } = useActiveBranchManagersList({
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
  } = useVerifiedBranchManagersList({
    page: pageNo,
    size: PAGE_SIZE,
    enabled:
      !isUsernameApiSearch && !isBranchFilter && filterMode === "verified",
  });

  const {
    data: byUsernameResponse,
    isLoading: isUsernameLoading,
    isError: isUsernameNotFound,
    refetch: refetchByUsername,
    isFetching: isUsernameFetching,
  } = useBranchManagerByUsername(debouncedSearch, {
    enabled: isUsernameApiSearch,
  });

  const {
    data: branchManagerResponse,
    isLoading: isBranchLoading,
    isError: isBranchError,
    error: branchError,
    refetch: refetchByBranch,
    isFetching: isBranchFetching,
  } = useBranchManagerByBranchId(selectedBranchId, { enabled: isBranchFilter });

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
      const r = byUsernameResponse?.data;
      return r ? [r] : [];
    }
    if (isBranchFilter) {
      return branchManagerResponse?.data?.content ?? [];
    }
    return activePageData?.content ?? [];
  }, [
    isUsernameApiSearch,
    isUsernameNotFound,
    byUsernameResponse?.data,
    isBranchFilter,
    branchManagerResponse?.data,
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
      ? (branchManagerResponse?.data?.totalElements ?? rows.length)
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

  const handleVerify = (manager: BranchManager) => {
    verifyMutation.mutate(manager.id, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || "Branch manager verified.");
        handleRefresh();
      },
      onError: (err: unknown) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to verify branch manager.",
        );
      },
    });
  };

  const handleActivate = (manager: BranchManager) => {
    activateMutation.mutate(manager.id, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || "Branch manager activated.");
        handleRefresh();
      },
      onError: (err: unknown) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to activate branch manager.",
        );
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteManager) return;
    deleteMutation.mutate(deleteManager.id, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || "Branch manager deleted.");
        setDeleteManager(null);
        handleRefresh();
      },
      onError: (err: unknown) => {
        toast.error(
          err instanceof Error
            ? err.message
            : "Failed to delete branch manager.",
        );
        setDeleteManager(null);
      },
    });
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const activeSearchLabel = isUsernameApiSearch
    ? "Searching by username"
    : isBranchFilter
      ? "Filtered by branch"
      : null;

  return (
    <>
      <AddBranchManagerModal
        isOpen={addModalOpen}
        onSuccess={handleFormSuccess}
        onClose={() => setAddModalOpen(false)}
      />
      <EditBranchManagerModal
        isOpen={editManagerId !== null}
        managerId={editManagerId}
        onSuccess={handleFormSuccess}
        onClose={() => setEditManagerId(null)}
      />
      <BranchManagerDetails
        isOpen={Boolean(viewManager)}
        manager={viewManager}
        onClose={() => setViewManager(null)}
        onEdit={(m) => {
          setViewManager(null);
          setEditManagerId(m.id);
        }}
        onActionSuccess={handleFormSuccess}
      />
      <DeleteAlertDialog
        isOpen={Boolean(deleteManager)}
        onClose={() => setDeleteManager(null)}
        onConfirm={handleConfirmDelete}
        title="Delete branch manager"
        description={`Are you sure you want to delete ${deleteManager ? getBranchManagerName(deleteManager) : "this manager"}? This action cannot be undone.`}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Branch Manager <span className="text-orange-500">Management</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              View, manage, verify, and activate branch manager accounts.
            </p>
          </div>
          <AddButton
            label="New branch manager"
            onClick={() => setAddModalOpen(true)}
          />
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors pointer-events-none"
                size={16}
                aria-hidden
              />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by username (exact match)…"
                className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 focus:bg-white transition-all"
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
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all disabled:opacity-40 shrink-0"
            >
              <RefreshCw
                size={15}
                className={isFetching ? "animate-spin" : ""}
                aria-hidden
              />
            </button>
          </div>

          {/* Filter tabs + branch dropdown */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
              Filter
            </span>
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
                    setSelectedBranchId(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                    isActive
                      ? mode === "all"
                        ? "bg-slate-800 text-white shadow-sm"
                        : mode === "active"
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-sky-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-200/70 hover:text-slate-700"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
            <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
            <BranchDropdown
              selectedBranchId={selectedBranchId}
              onSelect={(id) => {
                setSelectedBranchId(id);
                setSearchText("");
              }}
              disabled={isLoading}
            />
            {activeSearchLabel && (
              <span className="ml-auto text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg">
                {activeSearchLabel}
              </span>
            )}
          </div>
        </div>

        {/* Error banner */}
        {isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" aria-hidden />
            <span className="font-medium">
              {error instanceof Error
                ? error.message
                : "Failed to load branch managers."}
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

        {/* Table */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
            <Loader
              className="text-slate-400 animate-spin"
              size={32}
              aria-hidden
            />
            <p className="text-slate-600 font-medium">
              Loading branch managers…
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center space-y-2">
            <p className="text-slate-600 font-semibold">
              {isUsernameApiSearch
                ? `No manager found with username "${debouncedSearch}".`
                : isBranchFilter
                  ? "No branch managers found for this branch."
                  : filterMode === "active"
                    ? "No active branch managers found."
                    : filterMode === "verified"
                      ? "No verified branch managers found."
                      : "No branch managers found."}
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
                      Manager name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Username
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Branch
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Verified
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Created
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: BranchManager) => {
                    const active = isBranchManagerActive(row);
                    const verified = row.isVerified === true;
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shrink-0">
                              <Building2 size={18} aria-hidden />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center h-10">
                              <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-orange-600 transition-colors">
                                {getBranchManagerName(row)}
                              </div>
                              {row.branchName?.trim() && (
                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-48">
                                  {row.branchName.trim()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-700 font-mono">
                          {row.username?.trim() || "—"}
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Phone
                                size={11}
                                className="text-orange-400 shrink-0"
                              />
                              {getBranchManagerPhone(row)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail
                                size={11}
                                className="text-orange-400 shrink-0"
                              />
                              <span className="truncate max-w-40">
                                {row.email?.trim() || "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                          {(row.branchName?.trim() || row.branchId) ?? "—"}
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
                            {getBranchManagerVerifiedLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={active ? "default" : "secondary"}
                            className={
                              active
                                ? "bg-orange-500 hover:bg-orange-500 text-white text-[10px] font-bold"
                                : "text-[10px] font-bold"
                            }
                          >
                            {getBranchManagerStatusLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center text-xs font-medium text-slate-500">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <BranchManagerActions
                            manager={row}
                            onView={(m) => setViewManager(m)}
                            onEdit={(m) => setEditManagerId(m.id)}
                            onDelete={(m) => setDeleteManager(m)}
                            onVerify={handleVerify}
                            onActivate={handleActivate}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Database
                  size={14}
                  className="text-orange-500 shrink-0"
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

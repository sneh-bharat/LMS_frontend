"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Database,
  Eye,
  FlaskConical,
  Loader,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  ScrollText,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { DeleteAlertDialog } from "@/components/ui/delete-alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { branchApi, type Branch } from "@/app/Apis/branch/branchApi";
import {
  getPathologistName,
  getPathologistPhone,
  getPathologistStatusLabel,
  getPathologistVerifiedLabel,
  isPathologistActive,
  type Pathologist,
  usePathologistsList,
  useActivePathologistsList,
  useVerifiedPathologistsList,
  usePathologistByUsername,
  usePathologistsByBranch,
} from "../services/pathologist.service";
import AddPathologistModal from "../components/AddPathologistModal";
import PathologistDetails from "../components/PathologistDetails";
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
function PathologistActions({
  pathologist,
  onView,
}: {
  pathologist: Pathologist;
  onView: (p: Pathologist) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Pathologist actions"
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
          onClick={() => onView(pathologist)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-violet-600 focus:bg-violet-50 focus:text-violet-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PathologistPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewPathologist, setViewPathologist] = useState<Pathologist | null>(
    null,
  );
  const [deletePathologist, setDeletePathologist] =
    useState<Pathologist | null>(null);

  const isUsernameApiSearch = debouncedSearch.length > 0;
  const isBranchFilter = selectedBranchId !== null && !isUsernameApiSearch;

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
  } = usePathologistsList(
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
  } = useActivePathologistsList({
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
  } = useVerifiedPathologistsList({
    page: pageNo,
    size: PAGE_SIZE,
    enabled:
      !isUsernameApiSearch && !isBranchFilter && filterMode === "verified",
  });

  const {
    data: pathologistByUsernameResponse,
    isLoading: isUsernameLoading,
    isError: isUsernameNotFound,
    refetch: refetchByUsername,
    isFetching: isUsernameFetching,
  } = usePathologistByUsername(debouncedSearch, {
    enabled: isUsernameApiSearch,
  });

  const {
    data: branchPathologistResponse,
    isLoading: isBranchLoading,
    isError: isBranchError,
    error: branchError,
    refetch: refetchByBranch,
    isFetching: isBranchFetching,
  } = usePathologistsByBranch(
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
      const r = pathologistByUsernameResponse?.data;
      return r ? [r] : [];
    }
    if (isBranchFilter) {
      return branchPathologistResponse?.data?.content ?? [];
    }
    return activePageData?.content ?? [];
  }, [
    isUsernameApiSearch,
    isUsernameNotFound,
    pathologistByUsernameResponse?.data,
    isBranchFilter,
    branchPathologistResponse?.data,
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
      ? (branchPathologistResponse?.data?.totalElements ?? rows.length)
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
    if (!deletePathologist) return;
    toast.error("Delete pathologist is not available yet.");
    setDeletePathologist(null);
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
      <AddPathologistModal
        isOpen={addModalOpen}
        onSuccess={handleFormSuccess}
        onClose={() => setAddModalOpen(false)}
      />
      <PathologistDetails
        isOpen={Boolean(viewPathologist)}
        pathologist={viewPathologist}
        onClose={() => setViewPathologist(null)}
      />
      <DeleteAlertDialog
        isOpen={Boolean(deletePathologist)}
        onClose={() => setDeletePathologist(null)}
        onConfirm={handleConfirmDelete}
        title="Delete pathologist"
        description={`Are you sure you want to delete ${
          deletePathologist
            ? getPathologistName(deletePathologist)
            : "this pathologist"
        }? This action cannot be undone.`}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Pathologist <span className="text-violet-600">Management</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              View and manage pathologist accounts, specializations, and license
              records.
            </p>
          </div>
          <AddButton
            label="New pathologist"
            onClick={() => setAddModalOpen(true)}
          />
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-500 transition-colors pointer-events-none"
                size={16}
                aria-hidden
              />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by username (exact match)…"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 focus:bg-white transition-all"
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
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200 transition-all disabled:opacity-40 shrink-0"
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
                          ? "bg-violet-600 text-white shadow-sm"
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
              <span className="ml-auto text-[11px] font-semibold text-violet-600 bg-violet-50 border border-violet-200 px-3 py-1 rounded-lg">
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
                : "Failed to load pathologists."}
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
            <p className="text-slate-600 font-medium">Loading pathologists…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center space-y-2">
            <p className="text-slate-600 font-semibold">
              {isUsernameApiSearch
                ? `No pathologist found with username "${debouncedSearch}".`
                : isBranchFilter
                  ? "No pathologists found for this branch."
                  : filterMode === "active"
                    ? "No active pathologists found."
                    : filterMode === "verified"
                      ? "No verified pathologists found."
                      : "No pathologists found."}
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
                      Pathologist name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Username
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      License
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
                  {rows.map((row: Pathologist) => {
                    const active = isPathologistActive(row);
                    const verified = row.isVerified === true;
                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-all shrink-0">
                              <FlaskConical size={18} aria-hidden />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center h-10">
                              <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-violet-700 transition-colors">
                                {getPathologistName(row)}
                              </div>
                              {row.branchName?.trim() ? (
                                <div className="text-xs text-slate-400 mt-0.5 truncate max-w-48">
                                  {row.branchName.trim()}
                                </div>
                              ) : null}
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
                                className="text-violet-400 shrink-0"
                                aria-hidden
                              />
                              {getPathologistPhone(row)}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail
                                size={11}
                                className="text-violet-400 shrink-0"
                                aria-hidden
                              />
                              <span className="truncate max-w-40">
                                {row.email?.trim() || "—"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-50"
                          >
                            <FlaskConical size={10} className="mr-1" />
                            {row.specialization?.trim() || "—"}
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-600">
                            <ScrollText
                              size={11}
                              className="text-violet-400 shrink-0"
                              aria-hidden
                            />
                            {row.licenseNumber?.trim() || "—"}
                          </div>
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
                            {getPathologistVerifiedLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={active ? "default" : "secondary"}
                            className={
                              active
                                ? "bg-violet-600 hover:bg-violet-600 text-white text-[10px] font-bold"
                                : "text-[10px] font-bold"
                            }
                          >
                            {getPathologistStatusLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center text-xs font-medium text-slate-500">
                          {formatDate(row.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <PathologistActions
                            pathologist={row}
                            onView={(p) => setViewPathologist(p)}
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
                  className="text-violet-600 shrink-0"
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

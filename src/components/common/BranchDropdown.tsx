"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronDown, Loader, X } from "lucide-react";
import { toast } from "sonner";
import { branchApi, type Branch } from "@/app/Apis/branch/branchApi";

interface BranchDropdownProps {
  selectedBranchId: number | null;
  onSelect: (id: number | null) => void;
  disabled?: boolean;
}

export default function BranchDropdown({
  selectedBranchId,
  onSelect,
  disabled,
}: BranchDropdownProps) {
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
          <div className="absolute left-0 top-full mt-1.5 z-20 min-w-52 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5">
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
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-wide"
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
                    className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
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

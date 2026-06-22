"use client";

import { Building2, Mail, Phone, ShieldCheck, Zap } from "lucide-react";
import { RightDrawer } from "@/components/ui/right-drawer";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import {
  getBranchManagerName,
  getBranchManagerPhone,
  getBranchManagerStatusLabel,
  getBranchManagerVerifiedLabel,
  type BranchManager,
  useVerifyBranchManager,
  useActivateBranchManager,
} from "../services/branch-manager.service";

interface BranchManagerDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  manager: BranchManager | null;
  onEdit?: (manager: BranchManager) => void;
  onActionSuccess?: () => void;
}

export default function BranchManagerDetails({
  isOpen,
  onClose,
  manager,
  onEdit,
  onActionSuccess,
}: BranchManagerDetailsProps) {
  const verifyMutation = useVerifyBranchManager();
  const activateMutation = useActivateBranchManager();

  if (!manager) return null;

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

  const handleVerify = () => {
    verifyMutation.mutate(manager.id, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || "Branch manager verified.");
        onActionSuccess?.();
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to verify branch manager.";
        toast.error(msg);
      },
    });
  };

  const handleActivate = () => {
    activateMutation.mutate(manager.id, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || "Branch manager activated.");
        onActionSuccess?.();
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Failed to activate branch manager.";
        toast.error(msg);
      },
    });
  };

  const isPending = verifyMutation.isPending || activateMutation.isPending;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Building2 className="text-white" size={24} />
          <span>
            Branch Manager <span className="text-orange-200">Details</span>
          </span>
        </div>
      }
      description={manager.username?.trim() || "Branch manager profile"}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 font-bold"
            disabled={isPending}
          >
            Close
          </Button>
          {onEdit ? (
            <Button
              type="button"
              variant="gradient"
              className="flex-1 font-bold"
              onClick={() => onEdit(manager)}
              disabled={isPending}
            >
              Edit
            </Button>
          ) : null}
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Full name */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Full name
          </p>
          <p className="text-lg font-bold text-slate-900">
            {getBranchManagerName(manager)}
          </p>
        </div>

        {/* Username + Branch */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Username
            </p>
            <p className="text-sm font-semibold text-slate-800 font-mono">
              {manager.username?.trim() || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Branch
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Building2 size={14} className="text-orange-500 shrink-0" />
              {(manager.branchName?.trim() || manager.branchId) ?? "—"}
            </p>
          </div>
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Phone
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Phone size={14} className="text-orange-500 shrink-0" />
              {getBranchManagerPhone(manager)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Email
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 break-all">
              <Mail size={14} className="text-orange-500 shrink-0" />
              {manager.email?.trim() || "—"}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={manager.isVerified ? "default" : "secondary"}
            className={
              manager.isVerified
                ? "bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold"
                : "text-[10px] font-bold"
            }
          >
            {getBranchManagerVerifiedLabel(manager)}
          </Badge>
          <Badge
            variant={manager.isActive ? "default" : "secondary"}
            className={
              manager.isActive
                ? "bg-orange-500 hover:bg-orange-500 text-white text-[10px] font-bold"
                : "text-[10px] font-bold"
            }
          >
            {getBranchManagerStatusLabel(manager)}
          </Badge>
        </div>

        {/* Quick-action buttons — verify / activate */}
        {(!manager.isVerified || !manager.isActive) && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Quick actions
            </p>
            <div className="flex flex-wrap gap-2">
              {!manager.isVerified && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2 font-bold border-sky-200 text-sky-700 hover:bg-sky-50"
                  onClick={handleVerify}
                  disabled={isPending}
                >
                  <ShieldCheck size={14} />
                  Verify manager
                </Button>
              )}
              {!manager.isActive && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2 font-bold border-orange-200 text-orange-700 hover:bg-orange-50"
                  onClick={handleActivate}
                  disabled={isPending}
                >
                  <Zap size={14} />
                  Activate manager
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Created */}
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Created
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {formatDate(manager.createdAt)}
          </p>
        </div>
      </div>
    </RightDrawer>
  );
}

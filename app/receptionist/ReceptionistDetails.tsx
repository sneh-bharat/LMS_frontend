"use client";

import { Mail, MonitorCheck } from "lucide-react";
import { RightDrawer } from "@/components/ui/right-drawer";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import {
  getReceptionistName,
  getReceptionistStatusLabel,
  getReceptionistVerifiedLabel,
  type Receptionist,
} from "@/app/Apis/receptionist/ReceptionistsApi";

interface ReceptionistDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  receptionist: Receptionist | null;
  onEdit?: (receptionist: Receptionist) => void;
}

export default function ReceptionistDetails({
  isOpen,
  onClose,
  receptionist,
  onEdit,
}: ReceptionistDetailsProps) {
  if (!receptionist) return null;

  const formatCreatedAt = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <MonitorCheck className="text-white" size={24} />
          <span>
            Receptionist <span className="text-teal-200">Details</span>
          </span>
        </div>
      }
      description={receptionist.username?.trim() || "Receptionist profile"}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 font-bold"
          >
            Close
          </Button>
          {onEdit ? (
            <Button
              type="button"
              variant="gradient"
              className="flex-1 font-bold"
              onClick={() => onEdit(receptionist)}
            >
              Edit receptionist
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
            {getReceptionistName(receptionist)}
          </p>
        </div>

        {/* Username + Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Username
            </p>
            <p className="text-sm font-semibold text-slate-800 font-mono">
              {receptionist.username?.trim() || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Role
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {receptionist.role?.trim() || "—"}
            </p>
          </div>
        </div>

        {/* Email + Desk number */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Email
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 break-all">
              <Mail size={14} className="text-teal-500 shrink-0" />
              {receptionist.email?.trim() || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Desk number
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <MonitorCheck size={14} className="text-teal-500 shrink-0" />
              {receptionist.deskNumber?.trim() || "—"}
            </p>
          </div>
        </div>

        {/* Branch */}
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Branch
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {(receptionist.branchName?.trim() || receptionist.branchId) ?? "—"}
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={receptionist.isVerified ? "default" : "secondary"}
            className={
              receptionist.isVerified
                ? "bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold"
                : "text-[10px] font-bold"
            }
          >
            {getReceptionistVerifiedLabel(receptionist)}
          </Badge>
          <Badge
            variant={receptionist.isActive ? "default" : "secondary"}
            className={
              receptionist.isActive
                ? "bg-teal-600 hover:bg-teal-600 text-white text-[10px] font-bold"
                : "text-[10px] font-bold"
            }
          >
            {getReceptionistStatusLabel(receptionist)}
          </Badge>
        </div>
      </div>
    </RightDrawer>
  );
}
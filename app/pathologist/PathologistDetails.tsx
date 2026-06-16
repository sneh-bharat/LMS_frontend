"use client";

import { FlaskConical, Mail, Phone, ScrollText } from "lucide-react";
import { RightDrawer } from "@/components/ui/right-drawer";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import {
  getPathologistName,
  getPathologistPhone,
  getPathologistStatusLabel,
  getPathologistVerifiedLabel,
  type Pathologist,
} from "@/app/Apis/pathologist/PathologistsApi";

interface PathologistDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  pathologist: Pathologist | null;
  onEdit?: (pathologist: Pathologist) => void;
}

export default function PathologistDetails({
  isOpen,
  onClose,
  pathologist,
  onEdit,
}: PathologistDetailsProps) {
  if (!pathologist) return null;

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

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FlaskConical className="text-white" size={24} />
          <span>
            Pathologist <span className="text-violet-200">Details</span>
          </span>
        </div>
      }
      description={pathologist.username?.trim() || "Pathologist profile"}
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
              onClick={() => onEdit(pathologist)}
            >
              Edit pathologist
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
            {getPathologistName(pathologist)}
          </p>
        </div>

        {/* Username + Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Username
            </p>
            <p className="text-sm font-semibold text-slate-800 font-mono">
              {pathologist.username?.trim() || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Role
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {pathologist.role?.trim() || "—"}
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
              <Phone size={14} className="text-violet-500 shrink-0" />
              {getPathologistPhone(pathologist)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Email
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 break-all">
              <Mail size={14} className="text-violet-500 shrink-0" />
              {pathologist.email?.trim() || "—"}
            </p>
          </div>
        </div>

        {/* Specialization + License */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Specialization
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FlaskConical size={14} className="text-violet-500 shrink-0" />
              {pathologist.specialization?.trim() || "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              License number
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 font-mono">
              <ScrollText size={14} className="text-violet-500 shrink-0" />
              {pathologist.licenseNumber?.trim() || "—"}
            </p>
          </div>
        </div>

        {/* Branch */}
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Branch
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {(pathologist.branchName?.trim() || pathologist.branchId) ?? "—"}
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={pathologist.isVerified ? "default" : "secondary"}
            className={
              pathologist.isVerified
                ? "bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold"
                : "text-[10px] font-bold"
            }
          >
            {getPathologistVerifiedLabel(pathologist)}
          </Badge>
          <Badge
            variant={pathologist.isActive ? "default" : "secondary"}
            className={
              pathologist.isActive
                ? "bg-violet-600 hover:bg-violet-600 text-white text-[10px] font-bold"
                : "text-[10px] font-bold"
            }
          >
            {getPathologistStatusLabel(pathologist)}
          </Badge>
        </div>

        {/* Created */}
        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Created
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {formatDate(pathologist.createdAt)}
          </p>
        </div>
      </div>
    </RightDrawer>
  );
}

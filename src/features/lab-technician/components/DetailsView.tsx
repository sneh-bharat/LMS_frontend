'use client';

import { useEffect, useState } from 'react';
import {
  FlaskConical,
  Mail,
  Shield,
  Activity,
  Info,
  BadgeCheck,
  Building2,
  AtSign,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  Clock,
  Briefcase,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { branchApi } from '@/app/Apis/branch/branchApi';
import { useLabTechnician } from '\.\.\/services\/lab\-technician\.service';

export interface LabTechnicianDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  technicianId: number | null;
  onDelete?: (technicianId: number) => void;
  onEdit?: (technicianId: number) => void;
}

export function LabTechnicianDetails({ isOpen, onClose, technicianId, onDelete, onEdit }: LabTechnicianDetailsProps) {
  const detailQuery = useLabTechnician(technicianId, { enabled: isOpen && technicianId != null && technicianId > 0 });
  const technician = detailQuery.data?.data;
  const [branchDisplayName, setBranchDisplayName] = useState<string | null>(null);
  const [branchLoading, setBranchLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !technician) {
      setBranchDisplayName(null);
      setBranchLoading(false);
      return;
    }

    // Check if branchName is already in the response
    const directBranch = technician.branchName?.trim();
    if (directBranch) {
      setBranchDisplayName(directBranch);
      setBranchLoading(false);
      return;
    }

    // Otherwise fetch branch by ID
    if (technician.branchId == null || technician.branchId < 1) {
      setBranchDisplayName(null);
      setBranchLoading(false);
      return;
    }

    let cancelled = false;
    setBranchLoading(true);
    (async () => {
      try {
        const res = await branchApi.getBranchById(technician.branchId!);
        if (!cancelled) {
          setBranchDisplayName(res?.data?.branchName?.trim() || null);
        }
      } catch {
        if (!cancelled) setBranchDisplayName(null);
      } finally {
        if (!cancelled) setBranchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, technician]);

  const loading = detailQuery.isLoading || (detailQuery.isFetching && !technician);
  const numericId = technicianId != null && technicianId > 0 ? technicianId : null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FlaskConical className="text-white" size={24} />
          <span>
            Technician <span className="text-emerald-200">Full Profile</span>
          </span>
        </div>
      }
      description={numericId ? `Technician ID: ${numericId}` : 'Technician profile'}
      footer={
        numericId ? (
          <div className="flex flex-wrap gap-3 w-full">
            {onEdit ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(numericId)}
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 flex items-center gap-2"
              >
                <Pencil size={16} />
                Edit Technician
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onDelete(numericId)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Record
              </Button>
            ) : null}
          </div>
        ) : undefined
      }
      maxWidth="xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading technician profile…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load technician.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-bold" onClick={() => detailQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : !technician ? (
        <p className="text-sm text-slate-500 font-medium py-8 text-center">No technician selected.</p>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {/* Header Card */}
          <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50">
                <FlaskConical size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {technician.name?.trim() || technician.username?.trim() || '—'}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant={technician.isActive ? 'success' : 'secondary'}>
                    {technician.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {technician.isVerified != null ? (
                    <Badge variant={technician.isVerified ? 'default' : 'secondary'} className="text-[10px] font-bold">
                      {technician.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Role</div>
              <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block uppercase">
                {technician.role || 'LAB_TECHNICIAN'}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <AtSign size={10} /> Username
              </label>
              <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{technician.username || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Mail size={10} /> Email
              </label>
              <p className="text-sm font-bold text-slate-900 italic lowercase">{technician.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Briefcase size={10} /> Department
              </label>
              <p className="text-sm font-bold text-slate-900">{technician.department || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> Shift
              </label>
              <p className="text-sm font-bold text-slate-900">{technician.shift || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Building2 size={10} /> Branch
              </label>
              <p className="text-sm font-bold text-slate-900">
                {branchLoading ? (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <Loader2 className="animate-spin" size={12} aria-hidden />
                    Loading…
                  </span>
                ) : (
                  branchDisplayName || 'N/A'
                )}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} /> Phone
              </label>
              <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{technician.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Account & Access Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              Account & access
            </h4>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Verification</span>
                <span
                  className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                    technician.isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {technician.isVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Login username</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{technician.username || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Status</span>
                <span
                  className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                    technician.isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {technician.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Branch ID: <span className="text-slate-900">{technician.branchId ?? '—'}</span>
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <BadgeCheck size={12} className="text-emerald-500" />
              Technician ID: {technician.id}
            </span>
          </div>
        </div>
      )}
    </RightDrawer>
  );
}

export default LabTechnicianDetails;

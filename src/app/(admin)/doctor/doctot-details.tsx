'use client';

import { useEffect, useState } from 'react';
import {
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Shield,
  Activity,
  Info,
  User,
  BadgeCheck,
  Building2,
  AtSign,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { branchApi } from '@/app/Apis/branch/branchApi';
import { useReferringDoctor } from '@/app/Apis/doctor/useReferringDoctors';
import type { ReferringDoctor } from '@/app/Apis/doctor/referringDoctorApi';

export interface DoctorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number | null;
  onDelete?: (doctorId: number) => void;
  onEdit?: (doctorId: number) => void;
}

function resolveBranchNameFromDoctor(doctor: ReferringDoctor): string | null {
  const direct = doctor.branchName?.trim();
  if (direct) return direct;
  const nested = doctor.branch?.branchName?.trim();
  if (nested) return nested;
  return null;
}

export function DoctorDetails({ isOpen, onClose, doctorId, onDelete, onEdit }: DoctorDetailsProps) {
  const detailQuery = useReferringDoctor(doctorId, { enabled: isOpen && doctorId != null && doctorId > 0 });
  const doctor = detailQuery.data?.data;
  const [branchDisplayName, setBranchDisplayName] = useState<string | null>(null);
  const [branchLoading, setBranchLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !doctor) {
      setBranchDisplayName(null);
      setBranchLoading(false);
      return;
    }

    const fromDoctor = resolveBranchNameFromDoctor(doctor);
    if (fromDoctor) {
      setBranchDisplayName(fromDoctor);
      setBranchLoading(false);
      return;
    }

    if (doctor.branchId == null || doctor.branchId < 1) {
      setBranchDisplayName(null);
      setBranchLoading(false);
      return;
    }

    let cancelled = false;
    setBranchLoading(true);
    (async () => {
      try {
        const res = await branchApi.getBranchById(doctor.branchId!);
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
  }, [isOpen, doctor]);

  const loading = detailQuery.isLoading || (detailQuery.isFetching && !doctor);
  const numericId = doctorId != null && doctorId > 0 ? doctorId : null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Stethoscope className="text-white" size={24} />
          <span>
            Doctor <span className="text-emerald-200">Full Profile</span>
          </span>
        </div>
      }
      description={numericId ? `Doctor ID: ${numericId}` : 'Doctor profile'}
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
                Edit Doctor
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
                Delete Doctor Record
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
          <p className="text-sm font-medium">Loading doctor profile…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load doctor.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-bold" onClick={() => detailQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : !doctor ? (
        <p className="text-sm text-slate-500 font-medium py-8 text-center">No doctor selected.</p>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50">
                <Stethoscope size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{doctor.doctorName}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant={doctor.isActive ? 'success' : 'secondary'}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {doctor.isVerified != null ? (
                    <Badge variant={doctor.isVerified ? 'default' : 'secondary'} className="text-[10px] font-bold">
                      {doctor.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Role</div>
              <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block uppercase">
                {doctor.role || 'DOCTOR'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Activity size={10} /> Specialization
              </label>
              <p className="text-sm font-bold text-slate-900">{doctor.specialization || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <AtSign size={10} /> Username
              </label>
              <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{doctor.username || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Phone size={10} /> Phone
              </label>
              <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{doctor.doctorPhone || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Mail size={10} /> Email
              </label>
              <p className="text-sm font-bold text-slate-900 italic lowercase">{doctor.doctorEmail || 'N/A'}</p>
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
                <User size={10} /> Hospital
              </label>
              <p className="text-sm font-bold text-slate-900">{doctor.hospitalName || 'N/A'}</p>
            </div>
          </div>

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
                    doctor.isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {doctor.isVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Login username</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{doctor.username || '—'}</span>
              </div>
            </div>
          </div>

          {(doctor.deviceId || doctor.deviceTypes) && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" />
                Device information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {doctor.deviceId ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device ID</label>
                    <p className="text-sm font-bold text-slate-900 font-mono">{doctor.deviceId}</p>
                  </div>
                ) : null}
                {doctor.deviceTypes ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device types</label>
                    <p className="text-sm font-bold text-slate-900">{doctor.deviceTypes}</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Tenant ID: <span className="text-slate-900">{doctor.tenantId ?? '—'}</span>
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <BadgeCheck size={12} className="text-emerald-500" />
              Doctor ID: {doctor.id}
            </span>
          </div>
        </div>
      )}
    </RightDrawer>
  );
}

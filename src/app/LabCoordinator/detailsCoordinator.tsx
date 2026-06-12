'use client';

import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  Briefcase,
  Clock,
  Building2,
  FlaskConical,
  Info,
  Loader2,
  Mail,
  Shield,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  getLabCoordinatorDepartment,
  getLabCoordinatorName,
  getLabCoordinatorStatusLabel,
  getLabCoordinatorVerifiedLabel,
  isLabCoordinatorActive,
  type LabCoordinator,
} from '@/app/Apis/LabCoordinator/LabCoordinatorApi';
import { useLabCoordinatorById } from '@/app/Apis/LabCoordinator/useLabCoordinators';

function DetailField({
  label,
  value,
  icon: Icon,
  mono,
  href,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
  href?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon ? <Icon size={10} className="text-emerald-500" /> : null}
        {label}
      </label>
      {href && value !== '—' && value !== 'N/A' ? (
        <a
          href={href}
          className={`text-sm font-bold text-emerald-700 hover:text-emerald-800 transition-colors break-all ${mono ? 'font-mono' : ''}`}
        >
          {value}
        </a>
      ) : (
        <p className={`text-sm font-bold text-slate-900 break-all ${mono ? 'font-mono tracking-tight' : ''}`}>
          {value}
        </p>
      )}
    </div>
  );
}

export function LabCoordinatorDetailsBody({ coordinator }: { coordinator: LabCoordinator }) {
  const active = isLabCoordinatorActive(coordinator);
  const email = coordinator.email?.trim() || 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
      <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 shrink-0">
            <FlaskConical size={32} aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {getLabCoordinatorName(coordinator)}
            </h3>
            <p className="text-sm font-mono font-bold text-slate-500 mt-1">
              {coordinator.username?.trim() || '—'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={active ? 'success' : 'secondary'} className="text-[10px] font-bold">
                {getLabCoordinatorStatusLabel(coordinator)}
              </Badge>
              <Badge
                variant={coordinator.isVerified ? 'default' : 'secondary'}
                className="text-[10px] font-bold"
              >
                {getLabCoordinatorVerifiedLabel(coordinator)}
              </Badge>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">Role</div>
          <div className="text-sm font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block uppercase">
            {coordinator.role?.trim() || '—'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DetailField label="Username" value={coordinator.username?.trim() || 'N/A'} icon={AtSign} mono />
        <DetailField
          label="Email"
          value={email}
          icon={Mail}
          href={email !== 'N/A' ? `mailto:${email}` : undefined}
        />
        <DetailField
          label="Department"
          value={getLabCoordinatorDepartment(coordinator)}
          icon={Briefcase}
        />
        <DetailField label="Specialization" value={coordinator.specialization?.trim() || 'N/A'} icon={Clock} />
      </div>

    <DetailField label="Branch" value={coordinator.branchName?.trim() || 'N/A'} icon={Building2} />
      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" />
          Account status
        </h4>
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Status</span>
            <span
              className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {getLabCoordinatorStatusLabel(coordinator)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Verified</span>
            <span className="text-sm font-bold text-slate-900">
              {getLabCoordinatorVerifiedLabel(coordinator)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Login username</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {coordinator.username?.trim() || '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-slate-400" aria-hidden />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Lab coordinator profile
          </span>
        </div>
        {/* <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <BadgeCheck size={12} className="text-emerald-500" aria-hidden />
          Coordinator ID: {coordinator.id}
        </span> */}
      </div>
    </div>
  );
}

export interface LabCoordinatorDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  coordinatorId: number | null;
}

export default function LabCoordinatorDetailsView({
  isOpen,
  onClose,
  coordinatorId,
}: LabCoordinatorDetailsViewProps) {
  const detailQuery = useLabCoordinatorById(coordinatorId, {
    enabled: isOpen && coordinatorId != null && coordinatorId > 0,
  });
  const coordinator = detailQuery.data?.data;
  const loading = detailQuery.isLoading || (detailQuery.isFetching && !coordinator);
  const numericId = coordinatorId != null && coordinatorId > 0 ? coordinatorId : null;

  const footer =
    !loading ? (
      <div className="flex flex-wrap gap-3 w-full">
        <Button type="button" variant="outline" onClick={onClose} className="font-bold border-slate-200">
          Close
        </Button>
      </div>
    ) : undefined;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Lab coordinator <span className="text-emerald-200">Details</span>
        </>
      }
      description={numericId ? `Coordinator ID: ${numericId}` : 'Lab coordinator profile'}
      footer={footer}
      maxWidth="xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading coordinator profile…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load coordinator.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 font-bold"
            onClick={() => detailQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !coordinator ? (
        <p className="text-sm text-slate-500 font-medium py-8 text-center">No coordinator selected.</p>
      ) : (
        <LabCoordinatorDetailsBody coordinator={coordinator} />
      )}
    </RightDrawer>
  );
}

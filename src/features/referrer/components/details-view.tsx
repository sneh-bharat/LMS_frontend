'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AtSign,
  BadgeCheck,
  Building2,
  FileText,
  Info,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Pencil,
  Shield,
  User,
  UserCheck,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { branchApi } from '@/app/Apis/branch/branchApi';
import {
  getReferrerName,
  getReferrerPhone,
  getReferrerStatusLabel,
  getShowOnReportLabel,
  isReferrerActive,
  type Referrer,
} from '../services/referrer.service';
import { useReferrerById } from '../services/referrer.service';

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

function resolveBranchNameFromReferrer(referrer: Referrer): string | null {
  const direct = referrer.branchName?.trim();
  if (direct) return direct;
  const nested = referrer.branch?.branchName?.trim();
  if (nested) return nested;
  const centre = referrer.centre?.trim();
  if (centre) return centre;
  return null;
}

export function ReferrerDetailsBody({ referrer }: { referrer: Referrer }) {
  const active = isReferrerActive(referrer);
  const showOnReport = getShowOnReportLabel(referrer);
  const email = referrer.email?.trim() || 'N/A';
  const phone = getReferrerPhone(referrer);
  const [branchDisplayName, setBranchDisplayName] = useState<string | null>(null);
  const [branchLoading, setBranchLoading] = useState(false);

  useEffect(() => {
    const fromReferrer = resolveBranchNameFromReferrer(referrer);
    if (fromReferrer) {
      setBranchDisplayName(fromReferrer);
      setBranchLoading(false);
      return;
    }

    if (referrer.branchId == null || referrer.branchId < 1) {
      setBranchDisplayName(null);
      setBranchLoading(false);
      return;
    }

    let cancelled = false;
    setBranchLoading(true);
    (async () => {
      try {
        const res = await branchApi.getBranchById(referrer.branchId!);
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
  }, [referrer]);

  const branchLabel = branchLoading
    ? 'Loading…'
    : branchDisplayName || 'N/A';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-4">
      <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 shrink-0">
            <UserCheck size={32} aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate">
              {getReferrerName(referrer)}
            </h3>
            <p className="text-sm font-mono font-bold text-slate-500 mt-1">
              {referrer.username?.trim() || '—'}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={active ? 'success' : 'secondary'} className="text-[10px] font-bold">
                {getReferrerStatusLabel(referrer)}
              </Badge>
              <Badge
                variant="outline"
                className={
                  showOnReport === 'Yes'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold'
                    : 'text-[10px] font-bold'
                }
              >
                Report: {showOnReport}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DetailField label="Username" value={referrer.username?.trim() || 'N/A'} icon={AtSign} mono />
        <DetailField label="Mobile" value={referrer.mobile?.trim() || phone} icon={Phone} mono />
        <DetailField label="Branch" value={branchLabel} icon={Building2} />
        <DetailField
          label="Marketing associate"
          value={referrer.marketingAssociate?.trim() || 'N/A'}
          icon={UserCheck}
        />
        <DetailField label="Role" value={referrer.role?.trim() || 'N/A'} icon={User} />
      </div>

      {referrer.address?.trim() ? (
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} className="text-emerald-500" />
            Address
          </h4>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{referrer.address.trim()}</p>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Shield size={14} className="text-emerald-500" />
          Account & visibility
        </h4>
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Status</span>
            <span
              className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded ${
                active ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {getReferrerStatusLabel(referrer)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter flex items-center gap-1">
              <FileText size={10} />
              Show on report
            </span>
            <span className="text-sm font-bold text-slate-900">{showOnReport}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Login username</span>
            <span className="text-sm font-bold text-slate-900 font-mono">{referrer.username?.trim() || '—'}</span>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info size={14} className="text-slate-400" aria-hidden />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Referrer profile
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
          <BadgeCheck size={12} className="text-emerald-500" aria-hidden />
          Referrer ID: {referrer.id}
        </span>
      </div>
    </div>
  );
}

export interface ReferrerDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: number | null;
  onEdit?: (referrer: Referrer) => void;
}

export default function ReferrerDetailsView({
  isOpen,
  onClose,
  referrerId,
  onEdit,
}: ReferrerDetailsViewProps) {
  const detailQuery = useReferrerById(referrerId, {
    enabled: isOpen && referrerId != null && referrerId > 0,
  });
  const referrer = detailQuery.data?.data;
  const loading = detailQuery.isLoading || (detailQuery.isFetching && !referrer);
  const numericId = referrerId != null && referrerId > 0 ? referrerId : null;

  const footer =
    referrer && !loading ? (
      <div className="flex flex-wrap gap-3 w-full">
        <Button type="button" variant="outline" onClick={onClose} className="font-bold border-slate-200">
          Close
        </Button>
        {onEdit ? (
          <Button
            type="button"
            variant="gradient"
            onClick={() => onEdit(referrer)}
            className="font-bold gap-2"
          >
            <Pencil size={16} aria-hidden />
            Edit referrer
          </Button>
        ) : null}
      </div>
    ) : undefined;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Referrer <span className="text-emerald-200">Details</span>
        </>
      }
      description={numericId ? `Referrer ID: ${numericId}` : 'Referrer profile'}
      footer={footer}
      maxWidth="xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading referrer profile…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load referrer.'}
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
      ) : !referrer ? (
        <p className="text-sm text-slate-500 font-medium py-8 text-center">No referrer selected.</p>
      ) : (
        <ReferrerDetailsBody referrer={referrer} />
      )}
    </RightDrawer>
  );
}

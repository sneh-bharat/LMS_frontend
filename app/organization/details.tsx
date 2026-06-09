'use client';

import {
  Building2,
  CreditCard,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  User,
  AlertCircle,
  Loader2,
  Hash,
} from 'lucide-react';
import { Badge, Button, RightDrawer } from '@/components/ui';
import {
  getOrganizationCode,
  getOrganizationEmail,
  getOrganizationName,
  getOrganizationPhone,
  getOrganizationStatus,
  getOrganizationType,
  type Organization,
} from '@/app/Apis/organizations/organization';
import { useOrganizationById } from '@/app/Apis/organizations/useOrganizations';

function statusBadgeVariant(status: string) {
  const s = status.toUpperCase();
  if (s === 'ACTIVE' || s === 'APPROVED') return 'success' as const;
  if (s === 'PENDING') return 'warning' as const;
  if (s === 'INACTIVE' || s === 'REJECTED') return 'destructive' as const;
  return 'secondary' as const;
}

function DetailField({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
}) {
  const display =
    value == null || (typeof value === 'string' && !value.trim()) ? '—' : String(value);
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon ? <Icon size={10} className="text-emerald-500 shrink-0" /> : null}
        {label}
      </label>
      <p className={`text-sm font-bold text-slate-900 ${mono ? 'font-mono' : ''}`}>{display}</p>
    </div>
  );
}

function DetailsSection({
  title,
  icon: Icon,
  iconClass = 'text-emerald-500',
  children,
  variant = 'default',
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass?: string;
  children: React.ReactNode;
  variant?: 'default' | 'muted' | 'billing';
}) {
  const panelClass =
    variant === 'billing'
      ? 'p-4 rounded-xl border border-slate-100 bg-slate-50/50'
      : variant === 'muted'
        ? 'p-4 rounded-xl border border-slate-100 bg-white'
        : '';

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <Icon size={14} className={iconClass} />
        {title}
      </h4>
      <div className={panelClass || 'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
        {variant === 'default' ? children : <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">{children}</div>}
      </div>
    </div>
  );
}

function OrganizationDetailsBody({ org }: { org: Organization }) {
  const status = getOrganizationStatus(org);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Summary header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 shrink-0">
            <Building2 size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {getOrganizationName(org)}
            </h3>
            {org.shortName ? (
              <p className="text-xs font-bold text-slate-500 mt-0.5">{org.shortName}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={statusBadgeVariant(status)} className="font-black text-[10px] uppercase">
                {status}
              </Badge>
              <Badge variant="secondary" className="font-black text-[10px] uppercase">
                {getOrganizationType(org)}
              </Badge>
              {org.isActive != null ? (
                <Badge variant={org.isActive ? 'success' : 'secondary'} className="font-black text-[10px] uppercase">
                  {org.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
            Organization code
          </p>
          <p className="text-lg font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 font-mono inline-block">
            {getOrganizationCode(org)}
          </p>
        </div>
      </div>

      <DetailsSection title="Organization" icon={Building2}>
        <DetailField label="Organization ID" value={org.id} icon={Hash} mono />
        <DetailField label="Registration number" value={org.registrationNumber} icon={FileText} mono />
        <DetailField label="Organization type" value={getOrganizationType(org)} icon={Building2} />
      </DetailsSection>

      <DetailsSection title="Contact" icon={Mail}>
        <DetailField label="Email" value={getOrganizationEmail(org)} icon={Mail} />
        <DetailField label="Primary phone" value={org.primaryPhone} icon={Phone} />
        <DetailField label="Secondary phone" value={org.secondaryPhone} icon={Phone} />
        <DetailField label="Website" value={org.website} icon={Globe} />
        <DetailField label="Address" value={org.addressLine1} icon={MapPin} />
      </DetailsSection>

      <DetailsSection title="Contact person" icon={User} variant="muted">
        <DetailField label="Name" value={org.contactPersonName} icon={User} />
        {/* <DetailField label="Designation" value={org.contactPersonDesignation} icon={User} /> */}
        {/* <DetailField label="Phone" value={org.contactPersonPhone} icon={Phone} />
        <DetailField label="Email" value={org.contactPersonEmail} icon={Mail} /> */}
      </DetailsSection>

      <DetailsSection title="Billing & cards" icon={CreditCard} iconClass="text-amber-500" variant="billing">
        <DetailField label="Billing cycle" value={org.billingCycle} icon={CreditCard} />
        <DetailField label="Payment terms (days)" value={org.paymentTermsDays} icon={CreditCard} mono />
        <DetailField label="Active cards" value={org.activeCards} icon={CreditCard} mono />
        <DetailField label="Total cards" value={org.totalCards} icon={CreditCard} mono />
      </DetailsSection>

      {(org.specialNotes || org.termsAndConditions) ? (
        <DetailsSection title="Notes & terms" icon={FileText} variant="muted">
          <div className="sm:col-span-2">
            <DetailField label="Special notes" value={org.specialNotes} icon={FileText} />
          </div>
          <div className="sm:col-span-2">
            <DetailField label="Terms and conditions" value={org.termsAndConditions} icon={FileText} />
          </div>
        </DetailsSection>
      ) : null}

      <DetailsSection title="Audit" icon={FileText} iconClass="text-slate-400" variant="muted">
        <DetailField label="Created by" value={org.createdByName} icon={User} />
        <DetailField label="Updated by" value={org.updatedByName} icon={User} />
        <DetailField label="Approval date" value={org.approvalDate} icon={FileText} />
        <DetailField label="Approved by" value={org.approvedBy} icon={User} />
      </DetailsSection>
    </div>
  );
}

export interface OrganizationDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: number | null;
}

export default function OrganizationDetailsDrawer({
  isOpen,
  onClose,
  organizationId,
}: OrganizationDetailsDrawerProps) {
  const { data, isLoading, isError, error, refetch } = useOrganizationById(organizationId, {
    enabled: isOpen && organizationId != null,
  });

  const org = data?.data;

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={org ? getOrganizationName(org) : 'Organization details'}
      description={
        org
          ? `Code ${getOrganizationCode(org)} · ID ${org.id}`
          : 'Loading organization information…'
      }
      maxWidth="xl"
      footer={
        <div className="flex w-full gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 font-bold border-slate-200"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading organization details…</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
          <p className="text-sm font-semibold text-rose-800">
            {error?.message || 'Failed to load organization details.'}
          </p>
          <Button type="button" variant="outline" size="sm" className="font-bold bg-white" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : org ? (
        <OrganizationDetailsBody org={org} />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Building2 size={64} className="mb-4 text-slate-200" strokeWidth={1} aria-hidden />
          <p className="text-sm font-bold text-slate-900">No organization details available</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">The record may have been removed.</p>
        </div>
      )}
    </RightDrawer>
  );
}

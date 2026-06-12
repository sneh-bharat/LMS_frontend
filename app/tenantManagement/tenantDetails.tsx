'use client';

import type { ComponentType } from 'react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CreditCard,
    Globe,
    Hash,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Shield,
    User,
    Users,
} from 'lucide-react';
import { Badge, Button, RightDrawer } from '@/components/ui';
import {
    displayTenantValue,
    formatTenantDate,
    type TenantDetail,
} from '@/app/Apis/tenant/tenantApi';
import { useTenantById } from '@/app/Apis/tenant/useTenants';

function statusBadgeVariant(status: string) {
    const s = status.trim().toUpperCase();
    if (s === 'ACTIVE') return 'success' as const;
    if (s === 'INACTIVE' || s === 'SUSPENDED') return 'destructive' as const;
    if (s === 'PENDING') return 'warning' as const;
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
    icon?: ComponentType<{ size?: number; className?: string }>;
    mono?: boolean;
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                {Icon ? <Icon size={10} className="text-emerald-500 shrink-0" /> : null}
                {label}
            </label>
            <p className={`text-sm font-bold text-slate-900 break-words ${mono ? 'font-mono' : ''}`}>
                {displayTenantValue(value)}
            </p>
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
    icon: ComponentType<{ size?: number; className?: string }>;
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

function TenantDetailsBody({ tenant }: { tenant: TenantDetail }) {
    const active =
        tenant.isActive === true || tenant.status?.trim().toUpperCase() === 'ACTIVE';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 shrink-0">
                        <Building2 size={32} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                            {tenant.tenantName}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 mt-0.5 truncate">
                            {tenant.companyName}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant={statusBadgeVariant(tenant.status)} className="font-black text-[10px] uppercase">
                                {tenant.status}
                            </Badge>
                            <Badge variant="secondary" className="font-black text-[10px] uppercase">
                                {tenant.subscriptionPlan}
                            </Badge>
                            <Badge variant={active ? 'success' : 'secondary'} className="font-black text-[10px] uppercase">
                                {active ? 'Active' : 'Inactive'}
                            </Badge>
                            {tenant.isDeleted ? (
                                <Badge variant="destructive" className="font-black text-[10px] uppercase">
                                    Deleted
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>
               
            </div>

            <DetailsSection title="Tenant Information" icon={Building2} variant="muted">
                <DetailField label="Tenant name" value={tenant.tenantName} icon={Building2} />
                <DetailField label="Company name" value={tenant.companyName} icon={Building2} />
                {tenant.domain && (
                    <DetailField label="Domain" value={tenant.domain} icon={Globe} />
                )
                }
                {tenant.requestId && (
                    <DetailField label="Request ID" value={tenant.requestId} icon={Hash} mono />
                )
                }
            </DetailsSection>

            <DetailsSection title="Contact" icon={Mail}>
                <DetailField label="Contact email" value={tenant.contactEmail} icon={Mail} />
                <DetailField label="Contact phone" value={tenant.contactPhone} icon={Phone} />
            </DetailsSection>

            <DetailsSection title="Address" icon={MapPin} variant="muted">
                <div className="sm:col-span-2">
                    <DetailField label="Street address" value={tenant.address} icon={MapPin} />
                </div>
                <DetailField label="City" value={tenant.city} icon={MapPin} />
                <DetailField label="State" value={tenant.state} icon={MapPin} />
                <DetailField label="Country" value={tenant.country} icon={Globe} />
                <DetailField label="Postal code" value={tenant.postalCode} icon={Hash} mono />
            </DetailsSection>

            <DetailsSection title="Admin" icon={User} variant="muted">
                <DetailField label="Admin email" value={tenant.adminEmail} icon={Mail} />

                {tenant.adminUsername && (
                    <DetailField label="Admin username" value={tenant.adminUsername} icon={User} mono />
                )}

            </DetailsSection>

            <DetailsSection title="Subscription" icon={CreditCard} iconClass="text-amber-500" variant="billing">
                <DetailField label="Plan" value={tenant.subscriptionPlan} icon={CreditCard} />
                <DetailField label="Start date" value={formatTenantDate(tenant.subscriptionStartDate)} icon={Calendar} />
                <DetailField label="End date" value={formatTenantDate(tenant.subscriptionEndDate)} icon={Calendar} />
                <DetailField label="Status" value={tenant.status} icon={Shield} />
            </DetailsSection>

            <DetailsSection title="Capacity & usage" icon={Users}>
                <DetailField label="Max branches" value={tenant.maxBranches} icon={Building2} mono />
                <DetailField label="Max users per branch" value={tenant.maxUsersPerBranch} icon={Users} mono />
                {/* <DetailField label="Total branches" value={tenant.totalBranches} icon={Building2} mono />
        <DetailField label="Active branches" value={tenant.activeBranches} icon={Building2} mono />
        <DetailField label="Total users" value={tenant.totalUsers} icon={Users} mono /> */}
            </DetailsSection>

            {/* <DetailsSection title="Audit" icon={Shield} iconClass="text-slate-400" variant="muted">
        <DetailField label="Created by" value={tenant.createdBy} icon={User} mono />
        <DetailField label="Updated by" value={tenant.updatedBy} icon={User} mono />
        <DetailField label="Created at" value={formatTenantDate(tenant.createdAt)} icon={Calendar} />
        <DetailField label="Updated at" value={formatTenantDate(tenant.updatedAt)} icon={Calendar} />
      </DetailsSection> */}
        </div>
    );
}

export interface TenantDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: number | null;
    onEdit?: (tenantId: number) => void;
}

export default function TenantDetailsDrawer({
    isOpen,
    onClose,
    tenantId,
    onEdit,
}: TenantDetailsDrawerProps) {
    const { data, isLoading, isError, error, refetch } = useTenantById(tenantId, {
        enabled: isOpen && tenantId != null,
    });

    const tenant = data?.data;

    if (!isOpen) return null;

    return (
        <RightDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={
                tenant ? (
                    <div className="flex items-center gap-3">
                        <Building2 className="text-white" size={24} />
                        <span>
                            Tenant <span className="text-emerald-200">Details</span>
                        </span>
                    </div>
                ) : (
                    'Tenant details'
                )
            }
            description={
                tenant
                    ? `${tenant.tenantName} · ID ${tenant.id}`
                    : 'Loading tenant information…'
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
                    {onEdit && tenant ? (
                        <Button
                            type="button"
                            variant="gradient"
                            className="flex-1 font-bold"
                            onClick={() => onEdit(tenant.id)}
                        >
                            Edit tenant
                        </Button>
                    ) : null}
                </div>
            }
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
                    <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
                    <p className="text-sm font-medium">Loading tenant details…</p>
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
                    <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
                    <p className="text-sm font-semibold text-rose-800">
                        {error?.message || 'Failed to load tenant details.'}
                    </p>
                    <Button type="button" variant="outline" size="sm" className="font-bold bg-white" onClick={() => refetch()}>
                        Retry
                    </Button>
                </div>
            ) : tenant ? (
                <TenantDetailsBody tenant={tenant} />
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <Building2 size={64} className="mb-4 text-slate-200" strokeWidth={1} aria-hidden />
                    <p className="text-sm font-bold text-slate-900">No tenant details available</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">The record may have been removed.</p>
                </div>
            )}
        </RightDrawer>
    );
}

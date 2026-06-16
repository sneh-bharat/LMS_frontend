'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarClock,
  Eye,
  Loader2,
  Pencil,
  RefreshCw,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  EXPIRING_DAYS_OPTIONS,
  formatTenantDate,
  getDaysUntilDate,
  getTenantCompanyName,
  getTenantName,
  getTenantSubscriptionPlan,
  type ExpiringDaysOption,
  type Tenant,
  type TenantDetail,
} from '@/app/Apis/tenant/tenantApi';
import { useExpiringTenants } from '@/app/Apis/tenant/useTenants';
import {
  listingBadge,
  listingRowTitle,
  listingTableCard,
  listingTableThSm,
} from '@/lib/listingPageStyles';

function daysLeftBadgeClass(daysLeft: number | null): string {
  if (daysLeft == null) return listingBadge;
  if (daysLeft <= 7) return `bg-rose-600 hover:bg-rose-600 text-white ${listingBadge}`;
  if (daysLeft <= 15) return `bg-amber-500 hover:bg-amber-500 text-white ${listingBadge}`;
  return `bg-slate-600 hover:bg-slate-600 text-white ${listingBadge}`;
}

function formatDaysLeft(daysLeft: number | null): string {
  if (daysLeft == null) return '—';
  if (daysLeft < 0) return 'Expired';
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return '1 day';
  return `${daysLeft} days`;
}

interface ExpiringTenantsPanelProps {
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onRenew: (tenant: Tenant) => void;
}

export default function ExpiringTenantsPanel({ onView, onEdit, onRenew }: ExpiringTenantsPanelProps) {
  const [daysFilter, setDaysFilter] = useState<ExpiringDaysOption>(30);
  const { data, isLoading, isError, error, isFetching, refetch } = useExpiringTenants(daysFilter);

  const tenants = data?.data ?? [];

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-linear-to-br from-amber-50/90 to-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 sm:py-5 border-b border-amber-100 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <CalendarClock size={20} className="text-amber-700" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Expiring subscriptions
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Tenants whose subscription ends within the selected window
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-amber-200 bg-white p-1 shadow-sm">
            {EXPIRING_DAYS_OPTIONS.map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDaysFilter(days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                  daysFilter === days
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
          <button
            type="button"
            className="p-2 rounded-xl border border-amber-200 bg-white text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-50"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Refresh expiring tenants"
            aria-label="Refresh expiring tenants"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} aria-hidden />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
          <Loader2 size={28} className="animate-spin text-amber-600" aria-hidden />
          <p className="text-sm font-medium">Loading expiring tenants…</p>
        </div>
      ) : isError ? (
        <div className="mx-4 my-4 sm:mx-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-4 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">
            {error instanceof Error ? error.message : 'Failed to load expiring tenants.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : tenants.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm font-bold text-slate-700">No expiring tenants</p>
          <p className="text-xs font-medium text-slate-400 mt-1">
            No subscriptions ending within the next {daysFilter} days.
          </p>
        </div>
      ) : (
        <div className={`${listingTableCard} border-0 shadow-none rounded-none`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[880px]">
              <thead>
                <tr className="bg-amber-50/60 border-b border-amber-100">
                  <th className={listingTableThSm}>Tenant</th>
                  <th className={listingTableThSm}>Company</th>
                  <th className={listingTableThSm}>Plan</th>
                  <th className={listingTableThSm}>End date</th>
                  <th className={`${listingTableThSm} text-center`}>Days left</th>
                  <th className={`${listingTableThSm} text-center`}>Branches</th>
                  <th className={`${listingTableThSm} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant: TenantDetail) => {
                  const daysLeft = getDaysUntilDate(tenant.subscriptionEndDate);
                  const row = tenant as unknown as Tenant;

                  return (
                    <tr
                      key={tenant.id}
                      className="border-b border-amber-50 hover:bg-amber-50/40 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                            <Building2 size={16} aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <div className={listingRowTitle}>{getTenantName(row)}</div>
                            {tenant.tenantCode?.trim() ? (
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {tenant.tenantCode.trim()}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-700">
                        {getTenantCompanyName(row)}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Badge variant="secondary" className={`${listingBadge} uppercase tracking-wide`}>
                          {getTenantSubscriptionPlan(row)}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-slate-700">
                        {formatTenantDate(tenant.subscriptionEndDate)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <Badge className={daysLeftBadgeClass(daysLeft)}>
                          {formatDaysLeft(daysLeft)}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center text-sm font-semibold text-slate-700">
                        {tenant.activeBranches ?? 0}
                        <span className="text-slate-400 font-normal"> / </span>
                        {tenant.totalBranches ?? 0}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onView(row)}
                            className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            aria-label={`View ${getTenantName(row)}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRenew(row)}
                            className="p-2 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors"
                            aria-label={`Renew subscription for ${getTenantName(row)}`}
                          >
                            <CalendarClock size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            aria-label={`Edit ${getTenantName(row)}`}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 sm:px-6 py-3 border-t border-amber-100 text-xs font-semibold text-slate-500">
            {tenants.length} tenant{tenants.length === 1 ? '' : 's'} expiring within {daysFilter} days
          </div>
        </div>
      )}
    </section>
  );
}

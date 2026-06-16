'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Label } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import {
  formatTenantDate,
  getDaysUntilDate,
  getTenantName,
  getTenantSubscriptionPlan,
  isTenantMutationSuccess,
  RENEW_SUBSCRIPTION_MONTH_OPTIONS,
  type RenewSubscriptionMonths,
  type TenantApiResponse,
} from '@/app/Apis/tenant/tenantApi';
import { useRenewTenantSubscription, useTenantById } from '@/app/Apis/tenant/useTenants';

interface UpdateSubscriptionProps {
  isOpen: boolean;
  tenantId: number | null;
  onSuccess?: () => void;
  onClose: () => void;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;
    const responseData = (o.response as { data?: { message?: string } } | undefined)?.data;
    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
    if (typeof o.message === 'string' && o.message !== 'Request failed with status code 400') {
      return o.message;
    }
  }
  if (err instanceof Error) return err.message;
  return 'Failed to renew subscription.';
}

export default function UpdateSubscription({
  isOpen,
  tenantId,
  onSuccess,
  onClose,
}: UpdateSubscriptionProps) {
  const [months, setMonths] = useState<RenewSubscriptionMonths>(12);
  const renewMutation = useRenewTenantSubscription();

  const detailQuery = useTenantById(tenantId, {
    enabled: isOpen && tenantId != null && tenantId > 0,
  });

  const tenant = detailQuery.data?.data;
  const loadingDetail =
    !!tenantId &&
    (detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data));

  useEffect(() => {
    if (isOpen) {
      setMonths(12);
    }
  }, [isOpen, tenantId]);

  const handleRenew = () => {
    if (!tenantId || tenantId <= 0) return;

    renewMutation.mutate(
      { tenantId, months },
      {
        onSuccess: (res: TenantApiResponse) => {
          if (!isTenantMutationSuccess(res)) {
            toast.error(res.message?.trim() || 'Failed to renew subscription.');
            return;
          }

          toast.success(res.message?.trim() || 'Subscription renewed successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const pending = renewMutation.isPending;
  const daysLeft = tenant ? getDaysUntilDate(tenant.subscriptionEndDate) : null;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1 font-bold"
        disabled={pending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || loadingDetail || detailQuery.isError || !tenant}
        onClick={handleRenew}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Renewing…
          </span>
        ) : (
          `Renew for ${months} months`
        )}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Renew <span className="text-emerald-200">subscription</span>
        </>
      }
      description={
        tenant
          ? `${getTenantName(tenant)} · extend subscription period`
          : 'Extend tenant subscription'
      }
      footer={footer}
      maxWidth="md"
    >
      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading subscription details…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
          <p className="text-sm font-semibold text-rose-800">
            {detailQuery.error?.message || 'Failed to load tenant details.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold bg-white"
            onClick={() => detailQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : tenant ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 space-y-3">
            <div className="flex items-center gap-2 text-amber-800">
              <CalendarClock size={18} aria-hidden />
              <span className="text-xs font-black uppercase tracking-widest">Current subscription</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan</p>
                <Badge variant="secondary" className="mt-1 font-black text-[10px] uppercase">
                  {getTenantSubscriptionPlan(tenant)}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Days left</p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {daysLeft == null
                    ? '—'
                    : daysLeft < 0
                      ? 'Expired'
                      : daysLeft === 0
                        ? 'Expires today'
                        : `${daysLeft} day${daysLeft === 1 ? '' : 's'}`}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start date</p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {formatTenantDate(tenant.subscriptionStartDate)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End date</p>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {formatTenantDate(tenant.subscriptionEndDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Renewal period *
            </Label>
            <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1 w-full">
              {RENEW_SUBSCRIPTION_MONTH_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={pending}
                  onClick={() => setMonths(option)}
                  className={`flex-1 min-w-[4.5rem] px-3 py-2.5 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${
                    months === option
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {option} mo
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Subscription will be extended by {months} months from the current end date.
            </p>
          </div>
        </div>
      ) : null}
    </RightDrawer>
  );
}

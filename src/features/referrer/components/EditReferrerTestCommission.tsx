'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Building2, FlaskConical, Loader2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { useUpdateReferrerTestCommission } from '../services/referrer.service';
import type { ReferrerTestCommission } from '@/app/Apis/Referrer/ReferrerCommission';

export interface EditReferrerTestCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: number | null;
  referrerName?: string;
  test: ReferrerTestCommission | null;
}

function formatRupee(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function EditReferrerTestCommission({
  isOpen,
  onClose,
  referrerId,
  referrerName,
  test,
}: EditReferrerTestCommissionProps) {
  const [commissionPercentageInput, setCommissionPercentageInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateMutation = useUpdateReferrerTestCommission();

  useEffect(() => {
    if (!isOpen || !test) {
      setCommissionPercentageInput('');
      setError(null);
      return;
    }
    setCommissionPercentageInput(String(test.commissionPercentage ?? ''));
    setError(null);
  }, [isOpen, test]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!test || !referrerId || referrerId < 1) return;

    const pct = parseFloat(commissionPercentageInput);
    if (!commissionPercentageInput.trim()) {
      setError('Commission percentage is required.');
      return;
    }
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setError('Enter a value between 0 and 100.');
      return;
    }
    if (Math.abs(pct - test.commissionPercentage) < 0.000001) {
      toast.error('Change commission percentage before saving.');
      return;
    }

    setError(null);
    updateMutation.mutate(
      {
        referrerId,
        testId: test.testId,
        payload: { commissionPercentage: pct },
      },
      {
        onSuccess: (res: { message?: string }) => {
          toast.success(res?.message?.trim() || 'Test commission updated successfully.');
          onClose();
        },
        onError: (err: unknown) => {
          toast.error(err instanceof Error ? err.message : 'Failed to update test commission.');
        },
      }
    );
  };

  const pending = updateMutation.isPending;
  const displayReferrerName = referrerName?.trim() || 'Referrer';

  const footer = (
    <div className="flex gap-3 w-full">
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
        type="submit"
        form="edit-referrer-test-commission-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || !test || !referrerId}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Updating…
          </span>
        ) : (
          'Update percentage'
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
          Update <span className="text-emerald-200">test commission</span>
        </>
      }
      description={`${displayReferrerName}${test ? ` · ${test.testCode}` : ''}`}
      footer={footer}
      maxWidth="md"
    >
      {!test ? (
        <div className="py-12 text-center text-sm text-slate-500 font-medium">No test selected.</div>
      ) : (
        <form id="edit-referrer-test-commission-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#ff671f] shrink-0">
                <FlaskConical size={18} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test</p>
                <h4 className="text-base font-bold text-slate-900 tracking-tight">{test.testName}</h4>
                <Badge
                  variant="secondary"
                  className="mt-2 px-2 py-0.5 border-slate-200 text-[10px] font-bold font-mono"
                >
                  {test.testCode}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
              <Building2 size={12} aria-hidden />
              Referrer
            </Label>
            <Input
              value={displayReferrerName}
              readOnly
              className="border-slate-200 bg-slate-50 text-slate-700 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">MRP</Label>
              <Input
                value={formatRupee(test.mrpPrice)}
                readOnly
                className="border-slate-200 bg-slate-50 text-slate-700 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Final price
              </Label>
              <Input
                value={formatRupee(test.finalPrice)}
                readOnly
                className="border-slate-200 bg-slate-50 text-slate-700 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Current commission amount
            </Label>
            <Input
              value={formatRupee(test.commissionAmount)}
              readOnly
              className="border-slate-200 bg-slate-50 text-slate-700 font-semibold"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="referrerCommissionPercentage"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
            >
              <Percent size={12} aria-hidden />
              Commission percentage *
            </Label>
            <Input
              id="referrerCommissionPercentage"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={commissionPercentageInput}
              onChange={(e) => {
                setCommissionPercentageInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="20.00"
              className={`border-slate-200 ${error ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {error ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {error}
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                Sends PUT override with `commissionPercentage` (e.g. 20.00).
              </p>
            )}
          </div>
        </form>
      )}
    </RightDrawer>
  );
}

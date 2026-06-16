'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FlaskConical, IndianRupee, Loader2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import {
  updateDoctorCommissionByTestId,
  type DoctorTestCommission,
  type UpdateDoctorTestCommissionOverridePayload,
} from '\.\.\/services\/doctor\.service';
import { doctorCommissionQueryKeys } from '\.\.\/services\/doctor\.service';

export interface EditTestPriceCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number | null;
  doctorName?: string;
  test: DoctorTestCommission | null;
}

function formatRupee(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function numbersDiffer(original: number, input: string): boolean {
  const parsed = parseFloat(input);
  if (!Number.isFinite(parsed)) return true;
  return Math.abs(parsed - original) > 0.000001;
}

export default function EditTestPriceCommission({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  test,
}: EditTestPriceCommissionProps) {
  const [commissionPercentageInput, setCommissionPercentageInput] = useState('');
  const [commissionAmountInput, setCommissionAmountInput] = useState('');
  const [errors, setErrors] = useState<{ commissionPercentage?: string; commissionAmount?: string }>(
    {}
  );
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({
      doctorId: docId,
      testId,
      payload,
    }: {
      doctorId: number;
      testId: number;
      payload: UpdateDoctorTestCommissionOverridePayload;
    }) => updateDoctorCommissionByTestId(docId, testId, payload),
    onSuccess: (_data, { doctorId: docId }) => {
      queryClient.invalidateQueries({
        queryKey: doctorCommissionQueryKeys.testsByDoctor(docId),
      });
    },
  });

  useEffect(() => {
    if (!isOpen || !test) {
      setCommissionPercentageInput('');
      setCommissionAmountInput('');
      setErrors({});
      return;
    }
    setCommissionPercentageInput(String(test.commissionPercentage ?? ''));
    setCommissionAmountInput(String(test.commissionAmount ?? ''));
    setErrors({});
  }, [isOpen, test]);

  const validate = (): UpdateDoctorTestCommissionOverridePayload | null => {
    if (!test) return null;

    const next: { commissionPercentage?: string; commissionAmount?: string } = {};
    const payload: UpdateDoctorTestCommissionOverridePayload = {};

    const pctChanged = numbersDiffer(test.commissionPercentage, commissionPercentageInput);
    const amountChanged = numbersDiffer(test.commissionAmount, commissionAmountInput);

    if (!pctChanged && !amountChanged) {
      toast.error('Change commission percentage or amount before saving.');
      return null;
    }

    if (pctChanged) {
      const pct = parseFloat(commissionPercentageInput);
      if (!commissionPercentageInput.trim()) {
        next.commissionPercentage = 'Commission percentage is required.';
      } else if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        next.commissionPercentage = 'Enter a value between 0 and 100.';
      } else {
        payload.commissionPercentage = pct;
      }
    }

    if (amountChanged) {
      const amount = parseFloat(commissionAmountInput);
      if (!commissionAmountInput.trim()) {
        next.commissionAmount = 'Commission amount is required.';
      } else if (!Number.isFinite(amount) || amount < 0) {
        next.commissionAmount = 'Enter a valid amount (0 or greater).';
      } else {
        payload.commissionAmount = amount;
      }
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return null;
    return payload;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!test || !doctorId) return;

    const payload = validate();
    if (!payload) return;

    updateMutation.mutate(
      { doctorId, testId: test.testId, payload },
      {
        onSuccess: (res) => {
          toast.success(res?.message?.trim() || 'Commission updated successfully.');
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to update commission.');
        },
      }
    );
  };

  const pending = updateMutation.isPending;
  const displayDoctorName = doctorName?.trim() || 'Doctor';

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
        form="edit-test-commission-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || !test || !doctorId}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Updating…
          </span>
        ) : (
          'Update commission'
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
      description={`${displayDoctorName}${test ? ` · ${test.testCode}` : ''}`}
      footer={footer}
      maxWidth="md"
    >
      {!test ? (
        <div className="py-12 text-center text-sm text-slate-500 font-medium">No test selected.</div>
      ) : (
        <form id="edit-test-commission-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
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
                Discounted price
              </Label>
              <Input
                value={formatRupee(test.finalPrice)}
                readOnly
                className="border-slate-200 bg-slate-50 text-slate-700 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="commissionPercentage"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
            >
              <Percent size={12} aria-hidden />
              Commission percentage
            </Label>
            <Input
              id="commissionPercentage"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={commissionPercentageInput}
              onChange={(e) => {
                setCommissionPercentageInput(e.target.value);
                if (errors.commissionPercentage) {
                  setErrors((prev) => ({ ...prev, commissionPercentage: undefined }));
                }
              }}
              placeholder="15.00"
              className={`border-slate-200 ${errors.commissionPercentage ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.commissionPercentage ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.commissionPercentage}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="commissionAmount"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
            >
              <IndianRupee size={12} aria-hidden />
              Commission amount
            </Label>
            <Input
              id="commissionAmount"
              type="number"
              min={0}
              step={0.01}
              value={commissionAmountInput}
              onChange={(e) => {
                setCommissionAmountInput(e.target.value);
                if (errors.commissionAmount) {
                  setErrors((prev) => ({ ...prev, commissionAmount: undefined }));
                }
              }}
              placeholder="Enter commission amount"
              className={`border-slate-200 ${errors.commissionAmount ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.commissionAmount ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.commissionAmount}
              </p>
            ) : null}
          </div>

          <p className="text-xs text-slate-500 font-medium">
            Update one or both fields. Only the field you change is sent to the server.
          </p>
        </form>
      )}
    </RightDrawer>
  );
}

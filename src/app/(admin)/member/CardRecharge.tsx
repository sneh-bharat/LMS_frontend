'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { useAllocateMemberCardLimit } from '@/app/Apis/membership/useMembership';

interface CardRechargeProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: number | null;
  onSuccess?: () => void;
}

export default function CardRecharge({
  isOpen,
  onClose,
  cardId,
  onSuccess,
}: CardRechargeProps) {
  const allocateMutation = useAllocateMemberCardLimit();
  const [formData, setFormData] = useState({
    cardId: '',
    allocationAmount: '',
    remarks: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const loading = allocateMutation.isPending;

  // Set cardId automatically
  useEffect(() => {
    if (isOpen && cardId != null && cardId > 0) {
      setFormData({
        cardId: String(cardId),
        allocationAmount: '',
        remarks: '',
      });

      setErrors({});
    }
  }, [cardId, isOpen]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.allocationAmount.trim()) {
      newErrors.allocationAmount = 'Allocation amount is required';
    } else {
      const amount = Number(formData.allocationAmount);
      if (!Number.isFinite(amount) || amount <= 0) {
        newErrors.allocationAmount = 'Allocation amount must be greater than zero';
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const resolvedCardId = cardId ?? Number(formData.cardId);
    if (!resolvedCardId || resolvedCardId < 1) {
      toast.error('A valid member card is required.');
      return;
    }

    try {
      const res = await allocateMutation.mutateAsync({
        cardId: resolvedCardId,
        allocationAmount: Number(formData.allocationAmount),
        remarks: formData.remarks.trim() || undefined,
      });

      if (res.response === false) {
        toast.error(res.message || 'Failed to recharge member card.');
        return;
      }

      toast.success(res.message || 'Member card limit allocated successfully.');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to recharge member card.');
    }
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={loading}
      >
        Cancel
      </Button>

      <Button
        type="submit"
        form="recharge-form"
        variant="gradient"
        className="flex-1"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Recharge Card'}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Recharge{' '}
          <span className="text-emerald-200">
            Card Limit
          </span>
        </>
      }
      description="Recharge member card balance"
      footer={footer}
      maxWidth="md"
    >
      <form
        id="recharge-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Hidden Card ID */}
        <input
          type="hidden"
          name="cardId"
          value={formData.cardId}
        />

        {/* Allocation Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
            Allocation Amount *
          </label>

          <input
            type="number"
            name="allocationAmount"
            value={formData.allocationAmount}
            onChange={handleChange}
            placeholder="Enter amount"
            className={`w-full px-4 py-3 rounded-xl border outline-none ${
              errors.allocationAmount
                ? 'border-rose-300'
                : 'border-slate-200'
            }`}
          />

          {errors.allocationAmount && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle size={12} />
              {errors.allocationAmount}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
            Remarks
          </label>

          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Top-up for Q2 usage"
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
          />
        </div>
      </form>
    </RightDrawer>
  );
}
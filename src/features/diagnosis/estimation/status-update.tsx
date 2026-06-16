'use client';

import { useEffect, useState } from 'react';
import { FileText, Loader2, RefreshCcw } from 'lucide-react';
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ESTIMATION_STATUSES,
  formatEstimationLabel,
  type EstimationStatus,
} from '@/features/diagnosis/services/booking.service';
import { useUpdateEstimationStatus } from '@/features/diagnosis/services/booking.service';

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

const FORM_ID = 'update-estimation-status-form';

function normalizeToEstimationStatus(value?: string | null): EstimationStatus | '' {
  const s = value?.trim().toUpperCase() ?? '';
  if (!s) return '';
  const match = ESTIMATION_STATUSES.find((opt) => opt === s);
  return match ?? '';
}

export interface EstimationStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  estimationId: number | null;
  estimationNumber?: string | null;
  currentStatus?: string | null;
  patientLabel?: string | null;
  onSuccess?: () => void;
}

export default function EstimationStatusUpdate({
  isOpen,
  onClose,
  estimationId,
  estimationNumber,
  currentStatus,
  patientLabel,
  onSuccess,
}: EstimationStatusUpdateProps) {
  const [status, setStatus] = useState<EstimationStatus | ''>('');
  const updateMutation = useUpdateEstimationStatus();

  useEffect(() => {
    if (isOpen) {
      setStatus(normalizeToEstimationStatus(currentStatus) || 'DRAFT');
    }
  }, [isOpen, currentStatus]);

  const handleClose = () => {
    if (!updateMutation.isPending) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!estimationId || estimationId <= 0) {
      toast.error('Invalid estimation id.');
      return;
    }
    if (!status) {
      toast.error('Please select a status.');
      return;
    }

    const current = normalizeToEstimationStatus(currentStatus);
    if (current && current === status) {
      toast.info('Estimation is already in this status.');
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({ estimationId, status });
      if (res.response === false) {
        toast.error(res.message || 'Failed to update estimation status.');
        return;
      }
      toast.success(res.message || 'Estimation status updated successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update estimation status.'
      );
    }
  };

  const submitting = updateMutation.isPending;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <RefreshCcw className="text-white" size={22} />
          <span>
            Estimation <span className="text-emerald-200">Status</span>
          </span>
        </div>
      }
      description={
        estimationNumber
          ? `${estimationNumber}${estimationId != null ? ` · #${estimationId}` : ''}`
          : estimationId != null
            ? `Estimation #${estimationId}`
            : 'Change estimation workflow status'
      }
      maxWidth="md"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1 border-slate-200 font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="gradient"
            disabled={submitting || !estimationId || !status}
            className="flex-1 gap-2 font-bold"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCcw size={16} />
            )}
            Update Status
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Estimation
            </p>
            <p className="text-sm font-bold text-slate-900 font-mono truncate">
              {estimationNumber || (estimationId != null ? `ID ${estimationId}` : '—')}
            </p>
            {patientLabel?.trim() ? (
              <p className="text-xs text-slate-500 mt-1 truncate">{patientLabel}</p>
            ) : null}
            {currentStatus?.trim() ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current</span>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                  {formatEstimationLabel(currentStatus)}
                </Badge>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estimation-status" className={FIELD_LABEL}>
            New Status
          </Label>
          <Select
            value={status || undefined}
            onValueChange={(value) => setStatus(value as EstimationStatus)}
            disabled={submitting}
          >
            <SelectTrigger id="estimation-status" className="border-gray-300 font-bold">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {ESTIMATION_STATUSES.map((opt) => (
                <SelectItem key={opt} value={opt} className="font-semibold">
                  {formatEstimationLabel(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 pl-1">
            Sends{' '}
            <span className="font-mono font-bold">
              PUT /estimations/{estimationId ?? '…'}/status?status={status || '…'}
            </span>
          </p>
        </div>
      </form>
    </RightDrawer>
  );
}

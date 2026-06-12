'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, Loader2, RefreshCcw } from 'lucide-react';
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
  SAMPLE_API_STATUSES,
  formatSampleStatusLabel,
  type SampleApiStatus,
} from '@/app/Apis/booking/sample';
import { useUpdateSampleStatus } from '@/app/Apis/booking/useSamples';

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

const FORM_ID = 'update-sample-status-form';

export interface UpdateSampleStatusProps {
  isOpen: boolean;
  onClose: () => void;
  sampleId: number | null;
  /** Display in drawer header (barcode / label). */
  sampleLabel?: string | null;
  /** Pre-select status from GET sample or list row. */
  currentStatus?: string | null;
  onSuccess?: () => void;
}

function normalizeToApiStatus(value?: string | null): SampleApiStatus | '' {
  const s = value?.trim().toUpperCase() ?? '';
  if (!s) return '';
  const match = SAMPLE_API_STATUSES.find((opt) => opt === s);
  return match ?? '';
}

export default function UpdateSampleStatus({
  isOpen,
  onClose,
  sampleId,
  sampleLabel,
  currentStatus,
  onSuccess,
}: UpdateSampleStatusProps) {
  const [status, setStatus] = useState<SampleApiStatus | ''>('');
  const updateMutation = useUpdateSampleStatus();

  useEffect(() => {
    if (isOpen) {
      setStatus(normalizeToApiStatus(currentStatus) || 'REGISTERED');
    }
  }, [isOpen, currentStatus]);

  const handleClose = () => {
    if (!updateMutation.isPending) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sampleId || sampleId <= 0) {
      toast.error('Invalid sample id.');
      return;
    }
    if (!status) {
      toast.error('Please select a status.');
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({ sampleId, status });
      if (res.response === false) {
        toast.error(res.message || 'Failed to update sample status.');
        return;
      }
      toast.success(res.message || 'Sample status updated successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update sample status.');
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
          Specimen <span className="text-emerald-200"> Status</span>
          </span>
        </div>
      }
      description={
        sampleLabel
          ? `${sampleLabel}${sampleId != null ? ` · #${sampleId}` : ''}`
          : sampleId != null
            ? `Sample #${sampleId}`
            : 'Change sample workflow status'
      }
      maxWidth="md"
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="gradient"
            disabled={submitting || !sampleId || !status}
            className="flex-1 gap-2"
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
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
            <FlaskConical size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sample
            </p>
            <p className="text-sm font-bold text-slate-900 font-mono truncate">
              {sampleLabel || (sampleId != null ? `ID ${sampleId}` : '—')}
            </p>
            {currentStatus?.trim() ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current</span>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                  {formatSampleStatusLabel(currentStatus)}
                </Badge>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sample-status" className={FIELD_LABEL}>
            New Status
          </Label>
          <Select
            value={status || undefined}
            onValueChange={(value) => setStatus(value as SampleApiStatus)}
            disabled={submitting}
          >
            <SelectTrigger id="sample-status" className="border-gray-300 font-bold">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_API_STATUSES.map((opt) => (
                <SelectItem key={opt} value={opt} className="font-semibold">
                  {formatSampleStatusLabel(opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 pl-1">
            Sends <span className="font-mono font-bold">PUT /samples/{sampleId ?? '…'}/status?status={status || '…'}</span>
          </p>
        </div>
      </form>
    </RightDrawer>
  );
}

export { UpdateSampleStatus };

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, Edit2, FlaskConical, Loader2 } from 'lucide-react';
import {
  Input,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  SAMPLE_PROCESSING_TYPES,
  SAMPLE_QUALITY_CHECK_TYPES,
  buildUpdateSampleProcessingPayload,
  sampleProcessingToFormFields,
  type SampleProcessingFormData,
  type SampleProcessingRecord,
  type SampleProcessingType,
  type SampleQualityCheckType,
} from '@/app/Apis/booking/sample';
import {
  useSampleProcessingById,
  useUpdateSampleProcessing,
} from '@/app/Apis/booking/useSamples';

const FORM_ID = 'update-sample-processing-form';

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

const INPUT_CLASS = 'border-gray-300';

const TEXTAREA_CLASS = cn(
  'flex min-h-[80px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
);

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] font-semibold text-rose-600 pl-1" role="alert">
      {message}
    </p>
  );
}

export interface UpdateSampleProcessProps {
  isOpen: boolean;
  onClose: () => void;
  /** Processing record id — PUT `/api/v1/sample-processing/{processId}`. */
  processId: number | null;
  sampleLabel?: string | null;
  /** Optional pre-fill; otherwise fetched by `processId`. */
  initialRecord?: SampleProcessingRecord | null;
  onSuccess?: (record?: SampleProcessingRecord) => void;
}

export default function UpdateSampleProcess({
  isOpen,
  onClose,
  processId,
  sampleLabel,
  initialRecord = null,
  onSuccess,
}: UpdateSampleProcessProps) {
  const [form, setForm] = useState<SampleProcessingFormData | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SampleProcessingFormData, string>>
  >({});

  const shouldFetch = isOpen && processId != null && processId > 0 && !initialRecord;
  const detailQuery = useSampleProcessingById(
    shouldFetch ? processId : null,
    shouldFetch,
  );

  const record = useMemo(() => {
    if (initialRecord) return initialRecord;
    return detailQuery.data?.data ?? null;
  }, [initialRecord, detailQuery.data?.data]);

  const updateMutation = useUpdateSampleProcessing();
  const isSubmitting = updateMutation.isPending;
  const isLoading = shouldFetch && detailQuery.isLoading;

  useEffect(() => {
    if (!isOpen || !record) return;
    setForm(sampleProcessingToFormFields(record));
    setFieldErrors({});
  }, [isOpen, record]);

  useEffect(() => {
    if (!isOpen) {
      setForm(null);
      setFieldErrors({});
    }
  }, [isOpen]);

  const setField =
    (key: keyof SampleProcessingFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => (prev ? { ...prev, [key]: e.target.value } : prev));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    if (!form) return false;
    const e: Partial<Record<keyof SampleProcessingFormData, string>> = {};

    if (!form.processingDateTime) {
      e.processingDateTime = 'Processing date & time is required.';
    }
    if (!form.processedBy.trim()) {
      e.processedBy = 'Processed by is required.';
    }

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (processId == null || processId <= 0) {
      toast.error('Processing record id is missing.');
      return;
    }
    if (!record?.sampleId) {
      toast.error('Sample id is missing for this processing record.');
      return;
    }
    if (!form || !validate()) return;

    try {
      const payload = buildUpdateSampleProcessingPayload(record.sampleId, form);
      const res = await updateMutation.mutateAsync({ processId, payload });
      if (res.response === false) {
        toast.error(res.message || 'Failed to update sample processing.');
        return;
      }
      toast.success(res.message?.trim() || 'Sample processing updated successfully.');
      onSuccess?.(res.data);
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update sample processing.',
      );
    }
  };

  const displayLabel =
    sampleLabel?.trim() ||
    record?.sampleBarcode?.trim() ||
    (record?.sampleId ? `Sample #${record.sampleId}` : '—');

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <Activity className="text-white" size={22} />
          <span>
            Update <span className="text-emerald-200">Processing</span>
          </span>
        </div>
      }
      description={
        processId
          ? `${displayLabel} · Process #${processId}`
          : 'Update lab processing record'
      }
      maxWidth="lg"
      footer={
        <div className="flex flex-wrap gap-3 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-600 font-bold"
          >
            Close
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting || isLoading || !form || !record}
            className="custom-gradient text-white font-bold gap-2 min-w-[180px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Edit2 size={16} />
                Save changes
              </>
            )}
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
          <Loader2 size={28} className="animate-spin text-emerald-500" aria-hidden />
          <p className="text-sm font-medium">Loading processing record…</p>
        </div>
      ) : detailQuery.isError && !initialRecord ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : 'Failed to load processing record.'}
        </div>
      ) : !form || !record ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No processing record to edit.
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <input type="hidden" name="sampleId" value={record.sampleId} readOnly />
          <input type="hidden" name="processId" value={processId ?? ''} readOnly />

          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 flex items-start gap-3">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <FlaskConical size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Sample
              </p>
              <p className="text-sm font-bold text-slate-900 font-mono truncate">
                {displayLabel}
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Update processing details. Submits to{' '}
            <span className="font-mono text-xs">PUT /sample-processing/{processId}</span>.
          </p>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Processing details
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upd-proc-type" className={FIELD_LABEL}>
                  Processing type <span className="text-rose-500">*</span>
                </Label>
                <Select
                  value={form.processingType}
                  onValueChange={(value) => {
                    if (!value) return;
                    setForm((prev) =>
                      prev ? { ...prev, processingType: value as SampleProcessingType } : prev,
                    );
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="upd-proc-type" className={INPUT_CLASS}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_PROCESSING_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatEnumLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="upd-proc-method" className={FIELD_LABEL}>
                  Processing method
                </Label>
                <Input
                  id="upd-proc-method"
                  value={form.processingMethod}
                  onChange={setField('processingMethod')}
                  disabled={isSubmitting}
                  placeholder="Manual pipetting"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upd-proc-datetime" className={FIELD_LABEL}>
                  Processing date & time <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="upd-proc-datetime"
                  type="datetime-local"
                  value={form.processingDateTime}
                  onChange={setField('processingDateTime')}
                  disabled={isSubmitting}
                  className={INPUT_CLASS}
                />
                <FieldError message={fieldErrors.processingDateTime} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upd-proc-by" className={FIELD_LABEL}>
                  Processed by <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="upd-proc-by"
                  value={form.processedBy}
                  onChange={setField('processedBy')}
                  disabled={isSubmitting}
                  placeholder="lab_tech_user"
                  className={INPUT_CLASS}
                />
                <FieldError message={fieldErrors.processedBy} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Equipment & reagents
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upd-proc-equipment" className={FIELD_LABEL}>
                  Equipment used
                </Label>
                <Input
                  id="upd-proc-equipment"
                  value={form.equipmentUsed}
                  onChange={setField('equipmentUsed')}
                  disabled={isSubmitting}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upd-proc-reagent" className={FIELD_LABEL}>
                  Reagent used
                </Label>
                <Input
                  id="upd-proc-reagent"
                  value={form.reagentUsed}
                  onChange={setField('reagentUsed')}
                  disabled={isSubmitting}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upd-proc-lot" className={FIELD_LABEL}>
                Lot number
              </Label>
              <Input
                id="upd-proc-lot"
                value={form.lotNumber}
                onChange={setField('lotNumber')}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Parameters
            </p>

            <div className="space-y-2">
              <Label htmlFor="upd-proc-params" className={FIELD_LABEL}>
                Processing parameters
              </Label>
              <Input
                id="upd-proc-params"
                value={form.processingParameters}
                onChange={setField('processingParameters')}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upd-proc-rpm" className={FIELD_LABEL}>
                  RPM
                </Label>
                <Input
                  id="upd-proc-rpm"
                  type="number"
                  min={0}
                  value={form.rpm}
                  onChange={setField('rpm')}
                  disabled={isSubmitting}
                  placeholder="null if empty"
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upd-proc-duration" className={FIELD_LABEL}>
                  Duration (min)
                </Label>
                <Input
                  id="upd-proc-duration"
                  type="text"
                  value={form.durationMinutes}
                  onChange={setField('durationMinutes')}
                  disabled={isSubmitting}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upd-proc-temp" className={FIELD_LABEL}>
                  Temperature (°C)
                </Label>
                <Input
                  id="upd-proc-temp"
                  type="text"
                  value={form.temperatureCelsius}
                  onChange={setField('temperatureCelsius')}
                  disabled={isSubmitting}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Aliquots
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="upd-proc-aliquot-count" className={FIELD_LABEL}>
                  Aliquot count
                </Label>
                <Input
                  id="upd-proc-aliquot-count"
                  type="number"
                  min={0}
                  value={form.aliquotCount}
                  onChange={setField('aliquotCount')}
                  disabled={isSubmitting}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="upd-proc-aliquot-vol" className={FIELD_LABEL}>
                  Aliquot volume
                </Label>
                <Input
                  id="upd-proc-aliquot-vol"
                  value={form.aliquotVolume}
                  onChange={setField('aliquotVolume')}
                  disabled={isSubmitting}
                  placeholder="1 ml each"
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Quality & notes
            </p>

            <div className="space-y-2">
              <Label htmlFor="upd-proc-quality" className={FIELD_LABEL}>
                Quality check
              </Label>
              <Select
                value={form.qualityCheck}
                onValueChange={(value) => {
                  if (!value) return;
                  setForm((prev) =>
                    prev ? { ...prev, qualityCheck: value as SampleQualityCheckType } : prev,
                  );
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="upd-proc-quality" className={INPUT_CLASS}>
                  <SelectValue placeholder="Select quality check" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_QUALITY_CHECK_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upd-proc-notes" className={FIELD_LABEL}>
                Processing notes
              </Label>
              <textarea
                id="upd-proc-notes"
                value={form.processingNotes}
                onChange={setField('processingNotes')}
                disabled={isSubmitting}
                className={TEXTAREA_CLASS}
              />
            </div>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}

'use client';

import { useEffect, useState } from 'react';
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
  buildCreateSampleProcessingPayload,
  buildUpdateSampleProcessingPayload,
  sampleProcessingToFormFields,
  type SampleProcessingFormData,
  type SampleProcessingRecord,
  type SampleProcessingType,
  type SampleQualityCheckType,
} from '@/app/Apis/booking/sample';
import {
  useCreateSampleProcessing,
  useUpdateSampleProcessing,
} from '@/app/Apis/booking/useSamples';
import { getLoggedInFullName } from '@/app/utils/loggedInUser';

const FORM_ID = 'sample-processing-form';

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

const INPUT_CLASS = 'border-gray-300';

const TEXTAREA_CLASS = cn(
  'flex min-h-[80px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
);

function padDateTimePart(n: number): string {
  return String(n).padStart(2, '0');
}

function defaultProcessingDateTime(): string {
  const d = new Date();
  return `${d.getFullYear()}-${padDateTimePart(d.getMonth() + 1)}-${padDateTimePart(d.getDate())}T${padDateTimePart(d.getHours())}:${padDateTimePart(d.getMinutes())}`;
}

/** Earliest selectable value: start of today (no past dates). */
function minProcessingDateTime(): string {
  const d = new Date();
  return `${d.getFullYear()}-${padDateTimePart(d.getMonth() + 1)}-${padDateTimePart(d.getDate())}T00:00`;
}

function isProcessingDateTimeAllowed(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;

  const selected = new Date(trimmed);
  if (Number.isNaN(selected.getTime())) return false;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return selected >= startOfToday;
}

const BLANK_FORM: SampleProcessingFormData = {
  processingType: 'CENTRIFUGATION',
  processingMethod: '',
  processingDateTime: defaultProcessingDateTime(),
  processedBy: '',
  equipmentUsed: '',
  reagentUsed: 'None',
  lotNumber: '',
  processingParameters: '',
  rpm: '',
  durationMinutes: '',
  temperatureCelsius: '',
  aliquotCount: '',
  aliquotVolume: '',
  qualityCheck: 'VISUAL_INSPECTION',
  processingNotes: '',
};

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

export interface SampleProcessProps {
  isOpen: boolean;
  onClose: () => void;
  sampleId: number | null;
  sampleLabel?: string | null;
  /** When set, form runs in edit mode (PUT `/sample-processing/{processId}`). */
  processId?: number | null;
  /** Pre-fill form when editing (from processing details). */
  initialRecord?: SampleProcessingRecord | null;
  onSuccess?: (record?: SampleProcessingRecord) => void;
}

export default function SampleProcess({
  isOpen,
  onClose,
  sampleId,
  sampleLabel,
  processId = null,
  initialRecord = null,
  onSuccess,
}: SampleProcessProps) {
  const [form, setForm] = useState<SampleProcessingFormData>({ ...BLANK_FORM });
  const [formSampleId, setFormSampleId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SampleProcessingFormData, string>>
  >({});

  const isEditMode = processId != null && processId > 0;
  const createMutation = useCreateSampleProcessing();
  const updateMutation = useUpdateSampleProcessing();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && initialRecord) {
      setForm(sampleProcessingToFormFields(initialRecord));
      setFormSampleId(String(initialRecord.sampleId));
    } else {
      setForm({
        ...BLANK_FORM,
        processingDateTime: defaultProcessingDateTime(),
        processedBy: getLoggedInFullName(),
      });
      setFormSampleId(sampleId != null && sampleId > 0 ? String(sampleId) : '');
    }
    setFieldErrors({});
  }, [isOpen, sampleId, isEditMode, initialRecord, processId]);

  const setField =
    (key: keyof SampleProcessingFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof SampleProcessingFormData, string>> = {};

    if (!form.processingDateTime) {
      e.processingDateTime = 'Processing date & time is required.';
    } else if (!isEditMode && !isProcessingDateTimeAllowed(form.processingDateTime)) {
      e.processingDateTime = 'Processing date cannot be in the past.';
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

  const resolveSampleId = (): number => {
    const parsed = Number.parseInt(formSampleId.trim(), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedSampleId = resolveSampleId();
    if (!resolvedSampleId) {
      toast.error('Invalid sample id.');
      return;
    }
    if (!validate()) return;

    try {
      if (isEditMode && processId) {
        const payload = buildUpdateSampleProcessingPayload(resolvedSampleId, form);
        const res = await updateMutation.mutateAsync({ processId, payload });
        if (res.response === false) {
          toast.error(res.message || 'Failed to update sample processing.');
          return;
        }
        toast.success(res.message || 'Sample processing updated successfully.');
        onSuccess?.(res.data);
      } else {
        const payload = buildCreateSampleProcessingPayload(resolvedSampleId, form);
        const res = await createMutation.mutateAsync(payload);
        if (res.response === false) {
          toast.error(res.message || 'Failed to record sample processing.');
          return;
        }
        toast.success(res.message || 'Sample processing recorded successfully.');
        onSuccess?.(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isEditMode
            ? 'Failed to update sample processing.'
            : 'Failed to record sample processing.'
      );
    }
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <Activity className="text-white" size={22} />
          <span>
            {isEditMode ? (
              <>
                Update <span className="text-emerald-200">Processing</span>
              </>
            ) : (
              <>
                Sample <span className="text-emerald-200">Processing</span>
              </>
            )}
          </span>
        </div>
      }
      description={
        isEditMode && processId
          ? `${sampleLabel || `Process #${processId}`} · Edit record`
          : sampleLabel
            ? `${sampleLabel}${sampleId != null ? ` · #${sampleId}` : ''}`
            : sampleId != null
              ? `Sample #${sampleId}`
              : 'Record lab processing for this sample'
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
            disabled={isSubmitting || !resolveSampleId()}
            className="custom-gradient text-white font-bold gap-2 min-w-[180px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isEditMode ? 'Saving…' : 'Processing…'}
              </>
            ) : isEditMode ? (
              <>
                <Edit2 size={16} />
                Save changes
              </>
            ) : (
              'Record processing'
            )}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <input type="hidden" name="sampleId" value={formSampleId} readOnly />
        {isEditMode && processId ? (
          <input type="hidden" name="processId" value={processId} readOnly />
        ) : null}

        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 flex items-start gap-3">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <FlaskConical size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sample
            </p>
            <p className="text-sm font-bold text-slate-900 font-mono truncate">
              {sampleLabel || (formSampleId ? `ID ${formSampleId}` : '—')}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          {isEditMode ? (
            <>
              Update processing details. Submits to{' '}
              <span className="font-mono text-xs">PUT /sample-processing/{processId}</span>.
            </>
          ) : (
            <>
              Record centrifugation, aliquoting, and other prep steps. Submits to{' '}
              <span className="font-mono text-xs">POST /sample-processing</span>.
            </>
          )}
        </p>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Processing details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-type" className={FIELD_LABEL}>
                Processing type <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.processingType}
                onValueChange={(value) => {
                  if (!value) return;
                  setForm((prev) => ({
                    ...prev,
                    processingType: value as SampleProcessingType,
                  }));
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="proc-type" className={INPUT_CLASS}>
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
              <Label htmlFor="proc-method" className={FIELD_LABEL}>
                Processing method
              </Label>
              <Input
                id="proc-method"
                value={form.processingMethod}
                onChange={setField('processingMethod')}
                disabled={isSubmitting}
                placeholder="e.g. Hard spin"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-datetime" className={FIELD_LABEL}>
                Processing date & time <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="proc-datetime"
                type="datetime-local"
                value={form.processingDateTime}
                min={isEditMode ? undefined : minProcessingDateTime()}
                onChange={setField('processingDateTime')}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
              <p className="text-xs text-slate-500 pl-1">
                Today or a future date only.
              </p>
              <FieldError message={fieldErrors.processingDateTime} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proc-by" className={FIELD_LABEL}>
                Processed by <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="proc-by"
                value={form.processedBy}
                onChange={setField('processedBy')}
                disabled={isSubmitting}
                placeholder={getLoggedInFullName() || 'Your full name'}
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
              <Label htmlFor="proc-equipment" className={FIELD_LABEL}>
                Equipment used
              </Label>
              <Input
                id="proc-equipment"
                value={form.equipmentUsed}
                onChange={setField('equipmentUsed')}
                disabled={isSubmitting}
                placeholder="e.g. Eppendorf 5810R"
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proc-reagent" className={FIELD_LABEL}>
                Reagent used
              </Label>
              <Input
                id="proc-reagent"
                value={form.reagentUsed}
                onChange={setField('reagentUsed')}
                disabled={isSubmitting}
                placeholder="e.g. None"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proc-lot" className={FIELD_LABEL}>
              Lot number
            </Label>
            <Input
              id="proc-lot"
              value={form.lotNumber}
              onChange={setField('lotNumber')}
              disabled={isSubmitting}
              placeholder="e.g. LOT-2026-001"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Parameters
          </p>

          <div className="space-y-2">
            <Label htmlFor="proc-params" className={FIELD_LABEL}>
              Processing parameters
            </Label>
            <Input
              id="proc-params"
              value={form.processingParameters}
              onChange={setField('processingParameters')}
              disabled={isSubmitting}
              placeholder="e.g. 3000 RPM, 10 min, 4 C"
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="proc-rpm" className={FIELD_LABEL}>
                RPM
              </Label>
              <Input
                id="proc-rpm"
                type="number"
                min={0}
                value={form.rpm}
                onChange={setField('rpm')}
                disabled={isSubmitting}
                placeholder="3000"
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proc-duration" className={FIELD_LABEL}>
                Duration (min)
              </Label>
              <Input
                id="proc-duration"
                type="number"
                min={0}
                value={form.durationMinutes}
                onChange={setField('durationMinutes')}
                disabled={isSubmitting}
                placeholder="10"
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proc-temp" className={FIELD_LABEL}>
                Temperature (°C)
              </Label>
              <Input
                id="proc-temp"
                type="number"
                step="0.1"
                value={form.temperatureCelsius}
                onChange={setField('temperatureCelsius')}
                disabled={isSubmitting}
                placeholder="4"
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
              <Label htmlFor="proc-aliquot-count" className={FIELD_LABEL}>
                Aliquot count
              </Label>
              <Input
                id="proc-aliquot-count"
                type="number"
                min={0}
                value={form.aliquotCount}
                onChange={setField('aliquotCount')}
                disabled={isSubmitting}
                placeholder="3"
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proc-aliquot-vol" className={FIELD_LABEL}>
                Aliquot volume
              </Label>
              <Input
                id="proc-aliquot-vol"
                value={form.aliquotVolume}
                onChange={setField('aliquotVolume')}
                disabled={isSubmitting}
                placeholder="e.g. 1 ml each"
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
            <Label htmlFor="proc-quality" className={FIELD_LABEL}>
              Quality check
            </Label>
            <Select
              value={form.qualityCheck}
              onValueChange={(value) => {
                if (!value) return;
                setForm((prev) => ({
                  ...prev,
                  qualityCheck: value as SampleQualityCheckType,
                }));
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="proc-quality" className={INPUT_CLASS}>
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
            <Label htmlFor="proc-notes" className={FIELD_LABEL}>
              Processing notes
            </Label>
            <textarea
              id="proc-notes"
              value={form.processingNotes}
              onChange={setField('processingNotes')}
              disabled={isSubmitting}
              placeholder="e.g. Clear serum separation observed"
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}

export { SampleProcess };

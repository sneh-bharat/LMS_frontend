'use client';

import { useEffect, useState } from 'react';
import { Edit2, FlaskConical, Loader2, AlertCircle } from 'lucide-react';
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
  API_SAMPLE_TYPES,
  buildUpdateSamplePayload,
  getSampleDisplayCode,
  sampleToUpdateFormFields,
  type ApiSampleType,
  type UpdateSampleFormData,
} from '@/app/Apis/booking/sample';
import { useSampleById, useUpdateSample } from '@/app/Apis/booking/useSamples';
import {
  SAMPLE_CONDITIONS,
  STORAGE_LOCATIONS,
  TEMPERATURE_OPTIONS,
} from '@/app/diagnosis/invoice-list/AddNewReceipt';

const FORM_ID = 'edit-sample-form';

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

const INPUT_CLASS = 'border-gray-300';

const TEXTAREA_CLASS = cn(
  'flex min-h-[80px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
);

const BLANK_FORM: UpdateSampleFormData = {
  orderId: '',
  sampleType: 'BLOOD',
  sampleLabel: '',
  collectionDateTime: '',
  collectedBy: '',
  collectionMethod: '',
  collectionSite: '',
  sampleVolume: '',
  sampleCondition: 'Good',
  temperature: 'Room',
  storageLocation: 'Rack A1',
  storageTemperature: '2-8 C',
  expiryDateTime: '',
  chainOfCustodyNotes: '',
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] font-semibold text-rose-600 pl-1" role="alert">
      {message}
    </p>
  );
}

export interface EditSampleProps {
  isOpen: boolean;
  onClose: () => void;
  sampleId: number | null;
  onSuccess?: () => void;
}

export default function EditSample({
  isOpen,
  onClose,
  sampleId,
  onSuccess,
}: EditSampleProps) {
  const [form, setForm] = useState<UpdateSampleFormData>({ ...BLANK_FORM });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof UpdateSampleFormData, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    data: sampleRes,
    isLoading: isLoadingSample,
    isError: isLoadError,
    error: loadError,
    refetch,
  } = useSampleById(isOpen ? sampleId : null);

  const updateMutation = useUpdateSample();
  const sample = sampleRes?.data ?? null;
  const isSubmitting = updateMutation.isPending;

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setSubmitError(null);
    if (sample) {
      setForm(sampleToUpdateFormFields(sample));
    } else {
      setForm({ ...BLANK_FORM });
    }
  }, [isOpen, sample]);

  const setField =
    (key: keyof UpdateSampleFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      if (submitError) setSubmitError(null);
    };

  const setSelect =
    (key: keyof UpdateSampleFormData) => (value: string | null) => {
      if (!value) return;
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      if (submitError) setSubmitError(null);
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof UpdateSampleFormData, string>> = {};

    if (!form.sampleLabel.trim()) e.sampleLabel = 'Sample label is required.';
    if (!form.collectionDateTime) e.collectionDateTime = 'Collection date & time is required.';
    if (!form.collectedBy.trim()) e.collectedBy = 'Collected by is required.';
    if (!form.collectionMethod.trim()) e.collectionMethod = 'Collection method is required.';
    if (!form.collectionSite.trim()) e.collectionSite = 'Collection site is required.';
    if (!form.sampleVolume.trim()) e.sampleVolume = 'Sample volume is required.';
    if (!form.sampleCondition.trim()) e.sampleCondition = 'Sample condition is required.';
    if (!form.temperature.trim()) e.temperature = 'Temperature is required.';
    if (!form.storageLocation.trim()) e.storageLocation = 'Storage location is required.';
    if (!form.storageTemperature.trim()) {
      e.storageTemperature = 'Storage temperature is required.';
    }
    if (!form.expiryDateTime) e.expiryDateTime = 'Expiry date & time is required.';

    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleId || sampleId <= 0) {
      toast.error('Invalid sample id.');
      return;
    }
    if (!validate()) return;

    setSubmitError(null);
    try {
      const payload = buildUpdateSamplePayload(form);
      const res = await updateMutation.mutateAsync({ sampleId, payload });
      toast.success(res.message?.trim() || 'Sample updated successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sample.';
      setSubmitError(message);
      toast.error(message);
    }
  };

  const displayCode = sample ? getSampleDisplayCode(sample) : sampleId ? `#${sampleId}` : '—';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <FlaskConical className="text-white" size={22} />
          <span>
            Edit <span className="text-emerald-200">Sample</span>
          </span>
        </div>
      }
      description={displayCode}
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
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="gradient"
            disabled={isSubmitting || isLoadingSample || isLoadError || !sample}
            className="font-bold gap-2 min-w-[160px]"
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
      {isLoadingSample ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
          <Loader2 size={28} className="animate-spin text-emerald-600" />
          <span className="text-sm font-semibold">Loading sample…</span>
        </div>
      ) : isLoadError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 space-y-4">
          <div className="flex items-start gap-3 text-rose-700">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-bold">
              {loadError instanceof Error ? loadError.message : 'Failed to load sample.'}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Update collection, storage, and chain-of-custody details. Changes are sent to{' '}
            <span className="font-mono text-xs">PUT /samples/{sampleId}</span>.
          </p>

          <input type="hidden" name="orderId" value={form.orderId} readOnly />

          <div className="space-y-2">
            <Label htmlFor="edit-sampleLabel" className={FIELD_LABEL}>
              Sample label <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="edit-sampleLabel"
              value={form.sampleLabel}
              onChange={setField('sampleLabel')}
              disabled={isSubmitting}
              className={cn(INPUT_CLASS, 'font-mono')}
            />
            <FieldError message={fieldErrors.sampleLabel} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-sampleType" className={FIELD_LABEL}>
              Sample type <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={form.sampleType}
              onValueChange={(value) => {
                if (value) setForm((prev) => ({ ...prev, sampleType: value as ApiSampleType }));
                setFieldErrors((prev) => ({ ...prev, sampleType: undefined }));
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="edit-sampleType" className={INPUT_CLASS}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {API_SAMPLE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collectionDateTime" className={FIELD_LABEL}>
              Collection date & time <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="edit-collectionDateTime"
              type="datetime-local"
              value={form.collectionDateTime}
              onChange={setField('collectionDateTime')}
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
            <FieldError message={fieldErrors.collectionDateTime} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-collectedBy" className={FIELD_LABEL}>
                Collected by <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-collectedBy"
                value={form.collectedBy}
                onChange={setField('collectedBy')}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
              <FieldError message={fieldErrors.collectedBy} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-collectionMethod" className={FIELD_LABEL}>
                Collection method <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-collectionMethod"
                value={form.collectionMethod}
                onChange={setField('collectionMethod')}
                disabled={isSubmitting}
                placeholder="e.g. Centrifuged from blood"
                className={INPUT_CLASS}
              />
              <FieldError message={fieldErrors.collectionMethod} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-collectionSite" className={FIELD_LABEL}>
              Collection site <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="edit-collectionSite"
              value={form.collectionSite}
              onChange={setField('collectionSite')}
              disabled={isSubmitting}
              placeholder="e.g. Right antecubital fossa or N/A"
              className={INPUT_CLASS}
            />
            <FieldError message={fieldErrors.collectionSite} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-sampleVolume" className={FIELD_LABEL}>
                Sample volume <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-sampleVolume"
                value={form.sampleVolume}
                onChange={setField('sampleVolume')}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
              <FieldError message={fieldErrors.sampleVolume} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-sampleCondition" className={FIELD_LABEL}>
                Sample condition <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.sampleCondition}
                onValueChange={setSelect('sampleCondition')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-sampleCondition" className={INPUT_CLASS}>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_CONDITIONS.map((condition) => (
                    <SelectItem key={condition} value={condition}>
                      {condition}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.sampleCondition} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-temperature" className={FIELD_LABEL}>
                Temperature <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.temperature}
                onValueChange={setSelect('temperature')}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-temperature" className={INPUT_CLASS}>
                  <SelectValue placeholder="Select temperature" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPERATURE_OPTIONS.map((temp) => (
                    <SelectItem key={temp} value={temp}>
                      {temp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError message={fieldErrors.temperature} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-storageTemperature" className={FIELD_LABEL}>
                Storage temperature <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="edit-storageTemperature"
                value={form.storageTemperature}
                onChange={setField('storageTemperature')}
                disabled={isSubmitting}
                className={INPUT_CLASS}
              />
              <FieldError message={fieldErrors.storageTemperature} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-storageLocation" className={FIELD_LABEL}>
              Storage location <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={form.storageLocation}
              onValueChange={setSelect('storageLocation')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="edit-storageLocation" className={INPUT_CLASS}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {STORAGE_LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={fieldErrors.storageLocation} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-expiryDateTime" className={FIELD_LABEL}>
              Expiry date & time <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="edit-expiryDateTime"
              type="datetime-local"
              value={form.expiryDateTime}
              onChange={setField('expiryDateTime')}
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
            <FieldError message={fieldErrors.expiryDateTime} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-chainOfCustodyNotes" className={FIELD_LABEL}>
              Chain of custody notes
            </Label>
            <textarea
              id="edit-chainOfCustodyNotes"
              value={form.chainOfCustodyNotes}
              onChange={setField('chainOfCustodyNotes')}
              rows={3}
              disabled={isSubmitting}
              className={TEXTAREA_CLASS}
            />
          </div>

          {submitError ? (
            <p className="text-sm font-semibold text-rose-600 pl-1" role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      )}
    </RightDrawer>
  );
}

export { EditSample };

'use client';

import { useEffect, useState } from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
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
  registerSample,
  type ApiSampleType,
  type RegisterSamplePayload,
} from '@/app/Apis/booking/sample';

/** Matches POST `/api/v1/samples/register` body exactly. */
export interface RegisterSampleFormData {
  orderId: string;
  sampleType: ApiSampleType;
  sampleLabel: string;
  collectionDateTime: string;
  collectedBy: string;
  collectionMethod: string;
  collectionSite: string;
  sampleVolume: string;
  sampleCondition: string;
  temperature: string;
  storageLocation: string;
  storageTemperature: string;
  expiryDateTime: string;
  chainOfCustodyNotes: string;
}

export const STORAGE_LOCATIONS = [
  'Rack A1',
  'Rack A2',
  'Rack B1',
  'Rack B2',
  'Centrifuge Bay 1',
  'Centrifuge Bay 2',
  'Refrigerator 1',
  'Refrigerator 2',
  'Freezer Unit 1',
  'Processing Area',
];

export const COLLECTION_METHODS = [
  'Venipuncture',
  'Finger Prick',
  'Heel Prick',
  'Catheter',
  'Midstream Clean Catch',
  'Swab',
  'Other',
];

export const SAMPLE_CONDITIONS = ['Good', 'Haemolysed', 'Clotted', 'Insufficient', 'Leaked'];

export const TEMPERATURE_OPTIONS = ['Room', 'Ambient', '2-8 C', 'Cold (2–8°C)', 'Frozen'];

const FORM_ID = 'register-sample-form';

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

const INPUT_CLASS = 'border-gray-300';

const TEXTAREA_CLASS = cn(
  'flex min-h-[80px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
);

function defaultDateTimeLocal(offsetHours = 0): string {
  const d = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const BLANK_FORM: RegisterSampleFormData = {
  orderId: '',
  sampleType: 'BLOOD',
  sampleLabel: '',
  collectionDateTime: defaultDateTimeLocal(),
  collectedBy: '',
  collectionMethod: 'Venipuncture',
  collectionSite: '',
  sampleVolume: '5 ml',
  sampleCondition: 'Good',
  temperature: 'Room',
  storageLocation: 'Rack A1',
  storageTemperature: '2-8 C',
  expiryDateTime: defaultDateTimeLocal(48),
  chainOfCustodyNotes: '',
};

function toApiDateTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  return trimmed;
}

export function buildRegisterSamplePayload(form: RegisterSampleFormData): RegisterSamplePayload {
  const orderId = Number.parseInt(form.orderId.trim(), 10);
  if (!Number.isFinite(orderId) || orderId < 1) {
    throw new Error('A valid order ID is required.');
  }

  const collectionDateTime = toApiDateTime(form.collectionDateTime);
  const expiryDateTime = toApiDateTime(form.expiryDateTime);
  if (!collectionDateTime) throw new Error('Collection date & time is required.');
  if (!expiryDateTime) throw new Error('Expiry date & time is required.');

  return {
    orderId,
    sampleType: form.sampleType,
    sampleLabel: form.sampleLabel.trim(),
    collectionDateTime,
    collectedBy: form.collectedBy.trim(),
    collectionMethod: form.collectionMethod.trim(),
    collectionSite: form.collectionSite.trim(),
    sampleVolume: form.sampleVolume.trim(),
    sampleCondition: form.sampleCondition.trim(),
    temperature: form.temperature.trim(),
    storageLocation: form.storageLocation.trim(),
    storageTemperature: form.storageTemperature.trim(),
    expiryDateTime,
    chainOfCustodyNotes: form.chainOfCustodyNotes.trim() || undefined,
  };
}

export interface RegisterSampleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: () => void;
  /** Pre-fills and locks order ID when opened from invoice list. */
  initialOrderId?: number | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-[11px] font-semibold text-rose-600 pl-1" role="alert">
      {message}
    </p>
  );
}

export function AddNewReceipt({
  isOpen,
  onClose,
  onRegistered,
  initialOrderId = null,
}: RegisterSampleDrawerProps) {
  const orderIdLocked = initialOrderId != null && initialOrderId > 0;
  const [form, setForm] = useState<RegisterSampleFormData>({ ...BLANK_FORM });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterSampleFormData, string>>
  >({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFieldErrors({});
    setSubmitError(null);
    setForm({
      ...BLANK_FORM,
      orderId: orderIdLocked ? String(initialOrderId) : '',
      collectionDateTime: defaultDateTimeLocal(),
      expiryDateTime: defaultDateTimeLocal(48),
    });
  }, [isOpen, initialOrderId, orderIdLocked]);

  const setField =
    (key: keyof RegisterSampleFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      if (submitError) setSubmitError(null);
    };

  const setSelect =
    (key: keyof RegisterSampleFormData) => (value: string | null) => {
      if (!value) return;
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      if (submitError) setSubmitError(null);
    };

  const validate = (): boolean => {
    const e: Partial<Record<keyof RegisterSampleFormData, string>> = {};

    if (!form.orderId.trim() || !/^\d+$/.test(form.orderId.trim())) {
      e.orderId = 'Valid numeric order ID is required.';
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = buildRegisterSamplePayload(form);
      const res = await registerSample(payload);
      if (res.response === false) {
        throw new Error(res.message || 'Failed to register sample.');
      }
      toast.success(res.message?.trim() || 'Sample registered successfully.');
      onRegistered?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register sample.';
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FlaskConical className="text-white" size={22} />
          <span>
            Register <span className="text-emerald-200">Sample</span>
          </span>
        </div>
      }
      description={
        orderIdLocked
          ? `Order ID: ${initialOrderId}`
          : 'Link a collected sample to a booking order'
      }
      maxWidth="lg"
      footer={
        <div className="flex flex-wrap gap-3 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-600 font-bold"
          >
            Close
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="custom-gradient text-white font-bold gap-2 min-w-[160px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Registering…
              </>
            ) : (
              'Register sample'
            )}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Register collection, storage, and chain-of-custody details for this diagnostic order.
          All fields are sent to the booking service.
        </p>
{/* 
        {orderIdLocked ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Linked order
            </p>
            <p className="font-black text-slate-900 mt-1">Order #{initialOrderId}</p>
          </div>
        ) : null
        } */}

        <Input
          type="hidden"
          id="orderId"
          value={form.orderId}
          onChange={setField('orderId')}
          disabled={isSubmitting || orderIdLocked}
        />
        <FieldError message={fieldErrors.orderId} />

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sampleLabel" className={FIELD_LABEL}>
              Sample label <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="sampleLabel"
              value={form.sampleLabel}
              onChange={setField('sampleLabel')}
              disabled={isSubmitting}
              className={cn(INPUT_CLASS, 'font-mono')}
            />
            <FieldError message={fieldErrors.sampleLabel} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sampleType" className={FIELD_LABEL}>
            Sample type <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={form.sampleType}
            onValueChange={setSelect('sampleType')}
            disabled={isSubmitting}
          >
            <SelectTrigger id="sampleType" className={INPUT_CLASS}>
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
          <Label htmlFor="collectionDateTime" className={FIELD_LABEL}>
            Collection date & time <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="collectionDateTime"
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
            <Label htmlFor="collectedBy" className={FIELD_LABEL}>
              Collected by <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="collectedBy"
              value={form.collectedBy}
              onChange={setField('collectedBy')}
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
            <FieldError message={fieldErrors.collectedBy} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collectionMethod" className={FIELD_LABEL}>
              Collection method <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={form.collectionMethod}
              onValueChange={setSelect('collectionMethod')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="collectionMethod" className={INPUT_CLASS}>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {COLLECTION_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={fieldErrors.collectionMethod} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="collectionSite" className={FIELD_LABEL}>
            Collection site <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="collectionSite"
            value={form.collectionSite}
            onChange={setField('collectionSite')}
            disabled={isSubmitting}
            className={INPUT_CLASS}
          />
          <FieldError message={fieldErrors.collectionSite} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sampleVolume" className={FIELD_LABEL}>
              Sample volume <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="sampleVolume"
              value={form.sampleVolume}
              onChange={setField('sampleVolume')}
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
            <FieldError message={fieldErrors.sampleVolume} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sampleCondition" className={FIELD_LABEL}>
              Sample condition <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={form.sampleCondition}
              onValueChange={setSelect('sampleCondition')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="sampleCondition" className={INPUT_CLASS}>
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
            <Label htmlFor="temperature" className={FIELD_LABEL}>
              Temperature <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={form.temperature}
              onValueChange={setSelect('temperature')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="temperature" className={INPUT_CLASS}>
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
            <Label htmlFor="storageTemperature" className={FIELD_LABEL}>
              Storage temperature <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="storageTemperature"
              value={form.storageTemperature}
              onChange={setField('storageTemperature')}
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
            <FieldError message={fieldErrors.storageTemperature} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storageLocation" className={FIELD_LABEL}>
            Storage location <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={form.storageLocation}
            onValueChange={setSelect('storageLocation')}
            disabled={isSubmitting}
          >
            <SelectTrigger id="storageLocation" className={INPUT_CLASS}>
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
          <Label htmlFor="expiryDateTime" className={FIELD_LABEL}>
            Expiry date & time <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="expiryDateTime"
            type="datetime-local"
            value={form.expiryDateTime}
            onChange={setField('expiryDateTime')}
            disabled={isSubmitting}
            className={INPUT_CLASS}
          />
          <FieldError message={fieldErrors.expiryDateTime} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="chainOfCustodyNotes" className={FIELD_LABEL}>
            Chain of custody notes
          </Label>
          <textarea
            id="chainOfCustodyNotes"
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
    </RightDrawer>
  );
}

export default AddNewReceipt;

'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  getOrganizationName,
  type Organization,
} from '@/app/Apis/organizations/organization';
import { useOrganizations } from '@/app/Apis/organizations/useOrganizations';
import {
  MEMBER_CARD_TYPES,
  formatMemberCardLabel,
  type CreateMemberCardPayload,
  type MemberCardType,
} from '@/app/Apis/membership/membership';
import { useCreateMemberCard } from '@/app/Apis/membership/useMembership';

const FORM_ID = 'create-member-card-form';
const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';
const INPUT_CLASS =
  'h-11 rounded-xl border-slate-200 bg-white font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500';

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type FormState = {
  organizationId: string;
  cardholderName: string;
  cardType: MemberCardType | '';
  limitAmount: string;
  expiryDate: string;
  remarks: string;
  internalNotes: string;
  billingAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactEmail: string;
  autoRenewal: boolean;
};

function createEmptyForm(): FormState {
  return {
    organizationId: '',
    cardholderName: '',
    cardType: '',
    limitAmount: '',
    expiryDate: '',
    remarks: '',
    internalNotes: '',
    billingAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    autoRenewal: false,
  };
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
      <h3 className="text-[10px] font-black text-teal-700 uppercase tracking-widest">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <Label className={FIELD_LABEL}>
        {label}
        {required ? <span className="text-red-500 ml-0.5">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSuccess,
}: AddMemberModalProps) {
  const createMutation = useCreateMemberCard();
  const [form, setForm] = useState(() => createEmptyForm());

  // ✅ Fetch all organizations
  const { data: organizationsRes, isLoading: isLoadingOrgs } = useOrganizations(
    { pageNo: 0, pageSize: 200 },
    { enabled: isOpen }
  );

  const organizations = useMemo(() => {
    return organizationsRes?.data?.content ?? [];
  }, [organizationsRes?.data?.content]);

  const selectedOrganization = useMemo(
    () => organizations.find((o) => String(o.id) === form.organizationId),
    [organizations, form.organizationId]
  );

  const resetForm = () => setForm(createEmptyForm());

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setForm(createEmptyForm());
  }, [isOpen]);

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const organizationId = Number.parseInt(form.organizationId, 10);
    const cardholderName = form.cardholderName.trim();
    const cardType = form.cardType.trim() as MemberCardType;
    const limitAmount = Number.parseFloat(form.limitAmount);

    if (!Number.isFinite(organizationId) || organizationId < 1) {
      toast.error('Please select an organization.');
      return;
    }
    if (!cardholderName) {
      toast.error('Cardholder name is required.');
      return;
    }
    if (!cardType) {
      toast.error('Card type is required.');
      return;
    }
    if (!Number.isFinite(limitAmount) || limitAmount < 0) {
      toast.error('Limit amount must be a valid non-negative number.');
      return;
    }

    const expiryDate = form.expiryDate.trim();
    const minExpiry = todayIsoDate();
    if (expiryDate && expiryDate < minExpiry) {
      toast.error('Expiry date cannot be in the past.');
      return;
    }

    const payload: CreateMemberCardPayload = {
      organizationId,
      cardholderName,
      cardType,
      limitAmount,
      expiryDate: expiryDate || undefined,
      remarks: form.remarks.trim() || undefined,
      internalNotes: form.internalNotes.trim() || undefined,
      billingAddress: form.billingAddress.trim() || undefined,
      emergencyContactName: form.emergencyContactName.trim() || undefined,
      emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
      emergencyContactEmail: form.emergencyContactEmail.trim() || undefined,
      autoRenewal: form.autoRenewal,
    };

    try {
      const res = await createMutation.mutateAsync(payload);
      if (res.response === false) {
        toast.error(res.message || 'Failed to create member card.');
        return;
      }
      toast.success(res.message || 'Member card created successfully.');
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create member card.'
      );
    }
  };

  const submitting = createMutation.isPending;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-3">
          <CreditCard className="text-white" size={22} aria-hidden />
          <span>
            New <span className="text-emerald-200">Membership Card</span>
          </span>
        </div>
      }
      description="Create a membership card for an organization · organization, cardholder, type & limit required"
      footer={
        <div className="flex flex-wrap gap-3 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="border-slate-200 text-slate-600 font-bold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitting}
            className="custom-gradient text-white font-bold gap-2 min-w-[200px] h-12"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                Creating…
              </>
            ) : (
              <>
                <Plus size={18} aria-hidden />
                Create card
              </>
            )}
          </Button>
        </div>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-6 pb-4"
      >
        <FormSection title="Organization">
          <Field label="Organization" required className="sm:col-span-2">
            <Select
              value={form.organizationId}
              onValueChange={(v) => set('organizationId')(v ?? '')}
              disabled={submitting || isLoadingOrgs || organizations.length === 0}
            >
              <SelectTrigger className={`${INPUT_CLASS} font-bold`}>
                <SelectValue
                  placeholder={
                    isLoadingOrgs
                      ? 'Loading organizations…'
                      : organizations.length === 0
                        ? 'No organizations available'
                        : 'Select organization'
                  }
                >
                  {selectedOrganization
                    ? getOrganizationName(selectedOrganization)
                    : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={String(org.id)}>
                    {getOrganizationName(org)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Card details">
          <Field
            label="Cardholder name"
            required
            className="sm:col-span-2"
          >
            <Input
              value={form.cardholderName}
              onChange={(e) => set('cardholderName')(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Enter Cardholder Name"
              disabled={submitting}
            />
          </Field>
          <Field label="Card type" required>
            <Select
              value={form.cardType}
              onValueChange={(v) =>
                set('cardType')((v ?? '') as MemberCardType)
              }
              disabled={submitting}
            >
              <SelectTrigger className={`${INPUT_CLASS} font-bold`}>
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                {MEMBER_CARD_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {formatMemberCardLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Limit amount (₹)" required>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.limitAmount}
              onChange={(e) => set('limitAmount')(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Enter Limit Amount"
              disabled={submitting}
            />
          </Field>
          <Field label="Expiry date">
            <Input
              type="date"
              min={todayIsoDate()}
              value={form.expiryDate}
              onChange={(e) => set('expiryDate')(e.target.value)}
              className={INPUT_CLASS}
              disabled={submitting}
            />
          </Field>
          <Field label="Auto renewal" className="sm:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={form.autoRenewal}
                onChange={(e) => set('autoRenewal')(e.target.checked)}
                disabled={submitting}
                className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-bold text-slate-700">
                Enable auto renewal
              </span>
            </label>
          </Field>
        </FormSection>

        <FormSection title="Billing & address">
          <Field label="Billing address" className="sm:col-span-2">
            <Textarea
              value={form.billingAddress}
              onChange={(e) => set('billingAddress')(e.target.value)}
              className="min-h-[88px] rounded-xl border-slate-200 font-medium resize-y"
             
              disabled={submitting}
            />
          </Field>
        </FormSection>

        <FormSection title="Emergency contact">
          <Field label="Contact name">
            <Input
              value={form.emergencyContactName}
              onChange={(e) =>
                set('emergencyContactName')(e.target.value)
              }
              className={INPUT_CLASS}
              placeholder="John Smith"
              disabled={submitting}
            />
          </Field>
          <Field label="Contact phone">
            <Input
              value={form.emergencyContactPhone}
              onChange={(e) =>
                set('emergencyContactPhone')(e.target.value)
              }
              className={INPUT_CLASS}
              placeholder="+91-XX-XXXX-XXXX"
              maxLength={15}
              disabled={submitting}
            />
          </Field>
          <Field label="Contact email" className="sm:col-span-2">
            <Input
              type="email"
              value={form.emergencyContactEmail}
              onChange={(e) =>
                set('emergencyContactEmail')(e.target.value)
              }
              className={INPUT_CLASS}
              placeholder="EnterEmail"
              disabled={submitting}
            />
          </Field>
        </FormSection>

        <FormSection title="Notes">
          <Field label="Remarks" className="sm:col-span-2">
            <Textarea
              value={form.remarks}
              onChange={(e) => set('remarks')(e.target.value)}
              className="min-h-[72px] rounded-xl border-slate-200 font-medium resize-y"
             
              disabled={submitting}
            />
          </Field>
          <Field label="Internal notes" className="sm:col-span-2">
            <Textarea
              value={form.internalNotes}
              onChange={(e) => set('internalNotes')(e.target.value)}
              className="min-h-[72px] rounded-xl border-slate-200 font-medium resize-y"
              
              disabled={submitting}
            />
          </Field>
        </FormSection>
      </form>
    </RightDrawer>
  );
}
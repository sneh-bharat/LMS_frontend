'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CreditCard, Loader2, Pencil, Save } from 'lucide-react';
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
  MEMBER_CARD_TYPES,
  formatMemberCardLabel,
  getMemberCardExpiryDate,
  getMemberCardNumber,
  getMemberCardOrganization,
  getMemberCardType,
  getMemberCardholderName,
  type MemberCard,
  type MemberCardType,
  type UpdateMemberCardPayload,
} from '\.\.\/services\/member\.service';
import { useMemberCardById, useUpdateMemberCard } from '\.\.\/services\/member\.service';

const FORM_ID = 'edit-member-card-form';
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

function toDateInputValue(iso?: string | null): string {
  if (!iso?.trim()) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso.length >= 10 ? iso.slice(0, 10) : iso;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface EditMemberCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  cardId: number | null;
}

type FormState = {
  cardholderName: string;
  cardType: MemberCardType | '';
  expiryDate: string;
  remarks: string;
  autoRenewal: boolean;
};

function createFormFromCard(card: MemberCard): FormState {
  const cardTypeRaw = getMemberCardType(card).toUpperCase().replace(/\s+/g, '_');
  const cardType = MEMBER_CARD_TYPES.find((t) => t === cardTypeRaw) ?? '';

  return {
    cardholderName: getMemberCardholderName(card) === '—' ? '' : getMemberCardholderName(card),
    cardType,
    expiryDate: toDateInputValue(getMemberCardExpiryDate(card)),
    remarks: card.remarks?.trim() || card.notes?.trim() || '',
    autoRenewal: Boolean(card.autoRenewal),
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

export default function EditMemberCard({
  isOpen,
  onClose,
  onSuccess,
  cardId,
}: EditMemberCardProps) {
  const updateMutation = useUpdateMemberCard();

  const {
    data: cardRes,
    isLoading: isLoadingCard,
    isError: isCardError,
    error: cardError,
    refetch: refetchCard,
  } = useMemberCardById(cardId, { enabled: isOpen && cardId != null });

  const card = cardRes?.data;
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    cardholderName: '',
    cardType: '',
    expiryDate: '',
    remarks: '',
    autoRenewal: false,
  });

  const minExpiryDate = todayIsoDate();

  const handleClose = () => {
    if (!updateMutation.isPending) {
      setOrganizationId(null);
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen || !card) return;
    setOrganizationId(card.organizationId ?? null);
    setForm(createFormFromCard(card));
  }, [isOpen, card]);

  const set =
    <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardId || cardId < 1) {
      toast.error('Invalid member card.');
      return;
    }

    const orgId = organizationId ?? card?.organizationId;
    if (!orgId || orgId < 1) {
      toast.error('Organization is missing for this card. Cannot update.');
      return;
    }

    const cardholderName = form.cardholderName.trim();
    const cardType = form.cardType.trim() as MemberCardType;

    if (!cardholderName) {
      toast.error('Cardholder name is required.');
      return;
    }
    if (!cardType) {
      toast.error('Card type is required.');
      return;
    }

    const expiryDate = form.expiryDate.trim();
    if (expiryDate && expiryDate < minExpiryDate) {
      toast.error('Expiry date cannot be in the past.');
      return;
    }

    const payload: UpdateMemberCardPayload = {
      organizationId: orgId,
      cardholderName,
      cardType,
      expiryDate: expiryDate || undefined,
      remarks: form.remarks.trim() || undefined,
      autoRenewal: form.autoRenewal,
    };

    try {
      const res = await updateMutation.mutateAsync({ cardId, payload });
      if (res.response === false) {
        toast.error(res.message || 'Failed to update member card.');
        return;
      }
      toast.success(res.message || 'Member card updated successfully.');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update member card.');
    }
  };

  const submitting = updateMutation.isPending;
  const loading = isLoadingCard;

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-3">
          <Pencil className="text-white" size={22} aria-hidden />
          <span>
            Edit <span className="text-emerald-200">Membership Card</span>
          </span>
        </div>
      }
      description={
        card
          ? `${getMemberCardNumber(card)} · ${getMemberCardOrganization(card)}`
          : 'Update membership card details'
      }
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
            disabled={submitting || loading || isCardError || !card}
            className="custom-gradient text-white font-bold gap-2 min-w-[200px] h-12"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <Save size={18} aria-hidden />
                Save changes
              </>
            )}
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading card details…</p>
        </div>
      ) : isCardError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
          <p className="text-sm font-semibold text-rose-800">
            {cardError?.message || 'Failed to load member card.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold bg-white"
            onClick={() => void refetchCard()}
          >
            Retry
          </Button>
        </div>
      ) : card ? (
        <form id={FORM_ID} onSubmit={(e) => void handleSubmit(e)} className="space-y-6 pb-4">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0">
                <CreditCard size={24} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Organization (read-only)
                </p>
                <p className="text-sm font-bold text-slate-900 truncate">
                  {getMemberCardOrganization(card)}
                </p>
              </div>
            </div>
          </div>

          <FormSection title="Card details">
            <Field label="Cardholder name" required className="sm:col-span-2">
              <Input
                value={form.cardholderName}
                onChange={(e) => set('cardholderName')(e.target.value)}
                className={INPUT_CLASS}
                disabled={submitting}
              />
            </Field>
            <Field label="Card type" required>
              <Select
                value={form.cardType}
                onValueChange={(v) => set('cardType')((v ?? '') as MemberCardType)}
                disabled={submitting}
              >
                <SelectTrigger className={`${INPUT_CLASS} font-bold`}>
                  <SelectValue placeholder="Select card type">
                    {form.cardType ? formatMemberCardLabel(form.cardType) : null}
                  </SelectValue>
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
            <Field label="Expiry date">
              <Input
                type="date"
                min={minExpiryDate}
                value={form.expiryDate}
                onChange={(e) => {
                  const value = e.target.value;
                  set('expiryDate')(
                    value && value < minExpiryDate ? minExpiryDate : value
                  );
                }}
                className={INPUT_CLASS}
                disabled={submitting}
              />
            </Field>
          </FormSection>

          <FormSection title="Notes">
            <Field label="Auto renewal" className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.autoRenewal}
                  onChange={(e) => set('autoRenewal')(e.target.checked)}
                  disabled={submitting}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-bold text-slate-700">Enable auto renewal</span>
              </label>
            </Field>
            <Field label="Remarks" className="sm:col-span-2">
              <Textarea
                value={form.remarks}
                onChange={(e) => set('remarks')(e.target.value)}
                className="min-h-[88px] rounded-xl border-slate-200 font-medium resize-y"
                disabled={submitting}
              />
            </Field>
          </FormSection>
        </form>
      ) : null}
    </RightDrawer>
  );
}

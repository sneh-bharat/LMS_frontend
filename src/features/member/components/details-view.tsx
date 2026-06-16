'use client';

import { useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  Copy,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  User,
  Wallet,
} from 'lucide-react';
import { Badge, Button, RightDrawer } from '@/components/ui';
import {
  formatMemberCardCurrency,
  formatMemberCardDate,
  formatMemberCardLabel,
  getMemberCardAvailableBalance,
  getMemberCardExpiryDate,
  getMemberCardLimitAmount,
  getMemberCardNumber,
  getMemberCardOrganization,
  getMemberCardStatus,
  getMemberCardType,
  getMemberCardUsedAmount,
  getMemberCardholderName,
  type MemberCard,
} from '\.\.\/services\/member\.service';
import { useMemberCardById } from '\.\.\/services\/member\.service';

function statusBadgeVariant(status: string) {
  const s = status.toUpperCase();
  if (s === 'ACTIVE') return 'success' as const;
  if (s === 'PENDING') return 'warning' as const;
  if (s === 'INACTIVE' || s === 'EXPIRED' || s === 'BLOCKED') return 'destructive' as const;
  return 'secondary' as const;
}

function cardTypeBadgeClass(type: string): string {
  const t = type.toUpperCase();
  if (t.includes('CORPORATE')) return 'bg-violet-100 text-violet-700 border-violet-200';
  if (t.includes('INDIVIDUAL')) return 'bg-sky-100 text-sky-700 border-sky-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function DetailTile({
  label,
  value,
  icon: Icon,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
  highlight?: 'emerald' | 'amber' | 'teal';
}) {
  const valueClass =
    highlight === 'emerald'
      ? 'text-emerald-700'
      : highlight === 'amber'
        ? 'text-amber-700'
        : highlight === 'teal'
          ? 'text-[#006D77]'
          : 'text-slate-900';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-emerald-300 transition-all">
      <div className="flex items-center gap-2 mb-2">
        {Icon ? <Icon size={16} className="text-emerald-600 shrink-0" /> : null}
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-lg font-bold ${valueClass} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

function MemberCardDetailsBody({ card }: { card: MemberCard }) {
  const status = getMemberCardStatus(card);
  const cardType = getMemberCardType(card);
  const limit = getMemberCardLimitAmount(card);
  const used = getMemberCardUsedAmount(card);
  const available = getMemberCardAvailableBalance(card);

  return (
    <div className="space-y-8 pb-4">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <CreditCard size={32} aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-slate-900 mb-1 line-clamp-2">
              {getMemberCardholderName(card)}
            </h2>
            <p className="text-sm font-mono font-bold text-slate-500 mb-3">
              {getMemberCardNumber(card)}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={statusBadgeVariant(status)}
                className="font-black text-[10px] uppercase"
              >
                {formatMemberCardLabel(status)}
              </Badge>
              <Badge
                className={`px-3 py-1 text-[10px] font-bold uppercase border ${cardTypeBadgeClass(cardType)}`}
              >
                {formatMemberCardLabel(cardType)}
              </Badge>
              {card.branchId != null ? (
                <Badge variant="secondary" className="font-black text-[10px] uppercase">
                  Branch #{card.branchId}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailTile
          label="Limit amount"
          value={formatMemberCardCurrency(limit)}
          icon={Wallet}
          mono
          highlight="teal"
        />
        <DetailTile
          label="Used amount"
          value={formatMemberCardCurrency(used)}
          icon={Wallet}
          mono
          highlight="amber"
        />
        <DetailTile
          label="Available balance"
          value={formatMemberCardCurrency(available)}
          icon={CreditCard}
          mono
          highlight="emerald"
        />
        <DetailTile
          label="Expiry date"
          value={formatMemberCardDate(getMemberCardExpiryDate(card))}
          icon={Calendar}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
          <User size={18} className="text-emerald-600" />
          Cardholder & organization
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <User size={10} className="text-emerald-500" />
              Cardholder name
            </label>
            <p className="text-sm font-bold text-slate-900">{getMemberCardholderName(card)}</p>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Building2 size={10} className="text-emerald-500" />
              Organization
            </label>
            <p className="text-sm font-bold text-slate-900">{getMemberCardOrganization(card)}</p>
          </div>
          {/* <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Mail size={10} className="text-emerald-500" />
              Email
            </label>
            <p className="text-sm font-bold text-slate-900">{card.email?.trim() || '—'}</p>
          </div> */}
          {/* <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Phone size={10} className="text-emerald-500" />
              Phone
            </label>
            <p className="text-sm font-bold text-slate-900">
              {card.phone?.trim() || card.mobile?.trim() || '—'}
            </p>
          </div> */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Card identifiers
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-600 font-medium">Card ID</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{card.id}</span>
            </div>
            {card.patientId != null ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 font-medium">Patient ID</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{card.patientId}</span>
              </div>
            ) : null}
            {card.memberId != null ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 font-medium">Member ID</span>
                <span className="text-sm font-bold text-slate-900 font-mono">{card.memberId}</span>
              </div>
            ) : null}
            {card.organizationId != null ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 font-medium">Organization ID</span>
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {card.organizationId}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Dates & benefits
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-600 font-medium">Issue date</span>
              <span className="text-sm font-bold text-slate-900">
                {formatMemberCardDate(card.issueDate ?? card.issuedDate)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-slate-600 font-medium">Activated</span>
              <span className="text-sm font-bold text-slate-900">
                {formatMemberCardDate(card.activatedDate)}
              </span>
            </div>
            {card.cashbackPercentage != null ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 font-medium">Cashback</span>
                <Badge variant="success" className="text-[10px] font-bold">
                  {card.cashbackPercentage}%
                </Badge>
              </div>
            ) : null}
            {card.discountPercentage != null ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-600 font-medium">Discount</span>
                <Badge variant="primary" className="text-[10px] font-bold">
                  {card.discountPercentage}%
                </Badge>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {(card.remarks?.trim() || card.notes?.trim()) ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-3">Notes</h3>
          <p className="text-slate-700 leading-relaxed text-sm">
            {card.remarks?.trim() || card.notes?.trim()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export interface MemberDetailsViewProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: number | null;
  onEdit?: (card: MemberCard) => void;
}

export default function MemberDetailsView({
  isOpen,
  onClose,
  cardId,
  onEdit,
}: MemberDetailsViewProps) {
  const [copied, setCopied] = useState(false);
  const { data, isLoading, isError, error, refetch } = useMemberCardById(cardId, {
    enabled: isOpen && cardId != null,
  });

  const card = data?.data;

  const handleCopyCardNumber = () => {
    if (!card) return;
    const num = getMemberCardNumber(card);
    if (num === '—') return;
    void navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const footer = (
    <div className="flex gap-3 justify-end w-full flex-wrap">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="px-6 py-2 rounded-lg font-bold text-sm border-slate-300 text-slate-700"
      >
        Close
      </Button>
      {onEdit && card ? (
        <Button
          type="button"
          onClick={() => onEdit(card)}
          className="px-6 py-2 rounded-lg custom-gradient text-white font-bold text-sm gap-2"
        >
          Edit card
        </Button>
      ) : null}
    </div>
  );

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Member <span className="text-emerald-200">Details</span>
        </>
      }
      description="View complete membership card information"
      footer={footer}
      maxWidth="xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading member card details…</p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
          <p className="text-sm font-semibold text-rose-800">
            {error?.message || 'Failed to load member card details.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold bg-white"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : card ? (
        <>
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={handleCopyCardNumber}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy card number'}
            </button>
          </div>
          <MemberCardDetailsBody card={card} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <CreditCard size={64} className="mb-4 text-slate-200" strokeWidth={1} aria-hidden />
          <p className="text-sm font-bold text-slate-900">No member card details available</p>
          <p className="text-xs font-semibold text-slate-400 mt-1">The record may have been removed.</p>
        </div>
      )}
    </RightDrawer>
  );
}

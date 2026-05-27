'use client';

import {
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  Loader2,
  RefreshCcw,
  User,
  Wallet,
} from 'lucide-react';

import { Badge, Button, RightDrawer } from '@/components/ui';
import { useMemberCardBalanceById } from '@/app/Apis/membership/useMembership';
import {
  formatMemberCardCurrency,
  formatMemberCardDate,
  formatMemberCardLabel,
  formatMemberCardPercent,
  getMemberCardAvailableBalance,
  getMemberCardLimitAmount,
  getMemberCardNumber,
  getMemberCardOrganization,
  getMemberCardStatus,
  getMemberCardType,
  getMemberCardUsedAmount,
  memberCardFromBalanceData,
} from '@/app/Apis/membership/membership';
import { useCallback, useMemo, useState } from 'react';
import CardRecharge from './CardRecharge';

type MemberCardDetailsProps = {
  isOpen: boolean;
  onClose: () => void;
  cardId: number | null;
};

export default function MemberCardDetailsDrawer({
  isOpen,
  onClose,
  cardId,
}: MemberCardDetailsProps) {
  const [rechargeFormOpen, setRechargeFormOpen] = useState(false);
  const [rechargeTarget, setRechargeTarget] = useState<{ id: number; label: string } | null>(null);

  const handleOpenRechargeForm = useCallback((id: number | null) => {
    if (!id || id <= 0) return;
    setRechargeFormOpen(true);
    setRechargeTarget({
      id,
      label: String(id),
    });
  }, []);

  const { data: balanceRes, isLoading, error, refetch } = useMemberCardBalanceById(cardId, {
    enabled: isOpen && cardId != null && cardId > 0,
  });

  const card = useMemo(() => {
    const balance = balanceRes?.data;
    if (!balance) return null;
    return memberCardFromBalanceData(balance);
  }, [balanceRes?.data]);

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Card Details"
      description="View card details"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading card balance…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load card balance.
        </div>
      ) : !card ? (
        <div className="text-sm text-muted-foreground">No card balance data.</div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                Card number
              </div>
              <div className="mt-1 font-medium">{getMemberCardNumber(card)}</div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Organization
              </div>
              <div className="mt-1 font-medium">{getMemberCardOrganization(card)}</div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-4 w-4" />
                Available balance
              </div>
              <div className="mt-1 font-semibold">
                {formatMemberCardCurrency(getMemberCardAvailableBalance(card))}
              </div>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-4 w-4" />
                Status / type
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{formatMemberCardLabel(getMemberCardType(card))}</Badge>
                <Badge>{formatMemberCardLabel(getMemberCardStatus(card))}</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-md border p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">Limit</div>
                <div className="mt-1 font-medium">
                  {formatMemberCardCurrency(getMemberCardLimitAmount(card))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Used</div>
                <div className="mt-1 font-medium">
                  {formatMemberCardCurrency(getMemberCardUsedAmount(card))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Usage</div>
                <div className="mt-1 font-medium">
                  {formatMemberCardPercent(balanceRes?.data?.usagePercentage)}
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Expiry date
                </div>
                <div className="mt-1 font-medium">
                  {formatMemberCardDate(balanceRes?.data?.expiryDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last transaction</div>
                <div className="mt-1 font-medium">
                  {formatMemberCardDate(balanceRes?.data?.lastTransactionDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
                          onClick={() => handleOpenRechargeForm(cardId)}
                          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-blue-700"
                        >
                          <RefreshCcw size={16} className="mr-3 text-blue-500" />
                          <span>Recharge</span>
                      </Button>
          </div>
        </div>
      )}
      <CardRecharge
        isOpen={rechargeFormOpen}
        onClose={() => setRechargeFormOpen(false)}
        cardId={rechargeTarget?.id ?? null}
        onSuccess={() => void refetch()}
      />
    </RightDrawer>
  );
}

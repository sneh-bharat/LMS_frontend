'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  ChevronDown,
  CreditCard,
  Eye,
  Filter,
  Loader2,
  MoreHorizontal,
  Percent,
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  SearchX,
  Trash2,
  TrendingDown,
  Wallet,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ConfirmAlertDialog,
  DeleteAlertDialog,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useBranchesAll } from '@/app/Apis/branch/useBranchApi';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatMemberCardCurrency,
  formatMemberCardDate,
  formatMemberCardLabel,
  formatMemberCardPercent,
  getMemberCardAvailableBalance,
  getMemberCardExpiryDate,
  getMemberCardLimitAmount,
  getMemberCardNumber,
  getMemberCardOrganization,
  getMemberCardStatus,
  getMemberCardType,
  getMemberCardUsedAmount,
  getMemberCardholderName,
  isMemberCardPendingActivation,
  normalizeMemberCardStatusKey,
  MEMBER_CARD_TYPES,
  type MemberCard,
} from '@/app/Apis/membership/membership';
import {
  useActivateMemberCard,
  useDeleteMemberCard,
  useMemberCardStatistics,
  useMemberCards,
  useLowBalanceMemberCards,
  useExpiringMemberCards,
  useSuspendMemberCard,
  useUnblockMemberCard,
} from '@/app/Apis/membership/useMembership';
import AddMemberModal from './AddMemberModal';
import CardBalanceDetails from './card-details';
import MemberDetailsView from './details-view';
import EditMemberCard from './edit-member';
import MemberCardTransactionsDetails from './TransactionsDetails';

const PAGE_SIZE = 10;
const DEFAULT_BRANCH_ID = 1;

const filterLabelClass =
  'text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1';
const inputClass =
  'h-11 rounded-xl border-slate-200 bg-white/80 hover:bg-white transition-all font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500';

function statusBadgeVariant(status: string) {
  const s = status.toUpperCase().replace(/\s+/g, '_');
  if (s === 'ACTIVE') return 'success';
  if (s === 'PENDING_ACTIVATION' || s === 'PENDING') return 'warning';
  if (s === 'INACTIVE' || s === 'EXPIRED' || s === 'BLOCKED') return 'destructive';
  return 'secondary';
}

function cardTypeBadgeClass(type: string): string {
  const t = type.toUpperCase();
  if (t.includes('CORPORATE')) {
    return 'bg-violet-100 text-violet-700 border-violet-200';
  }
  if (t.includes('INDIVIDUAL')) {
    return 'bg-sky-100 text-sky-700 border-sky-200';
  }
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

function MemberCardActions({
  row,
  onView,
  onCardDetails,
  onTransactions,
  onApprove,
  onEdit,
  onSuspend,
  onUnblock,
  onDelete,
}: {
  row: MemberCard;
  onView: (row: MemberCard) => void;
  onCardDetails?: (row: MemberCard) => void;
  onTransactions?: (row: MemberCard) => void;
  onApprove?: (row: MemberCard) => void;
  onEdit: (row: MemberCard) => void;
  onSuspend?: (row: MemberCard) => void;
  onUnblock?: (row: MemberCard) => void;
  onDelete: (row: MemberCard) => void;
}) {
  const isPending = isMemberCardPendingActivation(row);
  const cardStatus = normalizeMemberCardStatusKey(row.status ?? row.cardStatus ?? '');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Member card actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-52 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => onView(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
        {onCardDetails ? (
          <DropdownMenuItem
            onClick={() => onCardDetails(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-[#006D77] focus:bg-emerald-50 focus:text-[#006D77]"
          >
            <CreditCard size={14} />
            Card details
          </DropdownMenuItem>
        ) : null}
        {onTransactions ? (
          <DropdownMenuItem
            onClick={() => onTransactions(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-violet-600 focus:bg-violet-50 focus:text-violet-700"
          >
            <Receipt size={14} />
            Transactions
          </DropdownMenuItem>
        ) : null}
        {isPending && onApprove ? (
          <DropdownMenuItem
            onClick={() => onApprove(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
          >
            <Plus size={14} className="text-amber-600" />
            Approve
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={() => onEdit(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-blue-600 focus:bg-blue-50 focus:text-blue-700"
        >
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        {onSuspend && cardStatus === 'ACTIVE' ? (
          <DropdownMenuItem
            onClick={() => onSuspend(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
          >
            <AlertCircle size={14} />
            Suspend
          </DropdownMenuItem>
        ) : null}
        {onUnblock && (cardStatus === 'INACTIVE' || cardStatus === 'EXPIRED' || cardStatus === 'BLOCKED' || cardStatus === 'SUSPENDED') ? (
          <DropdownMenuItem
            onClick={() => onUnblock(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
          >
            <RefreshCw size={14} />
            Unblock
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem
          onClick={() => onDelete(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-rose-600 focus:bg-rose-50 focus:text-rose-700"
        >
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function MembersPage() {
  const [pageNo, setPageNo] = useState(0);
  const [branchId, setBranchId] = useState(String(DEFAULT_BRANCH_ID));
  const [search, setSearch] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [balanceDetailsOpen, setBalanceDetailsOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<MemberCard | null>(null);
  const deleteMutation = useDeleteMemberCard();
  const activateMutation = useActivateMemberCard();
  const suspendMutation = useSuspendMemberCard();
  const unblockMutation = useUnblockMemberCard();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendingCard, setSuspendingCard] = useState<MemberCard | null>(null);
  const [suspendReason, setSuspendReason] = useState('Payment overdue');
  const [unblockDialogOpen, setUnblockDialogOpen] = useState(false);
  const [unblockingCard, setUnblockingCard] = useState<MemberCard | null>(null);
  const [editCardId, setEditCardId] = useState<number | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [cardToApprove, setCardToApprove] = useState<MemberCard | null>(null);
  const [isLowBalanceOnly, setIsLowBalanceOnly] = useState(false);
  const [isExpiringOnly, setIsExpiringOnly] = useState(false);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });


  const { data: branchesData, isLoading: isLoadingBranches } = useBranchesAll({ size: 100 });
  const branches = branchesData?.data?.content ?? [];

  const parsedBranchId = useMemo(() => {
    const id = Number.parseInt(branchId.trim(), 10);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [branchId]);

  const selectedBranch = useMemo(
    () => branches.find((b) => String(b.id) === branchId),
    [branches, branchId]
  );

  const selectedBranchName = selectedBranch?.branchName?.trim() || null;

  useEffect(() => {
    if (branches.length === 0) return;

    const currentValid = branches.some((b) => String(b.id) === branchId);
    if (currentValid) return;

    const defaultBranch =
      branches.find((b) => b.id === DEFAULT_BRANCH_ID) ?? branches[0];
    if (defaultBranch) {
      setBranchId(String(defaultBranch.id));
    }
  }, [branches, branchId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(search.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const isSearchActive = debouncedSearchTerm.length > 0;

  useEffect(() => {
    setPageNo(0);
  }, [parsedBranchId, typeFilter, statusFilter, dateRange, debouncedSearchTerm, isLowBalanceOnly, isExpiringOnly, dateRangeFilter]);

  const {
    data: statisticsRes,
    isLoading: isStatisticsLoading,
    isError: isStatisticsError,
    error: statisticsError,
    isFetching: isStatisticsFetching,
    refetch: refetchStatistics,
  } = useMemberCardStatistics(
    { branchId: parsedBranchId ?? undefined },
    { enabled: parsedBranchId != null && !isSearchActive }
  );

  const statistics = statisticsRes?.data ?? null;

  const {
    data: lowBalanceRes,
    isLoading: isLoadingLowBalance,
    isFetching: isFetchingLowBalance,
    refetch: refetchLowBalance,
  } = useLowBalanceMemberCards(
    { thresholdPercentage: 50, branchId: parsedBranchId ?? undefined },
    { enabled: isLowBalanceOnly }
  );

  const {
    data: expiringRes,
    isLoading: isLoadingExpiring,
    isFetching: isFetchingExpiring,
  } = useExpiringMemberCards(
    {
      startDate: dateRangeFilter.from ? format(dateRangeFilter.from, 'yyyy-MM-dd') : '',
      endDate: dateRangeFilter.to ? format(dateRangeFilter.to, 'yyyy-MM-dd') : '',
      branchId: parsedBranchId ?? undefined,
    },
    { enabled: isExpiringOnly && !!dateRangeFilter.from && !!dateRangeFilter.to }
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useMemberCards(
    {
      pageNo,
      pageSize: PAGE_SIZE,
      branchId: isSearchActive ? undefined : (parsedBranchId ?? undefined),
      searchTerm: debouncedSearchTerm || undefined,
    },
    { enabled: (parsedBranchId != null || isSearchActive) && !isLowBalanceOnly && !isExpiringOnly }
  );

  const lowBalanceCardsCount = lowBalanceRes?.data?.totalElements ?? 0;
  const expiringCardsCount = expiringRes?.data?.totalElements ?? 0;
  const page = isExpiringOnly ? expiringRes?.data : isLowBalanceOnly ? lowBalanceRes?.data : data?.data;
  const memberCards = page?.content ?? [];
  const totalPages = page?.totalPages ?? 1;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page?.last != null ? !page.last : pageNo + 1 < totalPages;

  const tableLoading = isLoading;
  const tableFetching = isFetching;
  const tableIsError = isError;
  const tableError = error;

  const refetchTable = () => {
    void refetch();
  };

  const filteredCards = useMemo(() => {
    return memberCards.filter((card) => {
      const cardType = getMemberCardType(card).toUpperCase();
      const status = getMemberCardStatus(card);
      const expiryDate = getMemberCardExpiryDate(card);
      const matchesType =
        typeFilter === 'All' || cardType.includes(typeFilter.toUpperCase());
      const matchesStatus =
        statusFilter === 'All' ||
        normalizeMemberCardStatusKey(status) === normalizeMemberCardStatusKey(statusFilter);
      let matchesDateRange = true;
      if (dateRange !== 'All') {
        if (!expiryDate) {
          matchesDateRange = false;
        } else {
          const expiry = new Date(expiryDate);
          if (Number.isNaN(expiry.getTime())) {
            matchesDateRange = false;
          } else {
            const now = new Date();
            const daysByRange: Record<string, number> = {
              '1 week': 7,
              '1 month': 30,
              '3 months': 90,
              '6 months': 180,
              '1 year': 365,
            };
            const maxDays = daysByRange[dateRange];
            if (maxDays == null) {
              matchesDateRange = true;
            } else {
              const diffMs = expiry.getTime() - now.getTime();
              const diffDays = diffMs / (1000 * 60 * 60 * 24);
              matchesDateRange = diffDays >= 0 && diffDays <= maxDays;
            }
          }
        }
      }

      return matchesType && matchesStatus && matchesDateRange;
    });
  }, [memberCards, typeFilter, statusFilter, dateRange]);

  const statCards = useMemo(
    () => [
      {
        label: 'Total Cards',
        value: statistics != null ? String(statistics.totalCards) : '—',
        icon: CreditCard,
        tone: 'text-[#FF671F]',
        bg: 'bg-[#FF671F]/15',
        valueColor: 'text-[#FF671F]',
      },
      {
        label: 'Total Limit',
        value:
          statistics != null ? formatMemberCardCurrency(statistics.totalLimit) : '—',
        icon: Wallet,
        tone: 'text-violet-600',
        bg: 'bg-violet-100',
        valueColor: 'text-violet-700',
      },
      {
        label: 'Total Used',
        value: statistics != null ? formatMemberCardCurrency(statistics.totalUsed) : '—',
        icon: TrendingDown,
        tone: 'text-amber-600',
        bg: 'bg-amber-100',
        valueColor: 'text-amber-700',
      },
      {
        label: 'Available Balance',
        value:
          statistics != null
            ? formatMemberCardCurrency(statistics.availableBalance)
            : '—',
        icon: CreditCard,
        tone: 'text-[#006D77]',
        bg: 'bg-[#006D77]/15',
        valueColor: 'text-[#006D77]',
      },
      {
        label: 'Average Usage',
        value:
          statistics != null ? formatMemberCardPercent(statistics.averageUsage) : '—',
        icon: Percent,
        tone: 'text-sky-600',
        bg: 'bg-sky-100',
        valueColor: 'text-sky-700',
      },
      // {
      //   label: 'Low Balance',
      //   value: isLoadingLowBalance ? '…' : String(lowBalanceCardsCount),
      //   icon: AlertCircle,
      //   tone: isLowBalanceOnly ? 'text-white' : 'text-rose-600',
      //   bg: isLowBalanceOnly ? 'bg-rose-600' : 'bg-rose-100',
      //   valueColor: isLowBalanceOnly ? 'text-white' : 'text-rose-700',
      //   onClick: () => setIsLowBalanceOnly(!isLowBalanceOnly),
      //   active: isLowBalanceOnly,
      // },
    ],
    [statistics, lowBalanceCardsCount, isLoadingLowBalance, isLowBalanceOnly]
  );

  const openViewDetails = (card: MemberCard) => {
    if (card.id > 0) {
      setSelectedCardId(card.id);
      setSelectedCard(card);
      setViewDetailsOpen(true);
    }
  };

  const openBalanceDetails = (card: MemberCard) => {
    if (card.id > 0) {
      setSelectedCardId(card.id);
      setSelectedCard(card);
      setBalanceDetailsOpen(true);
    }
  };

  const handleView = (card: MemberCard) => {
    openViewDetails(card);
  };

  const handleCardDetails = (card: MemberCard) => {
    openBalanceDetails(card);
  };

  const openTransactions = (card: MemberCard) => {
    if (card.id > 0) {
      setSelectedCardId(card.id);
      setSelectedCard(card);
      setTransactionsOpen(true);
    }
  };

  const closeTransactions = () => {
    setTransactionsOpen(false);
    setSelectedCardId(null);
    setSelectedCard(null);
  };

  const closeDetails = () => {
    setViewDetailsOpen(false);
    setBalanceDetailsOpen(false);
    setSelectedCardId(null);
    setSelectedCard(null);
  };

  const handleEdit = (card: MemberCard) => {
    if (card.id > 0) {
      closeDetails();
      setEditCardId(card.id);
      setEditOpen(true);
    }
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditCardId(null);
  };

  const handleDelete = (card: MemberCard) => {
    if (card.id > 0) {
      setDeletingCardId(card.id);
      setDeleteDialogOpen(true);
    }
  };

  const handleApprove = (card: MemberCard) => {
    setCardToApprove(card);
    setApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!cardToApprove?.id) return;

    try {
      const res = await activateMutation.mutateAsync(cardToApprove.id);
      if (res.response === false) {
        toast.error(res.message || 'Failed to approve membership card.');
        return;
      }
      toast.success(res.message || 'Membership card approved and activated successfully.');
      setApproveOpen(false);
      setCardToApprove(null);
      refetchTable();
      void refetchStatistics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve membership card.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCardId) return;

    try {
      const res = await deleteMutation.mutateAsync(deletingCardId);
      if (res.response === false) {
        toast.error(res.message || 'Failed to delete member card.');
        return;
      }
      toast.success(res.message || 'Member card deleted successfully.');
      setDeleteDialogOpen(false);
      setDeletingCardId(null);
      if (selectedCardId === deletingCardId) {
        closeDetails();
      }
      if (editCardId === deletingCardId) {
        closeEdit();
      }
      refetchTable();
      void refetchStatistics();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete member card.');
    }
  };

  const handleConfirmSuspend = async () => {
    if (!suspendingCard) return;
    try {
      await suspendMutation.mutateAsync({ cardId: suspendingCard.id, reason: suspendReason });
      toast.success('Member card suspended successfully.');
      setSuspendDialogOpen(false);
      setSuspendingCard(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to suspend member card.');
    }
  };

  const handleConfirmUnblock = async () => {
    if (!unblockingCard) return;
    try {
      await unblockMutation.mutateAsync(unblockingCard.id);
      toast.success('Member card unblocked successfully.');
      setUnblockDialogOpen(false);
      setUnblockingCard(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unblock member card.');
    }
  };

  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <MemberDetailsView
        isOpen={viewDetailsOpen}
        onClose={closeDetails}
        cardId={selectedCardId}
        onEdit={handleEdit}
      />
      <CardBalanceDetails
        isOpen={balanceDetailsOpen}
        onClose={closeDetails}
        cardId={selectedCardId}
      />
      <MemberCardTransactionsDetails
        isOpen={transactionsOpen}
        onClose={closeTransactions}
        cardId={selectedCardId}
        cardLabel={
          selectedCard
            ? `${getMemberCardNumber(selectedCard)} · ${getMemberCardholderName(selectedCard)}`
            : undefined
        }
      />
      <EditMemberCard
        isOpen={editOpen}
        onClose={closeEdit}
        cardId={editCardId}
        onSuccess={() => {
          refetchTable();
          void refetchStatistics();
        }}
      />
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Masters — <span className="text-[#FF671F]">Membership</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            View and manage membership cards, balances, and validity by branch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 bg-slate-50 text-[#006D77] border border-slate-200 font-bold"
          >
            {totalElements} Card{totalElements === 1 ? '' : 's'}
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 font-bold border-slate-200 bg-white shadow-sm"
            disabled={tableLoading || tableFetching || isStatisticsFetching}
            onClick={() => {
              refetchTable();
              void refetchStatistics();
            }}
          >
            <RefreshCw
              size={16}
              className={tableFetching || isStatisticsFetching ? 'animate-spin' : ''}
              aria-hidden
            />
            Refresh
          </Button>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} aria-hidden />
            New Membership Card
          </Button>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2.5 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl -ml-12 -mb-12 pointer-events-none" />

        {isStatisticsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" aria-hidden />
            <span className="text-sm font-semibold">Loading statistics…</span>
          </div>
        ) : (
          <div className="flex flex-nowrap items-stretch gap-0 overflow-x-auto pb-1 scrollbar-thin">
            {statCards.map((card: any, index) => {
              const Icon = card.icon;
              return (
                <button
                  type="button"
                  key={card.label}
                  onClick={card.onClick}
                  disabled={!card.onClick}
                  className={`flex min-w-[8rem] flex-1 flex-col items-center justify-center px-2 py-1 text-center sm:min-w-0 transition-all hover:bg-slate-50 active:scale-95 ${index < statCards.length - 1 ? 'border-r border-slate-200/70' : ''
                    } ${card.active ? 'ring-2 ring-inset ring-rose-500/20 bg-rose-50/30' : ''}`}
                >
                  <div
                    className={`mb-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${card.bg}`}
                  >
                    <Icon size={16} className={card.tone} aria-hidden />
                  </div>
                  <span className="mb-0.5 text-[9px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span className={`text-base font-black leading-none sm:text-lg transition-colors ${card.valueColor}`}>
                    {card.value}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl p-3 shadow-sm border-t-white/30">
        <div className="flex flex-wrap items-center gap-3 pb-4 pt-1">

          {/* Search */}
          <div className="flex-1 min-w-[280px] relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
              size={16}
              aria-hidden
            />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or card #"
              className={`${inputClass} pl-10 pr-10 h-9 text-xs font-bold`}
              disabled={tableLoading}
              title="Search by cardholder name or card number"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                aria-label="Clear search"
              >
                <SearchX size={14} />
              </button>
            ) : null}
          </div>

          {/* Card Type */}
          <div className="w-[140px] relative group">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
              size={14}
              aria-hidden
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${inputClass} w-full pl-9 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer h-9`}
              disabled={tableLoading}
              title="Filter by card type"
            >
              <option value="All">All Types</option>
              {MEMBER_CARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatMemberCardLabel(t)}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={12}
              aria-hidden
            />
          </div>

          {/* Status */}
          <div className="w-[140px] relative group">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
              size={14}
              aria-hidden
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${inputClass} w-full pl-9 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer h-9`}
              disabled={tableLoading}
              title="Filter by status"
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING ACTIVATION">Pending activation</option>
            </select>
            <ChevronDown
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={12}
              aria-hidden
            />
          </div>

          {/* Branch */}
          <div className="w-[160px] relative group">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
              size={14}
              aria-hidden
            />
            <Select
              value={branchId}
              onValueChange={(v) => setBranchId(v ?? '')}
              disabled={(tableLoading && !isSearchActive) || isLoadingBranches || branches.length === 0}
            >
              <SelectTrigger
                className={`${inputClass} w-full h-9 pl-9 pr-8 text-[10px] font-bold uppercase`}
              >
                <SelectValue
                  placeholder={
                    isLoadingBranches ? 'Loading branches…' : 'Branch'
                  }
                >
                  {selectedBranchName}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={String(branch.id)}>
                    {branch.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Expiring Soon Date Filter - Native HTML5 version */}
          <div className="flex items-center gap-1.5 bg-slate-50/50 rounded-xl p-1 border border-slate-200/60">
            <div className="flex items-center gap-1 pl-1">
              <CalendarDays className="text-slate-400" size={14} />
              <span className="text-[9px] font-black uppercase text-slate-400">Expiring:</span>
            </div>

            <input
              type="date"
              value={dateRangeFilter.from ? format(dateRangeFilter.from, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setDateRangeFilter(prev => ({ ...prev, from: date }));
                if (date) setIsExpiringOnly(true);
              }}
              min={todayStr}
              className="h-7 w-28 px-2 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              title="Filter by expiry start date"
            />

            <span className="text-slate-300">to</span>

            <input
              type="date"
              value={dateRangeFilter.to ? format(dateRangeFilter.to, 'yyyy-MM-dd') : ''}
              onChange={(e) => {
                const date = e.target.value ? new Date(e.target.value) : undefined;
                setDateRangeFilter(prev => ({ ...prev, to: date }));
                if (date) setIsExpiringOnly(true);
              }}
              min={todayStr}
              className="h-7 w-28 px-2 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
              title="Filter by expiry end date"
            />

            {isExpiringOnly && (
              <button
                type="button"
                onClick={() => {
                  setIsExpiringOnly(false);
                  setDateRangeFilter({ from: undefined, to: undefined });
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors"
                title="Clear expiry filter"
              >
                <SearchX size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-[1.5rem] bg-white border border-slate-300 backdrop-blur-md shadow-sm ">
          <Table className="border-collapse">
            <TableHeader className="bg-teal-600 border-b border-slate-100">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                  Card Number
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                  Cardholder Name
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                  Organization
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                  Card Type
                </TableHead>

                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest text-right">
                  Limit Amount
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest text-right">
                  Used Amount
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest text-right">
                  Available Balance
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                  Card Status
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                  Expiry Date
                </TableHead>
                <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest text-center">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
              {!isSearchActive && parsedBranchId == null ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={10}
                    className="px-6 py-16 text-center text-slate-500 text-sm font-semibold"
                  >
                    Select a branch to load member cards.
                  </TableCell>
                </TableRow>
              ) : tableLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full" />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        Loading member cards…
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tableIsError ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10} className="px-6 py-12">
                    <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      <AlertCircle size={18} className="shrink-0" aria-hidden />
                      <span className="font-medium">
                        {tableError?.message || 'Failed to load member cards.'}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="font-bold bg-white border-rose-200"
                        onClick={() => refetchTable()}
                      >
                        Retry
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredCards.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={10} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <CreditCard size={32} strokeWidth={1} aria-hidden />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">No member cards found</h4>
                      <p className="text-xs font-semibold text-slate-500 tracking-tight">
                        {isSearchActive
                          ? `No cards found for "${debouncedSearchTerm}".`
                          : memberCards.length === 0
                            ? `No records for ${selectedBranchName ?? `branch #${parsedBranchId}`} on this page.`
                            : 'Try adjusting filters.'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((card) => {
                  const status = getMemberCardStatus(card);
                  const cardType = getMemberCardType(card);
                  return (
                    <TableRow
                      key={card.id}
                      className="hover:bg-emerald-50/30 transition-all group border-none cursor-pointer"
                      onClick={() => handleView(card)}
                    >
                      <TableCell className="px-6 py-5">
                        <span className="text-xs font-bold text-slate-900 font-mono group-hover:text-emerald-700 transition-colors">
                          {getMemberCardNumber(card)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {getMemberCardholderName(card)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-xs font-bold text-slate-600 max-w-[180px] truncate">
                        {getMemberCardOrganization(card)}
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge
                          className={`px-3 py-1.5 text-[10px] font-bold uppercase border ${cardTypeBadgeClass(cardType)}`}
                        >
                          {formatMemberCardLabel(cardType)}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-5 text-right text-sm font-bold text-slate-800 font-mono">
                        {formatMemberCardCurrency(getMemberCardLimitAmount(card))}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right text-sm font-bold text-amber-700 font-mono">
                        {formatMemberCardCurrency(getMemberCardUsedAmount(card))}
                      </TableCell>
                      <TableCell className="px-6 py-5 text-right text-sm font-bold text-emerald-700 font-mono">
                        {formatMemberCardCurrency(getMemberCardAvailableBalance(card))}
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge
                          variant={statusBadgeVariant(status)}
                          className="font-black text-[10px] uppercase tracking-wider"
                        >
                          {formatMemberCardLabel(status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-xs font-bold text-slate-600">
                        {formatMemberCardDate(getMemberCardExpiryDate(card))}
                      </TableCell>
                      <TableCell
                        className="px-6 py-5 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MemberCardActions
                          row={card}
                          onView={handleView}
                          onCardDetails={handleCardDetails}
                          onTransactions={openTransactions}
                          onApprove={handleApprove}
                          onEdit={handleEdit}
                          onSuspend={(c) => { setSuspendingCard(c); setSuspendDialogOpen(true); }}
                          onUnblock={(c) => { setUnblockingCard(c); setUnblockDialogOpen(true); }}
                          onDelete={handleDelete}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {(isSearchActive || parsedBranchId != null) && !tableLoading && !tableIsError ? (
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
                <span className="text-slate-400 font-semibold normal-case tracking-normal ml-2">
                  · {totalElements} card{totalElements === 1 ? '' : 's'}
                  {isSearchActive ? (
                    <>
                      {' '}
                      for &quot;{debouncedSearchTerm}&quot;
                    </>
                  ) : null}
                  {typeFilter !== 'All' || statusFilter !== 'All'
                    ? ` · ${filteredCards.length} shown on this page`
                    : ''}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-bold border-slate-200 bg-white"
                  disabled={!canPrev || tableFetching}
                  onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-bold border-slate-200 bg-white"
                  disabled={!canNext || tableFetching}
                  onClick={() => setPageNo((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        <DeleteAlertDialog
          isOpen={deleteDialogOpen}
          onClose={() => {
            if (!isDeleting) {
              setDeleteDialogOpen(false);
              setDeletingCardId(null);
            }
          }}
          onConfirm={() => void handleConfirmDelete()}
          title="Delete Member Card"
          description="Are you sure you want to permanently delete this member card? This action cannot be undone and all associated data may be affected."
          isLoading={isDeleting}
        />
        <ConfirmAlertDialog
          isOpen={approveOpen}
          onClose={() => {
            if (!activateMutation.isPending) {
              setApproveOpen(false);
              setCardToApprove(null);
            }
          }}
          onConfirm={() => void handleConfirmApprove()}
          title="Approve Membership Card"
          description={`Are you sure you want to approve "${cardToApprove ? getMemberCardholderName(cardToApprove) : ''}" (${cardToApprove ? getMemberCardNumber(cardToApprove) : ''})? This will activate the membership card and allow it to be used on the platform.`}
          confirmText="Approve Membership Card"
          isLoading={activateMutation.isPending}
          variant="success"
        />
        <ConfirmAlertDialog
          isOpen={suspendDialogOpen}
          onClose={() => {
            if (!suspendMutation.isPending) {
              setSuspendDialogOpen(false);
              setSuspendingCard(null);
            }
          }}
          onConfirm={() => void handleConfirmSuspend()}
          title="Suspend Member Card"
          description={`Are you sure you want to suspend "${suspendingCard ? getMemberCardholderName(suspendingCard) : ''}" (${suspendingCard ? getMemberCardNumber(suspendingCard) : ''})? This will temporarily block the card from being used.`}
          confirmText="Suspend Member Card"
          isLoading={suspendMutation.isPending}
          variant="warning"
        >
          <div className="mt-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
              Reason for Suspension
            </label>
            <Input
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Payment overdue"
              className="h-10 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
            />
          </div>
        </ConfirmAlertDialog>
        <ConfirmAlertDialog
          isOpen={unblockDialogOpen}
          onClose={() => {
            if (!unblockMutation.isPending) {
              setUnblockDialogOpen(false);
              setUnblockingCard(null);
            }
          }}
          onConfirm={() => void handleConfirmUnblock()}
          title="Unblock Member Card"
          description={`Are you sure you want to unblock/reactivate "${unblockingCard ? getMemberCardholderName(unblockingCard) : ''}" (${unblockingCard ? getMemberCardNumber(unblockingCard) : ''})?`}
          confirmText="Unblock Member Card"
          isLoading={unblockMutation.isPending}
          variant="success"
        />
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            refetchTable();
            void refetchStatistics();
          }}
          defaultBranchId={parsedBranchId ?? DEFAULT_BRANCH_ID}
        />
      </div>
    </div>
  );
}

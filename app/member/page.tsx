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
} from 'lucide-react';
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
  onDelete,
}: {
  row: MemberCard;
  onView: (row: MemberCard) => void;
  onCardDetails?: (row: MemberCard) => void;
  onTransactions?: (row: MemberCard) => void;
  onApprove?: (row: MemberCard) => void;
  onEdit: (row: MemberCard) => void;
  onDelete: (row: MemberCard) => void;
}) {
  const isPending = isMemberCardPendingActivation(row);
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
  const [editCardId, setEditCardId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [cardToApprove, setCardToApprove] = useState<MemberCard | null>(null);

  const deleteMutation = useDeleteMemberCard();
  const activateMutation = useActivateMemberCard();

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
  }, [parsedBranchId, typeFilter, statusFilter, dateRange, debouncedSearchTerm]);

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
    { enabled: parsedBranchId != null || isSearchActive }
  );

  const page = data?.data;
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
    ],
    [statistics]
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

  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

      {isStatisticsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {statisticsError instanceof Error
            ? statisticsError.message
            : 'Failed to load member card statistics.'}
        </div>
      ) : null}

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-sm">
        {isStatisticsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" aria-hidden />
            <span className="text-sm font-semibold">Loading statistics…</span>
          </div>
        ) : (
          <div className="flex flex-nowrap items-stretch gap-0 overflow-x-auto pb-1 scrollbar-thin">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`flex min-w-[9.5rem] flex-1 flex-col items-center justify-center px-3 py-1 text-center sm:min-w-0 ${index < statCards.length - 1 ? 'border-r border-slate-200/70' : ''
                    }`}
                >
                  <div
                    className={`mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                  >
                    <Icon size={18} className={card.tone} aria-hidden />
                  </div>
                  <span className="mb-1 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span className={`text-lg font-black leading-none sm:text-xl ${card.valueColor}`}>
                    {card.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white backdrop-blur-xl p-4 shadow-sm border-t-white/20">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">

          {/* Search */}
          <div className="col-span-1 sm:col-span-6 lg:col-span-6 space-y-1.5">
            <label className={filterLabelClass}>Search by cardholder name Or Card Number</label>
            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                size={18}
                aria-hidden
              />
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. Jane"
                className={`${inputClass} pl-11 pr-10 h-9 text-sm`}
                disabled={tableLoading}
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  aria-label="Clear search"
                >
                  <SearchX size={16} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Card Type - ~13% width */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-1.5">
            <label className={`${filterLabelClass} text-xs`}>Card type</label>
            <div className="relative group">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                size={14}
                aria-hidden
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`${inputClass} w-full pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer h-9`}
                disabled={tableLoading}
              >
                <option value="All">All Types</option>
                {MEMBER_CARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {formatMemberCardLabel(t)}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                size={14}
                aria-hidden
              />
            </div>
          </div>

          {/* Status - ~13% width */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-1.5">
            <label className={`${filterLabelClass} text-xs`}>Status</label>
            <div className="relative group">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                size={14}
                aria-hidden
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`${inputClass} w-full pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none cursor-pointer h-9`}
                disabled={tableLoading}
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING ACTIVATION">Pending activation</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                size={14}
                aria-hidden
              />
            </div>
          </div>

          {/* Branch */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-1.5">
            <label className={`${filterLabelClass} text-xs`}>Branch</label>
            <div className="relative group">
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
                  className={`${inputClass} w-full h-9 pl-10 pr-10 text-xs font-bold`}
                >
                  <SelectValue
                    placeholder={
                      isLoadingBranches ? 'Loading branches…' : 'Select branch'
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
          </div>
          {/* select Date Range */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 space-y-1.5">
            <label className={filterLabelClass}>Date Range</label>
            <select className={inputClass} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="All">All</option>
              <option value="1 week">1 week</option>
              <option value="1 month">1 month</option>
              <option value="3 months">3 months</option>
              <option value="6 months">6 months</option>
              <option value="1 year">1 year</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-[1.5rem] bg-white border border-slate-300 backdrop-blur-md shadow-sm">
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

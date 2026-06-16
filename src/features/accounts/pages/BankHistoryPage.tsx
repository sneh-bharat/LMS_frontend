'use client';

import { useMemo, useState } from 'react';
import { Activity, Clock, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import { PageHeader, FilterBar, StatCard, StatCardGrid } from '@/components/common';
import { formatCurrency } from '@/lib/format';
import { BankHistoryTable } from '../components/BankHistoryTable';
import {
  SAMPLE_BANK_HISTORY,
  TRANSACTION_STATUS_OPTIONS,
  TRANSACTION_TYPE_OPTIONS,
} from '../constants/bank-history';

/**
 * Bank transaction history screen.
 *
 * Reference migration: types → `types/`, fixture + options + color maps →
 * `constants/`, table → `components/`, formatters → `@/lib/format`, layout chrome →
 * shared `components/common`. The route file is a thin re-export.
 *
 * TODO: replace `SAMPLE_BANK_HISTORY` with `useBankHistory()` once the endpoint lands.
 */
export function BankHistoryPage() {
  const [history] = useState(SAMPLE_BANK_HISTORY);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return history.filter((record) => {
      const matchesSearch =
        record.bankName.toLowerCase().includes(q) ||
        record.referenceNumber?.toLowerCase().includes(q) ||
        record.description?.toLowerCase().includes(q);
      const matchesType = typeFilter === 'All' || record.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [history, search, typeFilter, statusFilter]);

  const stats = useMemo(
    () => ({
      totalTransactions: history.length,
      totalDeposits: history
        .filter((h) => h.type === 'Deposit')
        .reduce((sum, h) => sum + h.amount, 0),
      totalWithdrawals: history
        .filter((h) => h.type === 'Withdrawal')
        .reduce((sum, h) => sum + h.amount, 0),
      pendingTransactions: history.filter((h) => h.status === 'Pending').length,
    }),
    [history],
  );

  const netFlow = stats.totalDeposits - stats.totalWithdrawals;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-6">
      <PageHeader
        icon={FileText}
        title="Bank Transaction History"
        subtitle="Track all bank transactions and transfers"
      />

      <StatCardGrid>
        <StatCard tone="blue" icon={Activity} label="Total Transactions" value={stats.totalTransactions} />
        <StatCard
          tone="emerald"
          icon={TrendingUp}
          label="Total Deposits"
          value={<span className="text-2xl text-emerald-600">{formatCurrency(stats.totalDeposits)}</span>}
        />
        <StatCard
          tone="rose"
          icon={TrendingDown}
          label="Total Withdrawals"
          value={<span className="text-2xl text-rose-600">{formatCurrency(stats.totalWithdrawals)}</span>}
        />
        <StatCard tone="amber" icon={Clock} label="Pending" value={stats.pendingTransactions} />
      </StatCardGrid>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by bank, reference, or description…"
        selects={[
          { name: 'type', value: typeFilter, onChange: setTypeFilter, options: TRANSACTION_TYPE_OPTIONS },
          { name: 'status', value: statusFilter, onChange: setStatusFilter, options: TRANSACTION_STATUS_OPTIONS },
        ]}
      />

      <BankHistoryTable data={filtered} />

      <div className="mt-2 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>
          Showing {filtered.length} of {history.length} Transactions
        </span>
        <span className="text-slate-500">
          Net Flow:{' '}
          <span className={netFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
            {formatCurrency(netFlow)}
          </span>
        </span>
      </div>
    </div>
  );
}

export default BankHistoryPage;

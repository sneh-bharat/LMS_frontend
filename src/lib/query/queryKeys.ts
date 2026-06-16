/**
 * Central, typed query-key factory for TanStack Query.
 *
 * Every feature hook should derive its keys from here so invalidation is
 * consistent and refactor-safe. Add a namespace per feature.
 *
 * Usage:
 *   useQuery({ queryKey: queryKeys.accounts.banks(), queryFn: ... })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all })
 */

export const queryKeys = {
  accounts: {
    all: ['accounts'] as const,
    banks: () => [...queryKeys.accounts.all, 'banks'] as const,
    bankHistory: (bankId?: number | string) =>
      [...queryKeys.accounts.all, 'bank-history', bankId ?? 'all'] as const,
    bankTransactions: () => [...queryKeys.accounts.all, 'bank-transactions'] as const,
    cashExpenses: () => [...queryKeys.accounts.all, 'cash-expenses'] as const,
    bankExpenses: () => [...queryKeys.accounts.all, 'bank-expenses'] as const,
    paymentHistory: () => [...queryKeys.accounts.all, 'payment-history'] as const,
    franchiseDue: () => [...queryKeys.accounts.all, 'franchise-due'] as const,
    franchiseLedger: () => [...queryKeys.accounts.all, 'franchise-ledger'] as const,
    invoices: () => [...queryKeys.accounts.all, 'invoices'] as const,
  },
  branches: {
    all: ['branches'] as const,
    list: () => [...queryKeys.branches.all, 'list'] as const,
    detail: (id: number | string) => [...queryKeys.branches.all, 'detail', id] as const,
  },
  doctor: {
    all: ['doctor'] as const,
    list: () => [...queryKeys.doctor.all, 'list'] as const,
    detail: (id: number | string) => [...queryKeys.doctor.all, 'detail', id] as const,
  },
} as const;

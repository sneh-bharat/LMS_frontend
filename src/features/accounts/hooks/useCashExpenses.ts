'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/queryKeys';
import type { CashExpenseFormValues } from '../schemas/cashExpense.schema';
import {
  createCashExpense,
  deleteCashExpense,
  fetchCashExpenses,
  updateCashExpense,
} from '../services/cashExpense.service';

/** Server state for cash expenses. */
export function useCashExpenses() {
  return useQuery({
    queryKey: queryKeys.accounts.cashExpenses(),
    queryFn: fetchCashExpenses,
  });
}

/** Create / update / delete mutations that invalidate the cash-expense cache. */
export function useCashExpenseMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.cashExpenses() });

  const create = useMutation({
    mutationFn: (values: CashExpenseFormValues) => createCashExpense(values),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: number; values: CashExpenseFormValues }) =>
      updateCashExpense(id, values),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteCashExpense(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

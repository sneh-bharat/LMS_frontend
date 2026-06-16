import type { CashExpense } from '../types/accounts.types';
import type { CashExpenseFormValues } from '../schemas/cashExpense.schema';
import { SAMPLE_CASH_EXPENSES } from '../constants/cash-expense';

/**
 * Cash-expense service.
 *
 * Endpoints are built on the shared `@/lib/api` clients. The accounts backend route
 * is not yet exposed, so each call currently resolves the in-memory fixture and is
 * marked `TODO: replace with API`. The function signatures are the real contract —
 * swapping the body for a `client.get/post` call is the only change needed.
 *
 * Example once the endpoint exists:
 *   import { bookingClient } from '@/lib/api/client';
 *   export const fetchCashExpenses = () =>
 *     bookingClient.get<CashExpense[]>('/accounts/cash-expenses').then((r) => r);
 */

export async function fetchCashExpenses(): Promise<CashExpense[]> {
  // TODO: replace with API
  return Promise.resolve(SAMPLE_CASH_EXPENSES);
}

export async function createCashExpense(values: CashExpenseFormValues): Promise<CashExpense> {
  // TODO: replace with API — POST /accounts/cash-expenses
  return Promise.resolve({
    id: Date.now(),
    ...values,
    createdAt: new Date().toISOString().split('T')[0],
  });
}

export async function updateCashExpense(
  id: number,
  values: CashExpenseFormValues,
): Promise<CashExpense> {
  // TODO: replace with API — PUT /accounts/cash-expenses/:id
  return Promise.resolve({ id, ...values, createdAt: new Date().toISOString().split('T')[0] });
}

export async function deleteCashExpense(id: number): Promise<void> {
  // TODO: replace with API — DELETE /accounts/cash-expenses/:id
  void id;
  return Promise.resolve();
}

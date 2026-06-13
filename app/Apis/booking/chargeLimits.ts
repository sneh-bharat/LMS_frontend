import type { KeyboardEvent } from 'react';

export const CHARGE_MIN = 100;
export const CHARGE_MAX = 1000;
export function parseChargeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  const num = Math.min(CHARGE_MAX, Number(digits));
  return String(num);
}

/** Enforce min/max when the field loses focus. Empty stays empty (no charge). */
export function normalizeChargeOnBlur(raw: string): string {
  if (!raw.trim()) return '';
  const num = Number(raw.replace(/\D/g, ''));
  if (Number.isNaN(num) || num === 0) return '';
  return String(Math.min(CHARGE_MAX, Math.max(CHARGE_MIN, num)));
}

/** Safe numeric value for totals — ignores out-of-range amounts until blur. */
export function chargeAmountForTotals(raw: string | null | undefined): number {
  const num = Number(raw) || 0;
  if (num <= 0) return 0;
  if (num < CHARGE_MIN || num > CHARGE_MAX) return 0;
  return num;
}

export function blockInvalidChargeKey(e: KeyboardEvent<HTMLInputElement>) {
  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
    e.preventDefault();
  }
}

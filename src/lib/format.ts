/**
 * Shared formatting helpers.
 *
 * Replaces the per-page copies of `formatCurrency` / `formatDate` that the audit
 * found duplicated across account / lab / report pages.
 */

/** Format a number as Indian Rupee currency (no decimals by default). */
export function formatCurrency(
  amount: number | null | undefined,
  options: { maximumFractionDigits?: number } = {},
): string {
  const value = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
  }).format(value);
}

/** Format an ISO date string as `dd Mon yyyy`. Returns '—' for empty/invalid input. */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format an ISO date string as `dd Mon yyyy, hh:mm`. Returns '—' for empty/invalid input. */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format just the time portion of an ISO date string as `hh:mm`. */
export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

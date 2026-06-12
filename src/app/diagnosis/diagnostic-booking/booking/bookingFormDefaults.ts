/** Local calendar date `YYYY-MM-DD` (offset days from today; 0 = today). */
export function isoDateOffset(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayIsoDate(): string {
  return isoDateOffset(0);
}

export const DEFAULT_COLLECTION_TIME = '09:00';

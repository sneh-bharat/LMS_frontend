/**
 * Mirrors `com.sbpl.lims.enums.order.Priority` on the booking service.
 */
export const ORDER_PRIORITIES = [
  { value: 'ROUTINE', label: 'Routine', level: 1, defaultTurnaroundHours: 24 },
  { value: 'URGENT', label: 'Urgent', level: 2, defaultTurnaroundHours: 8 },
  { value: 'STAT', label: 'Stat - Emergency', level: 3, defaultTurnaroundHours: 2 },
  { value: 'TIMED', label: 'Timed Collection', level: 4, defaultTurnaroundHours: 24 },
] as const;

export type OrderPriorityValue = (typeof ORDER_PRIORITIES)[number]['value'];

export const DEFAULT_ORDER_PRIORITY: OrderPriorityValue = 'ROUTINE';

const LABEL_BY_VALUE = Object.fromEntries(
  ORDER_PRIORITIES.map((p) => [p.value, p.label])
) as Record<OrderPriorityValue, string>;

const VALUE_BY_LABEL = Object.fromEntries(
  ORDER_PRIORITIES.map((p) => [p.label.toLowerCase(), p.value])
) as Record<string, OrderPriorityValue>;

/** Map UI / legacy strings to API enum value. */
export function normalizeOrderPriority(input: string | null | undefined): OrderPriorityValue {
  const raw = (input ?? '').trim();
  if (!raw) return DEFAULT_ORDER_PRIORITY;

  const upper = raw.toUpperCase();
  if (upper === 'ROUTINE' || upper === 'NORMAL') return 'ROUTINE';
  if (upper === 'URGENT') return 'URGENT';
  if (upper === 'STAT') return 'STAT';
  if (upper === 'TIMED') return 'TIMED';

  const fromLabel = VALUE_BY_LABEL[raw.toLowerCase()];
  if (fromLabel) return fromLabel;

  if (upper.includes('STAT')) return 'STAT';
  if (upper.includes('URGENT')) return 'URGENT';
  if (upper.includes('TIMED')) return 'TIMED';

  return DEFAULT_ORDER_PRIORITY;
}

export function orderPriorityLabel(value: string | null | undefined): string {
  const key = normalizeOrderPriority(value);
  return LABEL_BY_VALUE[key] ?? value ?? LABEL_BY_VALUE[DEFAULT_ORDER_PRIORITY];
}

export function orderPriorityTurnaroundHours(value: string | null | undefined): number {
  const key = normalizeOrderPriority(value);
  return ORDER_PRIORITIES.find((p) => p.value === key)?.defaultTurnaroundHours ?? 24;
}

export function isEmergencyPriority(value: string | null | undefined): boolean {
  const key = normalizeOrderPriority(value);
  return key === 'URGENT' || key === 'STAT';
}

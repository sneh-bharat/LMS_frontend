/** Logged-in staff display name from login (`localStorage.fullName`). */
export function getLoggedInFullName(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fullName')?.trim() ?? '';
}

/** Login username (`localStorage.username`). */
export function getLoggedInUsername(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('username')?.trim() ?? '';
}

/** Best value to send as created-by on create payloads. */
export function getCreatedByName(): string {
  return getLoggedInFullName() || getLoggedInUsername() || 'Staff';
}

/**
 * Prefer human-readable full name for "Processed by" display.
 * Falls back to stored API value when no full name is available.
 */
export function formatProcessedByDisplay(stored?: string | null): string {
  const fullName = getLoggedInFullName();
  const value = stored?.trim();

  if (!value) return fullName || '—';
  if (fullName && value === fullName) return fullName;
  // Username-style values (e.g. lab_tech_user) → show login full name when available
  if (fullName && !value.includes(' ')) return fullName;

  return value;
}

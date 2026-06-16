import type { ZodError } from 'zod';

/**
 * Flattens a ZodError into `{ field: firstMessage }` for inline form display.
 * Shared by every feature's forms so error handling is consistent.
 */
export function zodFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !result[key]) result[key] = issue.message;
  }
  return result;
}

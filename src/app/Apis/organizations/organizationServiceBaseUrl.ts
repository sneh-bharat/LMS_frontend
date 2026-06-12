/**
 * Organization routes on the booking service (`NEXT_PUBLIC_API_Booking` + `/api/v1`).
 */
export function getOrganizationServiceBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_Booking || 'http://localhost:8080')
    .trim()
    .replace(/\/+$/, '');

  if (/\/api\/v\d+$/i.test(raw)) {
    return raw;
  }
  return `${raw}/api/v1`;
}

/**
 * Resolves the booking microservice API prefix (`NEXT_PUBLIC_API_Booking` + `/api/v1`).
 */
export function getBookingServiceBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_Booking || 'http://localhost:8080').replace(
    /\/+$/,
    ''
  );
  if (/\/api\/v\d+$/i.test(raw)) {
    return raw;
  }
  return `${raw}/api/v1`;
}

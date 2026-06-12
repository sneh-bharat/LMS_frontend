/**
 * Resolves the booking microservice API prefix (`NEXT_PUBLIC_API_Booking` + `/api/v1`).
 * For `/orders/*` routes use `ordersAxios` + `getOrdersServiceBaseUrl()` instead.
 */
export function getBookingServiceBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_Booking || '')
    .trim()
    .replace(/\/+$/, '');

  if (/lims-patient/i.test(raw)) {
    console.warn(
      '[booking-api] NEXT_PUBLIC_API_Booking appears to be the lims-patient gateway. Point it at the booking/order service host, or set NEXT_PUBLIC_API_Order for /orders/* APIs.'
    );
  }

  if (/\/api\/v\d+$/i.test(raw)) {
    return raw;
  }
  return `${raw}/api/v1`;
}

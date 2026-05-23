/**
 * Order / booking routes (`/api/v1/orders/*`, `/api/v1/test-orders/*`).
 * Must NOT use the patient gateway (`NEXT_PUBLIC_API_URL1` / lims-patient).
 *
 * Set `NEXT_PUBLIC_API_Order` to the booking microservice host, e.g.
 * `https://www.snebharat.com/lims-booking` → requests go to
 * `https://www.snebharat.com/lims-booking/api/v1/test-orders/patient/{id}/last-visit`
 */
export function getOrdersServiceBaseUrl(): string {
  const raw = (
    process.env.NEXT_PUBLIC_API_Order ||
    process.env.NEXT_PUBLIC_API_Orders ||
    process.env.NEXT_PUBLIC_API_Booking ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');

  if (/lims-patient/i.test(raw)) {
    throw new Error(
      'Orders API is misconfigured: NEXT_PUBLIC_API_Booking (or API_Order) must point to the booking/order service, not lims-patient. Use the same base URL as test-orders, or set NEXT_PUBLIC_API_Order.'
    );
  }

  if (/\/api\/v\d+$/i.test(raw)) {
    return raw;
  }
  return `${raw}/api/v1`;
}

/**
 * Member-card routes on the booking service (`NEXT_PUBLIC_API_Booking` + `/api/v1`).
 */
export function getMembershipServiceBaseUrl(): string {
   const raw = (process.env.NEXT_PUBLIC_API_Booking || 'http://192.168.29.27:8080/lims-booking')
  //  const raw = 'http://192.168.29.27:8080/lims-booking'
    .trim()
    .replace(/\/+$/, '');

  if (/\/api\/v\d+$/i.test(raw)) {
    return raw;
  }
  return `${raw}/api/v1`;
}

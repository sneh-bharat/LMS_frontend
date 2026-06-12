/**
 * Resolves the patient microservice API prefix. Matches lab services: base host +
 * `/api/v1` before resource paths (e.g. `/patients`).
 */
export function getPatientServiceBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL1 || '/api/v1').replace(
    /\/+$/,
    ''
  );
  if (/\/api\/v\d+$/i.test(raw)) {
    return raw;
  }
  return `${raw}/api/v1`;
}

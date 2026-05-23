/**
 * Auth / tenant service base (`NEXT_PUBLIC_API_AUTH`).
 * Example: https://www.snehbharat.com/lims-auth
 * Branch search: {base}/api/v1/tenants/{tenantId}/branches/search
 */
export function getAuthServiceBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_AUTH || '').replace(
    /\/+$/,
    ''
  );
  return raw.replace(/\/api\/v\d+$/i, '');
}

/** Build path whether or not env already ends with /api/v1 */
export function authApiPath(path: string): string {
  const envRaw = (process.env.NEXT_PUBLIC_API_AUTH || '').replace(/\/+$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const baseHasApiVersion = /\/api\/v\d+$/i.test(envRaw);

  if (baseHasApiVersion && /^\/api\/v\d+/i.test(normalized)) {
    return normalized.replace(/^\/api\/v\d+/i, '') || normalized;
  }
  if (!baseHasApiVersion && !/^\/api\/v\d+/i.test(normalized)) {
    return `/api/v1${normalized}`;
  }
  return normalized;
}

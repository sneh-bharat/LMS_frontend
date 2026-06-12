/**
 * Test catalog service base (`NEXT_PUBLIC_API_Test`).
 * Example: https://www.snehbharat.com/test-catalog
 * Department URL: {base}/api/v1/departments/...
 */
export function getTestCatalogBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_Test || '').replace(
    /\/+$/,
    ''
  );
  return raw.replace(/\/api\/v\d+$/i, '');
}

/** Build path whether or not env already ends with /api/v1 */
export function testCatalogApiPath(path: string): string {
  const envRaw = (process.env.NEXT_PUBLIC_API_Test || '').replace(/\/+$/, '');
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

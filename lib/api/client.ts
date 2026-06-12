/**
 * Unified Axios factory for all LMS microservices.
 *
 * Replaces the 16 duplicate axios.ts files spread across app/Apis/.
 * Each service gets its own client instance via createApiClient().
 *
 * Migration plan:
 *   Phase 2 — import these clients in new API files instead of the old axios.ts files.
 *   Phase 3 — swap localStorage.getItem('token') → cookie read when httpOnly migration is done.
 *
 * Breaking changes vs old clients:
 *   - Errors are always `new Error(message)` — never a plain object spread.
 *   - All responses are unwrapped to response.data automatically.
 *   - localStorage.clear() on 401 replaced by selective key removal.
 *   - Default timeout: 15 000 ms (no timeout was set before).
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  AxiosHeaders,
} from 'axios';

// ─── Auth token helpers ───────────────────────────────────────────────────────

const AUTH_KEYS = ['token', 'refreshToken', 'role', 'tenantId', 'fullName'] as const;

export function readAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
}

function redirectToLogin(doctorRoute = false): void {
  if (typeof window === 'undefined') return;
  window.location.href = doctorRoute ? '/doctor-login' : '/login';
}

// ─── Error extraction ─────────────────────────────────────────────────────────

function extractErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Request failed';

  const axiosError = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const data = axiosError.response?.data;
  const status = axiosError.response?.status;

  if (typeof data === 'string' && data.trim()) return data.trim();

  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    for (const key of ['message', 'error', 'detail'] as const) {
      if (typeof body[key] === 'string' && (body[key] as string).trim()) {
        return (body[key] as string).trim();
      }
    }
    if (Array.isArray(body.errors)) {
      const joined = (body.errors as unknown[])
        .map((e) => (typeof e === 'string' ? e : JSON.stringify(e)))
        .filter(Boolean)
        .join(', ');
      if (joined) return joined;
    }
    if (body.data && typeof body.data === 'object') {
      const nested = body.data as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message.trim();
      }
    }
  }

  if (status === 409) return 'Conflict: this action could not be completed (duplicate or conflicting record).';
  if (status) return `Request failed with status ${status}`;
  return (axiosError.message ?? 'Request failed');
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export interface ApiClientOptions {
  /** Whether to unwrap `response.data` automatically. Default: true */
  unwrapData?: boolean;
  /** Redirect path on 401. Default: '/login' */
  loginPath?: '/login' | '/doctor-login';
  /** localStorage key to use for the Bearer token. Default: 'token' */
  tokenKey?: string;
  /** Request timeout in milliseconds. Default: 15_000 */
  timeout?: number;
}

export function createApiClient(
  baseURL: string,
  options: ApiClientOptions = {}
): AxiosInstance {
  const {
    unwrapData = true,
    loginPath = '/login',
    tokenKey = 'token',
    timeout = 15_000,
  } = options;

  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor — attach Bearer token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(tokenKey);
        if (token) {
          const headers = AxiosHeaders.from(config.headers ?? {});
          headers.set('Authorization', `Bearer ${token}`);
          config.headers = headers;
        }
      }
      // Allow FormData to set its own Content-Type (multipart boundary)
      if (config.data instanceof FormData) {
        const headers = AxiosHeaders.from(config.headers ?? {});
        headers.delete('Content-Type');
        config.headers = headers;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor — unwrap data, handle 401
  client.interceptors.response.use(
    (response) => (unwrapData ? response.data : response),
    (error) => {
      if (error.response?.status === 401) {
        clearAuthStorage();
        redirectToLogin(loginPath === '/doctor-login');
      }
      return Promise.reject(new Error(extractErrorMessage(error)));
    }
  );

  return client;
}

// ─── Named service clients ────────────────────────────────────────────────────
// One client per microservice. Import these instead of the per-domain axios.ts files.

function stripTrailingVersion(raw: string): string {
  return raw.replace(/\/+$/, '').replace(/\/api\/v\d+$/i, '');
}

function withApiV1(raw: string): string {
  const cleaned = raw.replace(/\/+$/, '');
  return /\/api\/v\d+$/i.test(cleaned) ? cleaned : `${cleaned}/api/v1`;
}

/** `NEXT_PUBLIC_API_AUTH` — lims-auth service */
export const authClient = createApiClient(
  stripTrailingVersion(process.env.NEXT_PUBLIC_API_AUTH ?? '')
);

/** `NEXT_PUBLIC_API_AUTH` — doctor portal (uses separate doctor-token) */
export const doctorAuthClient = createApiClient(
  stripTrailingVersion(process.env.NEXT_PUBLIC_API_AUTH ?? ''),
  { loginPath: '/doctor-login', tokenKey: 'doctor-token' }
);

/** `NEXT_PUBLIC_API_URL1` — lims-patient service */
export const patientClient = createApiClient(
  withApiV1(process.env.NEXT_PUBLIC_API_URL1 ?? ''),
  { unwrapData: false } // patient service returns the full AxiosResponse for some callers
);

/** `NEXT_PUBLIC_API_Test` — test-catalog service */
export const labClient = createApiClient(
  stripTrailingVersion(process.env.NEXT_PUBLIC_API_Test ?? '')
);

/** `NEXT_PUBLIC_API_Report` — report service */
export const reportClient = createApiClient(
  process.env.NEXT_PUBLIC_API_Report ?? ''
);

/** `NEXT_PUBLIC_API_Booking` — booking service (non-order routes) */
export const bookingClient = createApiClient(
  withApiV1(process.env.NEXT_PUBLIC_API_Booking ?? '')
);

/** `NEXT_PUBLIC_API_Booking` — order/test-order routes */
export const ordersClient = createApiClient(
  withApiV1(
    process.env.NEXT_PUBLIC_API_Order ??
    process.env.NEXT_PUBLIC_API_Orders ??
    process.env.NEXT_PUBLIC_API_Booking ??
    ''
  )
);

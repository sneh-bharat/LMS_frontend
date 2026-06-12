# Project Audit Report

> **Audit Date:** 2026-06-13
> **Auditor:** Claude Code — Automated Static Analysis
> **Branch:** `feature/template-editor-upgrade`

---

## Executive Summary

| Field                  | Value                                                              |
| ---------------------- | ------------------------------------------------------------------ |
| **Audit Date**         | 2026-06-13                                                         |
| **Project Name**       | Lab Management System (LMS) Frontend — *Snehbharat LIMS*          |
| **Next.js Version**    | 16.1.7                                                             |
| **Node.js Version**    | v24.13.0                                                           |
| **React Version**      | 19.2.3                                                             |
| **TypeScript Version** | ^5.x                                                               |
| **Total Files Scanned**| 335 (`.tsx`, `.ts`, `.jsx`, `.js`)                                 |
| **Total Pages**        | 87 (`page.tsx` files in App Router)                               |
| **Total API Routes**   | 0 (no Next.js server-side API routes; all calls to external microservices) |
| **Total Components**   | ~250+ (pages + standalone component files)                        |
| **Total Dependencies** | 42 production + 9 devDependencies = **51 total**                  |
| **Axios Instances**    | 16 separate `axios.ts` instances                                   |
| **Test Files**         | **0** — No tests exist                                             |

---

## Overall Scores

| Category              | Score  | Notes                                                                 |
| --------------------- | ------ | --------------------------------------------------------------------- |
| **Architecture**      | 5 / 10 | Good Next.js structure; 16 duplicate axios instances; no middleware   |
| **Code Quality**      | 4 / 10 | 201 `any` types; 277 `console.log` calls; 0 tests; mixed .jsx/.tsx   |
| **Security**          | 3 / 10 | Secret key exposed publicly; tokens in localStorage; no CSP headers   |
| **Performance**       | 5 / 10 | Good TanStack Query config; DevTools in prod; hardcoded dashboard data |
| **SEO**               | 2 / 10 | Single global metadata; no per-page SEO; no sitemap; no OG tags       |
| **Accessibility**     | 3 / 10 | No ARIA labels found; no keyboard navigation tests; no skip links     |
| **Production Readiness** | 2 / 10 | No CI/CD; no error tracking; no monitoring; DevTools in prod       |

---

## Architecture Analysis

### Current Structure

```
LMS_frontend/
├── app/
│   ├── Apis/                          # ← 16 separate axios.ts instances
│   │   ├── Auth/                      # Auth, apiClient, doctorClient
│   │   ├── booking/                   # bookingAxios, ordersAxios
│   │   ├── lab/                       # labClient, reportClient (same file)
│   │   ├── Patients/                  # patientAxios + connection-test.ts (debug)
│   │   ├── Commission/                # axios.ts
│   │   ├── LabCoordinator/            # axios.ts
│   │   ├── LabTechnician/             # axios.ts
│   │   ├── Referrer/                  # axios.ts
│   │   ├── Report/                    # axios.ts
│   │   ├── branch/                    # axios.ts
│   │   ├── collector/                 # axios.ts
│   │   ├── doctor/                    # axios.ts
│   │   ├── membership/                # axios.ts
│   │   ├── organizations/             # axios.ts
│   │   ├── tenant/                    # axios.ts
│   │   └── lab/TemplateMgmt/          # axios.ts
│   ├── components/
│   │   ├── layouts/                   # Sidebar, Topbar, RootLayoutClient
│   │   ├── editor/                    # AdvancedTemplateEditor
│   │   ├── DoctorGuard.tsx            # ← defined but NOT applied in layout
│   │   ├── RoleGuard.tsx
│   │   └── LogoutConfirmDialog.tsx
│   ├── providers/                     # QueryProvider
│   ├── utils/
│   ├── dashboard/page.tsx             # ← hardcoded mock data
│   ├── login/                         # Main login
│   ├── doctor-login/                  # Doctor login
│   ├── forDoctors/                    # Doctor portal (no guard applied)
│   ├── [80+ other page routes]
│   ├── layout.tsx                     # Root layout
│   └── globals.css
├── components/
│   ├── ui/                            # shadcn/ui components
│   └── Providers.tsx
├── lib/
│   └── utils.ts
├── public/images/
├── next.config.ts                     # Minimal — no security headers
├── .env                               # ← CRITICAL: secret exposed
└── package.json
```

### Issues Found

1. **16 duplicated axios instances** — Every service domain has its own `axios.ts` with copy-pasted interceptor logic. Token reading, 401 handling, and error extraction are repeated 16 times.
2. **No `middleware.ts`** — Route protection is done entirely client-side via `RoleGuard` and `DoctorGuard`. A user with a modified local storage or disabled JavaScript can bypass all auth guards.
3. **DoctorGuard is defined but never applied** — `RootLayoutClient.tsx` renders `{children}` directly for doctor routes without wrapping in `DoctorGuard`. Only `RoleGuard` is applied to non-login routes.
4. **No error boundaries** — Any uncaught render error will crash the entire application.
5. **No Next.js API routes** — All data fetching is directly from the browser to microservices, exposing all backend API URLs.
6. **Mixed `.jsx` and `.tsx` files** — `Sidebar.jsx`, `Topbar.jsx`, `DoctorSidebar.jsx`, `DoctorTopbar.jsx`, `StatsCards.js` use JavaScript instead of TypeScript.
7. **`debug` / test files in `app/`** — `app/Apis/Patients/connection-test.ts` and `app/patient-api-test/page.tsx` are debug utilities included in the production bundle.
8. **Dashboard has hardcoded mock data** — `app/dashboard/page.tsx` shows static placeholder values for Revenue, Patients, etc. with no real API connection.
9. **Inconsistent naming** — PascalCase (`AddCollectorModal.tsx`) mixed with kebab-case (`add-reflex-rule.tsx`) and snake_case (`doctot-details.tsx` — also a typo).
10. **No barrel/index exports** — Large `app/Apis/` folder has no consistent index file structure, making imports verbose.

### Recommended Enterprise Structure

```
LMS_frontend/
├── src/
│   ├── app/                           # Next.js App Router pages only
│   │   ├── (auth)/                    # Route group — no layout
│   │   │   ├── login/page.tsx
│   │   │   └── doctor-login/page.tsx
│   │   ├── (admin)/                   # Protected admin routes
│   │   │   ├── layout.tsx             # RoleGuard here
│   │   │   └── dashboard/page.tsx
│   │   ├── (doctor)/                  # Protected doctor routes
│   │   │   ├── layout.tsx             # DoctorGuard here
│   │   │   └── forDoctors/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                        # Design system (shadcn)
│   │   ├── layouts/                   # Sidebar, Topbar, etc.
│   │   ├── guards/                    # RoleGuard, DoctorGuard
│   │   └── common/                    # Shared business components
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # ONE base axios factory
│   │   │   ├── auth.ts                # Auth service API
│   │   │   ├── booking.ts             # Booking service API
│   │   │   ├── lab.ts                 # Lab/catalog service API
│   │   │   └── patients.ts            # Patient service API
│   │   └── utils.ts
│   ├── hooks/                         # All custom hooks
│   ├── types/                         # Shared TypeScript types
│   ├── stores/                        # State management (if needed)
│   └── middleware.ts                  # Server-side auth guard
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
└── [config files]
```

---

## Security Report

### Critical Issues

#### CRIT-1: Secret Key Exposed as Public Environment Variable

- **File:** `.env:1`
- **Code:** `NEXT_PUBLIC_SECRET_KEY=0A322E73634C0D241C604328944B342A`
- **Risk:** Any variable prefixed with `NEXT_PUBLIC_` is embedded in the client-side JavaScript bundle and visible to anyone who views the source or network traffic. This cryptographic key is fully public.
- **Fix:** Remove the `NEXT_PUBLIC_` prefix. Use it only on the server (Next.js API routes or middleware). If it's already compromised, rotate the key immediately.

```ts
// ❌ Current — public, visible in browser DevTools
NEXT_PUBLIC_SECRET_KEY=0A322E73634C0D241C604328944B342A

// ✅ Fix — server-only, never reaches the client
SECRET_KEY=0A322E73634C0D241C604328944B342A
```

#### CRIT-2: Internal Network IP Exposed in Environment File

- **File:** `.env:5`
- **Code:** `NEXT_PUBLIC_API_Report=http://192.168.29.27:9090/report-service`
- **Risk:** Internal network topology exposed in a public environment variable. HTTP (not HTTPS) also means traffic is unencrypted. If this repo is ever made public or the `.env` is committed, this is a reconnaissance vector.
- **Fix:** Use a domain name with HTTPS. Never expose raw internal IPs.

```ts
// ❌ Current
NEXT_PUBLIC_API_Report=http://192.168.29.27:9090/report-service

// ✅ Fix
NEXT_PUBLIC_API_Report=https://reports.snehbharat.com
```

---

### High Issues

#### HIGH-1: JWT Tokens Stored in `localStorage` (XSS Vulnerable)

- **Files:** `app/login/Login.tsx:36-44`, all `axios.ts` interceptors
- **Risk:** `localStorage` is accessible to any JavaScript on the page. An XSS attack can silently steal all tokens. `token`, `refreshToken`, `role`, `tenantId`, `fullName`, and `device_id` are all stored here.
- **Fix:** Store tokens in `httpOnly` cookies set by a Next.js API route (server-side). The browser cannot read `httpOnly` cookies from JavaScript.

```ts
// ✅ Recommended: Next.js API Route sets cookie server-side
// app/api/auth/login/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  const result = await fetch(`${AUTH_API}/api/v1/auth/login`, {
    method: 'POST', body: JSON.stringify(body),
  });
  const data = await result.json();
  const response = NextResponse.json({ success: true });
  response.cookies.set('token', data.data.token, {
    httpOnly: true, secure: true, sameSite: 'strict', path: '/',
  });
  return response;
}
```

#### HIGH-2: No Rate Limiting on Login

- **File:** `app/login/Login.tsx`
- **Risk:** Unlimited login attempts allow brute-force and credential stuffing attacks. No lockout, no CAPTCHA, no delay after failed attempts.
- **Fix:** Implement client-side attempt tracking as a minimum; backend rate limiting is essential.

```ts
// Minimum client-side guard
const MAX_ATTEMPTS = 5;
const [attempts, setAttempts] = useState(0);
const [lockedUntil, setLockedUntil] = useState<number | null>(null);

const handleLogin = (e: React.FormEvent) => {
  if (lockedUntil && Date.now() < lockedUntil) {
    toast.error(`Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)}s`);
    return;
  }
  // ...
  loginMutation.mutate(payload, {
    onError: () => {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) setLockedUntil(Date.now() + 5 * 60 * 1000);
    },
  });
};
```

#### HIGH-3: No Security Headers Configured

- **File:** `next.config.ts`
- **Risk:** No `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, or `Referrer-Policy` headers. The app is vulnerable to clickjacking, MIME sniffing, and XSS injection.
- **Fix:**

```ts
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://www.snehbharat.com;",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

#### HIGH-4: DoctorGuard Not Applied to Doctor Routes

- **File:** `app/components/layouts/RootLayoutClient.tsx:27-43`
- **Risk:** The `forDoctors/*` and `doctor-profile/*` routes check `isDoctorRoute` and render children directly — **without** the `DoctorGuard` wrapper. Any user who navigates to `/forDoctors/dashboard` can access it without a valid doctor token.
- **Fix:**

```tsx
// RootLayoutClient.tsx — doctor branch
if (isDoctorRoute) {
  return (
    <Providers>
      <DoctorGuard>  {/* ← add this */}
        <div className="flex flex-col h-screen overflow-hidden">
          ...
          <main>{children}</main>
        </div>
      </DoctorGuard>
    </Providers>
  );
}
```

#### HIGH-5: Debug `console.log` Statements in Production Code

- **Files:** `app/components/DoctorGuard.tsx:17`, `app/Apis/lab/TestCategories.ts:157-161`, `app/Apis/Patients/Patient_Service_API.ts:35`, `app/Apis/booking/bookingServiceBaseUrl.ts` (`console.warn`)
- **Risk:** Leaks internal state, API response structure, auth token presence, and routing decisions to anyone with DevTools open. This assists attackers in reconnaissance.
- **Fix:** Remove all `console.log`/`console.warn` from production paths. Use a logger library (e.g., `pino`) that can be silenced in production via log level config.

#### HIGH-6: ReactQueryDevtools Included in Production Build

- **File:** `app/providers/QueryProvider.tsx:4,18`
- **Risk:** `ReactQueryDevtools` is imported unconditionally. In production, it exposes all query keys, cached data (including patient and financial data), and network request details.
- **Fix:**

```tsx
// QueryProvider.tsx
const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? (await import('@tanstack/react-query-devtools')).ReactQueryDevtools
    : () => null;

// OR use the lazy import pattern:
import dynamic from 'next/dynamic';
const ReactQueryDevtools = dynamic(
  () => process.env.NODE_ENV === 'development'
    ? import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools }))
    : Promise.resolve({ default: () => null }),
  { ssr: false }
);
```

---

### Medium Issues

#### MED-1: 201 TypeScript `any` Usages

- **Risk:** `any` silences the type checker. Bugs that TypeScript would normally catch pass through silently.
- **Fix:** Enable `"noImplicitAny": true` in `tsconfig.json` and replace `any` with proper types. Use `unknown` when the type is genuinely unknown, then narrow with type guards.

#### MED-2: No Server-Side Route Protection (No `middleware.ts`)

- **Risk:** RoleGuard runs client-side. A user can access any admin page URL directly before JavaScript loads, or by disabling JavaScript.
- **Fix:** Create `middleware.ts` at the project root:

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/doctor-login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) return NextResponse.next();
  const token = request.cookies.get('token');
  if (!token) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next|images|favicon).*)'] };
```

#### MED-3: `localStorage.clear()` on 401 Response

- **Files:** `app/Apis/Auth/apiClient.ts:31`, `app/Apis/booking/axios.ts`
- **Risk:** Clears **all** localStorage data on any 401 response, including unrelated application state. Could also be triggered by a network error misidentified as 401.
- **Fix:** Clear only auth-related keys explicitly.

```ts
// ❌ Current
localStorage.clear();

// ✅ Fix
['token', 'refreshToken', 'role', 'tenantId', 'fullName'].forEach(k => localStorage.removeItem(k));
```

#### MED-4: Forgot Password Link Is a Dead `href="#"`

- **File:** `app/login/Login.tsx:112`
- **Code:** `<a href="#" className="...">Forgot Password?</a>`
- **Risk:** Users who forget their password have no recovery path. In healthcare/enterprise context this is a compliance concern.

---

### Low Issues

#### LOW-1: No Logout API Call

- **Risk:** Logout only clears localStorage. Server-side session/token is never invalidated. Stolen tokens remain valid until expiry.

#### LOW-2: `connection-test.ts` and `patient-api-test/page.tsx` in Production Bundle

- **Files:** `app/Apis/Patients/connection-test.ts`, `app/patient-api-test/page.tsx`
- **Risk:** Debug/test utilities included in production bundle. These expose internal API testing logic and environment configuration checks to anyone.
- **Fix:** Delete or move to a test directory outside `app/`.

#### LOW-3: `.env` Should Be in `.gitignore` and Never Committed

- **Risk:** If `.env` is ever committed, secrets and internal IPs are in git history permanently.

---

## API Audit

This project has **no Next.js API routes**. All data operations call external microservices directly from the browser. The audit covers the API client layer.

### API Client Inventory

| Client File | Base URL Env Var | Auth | Error Handling | 401 Redirect |
|---|---|---|---|---|
| `Apis/Auth/apiClient.ts` | `NEXT_PUBLIC_API_AUTH` | Bearer token | ✅ | ✅ |
| `Apis/booking/axios.ts` | `NEXT_PUBLIC_API_Booking` | Bearer token | ✅ | ✅ |
| `Apis/lab/axios.ts` | `NEXT_PUBLIC_API_Test` + `NEXT_PUBLIC_API_Report` | Bearer token | ✅ | ✅ |
| 13 others | Various | Bearer token | Partial | Partial |

**Security Score for API Layer: 4/10**

#### Recommendations

1. **Consolidate to a single axios factory:**

```ts
// lib/api/client.ts
export function createApiClient(baseURL: string) {
  const client = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' } });
  client.interceptors.request.use(config => {
    const token = getCookie('token'); // httpOnly cookie via server proxy
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  client.interceptors.response.use(r => r.data, handleApiError);
  return client;
}

export const authClient = createApiClient(process.env.NEXT_PUBLIC_API_AUTH!);
export const bookingClient = createApiClient(process.env.NEXT_PUBLIC_API_Booking!);
export const labClient = createApiClient(process.env.NEXT_PUBLIC_API_Test!);
```

2. **Add request timeout** — No timeout is set on any axios instance. A slow backend will hang the UI indefinitely.

```ts
axios.create({ baseURL, timeout: 15_000 });
```

3. **Proxy external APIs through Next.js** — Currently, all backend URLs are exposed to the client. Use Next.js API routes to proxy requests, hiding backend topology.

---

## Database Audit

This is a pure frontend application. Database operations are handled by backend microservices. No ORM, no direct database access, no schema files exist in this repository.

**N+1 Query Risk:** `app/Apis/booking/usePatientLastVisitApi.ts` and hooks like `useTestsByIds` and `usePatientsByIds` accept arrays of IDs and batch-fetch — this is the correct pattern.

**Recommendations for Backend Team:**
- Ensure pagination is enforced on all list endpoints (the frontend uses pagination components).
- Ensure all patient-facing endpoints require `tenantId` scoping to prevent cross-tenant data leakage.

---

## Performance Report

### Bundle Analysis

- **No bundle analyzer configured.** Add `@next/bundle-analyzer` to identify heavy dependencies.
- **Tiptap editor** (`@tiptap/*` — 17 packages) is a large rich text editor used in `AdvancedTemplateEditor.tsx`. If only used on one page, it should be dynamically imported.
- **Recharts** is imported but only used in the dashboard, which currently has hardcoded data — the library load may be wasted.
- **16 axios instances** — minimal impact on bundle size (axios is tree-shakeable) but represents unnecessary duplication.

```ts
// ✅ Dynamic import for heavy editor
const AdvancedTemplateEditor = dynamic(
  () => import('@/app/components/editor/AdvancedTemplateEditor'),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);
```

### React Performance

- **Memoization usage: 181 occurrences** — reasonable for the codebase size.
- **277 `console.log` calls** add measurable overhead in production builds, as string interpolation still occurs even when DevTools is closed.
- **All pages use `'use client'`** — no pages use React Server Components, missing a major Next.js performance feature.

### Next.js Performance

| Optimization           | Status  | Notes                                                           |
| ---------------------- | ------- | --------------------------------------------------------------- |
| SSR (Server Components)| ❌ None | All pages are `'use client'`                                    |
| ISR                    | ❌ None | No `revalidate` exports                                         |
| Static Rendering       | ❌ None | No static pages                                                 |
| Image Optimization     | ✅ Used | `next/image` used in Login                                      |
| Font Optimization      | ✅ Used | `next/font/google` used in root layout                         |
| Turbopack (Dev)        | ✅ On   | Configured in `next.config.ts`                                  |
| Bundle Analyzer        | ❌ None | Not configured                                                  |
| Dynamic Imports        | ❌ None | Heavy components loaded eagerly                                 |

**Estimated performance gains from fixes:**
- Converting static-data pages to SSR/RSC: **20-40% FCP improvement**
- Removing ReactQueryDevtools from prod: **~150KB bundle reduction**
- Dynamic importing Tiptap editor: **~300KB initial bundle reduction**
- Removing 277 console.log calls: **~5-15ms parse time reduction**

---

## SEO Audit

This is an **internal enterprise admin application** behind authentication. SEO is inherently low priority, but metadata should still be correct to prevent accidental indexing.

| Page              | Title | Description | OG Tags | Twitter Card | Canonical | Sitemap |
| ----------------- | ----- | ----------- | ------- | ------------ | --------- | ------- |
| Root `layout.tsx` | ✅    | ✅          | ❌      | ❌          | ❌        | ❌      |
| All other pages   | ❌    | ❌          | ❌      | ❌          | ❌        | ❌      |

**Issues:**
1. No `robots.txt` — search engines may attempt to index the application.
2. No `sitemap.xml`.
3. No Open Graph or Twitter Card metadata on any page.
4. No per-page `metadata` exports — every page shows the same generic title.

**Minimum Fix:**

```ts
// Add to next.config.ts or public/robots.txt
User-agent: *
Disallow: /
```

---

## Accessibility Audit

| Issue | Severity | Location |
|---|---|---|
| No `aria-label` on icon-only buttons | High | Sidebar toggle, password show/hide |
| No skip-to-content link | High | All pages |
| No visible focus ring on custom buttons | High | `components/ui/button.tsx` |
| Missing `<label>` associations verified | Medium | Most form inputs use shadcn Label correctly |
| Hardcoded color values (non-system) | Medium | `#00ac80`, `#325969`, `#FF671F` — untested for contrast ratio |
| No keyboard trap management in modals | Medium | Multiple modal components |
| `suppressHydrationWarning` on `<html>` | Low | `app/layout.tsx:23` |

**WCAG 2.1 AA Compliance Estimate: ~30%**

**Recommended Fixes:**

```tsx
// ✅ Add aria-label to icon buttons
<button aria-label="Toggle password visibility" onClick={...}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>

// ✅ Add skip link
<a href="#main-content" className="sr-only focus:not-sr-only">Skip to content</a>
```

---

## Dependency Audit

### Vulnerable Packages

Run `npm audit` or `pnpm audit` to get a current vulnerability report. Key concerns:

- **`next: 16.1.7`** — This appears to be a very recent version but should be verified against the Next.js security changelog.
- **`uuid: ^14.0.0`** — Version 14 is current and safe.
- **`axios: ^1.15.2`** — Recent, generally safe.

### Outdated Packages

The following packages are using broad semver ranges and should be pinned for reproducibility:

```json
"@tiptap/core": "^3.25.0"     // 17 tiptap packages — should be pinned exactly
"lucide-react": "^0.577.0"    // Icon library — minor updates can change icon names
```

### Potentially Unused Packages

| Package | Usage Evidence | Recommendation |
|---|---|---|
| `@radix-ui/react-separator` | Used in shadcn Separator | Keep |
| `@radix-ui/react-tabs` | Used in shadcn Tabs | Keep |
| `recharts` | Dashboard (hardcoded data) | Remove if dashboard stays static |
| `@base-ui/react` | Unclear — search finds no direct use | Audit and likely remove |
| `tw-animate-css` | Referenced in globals.css | Keep |
| `vaul` | Used in Drawer component | Keep |

### Suggested Improvements

- Add `zod` for runtime schema validation of API responses.
- Add `pino` or `@sentry/nextjs` for production logging and error tracking.
- Consider removing `@tanstack/react-query-devtools` from `dependencies` and moving to `devDependencies`.

---

## Technical Debt

### Critical

- [ ] **0 tests** — No unit, integration, or E2E tests exist in the entire codebase
- [ ] **NEXT_PUBLIC_SECRET_KEY** — Cryptographic key exposed client-side
- [ ] **DoctorGuard not applied** — Doctor routes are unprotected

### High

- [ ] **16 duplicate axios instances** — Replace with a shared factory
- [ ] **277 console.log statements** — Remove from production code
- [ ] **JWT in localStorage** — Migrate to httpOnly cookies
- [ ] **No security headers** — Add CSP, HSTS, X-Frame-Options to `next.config.ts`
- [ ] **No middleware.ts** — Add server-side route protection
- [ ] **Dashboard hardcoded** — Connect to real API or clearly mark as demo

### Medium

- [ ] **201 TypeScript `any` types** — Resolve to proper types
- [ ] **Mixed `.jsx` / `.tsx`** — Migrate Sidebar, Topbar, and layout files to TypeScript
- [ ] **Inconsistent naming conventions** — Standardize to kebab-case for files
- [ ] **ReactQueryDevtools in production** — Gate behind `process.env.NODE_ENV`
- [ ] **No error boundaries** — Add global and per-section error boundaries
- [ ] **Dead "Forgot Password" link** — Implement or remove
- [ ] **Debug files in `app/`** — Remove `connection-test.ts` and `patient-api-test/`

### Low

- [ ] **No logout API call** — Invalidate server-side token on logout
- [ ] **localStorage.clear() on 401** — Replace with targeted key removal
- [ ] **No bundle analyzer** — Add `@next/bundle-analyzer`
- [ ] **No TypeScript strict mode enforced** — 201 `any` types suggest it's not fully strict
- [ ] **Typo in file name** — `doctot-details.tsx` should be `doctor-details.tsx`

---

## Refactoring Roadmap

### Phase 1 — Immediate (1–3 days)

1. **Remove `NEXT_PUBLIC_` prefix from `SECRET_KEY`** — Prevents credential leak in client bundle.
2. **Apply DoctorGuard in RootLayoutClient** — Closes the doctor route access gap.
3. **Remove all `console.log` from production files** — Reduces information leakage.
4. **Gate ReactQueryDevtools behind `NODE_ENV === 'development'`** — Prevents data exposure in production.
5. **Add security headers to `next.config.ts`** — Baseline XSS/clickjacking protection.
6. **Delete `connection-test.ts` and `patient-api-test/page.tsx`** — Remove debug code.

### Phase 2 — Short-Term (1–2 weeks)

1. **Consolidate 16 axios instances** into a single `createApiClient()` factory in `lib/api/client.ts`.
2. **Create `middleware.ts`** for server-side authentication.
3. **Implement request timeout** (15s) across all axios instances.
4. **Replace `localStorage.clear()`** with targeted key removal on 401.
5. **Migrate `.jsx` layout files** to `.tsx` with proper TypeScript types.
6. **Write minimal tests** — At least smoke tests for RoleGuard, DoctorGuard, and login flow.
7. **Connect Dashboard** to real data or explicitly mark as a placeholder/demo.
8. **Add dynamic imports** for `AdvancedTemplateEditor` (heavy Tiptap bundle).
9. **Fix "Forgot Password"** link — implement recovery flow or remove.

### Phase 3 — Long-Term (1–3 months)

1. **Migrate tokens to `httpOnly` cookies** via Next.js API route proxy.
2. **Add login rate limiting** (client-side minimum; backend enforcement required).
3. **Reduce TypeScript `any` from 201 to 0** — Enforce with ESLint `@typescript-eslint/no-explicit-any`.
4. **Add `zod` schemas** for all API response validation.
5. **Add `@sentry/nextjs`** for error tracking and session replays.
6. **Build a real-time dashboard** — Connect existing chart components to live APIs.
7. **Implement E2E tests** with Playwright for critical user journeys (login, booking, report entry).
8. **Add `robots.txt`** to prevent search engine indexing.
9. **Accessibility pass** — Implement ARIA labels, focus management, keyboard navigation.
10. **Setup CI/CD pipeline** — GitHub Actions with lint, type-check, test, and build gates.

---

## Production Readiness Checklist

| Item                       | Status             | Notes                                                          |
| -------------------------- | ------------------ | -------------------------------------------------------------- |
| Authentication             | ⚠️ Needs Improvement | Client-side guard only; localStorage tokens; no httpOnly cookie |
| Authorization              | ⚠️ Needs Improvement | RoleGuard works; DoctorGuard not applied; no server middleware |
| Security Headers           | ❌ Missing          | No CSP, HSTS, X-Frame-Options configured                      |
| Input Validation           | ⚠️ Needs Improvement | Minimal validation; no zod schemas for API responses          |
| Error Boundaries           | ❌ Missing          | No React error boundaries anywhere                            |
| Logging                    | ❌ Missing          | 277 console.logs in code; no structured logging               |
| Error Tracking             | ❌ Missing          | No Sentry or equivalent                                       |
| Monitoring / Alerting      | ❌ Missing          | No health check page; no uptime monitoring                    |
| CI/CD                      | ❌ Missing          | No pipeline configuration found                               |
| Automated Tests            | ❌ Missing          | 0 test files                                                  |
| Testing Coverage           | ❌ Missing          | N/A — no tests exist                                          |
| Environment Separation     | ⚠️ Needs Improvement | Single `.env`; no `.env.production` vs `.env.local` split    |
| Secret Management          | ❌ Missing          | Secret exposed as `NEXT_PUBLIC_`; no secrets manager          |
| Dependency Audit           | ⚠️ Needs Improvement | No automated `npm audit` in CI                               |
| Performance Budget         | ❌ Missing          | No Lighthouse CI or bundle size limits                        |
| Accessibility Testing      | ❌ Missing          | No automated axe or pa11y checks                             |
| Backup Strategy            | N/A                | Frontend only — backend responsibility                        |
| Rollback Plan              | ⚠️ Needs Improvement | Git history available; no feature flags for gradual rollout  |

---

## Scalability Assessment

### Can this application support 10,000 users?

**Yes, with caveats.** The frontend itself is stateless — scaling is about the backend microservices, not the Next.js app. The current architecture would handle 10K users if:
- The backend can handle the concurrent API load.
- CDN is used for static assets (Vercel/AWS CloudFront).
- The missing auth hardening (httpOnly cookies, server middleware) is addressed first.

**Bottlenecks at 10K:**
- `localStorage`-based auth doesn't scale across tabs or devices cleanly.
- No token refresh logic — users are silently kicked out when tokens expire.

### Can this application support 100,000 users?

**Unlikely without backend changes.** The frontend will be fine on a CDN, but:
- All 100K users' browsers talk directly to `snehbharat.com` microservices — no API gateway or BFF (Backend for Frontend) layer.
- No caching layer between frontend and APIs — identical requests are repeated across users.
- No rate limiting means the backend is fully exposed to traffic spikes.

**Required improvements:**
- Implement a Next.js BFF layer to proxy and cache API responses.
- Add token refresh logic (refresh token is stored but never used in the interceptors).
- Implement an API gateway with rate limiting and DDoS protection.

### Can this application support 1,000,000 users?

**No, not in current architecture.** Additional requirements:
- Global CDN with edge caching for all static assets.
- Server-Side Rendering or ISR for data-heavy pages to reduce API hits.
- Feature flagging system for gradual rollouts.
- Multi-region deployment.
- Full observability stack (metrics, traces, logs).
- A load-tested backend with proven horizontal scaling.

---

## Auto-Fix Suggestions

### Fix 1: Security Headers in `next.config.ts`

**Current:**
```ts
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: { buildActivity: false } as any,
};
```

**Improved:**
```ts
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
```

**Explanation:** Adds baseline protection against clickjacking (`X-Frame-Options`), MIME sniffing (`X-Content-Type-Options`), and enforces HTTPS (`Strict-Transport-Security`). Zero runtime cost.

---

### Fix 2: Gate ReactQueryDevtools Behind Environment Check

**Current (`app/providers/QueryProvider.tsx`):**
```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// ...
<ReactQueryDevtools initialIsOpen={false} />
```

**Improved:**
```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        // Dynamically loaded — zero production bundle impact
        <DevtoolsLoader />
      )}
    </QueryClientProvider>
  );
}

// Separate component to allow tree-shaking
function DevtoolsLoader() {
  const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
  return <ReactQueryDevtools initialIsOpen={false} />;
}
```

---

### Fix 3: Unified Axios Factory (Replace 16 duplicate files)

**Current (repeated 16 times with minor variations):**
```ts
// app/Apis/SomeDomain/axios.ts
const client = axios.create({ baseURL: '...' });
client.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Improved (`lib/api/client.ts`):**
```ts
import axios, { type AxiosInstance } from 'axios';

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

function onUnauthorized(): void {
  ['token', 'refreshToken', 'role', 'tenantId', 'fullName'].forEach(k =>
    localStorage.removeItem(k)
  );
  window.location.href = '/login';
}

export function createApiClient(baseURL: string, timeoutMs = 15_000): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: timeoutMs,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });

  client.interceptors.request.use(config => {
    const token = readToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    response => response.data,
    error => {
      if (error.response?.status === 401) onUnauthorized();
      const message = error.response?.data?.message ?? error.message ?? 'Request failed';
      return Promise.reject(new Error(message));
    }
  );

  return client;
}

// All service clients — one place, no duplication
export const authClient   = createApiClient(process.env.NEXT_PUBLIC_API_AUTH!);
export const bookingClient = createApiClient(process.env.NEXT_PUBLIC_API_Booking!);
export const labClient    = createApiClient(process.env.NEXT_PUBLIC_API_Test!);
export const reportClient = createApiClient(process.env.NEXT_PUBLIC_API_Report!);
export const patientClient = createApiClient(process.env.NEXT_PUBLIC_API_URL1!);
```

---

### Fix 4: Apply DoctorGuard to Doctor Routes

**Current (`app/components/layouts/RootLayoutClient.tsx`):**
```tsx
if (isLoginPage || isDoctorRoute) {
  return (
    <Providers>
      <main className="min-h-screen bg-[#eceff1]">
        {isDoctorRoute ? (
          <div className="flex flex-col h-screen overflow-hidden">
            ...
            <main className="flex-1 overflow-y-auto p-4">{children}</main>
          </div>
        ) : (children)}
      </main>
    </Providers>
  );
}
```

**Improved:**
```tsx
import DoctorGuard from '../DoctorGuard'; // ← add import

if (isLoginPage) {
  return <Providers>{children}</Providers>;
}

if (isDoctorRoute) {
  return (
    <Providers>
      <DoctorGuard>   {/* ← wrap all doctor routes */}
        <div className="flex flex-col h-screen overflow-hidden">
          <DoctorTopbar onToggleSidebar={handleToggleSidebar} />
          ...
          <main className="flex-1 overflow-y-auto p-4">{children}</main>
        </div>
      </DoctorGuard>
    </Providers>
  );
}
```

---

## Final Verdict

### Overall Grade: **D+**

| Score Category         | Value  |
| ---------------------- | ------ |
| **Overall Grade**      | D+ (47/100) |
| **Production Readiness** | 2/10 — Not production-ready |
| **Security Score**     | 3/10 — Critical issues present |
| **Performance Score**  | 5/10 — Acceptable for internal tool |

### Is this application suitable for production deployment?

**No — not in its current state.** Before any production deployment, the following **must** be fixed:

#### Blockers (Must Fix Before Launch)

1. ❌ `NEXT_PUBLIC_SECRET_KEY` exposes a cryptographic secret to all users
2. ❌ `DoctorGuard` is not applied — doctor routes are publicly accessible
3. ❌ No security headers — application is vulnerable to clickjacking and XSS
4. ❌ Internal IP address `192.168.29.27` exposed via public env variable
5. ❌ `ReactQueryDevtools` exposes all cached patient/financial data in production
6. ❌ Debug `console.log` statements leak internal state and API structure
7. ❌ Zero automated tests — no safety net for regressions

#### High-Priority (Fix Within First Sprint Post-Launch)

- JWT tokens in `localStorage` → migrate to `httpOnly` cookies
- Add `middleware.ts` for server-side route protection
- Add login rate limiting
- Add error boundaries
- Set up error tracking (Sentry)
- Remove `connection-test.ts` debug files from the app bundle

---

*Report generated by Claude Code on 2026-06-13. Re-run audit after implementing Phase 1 fixes.*
*Next scheduled audit: 2026-07-13*

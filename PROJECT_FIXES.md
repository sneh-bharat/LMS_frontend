# Project Fixes

> Every issue from the audit with: current code → fixed code → diff → migration steps → risk → effort.
> Apply in the order listed. Phase 1 fixes are safe to apply immediately.

---

## FIX-001 · Security Headers in `next.config.ts`

**Severity:** HIGH | **Phase:** 1 | **Effort:** 5 min | **Risk:** Low

### Current Code

```ts
// next.config.ts
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  devIndicators: { buildActivity: false } as any,
};
```

### Fixed Code

```ts
// next.config.ts — already applied to file
// See: next.config.ts (updated)
```

### Git Diff (summary)

```diff
+ const securityHeaders = [
+   { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
+   { key: 'X-Content-Type-Options', value: 'nosniff' },
+   { key: 'Strict-Transport-Security', value: 'max-age=63072000; ...' },
+   { key: 'Content-Security-Policy', value: '...' },
+   // ... 4 more headers
+ ];
+
+ async headers() {
+   return [{ source: '/(.*)', headers: securityHeaders }];
+ }
```

### Migration Steps

```bash
# File already updated — verify the build still passes:
npm run build
```

### Risk

Low. Headers are additive. CSP `unsafe-inline` is included for Tailwind inline styles — tighten it after auditing style injection.

---

## FIX-002 · Remove `NEXT_PUBLIC_` from `SECRET_KEY`

**Severity:** CRITICAL | **Phase:** 1 | **Effort:** 10 min | **Risk:** Medium

### Current Code

```env
# .env
NEXT_PUBLIC_SECRET_KEY=0A322E73634C0D241C604328944B342A
```

### Fixed Code

```env
# .env
SECRET_KEY=0A322E73634C0D241C604328944B342A
```

### Migration Steps

1. Find every usage of the key in the codebase:
```bash
grep -rn "NEXT_PUBLIC_SECRET_KEY\|SECRET_KEY" app/ lib/ --include="*.ts" --include="*.tsx"
```

2. If used client-side, move that logic to a Next.js API route (server-only).
3. Update `.env`, `.env.local`, `.env.production`.
4. Rotate the key itself — it was exposed in the client bundle before this fix.
5. Rebuild and redeploy.

### Risk

Medium. If anything reads `process.env.NEXT_PUBLIC_SECRET_KEY` on the client side, that code will break. Move such logic server-side first.

---

## FIX-003 · Gate ReactQueryDevtools Behind `NODE_ENV`

**Severity:** HIGH | **Phase:** 1 | **Effort:** 5 min | **Risk:** Very Low

### Current Code (`app/providers/QueryProvider.tsx`)

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// ...inside JSX:
<ReactQueryDevtools initialIsOpen={false} />
```

### Fixed Code

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false },
      },
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <DevTools />}
    </QueryClientProvider>
  );
}

function DevTools() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
  return <ReactQueryDevtools initialIsOpen={false} />;
}
```

### Git Diff

```diff
- import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

- <ReactQueryDevtools initialIsOpen={false} />
+ {process.env.NODE_ENV === 'development' && <DevTools />}
+
+ function DevTools() {
+   const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
+   return <ReactQueryDevtools initialIsOpen={false} />;
+ }
```

### Migration Steps

```bash
# Edit app/providers/QueryProvider.tsx with the fixed code above
# Move @tanstack/react-query-devtools to devDependencies:
npm install --save-dev @tanstack/react-query-devtools
npm uninstall @tanstack/react-query-devtools
npm install --save-dev @tanstack/react-query-devtools
```

### Risk

Very low. Only affects devtools visibility. Zero production behavior change.

---

## FIX-004 · Remove `console.log` Statements from Production Code

**Severity:** HIGH | **Phase:** 1 | **Effort:** 30 min | **Risk:** Low

### Current Code (sample — `app/components/DoctorGuard.tsx`)

```ts
console.log('DoctorGuard Debug:', { token: !!token, role });
console.log('DoctorGuard: Unauthorized access, redirecting...');
console.log('DoctorGuard: Authorized');
```

### Fixed Code

```ts
// Remove all three console.log lines — the auth logic remains identical.
// For production debugging, use: if (process.env.NODE_ENV === 'development') console.log(...)
```

### Migration Steps

```bash
# Find all console.log locations
grep -rn "console\.log\|console\.warn\|console\.error" app/ --include="*.ts" --include="*.tsx"

# Auto-remove console.log with ESLint rule (add to eslint.config.mjs):
# 'no-console': ['error', { allow: ['warn', 'error'] }]

# Or bulk-remove with sed (review each file before committing):
# WARNING: review changes before committing
find app/ -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\.log" | while read f; do
  echo "Review: $f"
done
```

### Risk

Low. Removing debug logs has no effect on application behavior.

---

## FIX-005 · Fix `localStorage.clear()` on 401 Response

**Severity:** MEDIUM | **Phase:** 1 | **Effort:** 15 min | **Risk:** Low

### Current Code (repeated in 16 axios.ts files)

```ts
// In response interceptor error handler:
if (error.response?.status === 401) {
  if (typeof window !== 'undefined') {
    localStorage.clear();  // ← clears ALL keys
    window.location.href = '/login';
  }
}
```

### Fixed Code

```ts
const AUTH_KEYS = ['token', 'refreshToken', 'role', 'tenantId', 'fullName'];

if (error.response?.status === 401) {
  if (typeof window !== 'undefined') {
    AUTH_KEYS.forEach(k => localStorage.removeItem(k)); // ← targeted removal
    window.location.href = '/login';
  }
}
```

### Migration Steps

1. Open each of the 16 `axios.ts` files in `app/Apis/`:

```bash
grep -rn "localStorage\.clear()" app/Apis/ --include="*.ts" -l
```

2. Replace `localStorage.clear()` with the targeted removal above in each file.
3. Alternatively, adopt the unified `lib/api/client.ts` factory (FIX-009) which handles this correctly.

### Risk

Low. More surgical — only auth keys are removed. Any other app state in localStorage is preserved.

---

## FIX-006 · Add `doctor-profile` Layout with DoctorGuard

**Severity:** HIGH | **Phase:** 1 | **Effort:** 5 min | **Risk:** Low

### Current State

`app/doctor-profile/` has only `page.tsx`. No `layout.tsx` — so no `DoctorGuard` wraps it, even though `RootLayoutClient` shows the doctor sidebar for this route.

### Fixed Code — new file: `app/doctor-profile/layout.tsx`

```tsx
import React from 'react';
import DoctorGuard from '@/app/components/DoctorGuard';

export default function DoctorProfileLayout({ children }: { children: React.ReactNode }) {
  return <DoctorGuard>{children}</DoctorGuard>;
}
```

### Migration Steps

```bash
# Create the file:
# app/doctor-profile/layout.tsx  (copy from snippet above)
```

### Risk

Low. Adds auth protection. Users without a valid doctor token will be redirected to `/doctor-login`.

---

## FIX-007 · Remove Debug Files from App Directory

**Severity:** MEDIUM | **Phase:** 1 | **Effort:** 5 min | **Risk:** Very Low

### Files to Remove or Relocate

```
app/Apis/Patients/connection-test.ts
app/patient-api-test/page.tsx
```

### Migration Steps

```bash
# Option A — Delete (recommended if no longer needed):
rm app/Apis/Patients/connection-test.ts
rm -r app/patient-api-test/

# Option B — Move outside app/ for manual use:
mkdir -p scripts/debug
mv app/Apis/Patients/connection-test.ts scripts/debug/
rm -r app/patient-api-test/
```

### Risk

Very low. These are debug utilities not imported by production code.

---

## FIX-008 · Add `middleware.ts` for Security Headers

**Severity:** HIGH | **Phase:** 1 | **Effort:** Already done | **Risk:** Very Low

The file `middleware.ts` has been created at the project root. It currently:
- Adds all security headers to every response.
- Does NOT block unauthenticated routes (Phase 3 gate is commented out).

**Why not block now?** The current auth uses `localStorage` tokens. Server-side `middleware` runs before hydration and cannot read `localStorage`. Full server-side auth protection requires migrating to `httpOnly` cookies first (Phase 3).

### To activate full server-side blocking (Phase 3):

Uncomment the gate in `middleware.ts` lines 41–58 after the cookie migration.

---

## FIX-009 · Unified Axios Factory (Replace 16 Duplicate Files)

**Severity:** HIGH | **Phase:** 2 | **Effort:** 2–3 days | **Risk:** Medium

### Current State

16 separate `axios.ts` files across `app/Apis/` — each with copy-pasted interceptor logic. Bugs fixed in one are not fixed in others (proven by `localStorage.clear()` still being present in most).

### Fixed Code

See `lib/api/client.ts` — already generated.

### Migration Steps (per service domain — do one at a time)

#### Step 1 — Pick a domain (e.g., `Commission`)

```bash
# See what the current client exports:
cat app/Apis/Commission/axios.ts
```

#### Step 2 — Update the API file to use the factory client

```ts
// app/Apis/Commission/commissionPrice.ts — BEFORE
import commissionAxios from './axios';

// AFTER
import { labClient } from '@/lib/api/client';
// Use labClient instead of commissionAxios
```

#### Step 3 — Delete the old axios.ts

```bash
rm app/Apis/Commission/axios.ts
```

#### Step 4 — Run the app and verify no regressions

```bash
npm run dev
# Navigate to Commission pages and verify API calls work
```

#### Step 5 — Repeat for each domain

Order (safest to most complex):
1. `Commission/` → uses `labClient`
2. `LabCoordinator/` → uses `authClient` or `labClient`
3. `LabTechnician/` → uses `labClient`
4. `collector/` → uses `authClient`
5. `doctor/` → uses `patientClient`
6. `branch/` → uses `authClient`
7. `organizations/` → uses `bookingClient`
8. `membership/` → uses `bookingClient`
9. `tenant/` → uses `authClient`
10. `Referrer/` → uses `authClient`
11. `Report/` → uses `reportClient`
12. `lab/TemplateMgmt/` → uses `reportClient`
13. `lab/report/` → uses `reportClient`
14. `Patients/` → uses `patientClient` (note: `unwrapData: false`)
15. `booking/` → uses `bookingClient` + `ordersClient`
16. `Auth/` → uses `authClient` (last — highest risk)

### Breaking Changes

| Old behavior | New behavior |
|---|---|
| Error thrown as plain object `{ ...error, message }` | Error always thrown as `new Error(message)` |
| No timeout | 15 000 ms default timeout |
| `localStorage.clear()` on 401 | Targeted auth key removal only |
| Response shape varies per client | Consistent: `response.data` unwrapped |

**In consuming code**, change `catch` blocks from:

```ts
// Old: error might be a plain object
catch (err: any) {
  toast.error(err.message || 'Failed');
}

// New: error is always an Error instance
catch (err) {
  toast.error(err instanceof Error ? err.message : 'Failed');
}
```

### Risk

Medium. Requires touching every API-calling file. Mitigate by migrating one domain at a time and testing after each.

---

## FIX-010 · Add Zod Runtime Validation for API Responses

**Severity:** MEDIUM | **Phase:** 2 | **Effort:** 1 week | **Risk:** Low

### Install Zod

```bash
npm install zod
```

### Usage Pattern

```ts
// app/Apis/Auth/auth.ts — with validation
import { z } from 'zod';
import { LoginResponseSchema } from '@/lib/schemas/auth.schema';
import { authClient } from '@/lib/api/client';

export const authApi = {
  login: async (payload: LoginPayload) => {
    const raw = await authClient.post('/api/v1/auth/login', payload);
    // Validate at the boundary — throws ZodError if shape is unexpected
    return LoginResponseSchema.parse(raw);
  },
};
```

### Why This Matters

Without runtime validation, a backend API change (e.g., renaming `loginDetails` to `login_details`) causes a silent runtime crash. Zod surfaces the mismatch immediately with a clear error.

---

## FIX-011 · Add React Error Boundaries

**Severity:** HIGH | **Phase:** 2 | **Effort:** 30 min | **Risk:** Very Low

### `app/error.tsx` — Already Created

The global error boundary is now at `app/error.tsx`. Next.js App Router automatically uses this for any uncaught error in the route tree.

### Add Section-Level Error Boundaries

For critical pages (invoice, report entry), add local error boundaries:

```tsx
// Example: app/diagnosis/invoice-list/error.tsx
'use client';
import { AlertTriangle } from 'lucide-react';

export default function InvoiceError({ reset }: { reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <AlertTriangle className="mx-auto text-rose-500 mb-4" size={40} />
      <h2 className="font-bold text-slate-900 mb-2">Failed to load invoices</h2>
      <button onClick={reset} className="text-sm text-[#00ac80] underline">
        Try again
      </button>
    </div>
  );
}
```

Create an `error.tsx` in any route folder to catch errors scoped to that segment.

---

## FIX-012 · Migrate `.jsx` Layout Files to `.tsx`

**Severity:** MEDIUM | **Phase:** 2 | **Effort:** 2 hours | **Risk:** Low

### Files to Migrate

```bash
app/components/layouts/Sidebar.jsx     → Sidebar.tsx
app/components/layouts/Topbar.jsx      → Topbar.tsx
app/components/layouts/DoctorSidebar.jsx → DoctorSidebar.tsx
app/components/layouts/DoctorTopbar.jsx  → DoctorTopbar.tsx
app/components/layouts/StatsCards.js   → StatsCards.tsx
```

### Migration Steps

```bash
# Rename files
mv app/components/layouts/Sidebar.jsx app/components/layouts/Sidebar.tsx
mv app/components/layouts/Topbar.jsx app/components/layouts/Topbar.tsx
mv app/components/layouts/DoctorSidebar.jsx app/components/layouts/DoctorSidebar.tsx
mv app/components/layouts/DoctorTopbar.jsx app/components/layouts/DoctorTopbar.tsx
mv app/components/layouts/StatsCards.js app/components/layouts/StatsCards.tsx

# Run TypeScript check — fix any type errors reported
npx tsc --noEmit
```

### Risk

Low. The files are valid JSX. TypeScript will report missing prop types which need to be added, but the logic is unchanged.

---

## FIX-013 · Add Login Rate Limiting

**Severity:** HIGH | **Phase:** 2 | **Effort:** 1 hour | **Risk:** Very Low

### Current Code (`app/login/Login.tsx`)

No attempt tracking. Unlimited login attempts allowed.

### Fixed Code — add to Login.tsx

```tsx
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

const [attempts, setAttempts] = useState(0);
const [lockedUntil, setLockedUntil] = useState<number | null>(null);

const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
const lockSecondsLeft = isLocked ? Math.ceil((lockedUntil! - Date.now()) / 1000) : 0;

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();

  if (isLocked) {
    toast.error(`Too many attempts. Try again in ${lockSecondsLeft}s`);
    return;
  }

  if (!username || !password) {
    toast.error('Please enter both username and password');
    return;
  }

  loginMutation.mutate(
    { username, password, deviceTypes: 'BROWSER', deviceId: deviceId! },
    {
      onError: () => {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_MS);
          toast.error('Account temporarily locked. Try again in 5 minutes.');
        } else {
          toast.error(`Invalid credentials. ${MAX_ATTEMPTS - next} attempt(s) remaining.`);
        }
      },
    }
  );
};
```

Add to the submit button:

```tsx
<Button
  type="submit"
  disabled={isLoading || isLocked}
  // ...
>
  {isLocked ? `Locked (${lockSecondsLeft}s)` : isLoading ? 'Signing In...' : 'Sign In'}
</Button>
```

### Risk

Very low. Purely additive UI state. Does not affect the API call.

---

## FIX-014 · Resolve TypeScript `any` Types

**Severity:** MEDIUM | **Phase:** 2 | **Effort:** 1–2 weeks | **Risk:** Medium

### Current State

201 `any` usages found. Key patterns:

**Pattern A — Event handlers:**

```ts
// ❌ Before
onError: (error: any) => { toast.error(error.message); }

// ✅ After
onError: (error: unknown) => {
  toast.error(error instanceof Error ? error.message : 'An error occurred');
}
```

**Pattern B — API responses typed as `any`:**

```ts
// ❌ Before
const [data, setData] = useState<any>(null);

// ✅ After — use the zod-generated type
import type { TestOrder } from '@/lib/schemas/booking.schema';
const [data, setData] = useState<TestOrder | null>(null);
```

**Pattern C — Third-party type gaps:**

```ts
// ❌ Before
const cloneElement = React.cloneElement(stat.icon as any, { size: 20 });

// ✅ After
const cloneElement = React.cloneElement(
  stat.icon as React.ReactElement<{ size?: number }>,
  { size: 20 }
);
```

### Enable ESLint Rule

Add to `eslint.config.mjs`:

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
}
```

### Risk

Medium. Type errors will surface real bugs hidden by `any`. Fix type errors one file at a time.

---

## FIX-015 · Token Storage Migration to httpOnly Cookies

**Severity:** CRITICAL (long-term) | **Phase:** 3 | **Effort:** 1 week | **Risk:** High

This is the most impactful security fix but requires significant backend and frontend coordination.

### Architecture Change

```
Current:  Browser → [fetch] → External API (token in localStorage)
Target:   Browser → Next.js API Route → External API (token in httpOnly cookie)
```

### Step 1 — Create Next.js auth proxy routes

```bash
mkdir -p app/api/auth
```

```ts
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const upstream = await fetch(
    `${process.env.AUTH_API_BASE}/api/v1/auth/login`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body) }
  );

  const data = await upstream.json();

  if (!upstream.ok || !data.response) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json({
    message: data.message,
    response: data.response,
    loginDetails: data.data.loginDetails,
  });

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  };

  response.cookies.set('auth_token', data.data.token, cookieOpts);
  response.cookies.set('auth_refresh', data.data.refreshToken, {
    ...cookieOpts, maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  response.cookies.set('auth_role', data.data.loginDetails.role, {
    ...cookieOpts, httpOnly: false, // role can be read by client JS for UI decisions
  });

  return response;
}
```

```ts
// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('auth_token');
  response.cookies.delete('auth_refresh');
  response.cookies.delete('auth_role');
  return response;
}
```

### Step 2 — Update Login.tsx to call the proxy

```ts
// Instead of: loginMutation.mutate({ ... })
// Use the proxy:
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password, deviceTypes: 'BROWSER', deviceId }),
});
const data = await res.json();
if (data.response) {
  // No need to store token — it's in httpOnly cookie
  localStorage.setItem('role', data.loginDetails.role); // for UI only — low risk
  router.push('/dashboard');
}
```

### Step 3 — Update axios clients to not send Bearer token

The server-side Next.js API routes will forward requests to microservices with the token read from the cookie (server-side). Client-side axios clients no longer need to read `localStorage`.

### Step 4 — Activate middleware.ts gate

Uncomment the Phase 3 gate in `middleware.ts`.

### Risk

High. This is a complete auth flow rewrite. Test exhaustively in staging before production rollout.

---

## FIX-016 · Add Playwright E2E Tests

**Severity:** HIGH | **Phase:** 4 | **Effort:** 1 week | **Risk:** Very Low

### Install

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

### Test: Login Flow

```ts
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('redirects to dashboard on successful login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'admin');
    await page.fill('#password', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'wrong');
    await page.fill('#password', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
  });

  test('locks after 5 failed attempts', async ({ page }) => {
    await page.goto('/login');
    for (let i = 0; i < 5; i++) {
      await page.fill('#username', 'wrong');
      await page.fill('#password', 'wrong');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(300);
    }
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('blocks unauthenticated access to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
```

### Add to `package.json`

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## FIX-017 · Add `not-found.tsx` and `error.tsx` Pages

**Status:** ✅ Already created

- `app/error.tsx` — created
- `app/not-found.tsx` — created

These automatically activate for all routes in the Next.js App Router.

---

## FIX-018 · Fix Hardcoded Dashboard Data

**Severity:** MEDIUM | **Phase:** 2 | **Effort:** 2–3 days | **Risk:** Low

### Current State (`app/dashboard/page.tsx`)

Revenue, Patients, Test Velocity, Lab Efficiency are all hardcoded static values. Branch table shows fake email addresses.

### Fix Approach

1. Create a dashboard API endpoint or use existing booking/order API for statistics.
2. Replace hardcoded arrays with `useQuery` calls.

```tsx
// Example — real stats card
const { data: stats, isLoading } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: () => bookingClient.get('/api/v1/dashboard/stats'),
});

// Replace hardcoded values:
{ label: 'Active Patients', value: isLoading ? '...' : stats?.activePatients ?? '—' }
```

### Risk

Low — additive change. If API is not ready, keep placeholder values clearly labeled as demo.

---

## Summary Checklist

### Phase 1 — Critical Security (apply immediately)

- [x] `FIX-001` Security headers in `next.config.ts` ← **DONE**
- [ ] `FIX-002` Remove `NEXT_PUBLIC_SECRET_KEY`
- [x] `FIX-003` Gate ReactQueryDevtools behind `NODE_ENV` ← code provided
- [ ] `FIX-004` Remove 277 `console.log` statements
- [ ] `FIX-005` Fix `localStorage.clear()` in 16 axios files
- [x] `FIX-006` Add `doctor-profile/layout.tsx` with DoctorGuard ← code provided
- [ ] `FIX-007` Delete debug files from `app/`
- [x] `FIX-008` Add `middleware.ts` ← **DONE**

### Phase 2 — Architecture & Code Quality

- [x] `FIX-009` Unified axios factory (`lib/api/client.ts`) ← **DONE** (migration required)
- [x] `FIX-010` Add Zod schemas ← **DONE** (install `zod` first)
- [x] `FIX-011` Add error boundaries (`app/error.tsx`) ← **DONE**
- [ ] `FIX-012` Migrate `.jsx` to `.tsx`
- [ ] `FIX-013` Login rate limiting
- [ ] `FIX-014` Resolve `any` types

### Phase 3 — Auth & Performance

- [ ] `FIX-015` Token migration to `httpOnly` cookies

### Phase 4 — Testing & Monitoring

- [ ] `FIX-016` Playwright E2E tests
- [x] `FIX-017` `not-found.tsx` + `error.tsx` ← **DONE**
- [ ] `FIX-018` Real dashboard data

### Already Done in This Session

| File | Status |
|---|---|
| `middleware.ts` | ✅ Created |
| `next.config.ts` | ✅ Updated with security headers |
| `app/error.tsx` | ✅ Created |
| `app/not-found.tsx` | ✅ Created |
| `lib/api/client.ts` | ✅ Created |
| `lib/schemas/auth.schema.ts` | ✅ Created |
| `lib/schemas/booking.schema.ts` | ✅ Created |
| `.github/workflows/ci.yml` | ✅ Created |
| `public/robots.txt` | ✅ Created |
| `public/sitemap.xml` | ✅ Created |
| `PROJECT_AUDIT_REPORT.md` | ✅ Created |
| `PROJECT_AUDIT_REPORT.json` | ✅ Created |

# Project Migration Guide

> Step-by-step instructions for migrating each system from its current state to the target state.
> Every section is self-contained — engineers can work on sections independently.

---

## How to Use This Guide

- Each section has a **Current State**, **Target State**, and exact terminal commands.
- Sections marked ✅ are already done. Sections marked 🔴 are launch blockers.
- Always create a git branch before starting a migration section.
- Merge strategy: small PRs per section, not one giant PR.

---

## Migration 1 — Security Headers

**Status: ✅ Complete**
**File changed:** `next.config.ts`

The updated `next.config.ts` now adds 7 security headers to every HTTP response:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` (inline styles allowed; tighten in production)

### Verify

```bash
npm run build
npm run start &
sleep 3
curl -s -I http://localhost:3000/login | grep -iE "x-frame|x-content|strict-transport|content-security-policy"
# Kill the server:
kill $(lsof -ti:3000) 2>/dev/null
```

Expected output: All 4+ headers present with correct values.

---

## Migration 2 — Secret Key Removal 🔴

**Status: Required immediately**

### Current State

```
NEXT_PUBLIC_SECRET_KEY=0A322E73634C0D241C604328944B342A
```

This key is bundled into the client JavaScript and visible in browser DevTools → Sources → any `_next/static/chunks/*.js` file.

### Target State

```
SECRET_KEY=0A322E73634C0D241C604328944B342A
```

Used only in server-side code (Next.js API routes, `middleware.ts`).

### Steps

```bash
# 1. Check where it's used
grep -rn "NEXT_PUBLIC_SECRET_KEY" app/ components/ lib/ --include="*.ts" --include="*.tsx"

# If output is empty → only referenced in .env (safest case, just rename)
# If output has results → read each file and move that logic to app/api/

# 2. Rename in .env
sed -i '' 's/NEXT_PUBLIC_SECRET_KEY/SECRET_KEY/g' .env

# 3. Verify it no longer appears in client bundle after build
npm run build
grep -rl "0A322E73634C0D241C604328944B342A" .next/static/ 2>/dev/null \
  && echo "⚠️  KEY STILL IN CLIENT BUNDLE" \
  || echo "✅ Key not found in client bundle"

# 4. IMPORTANT: Rotate the key — it was already exposed to anyone who loaded the app
# Generate a new key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Update the key in your secrets manager / hosting platform env vars
```

---

## Migration 3 — Middleware for Server-Side Security Headers

**Status: ✅ Complete**
**File created:** `middleware.ts`

The middleware currently:
1. Applies all security headers server-side (belt-and-suspenders with `next.config.ts`).
2. Allows all routes through — the auth-blocking gate is commented out (Phase 3).

### To Enable Full Auth Blocking (Phase 3)

After token storage migrates to httpOnly cookies, uncomment lines 41–58 in `middleware.ts`:

```bash
# Edit middleware.ts to uncomment the Phase 3 gate
# Then test with a fresh browser (no cookies):
# 1. Open http://localhost:3000/dashboard in incognito
# 2. Should redirect to /login
# 3. Log in, then navigate to /dashboard — should work
```

---

## Migration 4 — Axios Factory Consolidation

**Status: Factory created at `lib/api/client.ts`. Migration of 16 files required.**

### Why Migrate

The 16 existing `axios.ts` files have:
- Copy-pasted interceptor logic (diverged over time)
- `localStorage.clear()` bug on 401 (destroys all app state)
- No request timeout
- Inconsistent error shapes

### Migration Template

For each domain folder in `app/Apis/`:

#### Step A — Identify what the domain's axios.ts exports and what uses it

```bash
# Example: Commission domain
cat app/Apis/Commission/axios.ts
grep -rn "commissionAxios\|from './axios'" app/Apis/Commission/ --include="*.ts"
```

#### Step B — Replace import in API files

```ts
// BEFORE (in app/Apis/Commission/commissionPrice.ts):
import commissionAxios from './axios';

// AFTER:
import { labClient } from '@/lib/api/client';
// Replace all: commissionAxios.get(...) → labClient.get(...)
//              commissionAxios.post(...) → labClient.post(...)
```

#### Step C — Handle the error shape change

Old interceptors threw errors as plain objects:

```ts
// Old error shape (from most axios.ts files):
return Promise.reject({ ...error, message });
// Caught as: catch (err: any) { err.message }

// New error shape (from lib/api/client.ts):
return Promise.reject(new Error(message));
// Caught as: catch (err) { err instanceof Error ? err.message : 'Failed' }
```

Update catch blocks in calling hooks/components:

```ts
// Old pattern (update these):
} catch (err: any) {
  toast.error(err?.message || 'Failed');
}

// New pattern:
} catch (err) {
  toast.error(err instanceof Error ? err.message : 'Failed');
}
```

#### Step D — Delete the old axios.ts

```bash
rm app/Apis/Commission/axios.ts
```

#### Step E — Verify

```bash
npx tsc --noEmit        # No TypeScript errors
npm run dev             # App starts
# Navigate to a page that uses Commission APIs
# Open DevTools → Network → verify API calls succeed
```

#### Step F — Commit

```bash
git add app/Apis/Commission/
git commit -m "refactor(api): migrate Commission to shared axios factory"
```

### Service Client Mapping

| Domain | Use this client | Notes |
|---|---|---|
| `app/Apis/Auth/` | `authClient` | |
| `app/Apis/Commission/` | `labClient` | Uses `NEXT_PUBLIC_API_Test` |
| `app/Apis/LabCoordinator/` | `authClient` or `labClient` | Check base URL |
| `app/Apis/LabTechnician/` | `labClient` | |
| `app/Apis/collector/` | `authClient` | |
| `app/Apis/doctor/` | `patientClient` | Note: `unwrapData: false` |
| `app/Apis/branch/` | `authClient` | |
| `app/Apis/organizations/` | `bookingClient` | |
| `app/Apis/membership/` | `bookingClient` | |
| `app/Apis/tenant/` | `authClient` | |
| `app/Apis/Referrer/` | `authClient` | Check — currently uses `NEXT_PUBLIC_API_AUTH` |
| `app/Apis/Report/` | `reportClient` | Uses `NEXT_PUBLIC_API_Report` |
| `app/Apis/lab/TemplateMgmt/` | `reportClient` | Same base as Report |
| `app/Apis/lab/report/` | `reportClient` | |
| `app/Apis/Patients/` | `patientClient` | `unwrapData: false` — full response needed |
| `app/Apis/booking/axios.ts` | `bookingClient` | |
| `app/Apis/booking/ordersAxios.ts` | `ordersClient` | |
| `app/Apis/lab/axios.ts` | `labClient` + `reportClient` | This file creates both — split callers |

---

## Migration 5 — Token Storage (httpOnly Cookies)

**Status: Phase 3 — do not start until Phase 1 and 2 are complete**

### Architecture Overview

```
Current Architecture:
┌──────────┐   POST /api/v1/auth/login   ┌──────────────────────┐
│ Browser  │ ─────────────────────────→  │ lims-auth microservice│
│ (Login)  │ ←──────── token ────────── │                      │
│          │  stores in localStorage     └──────────────────────┘
└──────────┘

Target Architecture:
┌──────────┐  POST /api/auth/login  ┌────────────────┐  POST /api/v1/auth/login  ┌──────────────┐
│ Browser  │ ─────────────────────→ │  Next.js       │ ────────────────────────→ │ lims-auth    │
│ (Login)  │ ← httpOnly cookie ──── │  API Route     │ ←─── token ────────────── │ microservice │
│          │  (JS can't read it)    │  /api/auth/*   │                           └──────────────┘
└──────────┘                        └────────────────┘
```

### Files to Create

```bash
mkdir -p app/api/auth/login app/api/auth/logout app/api/auth/refresh
```

### `app/api/auth/login/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const authBase = process.env.AUTH_API_BASE; // server-only (no NEXT_PUBLIC_)

  const upstream = await fetch(`${authBase}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();

  if (!upstream.ok || !data.response) {
    return NextResponse.json(
      { message: data.message || 'Login failed', response: false },
      { status: upstream.status }
    );
  }

  const response = NextResponse.json({
    message: data.message,
    response: true,
    loginDetails: data.data.loginDetails, // exclude token from response body
  });

  const isProd = process.env.NODE_ENV === 'production';
  const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict' as const,
    path: '/',
  };

  response.cookies.set('auth_token', data.data.token, {
    ...cookieBase,
    maxAge: 60 * 60 * 8, // 8 hours
  });
  response.cookies.set('auth_refresh', data.data.refreshToken, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  // Role is readable by client JS (needed for RoleGuard UI decisions)
  response.cookies.set('auth_role', data.data.loginDetails.role, {
    ...cookieBase,
    httpOnly: false,
    maxAge: 60 * 60 * 8,
  });

  return response;
}
```

### `app/api/auth/logout/route.ts`

```ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  ['auth_token', 'auth_refresh', 'auth_role'].forEach(name =>
    response.cookies.delete(name)
  );
  return response;
}
```

### Update Login.tsx to Use the Proxy

```ts
// In app/login/Login.tsx — replace loginMutation with a fetch call:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!username || !password || !deviceId) return;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, deviceTypes: 'BROWSER', deviceId }),
    });
    const data = await res.json();

    if (data.response) {
      // Store only non-sensitive display info in localStorage
      if (data.loginDetails.fullName) localStorage.setItem('fullName', data.loginDetails.fullName);
      if (data.loginDetails.tenantId) localStorage.setItem('tenantId', String(data.loginDetails.tenantId));
      toast.success('Login successful');
      router.push('/dashboard');
    } else {
      toast.error(data.message || 'Login failed');
    }
  } catch {
    toast.error('An error occurred during login');
  }
};
```

### Update All Axios Clients to Use Cookie Instead of Authorization Header

```ts
// lib/api/client.ts — request interceptor (Phase 3 version):
// Remove the localStorage.getItem('token') block entirely.
// The browser sends the httpOnly cookie automatically with every request.
// The microservices must accept the cookie OR the Next.js BFF proxy must
// forward the token from the cookie as a header — your choice.
```

### Update `RoleGuard.tsx` to Read Cookie Instead of localStorage

```ts
// After migration, role is in the 'auth_role' cookie (readable by JS)
// Use document.cookie parsing or a cookie library:
import Cookies from 'js-cookie'; // npm install js-cookie

const role = Cookies.get('auth_role');
```

### Update `middleware.ts`

Uncomment the Phase 3 gate in `middleware.ts` to enable server-side route protection.

---

## Migration 6 — Add Tests

**Status: Phase 4**

### File Structure to Create

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── booking/
│   │   └── create-order.spec.ts
│   └── reports/
│       └── report-entry.spec.ts
├── unit/
│   ├── guards/
│   │   ├── RoleGuard.test.tsx
│   │   └── DoctorGuard.test.tsx
│   └── schemas/
│       ├── auth.schema.test.ts
│       └── booking.schema.test.ts
└── playwright.config.ts
```

### Setup Commands

```bash
# E2E (Playwright):
npm install --save-dev @playwright/test
npx playwright install chromium

# Unit (Vitest — recommended for Next.js 15+):
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

# Add to package.json scripts:
# "test": "vitest",
# "test:e2e": "playwright test"
```

### Minimum Test for RoleGuard

```tsx
// tests/unit/guards/RoleGuard.test.tsx
import { render } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import RoleGuard from '@/app/components/RoleGuard';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it('redirects to /login when no token', async () => {
    render(<RoleGuard><div>protected</div></RoleGuard>);
    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects when role is not authorized', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('role', 'UNKNOWN_ROLE');
    render(<RoleGuard><div>protected</div></RoleGuard>);
    await vi.waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  it('renders children for ADMIN role', async () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('role', 'ADMIN');
    const { getByText } = render(<RoleGuard><div>protected</div></RoleGuard>);
    await vi.waitFor(() => {
      expect(getByText('protected')).toBeInTheDocument();
    });
  });
});
```

---

## Migration 7 — Error Tracking with Sentry

**Status: Phase 4**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs --saas
```

The wizard will:
1. Create `sentry.client.config.ts`
2. Create `sentry.server.config.ts`
3. Patch `next.config.ts` (add `withSentryConfig()`)
4. Create `app/global-error.tsx`

After setup, update `app/error.tsx`:

```tsx
import * as Sentry from '@sentry/nextjs';

useEffect(() => {
  Sentry.captureException(error);
}, [error]);
```

**Important:** Set `SENTRY_DSN` as a server-only env var (no `NEXT_PUBLIC_` prefix). The Sentry DSN is not a secret, but keeping it server-side prevents accidental client-side exposure of your project details.

---

## Environment Variables Reference

| Variable | Scope | Usage | Phase |
|---|---|---|---|
| `NEXT_PUBLIC_API_AUTH` | Client | Auth microservice URL | Current |
| `NEXT_PUBLIC_API_URL1` | Client | Patient microservice URL | Current |
| `NEXT_PUBLIC_API_Test` | Client | Test catalog URL | Current |
| `NEXT_PUBLIC_API_Report` | Client | Report service URL | Current |
| `NEXT_PUBLIC_API_Booking` | Client | Booking service URL | Current |
| `SECRET_KEY` | Server only | Cryptographic operations | Phase 1 (rename) |
| `AUTH_API_BASE` | Server only | Auth URL for Next.js proxy | Phase 3 |
| `SENTRY_DSN` | Server only | Error tracking | Phase 4 |
| `SENTRY_AUTH_TOKEN` | CI only | Source map upload | Phase 4 |

### `.env` structure after all phases

```bash
# Client-side (exposed to browser — only URLs, no secrets)
NEXT_PUBLIC_API_AUTH=https://www.snehbharat.com/lims-auth
NEXT_PUBLIC_API_URL1=https://www.snehbharat.com/lims-patient
NEXT_PUBLIC_API_Test=https://www.snehbharat.com/test-catalog
NEXT_PUBLIC_API_Report=https://reports.snehbharat.com       # ← no more IP
NEXT_PUBLIC_API_Booking=https://www.snehbharat.com/lims-booking

# Server-only (never exposed to browser)
AUTH_API_BASE=https://www.snehbharat.com/lims-auth          # for proxy route
SECRET_KEY=<rotate-from-original>
SENTRY_DSN=https://...@sentry.io/...
```

---

## Git Branch Strategy

```
main
├── develop                          (integration branch)
│   ├── fix/phase1-security-headers  ← merge first
│   ├── fix/phase1-secret-key        ← merge second
│   ├── fix/phase1-devtools-gate     ← merge third
│   ├── fix/phase1-console-logs      ← merge fourth
│   ├── fix/phase1-localstorage      ← merge fifth
│   ├── fix/phase1-doctor-profile    ← merge sixth
│   ├── fix/phase1-debug-files       ← merge seventh
│   └── refactor/phase2-axios-commission  ← phase 2, one at a time
```

---

## Rollback Plan

Every phase can be rolled back independently because changes are modular:

| Change | Rollback |
|---|---|
| `next.config.ts` security headers | Revert to previous version in git |
| `middleware.ts` | Delete the file — Next.js ignores missing middleware |
| Zod schemas | Delete `lib/schemas/` — schemas are additive |
| Axios factory | Old `axios.ts` files still exist until explicitly deleted |
| `error.tsx` / `not-found.tsx` | Delete files — Next.js uses defaults |
| `doctor-profile/layout.tsx` | Delete the file |
| Token migration | Revert login route to use localStorage path |

---

## Production Deployment Checklist

Before deploying any Phase 1 fix to production:

```bash
# 1. Run full build
npm run build

# 2. Run lint
npm run lint

# 3. Type-check
npx tsc --noEmit

# 4. Test locally
npm run start
# Manually test: login, dashboard, core booking flows

# 5. Check security headers
curl -s -I https://your-staging-url/ | grep -iE "x-frame|content-security|strict-transport"

# 6. Verify no secret in client bundle (after Phase 1.2)
grep -r "SECRET_KEY_VALUE" .next/static/ || echo "Clean"

# 7. Verify DevTools not in production bundle
grep -r "ReactQueryDevtools" .next/static/ || echo "Clean"
```

---

## Estimated Total Effort

| Phase | Work Required | Calendar Time |
|---|---|---|
| Phase 1 — Critical Security | ~4 hours of dev time | 1–3 days (reviews/deploys) |
| Phase 2 — Architecture | ~3–5 days of dev time | 1–2 weeks |
| Phase 3 — Auth Migration | ~1 week of dev time | 2–4 weeks (staging required) |
| Phase 4 — Tests/Monitoring | ~1–2 weeks of dev time | 1–3 months (parallel) |
| **Total** | **~3–4 weeks dev time** | **1–3 months calendar** |

# Production Readiness

> Phase 9 — 2026-06-13

---

## Status Overview

| Category | Status | Notes |
|---|---|---|
| Security headers | ✅ Applied | CSP, HSTS, X-Frame-Options, etc. via `next.config.ts` |
| Secrets in `.env` | ⚠️ Manual action needed | `SECRET_KEY` rotated in file; push with new value |
| Internal IP in config | ❌ Blocker | `NEXT_PUBLIC_API_Report=http://192.168.29.27:9090` must be replaced |
| localStorage JWT | ⚠️ Acceptable for now | Phase 3 long-term: migrate to httpOnly cookies |
| Middleware auth gate | ⏳ Deferred | Uncomment in `middleware.ts` after httpOnly migration |
| Console.log removed | ✅ Done | 277 calls removed |
| `localStorage.clear()` | ✅ Fixed | 18 axios files — now removes only auth keys |
| API timeout | ✅ Set | 15 s on all clients |
| TanStack Query stale time | ✅ Set | 5 min default |
| DevTools gated | ✅ Done | Only renders in `NODE_ENV === 'development'` |
| Debug pages removed | ✅ Done | `patient-api-test/page.tsx`, `connection-test.ts` deleted |
| `robots.txt` | ✅ Created | Disallows all (internal app) |
| `sitemap.xml` | ✅ Created | Placeholder |
| CI/CD pipeline | ✅ Created | `.github/workflows/ci.yml` |
| Error boundary | ✅ Created | `src/app/error.tsx` |
| Not-found page | ✅ Created | `src/app/not-found.tsx` |
| Loading states | ✅ Created | Root + 4 routes |
| Sentry | ❌ Not installed | See below |
| Structured logging | ❌ Not set up | See below |
| Unit tests | ⏳ Written, deps missing | Run `npm install` commands in TESTING_GUIDE.md |
| E2E tests | ⏳ Written, deps missing | Run `npx playwright install chromium` |

---

## Manual Actions Required Before Production

### 1. Replace internal IP
```bash
# .env
NEXT_PUBLIC_API_Report=https://www.snehbharat.com/report-service
```

### 2. Rotate SECRET_KEY
Generate a new 32-char hex key:
```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
Update `.env` and all deployment secrets.

### 3. Add `.env` to `.gitignore`
```bash
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

### 4. Move `@tanstack/react-query-devtools` to devDependencies
```bash
npm install --save-dev @tanstack/react-query-devtools
```

---

## Sentry Setup

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

This generates `sentry.client.config.ts`, `sentry.server.config.ts`, and updates `next.config.ts`.

Minimal config:
```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
```

---

## Structured Logging

Replace `console.error` in catch blocks with a structured logger:

```ts
// src/lib/logger.ts
const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (msg: string, meta?: object) => {
    if (isDev) console.log('[INFO]', msg, meta ?? '');
  },
  error: (msg: string, error?: unknown, meta?: object) => {
    if (isDev) console.error('[ERROR]', msg, error, meta ?? '');
    // In production, send to Sentry:
    // Sentry.captureException(error, { extra: { msg, ...meta } });
  },
};
```

Usage:
```ts
import { logger } from '@/lib/logger';
// In service files:
logger.error('Failed to fetch patient', error, { patientId });
```

---

## Environment Variables Checklist

| Variable | Required | Sensitive | Notes |
|---|---|---|---|
| `SECRET_KEY` | Yes | Yes | Must be rotated; never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_API_AUTH` | Yes | No | Should be HTTPS |
| `NEXT_PUBLIC_API_URL1` | Yes | No | Should be HTTPS |
| `NEXT_PUBLIC_API_Test` | Yes | No | Should be HTTPS |
| `NEXT_PUBLIC_API_Report` | Yes | No | **Replace internal IP** |
| `NEXT_PUBLIC_API_Booking` | Yes | No | Should be HTTPS |
| `NEXT_PUBLIC_SENTRY_DSN` | Recommended | No | Add after Sentry setup |

---

## Pre-Deployment Checklist

- [ ] All `.env` values point to production HTTPS URLs
- [ ] `SECRET_KEY` rotated and set in deployment platform secrets
- [ ] `.env` is in `.gitignore`
- [ ] `npm audit --audit-level=high` passes (CI enforces this)
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Sentry DSN configured
- [ ] DevTools not visible in production build (verify with `NODE_ENV=production npm run start`)
- [ ] `robots.txt` is correct for production (currently disallows all — correct for internal app)

# Project Refactor Plan

> Incremental refactoring of the existing project. No new project created from scratch.
> Every change preserves existing functionality and is applied folder-by-folder.

---

## Guiding Principles

1. **Never break what works** — each change must be independently deployable.
2. **One folder at a time** — migrate service by service, not all at once.
3. **Old and new can coexist** — during migration, old `axios.ts` files stay until their domain is fully migrated.
4. **Test after each step** — run `npm run dev` and manually exercise the affected pages.
5. **Git commit after each phase** — small commits, easy to revert.

---

## Phase 1 — Critical Security Fixes

> Target: Complete within 1–3 days. These are deploy-blocking issues.

### P1.1 — Security Headers (30 min)

**Status: ✅ Done** — `next.config.ts` updated.

Verify:

```bash
npm run build && npm run start
# In another terminal:
curl -I http://localhost:3000 | grep -E "X-Frame|X-Content|Strict-Transport|Content-Security"
```

Expected: All 4 headers present.

---

### P1.2 — Remove `NEXT_PUBLIC_SECRET_KEY` (10 min)

**Files affected:** `.env`, `.env.local`, `.env.production`

```bash
# 1. Find all usages
grep -rn "NEXT_PUBLIC_SECRET_KEY" app/ lib/ components/ --include="*.ts" --include="*.tsx"

# 2. If found client-side → move to a Next.js API route. If server-only → just rename.

# 3. Update .env
sed -i '' 's/NEXT_PUBLIC_SECRET_KEY/SECRET_KEY/' .env

# 4. Rebuild to confirm no client-side references remain:
npm run build
# Search the built output:
grep -r "0A322E73634C0D241C604328944B342A" .next/ 2>/dev/null && echo "STILL EXPOSED" || echo "CLEAN"
```

**Commit:** `security: remove NEXT_PUBLIC prefix from SECRET_KEY`

---

### P1.3 — Gate ReactQueryDevtools (5 min)

```bash
# Edit file:
# app/providers/QueryProvider.tsx
# Apply FIX-003 code from PROJECT_FIXES.md

# Move to devDependencies:
npm install --save-dev @tanstack/react-query-devtools
# Remove from dependencies:
npm pkg delete dependencies["@tanstack/react-query-devtools"]
npm pkg set devDependencies["@tanstack/react-query-devtools"]="^5.100.8"
```

**Commit:** `fix: gate ReactQueryDevtools behind NODE_ENV check`

---

### P1.4 — Remove `console.log` Statements (30 min)

```bash
# Generate a list of all files with console statements:
grep -rn "console\.log\|console\.warn" app/ --include="*.ts" --include="*.tsx" -l

# Review and remove manually, OR add ESLint rule to prevent future ones:
```

Add to `eslint.config.mjs`:

```js
rules: {
  'no-console': ['warn', { allow: ['error'] }],
}
```

Then run: `npm run lint -- --fix` (ESLint can auto-remove some)

**Commit:** `fix: remove console.log statements from production code`

---

### P1.5 — Fix `localStorage.clear()` in All Axios Files (15 min)

```bash
# Find all occurrences:
grep -rn "localStorage\.clear()" app/Apis/ --include="*.ts" -l

# Files to update (all 16 axios.ts instances):
# Replace localStorage.clear() with:
# ['token','refreshToken','role','tenantId','fullName'].forEach(k => localStorage.removeItem(k));
```

**Commit:** `fix: replace localStorage.clear() with targeted auth key removal`

---

### P1.6 — Add `doctor-profile/layout.tsx` (5 min)

```bash
# Create the file:
cat > app/doctor-profile/layout.tsx << 'EOF'
import React from 'react';
import DoctorGuard from '@/app/components/DoctorGuard';

export default function DoctorProfileLayout({ children }: { children: React.ReactNode }) {
  return <DoctorGuard>{children}</DoctorGuard>;
}
EOF
```

**Commit:** `fix: protect doctor-profile route with DoctorGuard`

---

### P1.7 — Delete Debug Files (5 min)

```bash
rm app/Apis/Patients/connection-test.ts
rm -rf app/patient-api-test/

npm run build # Verify build still passes
```

**Commit:** `chore: remove debug/test files from production bundle`

---

## Phase 2 — Architecture Refactoring

> Target: Complete within 1–2 weeks. These improve maintainability.

### P2.1 — Install Zod (5 min)

```bash
npm install zod
```

The schemas are already in `lib/schemas/`. After installing zod:

```bash
npx tsc --noEmit  # Verify no type errors in schema files
```

**Commit:** `feat: add zod and runtime validation schemas`

---

### P2.2 — Add Error Boundaries (30 min)

**Status: ✅ Done** — `app/error.tsx` and `app/not-found.tsx` created.

Add section-level boundaries for critical pages:

```bash
# Create error boundaries for high-traffic pages:
for dir in diagnosis/invoice-list reports/reportEntry lab/sample-receipt; do
  mkdir -p "app/$dir"
  cat > "app/$dir/error.tsx" << 'EOF'
'use client';
import { AlertTriangle } from 'lucide-react';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="p-8 text-center space-y-4">
      <AlertTriangle className="mx-auto text-rose-500" size={40} />
      <p className="font-semibold text-slate-900">Failed to load this section.</p>
      <button onClick={reset} className="text-sm text-[#00ac80] underline">Retry</button>
    </div>
  );
}
EOF
done
```

**Commit:** `feat: add React error boundaries for critical pages`

---

### P2.3 — Axios Factory Migration (per-domain, 2–3 days)

**Status:** `lib/api/client.ts` created. Migration is incremental.

#### Migration order and commands

```bash
# ── Day 1: Low-risk domains ────────────────────────────────────

# Commission
grep -rn "commissionAxios\|from './axios'" app/Apis/Commission/ --include="*.ts"
# Update imports in each file found, then:
rm app/Apis/Commission/axios.ts
git add app/Apis/Commission/ && git commit -m "refactor(api): migrate Commission to shared axios factory"

# LabCoordinator
grep -rn "from './axios'" app/Apis/LabCoordinator/ --include="*.ts"
rm app/Apis/LabCoordinator/axios.ts
git add app/Apis/LabCoordinator/ && git commit -m "refactor(api): migrate LabCoordinator to shared axios factory"

# LabTechnician
rm app/Apis/LabTechnician/axios.ts
git add app/Apis/LabTechnician/ && git commit -m "refactor(api): migrate LabTechnician to shared axios factory"

# ── Day 2: Medium-risk domains ─────────────────────────────────

# collector, doctor, branch
# Referrer, Report, membership, organizations, tenant
# (follow same pattern: update imports, delete axios.ts, commit)

# ── Day 3: High-risk domains ───────────────────────────────────

# lab/TemplateMgmt, lab/report, Patients, booking, Auth
# These have the most callers — test each page manually before committing
```

#### Verification after each domain

```bash
npm run dev
# Navigate to the pages that use the migrated domain
# Open browser Network tab — verify API calls succeed
# Check for any console errors
```

---

### P2.4 — Migrate `.jsx` to `.tsx` (2 hours)

```bash
# Rename files:
cd app/components/layouts
for f in Sidebar.jsx Topbar.jsx DoctorSidebar.jsx DoctorTopbar.jsx; do
  mv "$f" "${f%.jsx}.tsx"
done
mv StatsCards.js StatsCards.tsx

cd /Users/mactix/project/web/LMS_frontend

# Check TypeScript errors:
npx tsc --noEmit 2>&1 | head -50
```

Add prop types to each file. TypeScript will tell you exactly what's missing.

**Commit:** `refactor: migrate layout components from .jsx to .tsx`

---

### P2.5 — Add Login Rate Limiting (1 hour)

Apply `FIX-013` code from `PROJECT_FIXES.md` to `app/login/Login.tsx`.

```bash
# Test manually:
# 1. Enter wrong credentials 5 times
# 2. Verify button becomes disabled and shows countdown
# 3. Wait 5 minutes (or set LOCKOUT_MS = 10_000 for testing)
```

**Commit:** `feat: add client-side login rate limiting (5 attempts, 5-min lockout)`

---

### P2.6 — Resolve TypeScript `any` (1–2 weeks, parallel work)

```bash
# Add ESLint rule to prevent new any usages:
# eslint.config.mjs → add: '@typescript-eslint/no-explicit-any': 'error'

# Run lint to see all locations:
npm run lint 2>&1 | grep "no-explicit-any" | wc -l

# Fix in batches — one file or feature area at a time
# Priority: auth flow, booking, invoice — highest-risk paths
```

---

### P2.7 — Connect Dashboard to Real Data (2–3 days)

```bash
# Check what stats APIs exist on the backend:
# Ask backend team for /api/v1/dashboard/stats endpoint

# Interim: clearly mark hardcoded values as demo
# In app/dashboard/page.tsx, add a banner:
```

```tsx
{process.env.NODE_ENV !== 'test' && (
  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700 font-medium">
    Dashboard stats are placeholder data — connect to live API in Phase 2.
  </div>
)}
```

---

## Phase 3 — Performance Optimization

> Target: Complete within 1–3 months.

### P3.1 — Dynamic Import for Tiptap Editor

```bash
# app/lab/templates/template_management/page.tsx or wherever AdvancedTemplateEditor is used:
```

```tsx
import dynamic from 'next/dynamic';

const AdvancedTemplateEditor = dynamic(
  () => import('@/app/components/editor/AdvancedTemplateEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-sm text-slate-400">Loading editor...</div>
      </div>
    ),
  }
);
```

**Estimated bundle savings:** ~300 KB from initial load.

---

### P3.2 — Add Bundle Analyzer

```bash
npm install --save-dev @next/bundle-analyzer

# Update next.config.ts:
```

```ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
export default withBundleAnalyzer(nextConfig);
```

```bash
# Run analysis:
ANALYZE=true npm run build
# Opens browser with interactive bundle map
```

---

### P3.3 — Token Migration to httpOnly Cookies

See `FIX-015` in `PROJECT_FIXES.md` for the full implementation.

**Prerequisite:** Staging environment where this can be tested end-to-end before production.

---

### P3.4 — React Server Components for Static Pages

Pages that don't need client interactivity can drop the `'use client'` directive and become RSCs:

```bash
# Candidate pages (read-only displays):
app/reports/BulkReport/page.tsx
app/management/InterfaceMonitor/page.tsx
app/lab/units/page.tsx

# Remove 'use client' directive from the page.tsx
# Move all client state to child components that keep 'use client'
```

---

## Phase 4 — Testing & Production Readiness

> Target: Complete within 1–3 months, parallel with Phase 3.

### P4.1 — Install and Configure Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install chromium

# Create playwright.config.ts:
cat > playwright.config.ts << 'EOF'
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
EOF
```

### Test Coverage Priority

1. Login / logout flow
2. Unauthenticated redirect
3. Patient registration
4. Test order creation
5. Invoice generation
6. Report entry and verification

---

### P4.2 — Add Sentry Error Tracking

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Follow the wizard — it creates `sentry.client.config.ts`, `sentry.server.config.ts`, and patches `next.config.ts`.

Replace `console.error` in `app/error.tsx`:

```tsx
import * as Sentry from '@sentry/nextjs';

useEffect(() => {
  Sentry.captureException(error);
}, [error]);
```

---

### P4.3 — Activate Full CI/CD

The `.github/workflows/ci.yml` file is created. Activate steps:

```bash
# Uncomment test job in .github/workflows/ci.yml when tests exist
# Uncomment e2e job when Playwright is set up

# Add GitHub branch protection rules:
# Settings → Branches → Add rule:
#   - Require status checks: lint, build, security
#   - Require pull request reviews before merging
```

---

## Folder-by-Folder Migration Map

| Folder | Phase | Action | Priority |
|---|---|---|---|
| `.env` | 1 | Remove `NEXT_PUBLIC_SECRET_KEY` | 🔴 Critical |
| `next.config.ts` | 1 | Security headers | ✅ Done |
| `middleware.ts` | 1 | Security headers applied | ✅ Done |
| `app/providers/QueryProvider.tsx` | 1 | Gate DevTools | 🔴 Critical |
| `app/components/DoctorGuard.tsx` | 1 | Remove console.log | 🔴 Critical |
| `app/doctor-profile/` | 1 | Add layout.tsx | 🔴 Critical |
| `app/Apis/Patients/connection-test.ts` | 1 | Delete | 🔴 Critical |
| `app/patient-api-test/` | 1 | Delete | 🔴 Critical |
| `app/Apis/Commission/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/LabCoordinator/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/LabTechnician/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/collector/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/doctor/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/branch/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/organizations/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/membership/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/tenant/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/Referrer/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/Report/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/lab/TemplateMgmt/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/lab/report/` | 2 | Migrate to factory client | 🟡 High |
| `app/Apis/Patients/` | 2 | Migrate (careful: `unwrapData: false`) | 🟡 High |
| `app/Apis/booking/` | 2 | Migrate (two clients: booking + orders) | 🟠 Medium |
| `app/Apis/Auth/` | 2 | Migrate last (highest risk) | 🟠 Medium |
| `app/components/layouts/*.jsx` | 2 | Rename to .tsx | 🟠 Medium |
| `app/dashboard/page.tsx` | 2 | Connect to real API | 🟠 Medium |
| `app/login/Login.tsx` | 2 | Add rate limiting | 🟠 Medium |
| `lib/schemas/` | 2 | Add zod (install package first) | 🟠 Medium |
| `app/Apis/Auth/apiClient.ts` | 3 | Proxy through Next.js API route | 🟢 Long-term |
| All `page.tsx` files | 3 | Evaluate RSC candidates | 🟢 Long-term |
| `tests/` | 4 | Add Playwright tests | 🟢 Long-term |

---

## Terminal Commands Quick Reference

```bash
# ── Phase 1 (run these now) ────────────────────────────────────────────

# Verify security headers are working:
npm run build && npm run start &
curl -s -I http://localhost:3000 | grep -E "x-frame|x-content|strict-transport|content-security"
kill %1

# Check for exposed secret:
grep -rn "NEXT_PUBLIC_SECRET" .env* 2>/dev/null

# Find all console.log:
grep -rn "console\.log" app/ --include="*.ts" --include="*.tsx" | wc -l

# Find all localStorage.clear():
grep -rn "localStorage\.clear()" app/ --include="*.ts" --include="*.tsx"

# ── Phase 2 ────────────────────────────────────────────────────────────

# Install zod:
npm install zod

# Type-check after each migration step:
npx tsc --noEmit

# Lint all files:
npm run lint

# ── Phase 3 ────────────────────────────────────────────────────────────

# Bundle analysis:
ANALYZE=true npm run build

# ── Phase 4 ────────────────────────────────────────────────────────────

# Install Playwright:
npm install --save-dev @playwright/test && npx playwright install chromium

# Run E2E tests:
npm run test:e2e

# Install Sentry:
npm install @sentry/nextjs && npx @sentry/wizard@latest -i nextjs
```

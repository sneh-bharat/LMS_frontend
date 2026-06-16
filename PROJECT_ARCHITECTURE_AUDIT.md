# PROJECT ARCHITECTURE AUDIT

**Project:** Snehbharat LMS Frontend
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · TanStack Query 5 · Zod 4 · Axios · Tailwind
**Audit date:** 2026-06-15
**Scope analysed:** 393 `.ts/.tsx` files · ~100,400 LOC · 226 `.tsx` files under `src/app` · 35 functional modules

> This audit supersedes the earlier `PROJECT_AUDIT_REPORT.md`. That report and several
> sibling docs described a target architecture and created scaffolding, but the
> structural migration was **not carried out**. The numbers below reflect the codebase
> as it actually exists today.

---

## 0. Executive summary

The previous refactoring effort produced **infrastructure and documentation but almost no migration**:

| Built (scaffolding)                                   | Reality (adoption)                                     |
| ----------------------------------------------------- | ------------------------------------------------------ |
| Unified Axios factory `src/lib/api/client.ts` (good)  | Only **5 files** import `@/lib/api`                    |
| Route groups `(auth) (admin) (doctor)`                | Done ✅ — this part is solid                            |
| `src/services`, `src/stores`, `src/validations` dirs  | **Empty stubs** — never populated                      |
| TanStack Query installed + Providers wired            | Only **7 files** use `useQuery`/`useMutation`          |
| Zod installed, `src/lib/schemas` created              | Only **2 schemas** exist for 35 modules                |
| TypeScript `strict: true`                             | **97 files** declare types inline in components        |

**Net state:** the app still runs on the legacy `src/app/Apis/` layer (135 importers,
16 separate `axios.create` instances), with business logic, types, static data,
validation and data-fetching all living inside page components. **No `src/features/`
directory exists.** The feature-based architecture has not been started.

---

## 1. Folder structure issues

- **No `src/features/` layer.** All 35 modules live directly under `src/app/(admin)/`,
  `(auth)/`, `(doctor)/` as route folders that double as code homes. App Router is
  doing routing *and* hosting business logic, types, data, and UI.
- **Legacy API layer `src/app/Apis/`** — a non-route folder living inside the App
  Router tree (15 sub-folders, 16 `axios.create` instances). It is the de-facto data
  layer for 135 files and directly contradicts the new `src/lib/api/` layer.
- **Duplicated/overlapping infra roots:** `src/lib/api` **and** `src/app/Apis`;
  `src/lib/schemas` **and** `src/validations` (empty); `src/services` (empty) **and**
  per-module API files. Two of everything, one populated.
- **Empty stub directories:** `src/services/`, `src/stores/`, `src/validations/` —
  dead scaffolding that implies structure that isn't there.
- **Inconsistent casing in route folders:** `SampleTracking`, `Appointments`,
  `OnlineBooking`, `LabCoordinator`, `LabTechnician`, `ConcessionAuthority`,
  `BankInfo` (PascalCase) vs `register-patient`, `price-list`, `report-unlock`
  (kebab-case). URL surface is inconsistent.
- **Mixed concerns inside route folders:** e.g. `accounts/` holds 8 sub-routes, each a
  monolithic `page.tsx` plus an ad-hoc `AddNew*.tsx` sibling — no `components/`,
  `hooks/`, `types/`, or `services/` separation.

## 2. Duplicate code

- **16 `axios.create()` instances** (`src/app/Apis/**/axios.ts`, `apiClient.ts`,
  `doctorClient.ts`, `ordersAxios.ts`, …) each re-implementing base URL, token
  injection, and error handling. `src/lib/api/client.ts` was written to replace all
  of them but adoption stalled at 5 files.
- **Repeated UI utilities copy-pasted across pages:** `getStatusColor`,
  `getTypeColor`, `formatCurrency`, `formatDate`, `getTransactionIcon` appear
  re-declared in many account/lab/report pages (e.g. `accounts/bank-history/page.tsx`).
- **Repeated filter/stat/table scaffolding:** nearly every list page hand-rolls the
  same search-input + `<select>` filter bar + stats-card grid + `<Table columns/>`
  block. No shared `DataTable`, `FilterBar`, `StatCard`, or `PageHeader`.
- **Manual validation blocks** (`if (!field) …`) duplicated across **149 files**.

## 3. Large components / God files

Pages mixing 5+ responsibilities (types + data + utils + columns + filtering + stats + JSX):

| Lines | File |
| ----- | ---- |
| 1542 | `(admin)/diagnosis/diagnostic-booking/booking/page.tsx` |
| 1411 | `(admin)/lab/tests/NewTest.tsx` |
| 1111 | `(admin)/member/page.tsx` |
|  955 | `(admin)/diagnosis/invoice-list/page.tsx` |
|  897 | `(admin)/lab/sample-receipt/page.tsx` |
|  876 | `(admin)/lab/test-packages/page.tsx` |
|  869 | `(admin)/lab/tests/page.tsx` |
|  850 | `(admin)/reports/reportEntry/page.tsx` |
|  839 | `(admin)/accounts/payment-history/page.tsx` |
|  784 | `(admin)/organization/page.tsx` |

**38 page files exceed 200 lines** (the stated SRP threshold). The largest API
files are also oversized: `Apis/booking/sample.ts` (1183), `Apis/membership/membership.ts`
(1182), `Apis/lab/TestApis.ts` (953).

## 4. Type duplication / inline types

- **97 files** declare `interface`/`type` inside component files. Example:
  `BankHistory` is defined inside `accounts/bank-history/page.tsx` and re-`export`ed
  from a page — meaning other modules import a *page* to get a type.
- `src/types/index.ts` exists but is barely used; there is no per-feature `types/` layer.
- Status/enum unions (`'Success' | 'Pending' | 'Failed'`, `'Deposit' | 'Withdrawal'
  | 'Transfer'`) are re-typed per page instead of shared.

## 5. API layer issues

- **Two competing data layers.** Legacy `src/app/Apis/` (135 importers) vs new
  `src/lib/api/` (5 importers). The new one is well-built (interceptors, token
  handling, error normalization, FormData support, per-service clients) but unused.
- **No response/request typing discipline** in the legacy layer; many calls return
  `any` and unwrap data ad-hoc at the call site.
- **API calls inside components.** Data fetching, loading flags, and error toasts are
  hand-managed with `useState`/`useEffect` rather than React Query (only 7 files use
  Query). 171 files use raw `useState`/`useEffect`.
- `patientClient` is configured with `unwrapData: false` to preserve a quirk of one
  caller — a sign the contract isn't normalized.

## 6. Validation issues

- **149 files** use manual `if (!field)` validation; **only 2 Zod schemas** exist.
- No schema-derived types (`z.infer`), so form shapes and validation drift apart.
- No consistent error-surface — validation failures are handled differently per page.

## 7. Performance issues

- `'use client'` on **204 of 226** app `.tsx` files — almost everything is a client
  component, forfeiting RSC streaming/payload benefits.
- Large pages do filtering/stat reduction inline on every render without `useMemo`;
  column definitions (with closures) are recreated each render without `useMemo`.
- No `React.memo` on heavy table rows; no `dynamic()` import / route-level code
  splitting for heavy editors (TipTap `AdvancedTemplateEditor`, 642 lines, is a prime
  lazy-load candidate).
- Hardcoded sample datasets shipped in client bundles (e.g. `SAMPLE_BANK_HISTORY`).

## 8. Naming inconsistencies

- Folder casing mix (see §1).
- Typo'd folder `management/management-docotor`.
- Component files named generically (`NewTest.tsx`, `genaret.tsx`, `Addnew.tsx`,
  `Addnewbank.tsx`) with non-descriptive, inconsistently-cased names.
- API files inconsistently named (`TestApis.ts`, `Patient_Service_API.ts`,
  `membership.ts`, `sample.ts`).

## 9. Dead code & static data

- **Empty stub dirs:** `src/services`, `src/stores`, `src/validations`.
- **Hardcoded sample/mock data** embedded in pages (`SAMPLE_BANK_HISTORY`, and similar
  across modules) standing in for real API data — ships to the client and masks
  missing integration.
- Sibling docs from the prior pass (`PROJECT_AUDIT_REPORT.*`, `PROJECT_FIXES.md`,
  `PROJECT_REFACTOR_PLAN.md`, `PROJECT_MIGRATION_GUIDE.md`, `TYPESCRIPT_REFACTOR.md`)
  describe work that was largely not done — stale and misleading.

## 10. Unused imports / variables

- Numerous `render: (value, row) =>` column callbacks accept `row`/`value` they don't
  use (e.g. `bank-history` columns) — flagged but not enforced.
- ESLint uses `next/core-web-vitals` + `next/typescript` defaults only; no
  `no-unused-vars`/`import/order`/boundary rules, so these slip through.

## 11. Circular dependency risk

- Pages **export types** that other modules import (`export interface BankHistory`
  from a `page.tsx`). Importing a route component to obtain a type is a structural
  smell and a circular-import hazard. No `madge`/dependency-cruiser check is in place.

---

## 12. What is already good (keep / build on)

- ✅ Route groups `(auth) (admin) (doctor)` are correctly set up.
- ✅ `src/lib/api/client.ts` is a solid, enterprise-grade Axios factory — **make this
  the single source of truth** and migrate the 16 legacy clients onto it.
- ✅ shadcn-style `src/components/ui/` primitives exist.
- ✅ `strict: true`, React 19, Next 16, Query + Zod already in `package.json`.
- ✅ Guards (`RoleGuard`, `DoctorGuard`) and layouts already extracted to
  `src/components/`.

---

## 13. Severity ranking

| # | Issue | Severity | Effort |
| - | ----- | -------- | ------ |
| 1 | Two competing API layers; legacy `Apis/` dominant | 🔴 Critical | High |
| 2 | No `features/` layer; logic in App Router | 🔴 Critical | High |
| 3 | God pages (38 > 200 lines) | 🟠 High | High |
| 4 | Inline types in 97 files | 🟠 High | Medium |
| 5 | Manual validation, 2 Zod schemas | 🟠 High | Medium |
| 6 | Data fetching in components (no Query) | 🟠 High | High |
| 7 | Hardcoded sample data in bundles | 🟡 Medium | Low |
| 8 | `'use client'` everywhere | 🟡 Medium | Medium |
| 9 | Naming/casing inconsistency | 🟡 Medium | Low |
| 10 | Empty stub dirs / stale docs | 🟢 Low | Low |

See `MIGRATION_PLAN.md` for the sequenced remediation.

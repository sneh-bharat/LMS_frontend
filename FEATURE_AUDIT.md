# FEATURE AUDIT

**Scope:** `src/features/` (post structural-migration state)
**Date:** 2026-06-16
**Totals:** 35 features · 281 `.ts/.tsx` files · **159 files > 200 lines** · 78 cross-feature type imports from the legacy `@/app/Apis` layer

> Context: the **structural** migration is complete — every `app/**/page.tsx` is a thin
> re-export and all business code lives under `src/features/`. This audit targets the
> **second layer**: deep per-feature refactor (types, constants, Zod, services, hooks,
> component splitting). `accounts` is already done to this depth and is the reference.

---

## 0. Per-feature heat map

`big` = files > 200 lines · `inl` = files with inline `interface`/`type` · `val` = files
with manual `if (!x)` validation · `apis` = files importing `@/app/Apis` (or a service
seam) directly · `q` = files using React Query.

| Feature | files | big | inl | val | apis | q | Depth status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **accounts** | 34 | 9 | 10 | 9 | 1 | 1 | ✅ deep-refactored (reference) |
| lab | 35 | 27 | 24 | 28 | 28 | 1 | 🔴 heaviest |
| diagnosis | 41 | 24 | 28 | 28 | 31 | 1 | 🔴 heaviest |
| management | 15 | 14 | 14 | 8 | 0 | 0 | 🟠 |
| referrer | 13 | 11 | 12 | 10 | 10 | 0 | 🟠 |
| doctor | 12 | 11 | 11 | 10 | 11 | 1 | 🟠 |
| reports | 11 | 9 | 9 | 5 | 2 | 2 | 🟠 |
| member | 9 | 6 | 6 | 7 | 7 | 0 | 🟠 |
| branches | 8 | 6 | 6 | 6 | 8 | 0 | 🟠 (service seam exists) |
| register-patient | 7 | 5 | 5 | 5 | 5 | 0 | 🟠 |
| polyclinic | 7 | 5 | 4 | 3 | 0 | 0 | 🟡 |
| brand | 6 | 4 | 5 | 3 | 0 | 0 | 🟡 |
| collector / organization | 5 | 3–4 | 3–4 | 4 | 4 | 0 | 🟡 |
| lab-coordinator / lab-technician | 4–5 | 3–4 | 2–3 | 3 | 3–4 | 0 | 🟡 (consolidate → lab) |
| dailyworksheet | 10 | 1 | 5 | 3 | 0 | 0 | 🟡 (already partly split) |
| appointments, online-booking, brand, … | ≤3 | 1–2 | 1–2 | 0–1 | 0 | 0 | 🟢 small |
| auth | 4 | 1 | 0 | 2 | 2 | 2 | 🟢 first target |
| doctor-portal | 4 | 1 | 0 | 1 | 1 | 0 | 🟢 (consolidate → doctor) |
| dashboard, emr, reception, pathology, price-list, report-user, user-management, patient-code-prefix | ≤4 | 0–1 | 0–1 | 0–1 | 0–1 | 0 | 🟢 thin/stub |

---

## 1. Large components (> 200 lines) — 159 files

The dominant problem. Worst offenders (lines):
`diagnosis/diagnostic-booking/booking/page.tsx` 1542 · `lab/tests/NewTest.tsx` 1411 ·
`member/.../page` 1111 · `diagnosis/invoice-list/page` 955 · `lab/sample-receipt/page`
897 · `lab/test-packages/page` 876 · `lab/tests/page` 869 · `reports/reportEntry/page`
850 · `doctor/.../page` 690. Each mixes types + data + columns + filters + API + JSX.

**Action:** split per Step 10 into `components/{X}Table,{X}Filters,{X}Form,{X}Modal` +
`pages/{X}Page` composing them, each < 200 lines (SRP).

## 2. Inline interfaces / duplicate types

Files with inline `interface`/`type`: lab 24, diagnosis 28, management 14, referrer 12,
doctor 11, reports 9, member 6, branches 6, brand 5, register-patient 5. **Duplicate
domain types** re-declared or re-imported across features (78 cross-feature imports from
`@/app/Apis/**`): `Branch`, `Department`, `ReferringDoctor`, `DoctorCommission`,
`OneInvoiceRecord`, patient/booking DTOs.

**Action:** per-feature `types/<x>.types.ts`; promote cross-feature DTOs to `src/types/`
(domain) once the service layer owns them.

## 3. Hardcoded static data

`SAMPLE_*` fixtures, dropdown arrays, status lists, column defs, config objects embedded
in pages across accounts(now extracted), branches, member, organization, register-patient,
lab, diagnosis, reports, management, referrer, polyclinic, brand.

**Action:** move to `features/<f>/constants/`; mark mock fixtures `// TODO: replace with API`.

## 4. API calls inside components

Features importing `@/app/Apis/**` (or a thin seam) directly from components:
diagnosis 31, lab 28, doctor 11, referrer 10, branches 8 (via seam), member 7,
register-patient 5, collector 4, organization 4, lab-coordinator 4, lab-technician 3,
auth 2, patient-family-link 2, reports 2, doctor-portal 1, patient-code-prefix 1.

**Action:** per-feature `services/<x>.service.ts` built on `@/lib/api/client`; UI calls
hooks only.

## 5. Manual validation

~150 component files use `if (!field)` patterns (branches 6, collector 4, organization 4,
member 7, register-patient 5, referrer 10, doctor 10, lab 28, diagnosis 28, management 8…).

**Action:** `features/<f>/schemas/<x>.schema.ts` (Zod) + `z.infer` types; reuse
`@/lib/zod` `zodFieldErrors`.

## 6. Duplicate business logic

- **28 files** re-implement a kebab/`MoreHorizontal` **ActionsMenu** → already have
  `features/accounts/components/RowActionsMenu`; promote to `src/components/common`.
- **13 features** re-implement the **stats-card grid** markup → use `StatCard`/`StatCardGrid`.
- `formatCurrency`/`formatDate`/`getStatusColor`/`getTypeColor` re-declared per page →
  use `@/lib/format` + per-feature constant colour maps.
- Date-range + search filter bars duplicated → `FilterBar` (+ a `DateRangeFilter` candidate).

## 7. Reusable component candidates (→ `src/components/common`)

`RowActionsMenu` (kebab actions), `AmountPaymentDialog` (already in accounts; promote),
`DateRangeFilter`, `ConfirmDialog` (exists in `ui`), `SectionCard`, `DetailDrawer`
(repeated drawer shells), `CategoryBreakdownList`.

## 8. Shared hook candidates (→ `src/hooks` or domain feature)

`useReferringDoctors` (doctor/referrer/diagnosis), `useBranches`/`useDepartments`
(branches/doctor/lab/management cross-use), `usePatientsByIds`, `useDoctorCommission`
(doctor/referrer). These currently live in `@/app/Apis` and are imported cross-feature.

## 9. Shared type candidates (→ `src/types/`)

`Branch`, `Department`, `ReferringDoctor`, `DoctorCommission`, patient/booking DTOs,
`Invoice`, generic `ApiResponse<T>`/`PaginatedResponse<T>` (currently in `Apis/branch`).

## 10. Domain consolidation (Step 12)

- `doctor` + `doctor-portal` → **doctor** (`pages/DoctorManagementPage`, `DoctorProfilePage`,
  `DoctorPortalPage`). Overlap: doctor profile/payment-history already cross-imported.
- `lab` + `lab-coordinator` + `lab-technician` → **lab** (`pages/CoordinatorPage`,
  `TechnicianPage`). Shared sample/department/test domain.
- Keep others separate (distinct domains).

---

## 11. Recommended order (per Step 14)

auth → branches → appointments → doctor(+doctor-portal) → lab(+coordinator/technician) →
pathology → reception → reports → remaining. Gate each: `tsc` clean · `build` · routing ·
forms · validation · imports. See `MIGRATION_PLAN.md`.

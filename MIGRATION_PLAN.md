# MIGRATION PLAN — Deep Per-Feature Refactor

Companion: `FEATURE_AUDIT.md`, `PERFORMANCE_AUDIT.md`.

## Status

- ✅ **Phase A — Structural migration (done).** Every `app/**/page.tsx` is a thin
  re-export; all code under `src/features/`; shared `components/common` + `lib` primitives
  exist; `accounts` deep-refactored as the reference. `tsc` 0 errors, `pnpm build` green.
- ▶️ **Phase B — Deep refactor (this plan).** Bring all 35 features to the `accounts`
  depth: types, constants, Zod schemas, service layer, Query hooks, components < 200 lines.

## Per-feature recipe (apply identically; mirror `features/accounts`)

1. **types/** — move every inline `interface`/`type` to `types/<x>.types.ts`; de-dup;
   promote cross-feature DTOs to `src/types/`.
2. **constants/** — extract columns, status/colour maps, dropdowns, fixtures (mark
   `// TODO: replace with API`).
3. **schemas/** — convert each `if (!field)` form to a Zod schema; derive form types with
   `z.infer`; use `@/lib/zod` `zodFieldErrors`.
4. **services/** — `services/<x>.service.ts` on `@/lib/api/client`; port the feature's
   `@/app/Apis/**` calls with typed request/response.
5. **hooks/** — wrap services in React Query hooks (`useX`, `useCreateX`…); keys from
   `@/lib/query/queryKeys`.
6. **components/** — split god files (Step 10) into `<X>Table`, `<X>Filters`, `<X>Form`,
   `<X>Modal`, each < 200 lines, SRP; reuse `components/common` (`DataTable`, `PageHeader`,
   `FilterBar`, `StatCard`, `RowActionsMenu`, `Loader`, `EmptyState`).
7. **pages/** — `<X>Page` composes the above; stays thin.
8. **index.ts** — export pages + public hooks/types only.
9. **Gate:** `pnpm typecheck` (0 new errors) · `pnpm build` periodically · routing/forms/
   validation/imports spot-checked.
10. **Commit** the feature as one logical commit (`refactor(<feature>): deep feature refactor`).

## Shared-layer promotions (do alongside, when first needed)

- `RowActionsMenu`, `AmountPaymentDialog` → `src/components/common` (from `accounts`).
- `DateRangeFilter`, `CategoryBreakdownList` → `src/components/common` (new, from repeated markup).
- Cross-feature DTOs (`Branch`, `Department`, `ReferringDoctor`, `ApiResponse<T>`) →
  `src/types/`; cross-feature hooks (`useBranches`, `useReferringDoctors`) → owning feature,
  re-exported.

## Sequence (Step 14 order, smallest-risk first within tier)

1. **auth** (login/doctor-login: Zod login schema, auth.service, useLogin)
2. **branches** (service seam → typed `branch.service`, Zod for AddFranchiseModal, split page)
3. **appointments**
4. **doctor** + **doctor-portal** (consolidate per Step 12)
5. **lab** + **lab-coordinator** + **lab-technician** (consolidate; heaviest — split first)
6. **pathology**
7. **reception**
8. **reports**
9. Remaining: diagnosis, management, member, referrer, register-patient, organization,
   collector, polyclinic, brand, investigation, dailyworksheet, online-booking,
   estimation, and the thin/stub features.

## Risk controls

- One feature per commit; app stays shippable after each.
- Real-API features: keep response shapes identical when porting to `@/lib/api`; migrate
  endpoint-by-endpoint behind the existing service seam.
- Don't rename route folders (URL stability) in this phase.
- Mark every retained mock fixture `// TODO: replace with API`.

## Definition of done

All 35 features match the recipe; 0 inline types in components; Zod drives all form
validation; React Query drives all server state; no component imports `@/app/Apis`
directly; `tsc`, `build` green; `src/app/Apis` deletable.

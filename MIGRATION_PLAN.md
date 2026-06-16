# MIGRATION PLAN

**Goal:** Move from "logic-in-App-Router" to a feature-based, type-safe, Query-driven
enterprise architecture **without breaking existing functionality**, one feature at a time.

Companion doc: `PROJECT_ARCHITECTURE_AUDIT.md`.

---

## 1. Guiding principles

1. **Incremental & reversible.** Migrate one feature at a time; keep the app compiling
   and the routes working after every feature. No big-bang rewrite.
2. **App Router = routing only.** A `page.tsx` becomes a 3-line re-export of a feature
   page. No logic, fetching, validation, or large JSX in routes.
3. **One source of truth per concern.** `src/lib/api/client.ts` for HTTP; feature
   `services/` for endpoints; `schemas/` (Zod) for validation + inferred types;
   `hooks/` for server state via React Query.
4. **Strangler pattern for the API layer.** New feature `services/` call `@/lib/api`
   clients. Legacy `src/app/Apis/**` stays alive until its last importer is migrated,
   then is deleted folder-by-folder.
5. **Replace mock data with real services** where an endpoint exists; otherwise keep a
   typed fixture in `constants/` clearly marked `// TODO: replace with API`.

## 2. Target structure

```txt
src/
├── app/                      # routing ONLY
│   ├── (auth)/ (admin)/ (doctor)/
│   │   └── <route>/page.tsx  # → re-exports a feature page
│   ├── layout.tsx  globals.css
│
├── features/
│   └── <feature>/
│       ├── components/       # presentational + small smart components (<200 lines)
│       ├── hooks/            # React Query hooks (useX, useCreateX…)
│       ├── services/         # endpoint fns built on @/lib/api clients
│       ├── schemas/          # Zod schemas (source of truth for form types)
│       ├── types/            # types not derivable from schemas / API DTOs
│       ├── constants/        # columns, status maps, dropdowns, config
│       ├── utils/            # pure helpers (formatters, mappers)
│       ├── pages/            # <Feature>Page.tsx — composed screen
│       └── index.ts          # public surface (export pages + hooks + types)
│
├── components/{ui,common,layouts,guards}/   # shared, cross-feature
├── hooks/                    # cross-feature (useDebounce, usePagination…)
├── lib/api/                  # the ONE Axios layer (client.ts + per-service)
└── types/                    # truly global types
```

**Import boundaries:** features may import from `lib/`, `components/`, `hooks/`,
`types/`, and their own folder. Features must **not** import from `app/` or from
another feature's internals (only via its `index.ts`). To be enforced later with an
ESLint boundaries rule.

## 3. Shared foundation (do FIRST — unblocks every feature)

Before feature #1, build the reusable primitives the audit shows are copy-pasted
everywhere:

- `components/common/DataTable.tsx` — generic `<DataTable<T> columns data>` (typed).
- `components/common/PageHeader.tsx` — title + subtitle + actions slot.
- `components/common/FilterBar.tsx` — search input + select filters.
- `components/common/StatCard.tsx` + `StatCardGrid`.
- `components/common/{EmptyState,Loader}.tsx`.
- `hooks/useDebounce.ts`, `hooks/usePagination.ts`.
- `lib/utils/format.ts` — `formatCurrency`, `formatDate` (kill per-page copies).
- `lib/query/queryKeys.ts` — central typed query-key factory.

## 4. Per-feature migration recipe (apply identically to every module)

For feature `X` (e.g. `accounts`):

1. **Create** `src/features/X/` with the subfolders in §2.
2. **Types** → move inline `interface`/`type` out of pages into `types/X.types.ts`;
   de-duplicate shared unions.
3. **Schemas** → convert `if (!field)` checks into `schemas/X.schema.ts` Zod schemas;
   derive form types with `z.infer`.
4. **Constants** → move column defs, status colour maps, dropdown options, sample
   data into `constants/`.
5. **Utils** → move pure helpers into `utils/`; replace local `formatCurrency`/
   `formatDate` with the shared `lib/utils/format`.
6. **Services** → create `services/X.service.ts` using `@/lib/api` clients; port the
   relevant `src/app/Apis/**` calls with request/response types.
7. **Hooks** → wrap services in React Query hooks (`useX`, `useCreateX`, …) in `hooks/`.
8. **Components** → split the god page into `DataTable` usage + `XFilters` + `XForm` +
   `XModal`, each <200 lines, single responsibility, `useMemo`/`memo` where it matters.
9. **Page** → assemble in `pages/XPage.tsx`.
10. **Route** → reduce `app/(group)/X/page.tsx` to:
    ```tsx
    import { XPage } from '@/features/X';
    export default function Page() { return <XPage />; }
    ```
11. **Verify** (gate before moving on): `pnpm tsc --noEmit` clean · `pnpm lint` clean ·
    route renders · imports resolve · legacy `Apis/X` importers = 0 → delete it.

## 5. Sequencing

**Phase 0 — Foundation** (§3): shared components, hooks, format utils, query keys.

**Phase 1 — Reference feature: `accounts`.** Fully migrate end-to-end as the canonical
example all other features copy. Smaller, self-contained, mostly mock-data today
(low risk). Establishes the pattern + the shared primitives' real API.

**Phase 2 — Core features, in dependency order:**
1. accounts ✅ (Phase 1)
2. branches
3. doctor
4. lab  *(largest surface — tests, packages, samples, templates, reflex-rules)*
5. pathology
6. reception
7. reports

**Phase 3 — Remaining modules:** appointments, brand, collector, concessionAuthority,
dailyworksheet, dashboard, diagnosis, emr, estimation, investigation, labCoordinator,
labTechnician, management, member, onlineBooking, organization, polyclinic, price-list,
referrer, register-patient, report-unlock, report-user, sampleTracking, user-management,
patient-family-link, patient-code-prefix.

**Phase 4 — Cleanup & hardening:**
- Delete `src/app/Apis/` once importer count = 0.
- Remove empty stubs (`services`, `stores`, `validations`) or repurpose.
- Normalize route-folder casing to kebab-case (with redirects if URLs are public).
- Add ESLint rules: `no-unused-vars`, `import/order`, feature boundary rule, `madge`
  circular-dep check in CI.
- Convert leaf presentational components off `'use client'` where possible.
- Lazy-load heavy editors (`AdvancedTemplateEditor`) via `dynamic()`.
- Update `PERFORMANCE_REPORT.md` with before/after.
- Retire stale prior docs.

## 6. Verification gates (run after EVERY feature)

```bash
pnpm tsc --noEmit          # types
pnpm lint                  # lint
pnpm build                 # route + bundle sanity (periodically)
# manual: open each migrated route, confirm render + data + actions
grep -rl "Apis/X" src      # must be 0 before deleting legacy Apis/X
```

## 7. Risk register

| Risk | Mitigation |
| ---- | ---------- |
| Hidden runtime coupling to legacy axios quirks (e.g. `unwrapData:false`) | Migrate service-by-service; keep response shape identical; add types |
| Route folder rename breaks public URLs | Defer renames to Phase 4; add redirects in `next.config` |
| Large lab/diagnosis pages hard to split safely | Split by extracting pure pieces first (types/constants/utils) before touching JSX |
| Mock data hides missing endpoints | Mark every fixture `// TODO: replace with API`; track in an issue list |
| Scope is multi-week | Strict per-feature gating; app stays shippable after each feature |

## 8. Definition of done (whole migration)

- `src/features/` contains all 35 modules following §2.
- Every `app/**/page.tsx` is a thin re-export.
- `src/app/Apis/` deleted; all HTTP via `src/lib/api`.
- 0 inline types in pages; schemas drive form types; Query drives server state.
- `tsc --noEmit`, `lint`, `build` all green; circular-dep check green.

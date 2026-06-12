# Architecture

> Current state after refactoring — 2026-06-13

---

## Directory Layout

```
LMS_frontend/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (public)/               # Unauthenticated routes
│   │   │   └── login/
│   │   ├── components/
│   │   │   ├── editor/             # Tiptap rich text editor (lazy-loaded)
│   │   │   └── layouts/            # Topbar, Sidebar, DoctorSidebar, etc.
│   │   ├── providers/
│   │   │   └── QueryProvider.tsx   # TanStack Query + DevTools (dev only)
│   │   ├── dashboard/
│   │   ├── diagnosis/
│   │   ├── doctor-profile/         # Protected by DoctorGuard via layout.tsx
│   │   ├── forDoctors/             # Protected by DoctorGuard via layout.tsx
│   │   ├── lab/
│   │   ├── reports/
│   │   ├── error.tsx               # Global error boundary
│   │   ├── loading.tsx             # Root loading state
│   │   ├── not-found.tsx           # 404 page
│   │   └── layout.tsx              # Root layout (RoleGuard via RootLayoutClient)
│   │
│   ├── components/
│   │   └── guards/
│   │       ├── RoleGuard.tsx       # Staff auth guard (localStorage token)
│   │       ├── DoctorGuard.tsx     # Doctor auth guard (localStorage doctor-token)
│   │       └── LogoutConfirmDialog.tsx
│   │
│   ├── config/
│   │   └── constants.ts            # AUTHORIZED_ROLES, AUTH_STORAGE_KEYS, timeouts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   └── client.ts           # Unified axios factory (6 named exports)
│   │   └── schemas/
│   │       ├── auth.schema.ts      # Zod — LoginPayload, LoginResponse, DoctorProfile
│   │       └── booking.schema.ts   # Zod — TestOrder, Patient, enums
│   │
│   ├── services/
│   │   ├── auth.service.ts         # login, doctorLogin, refreshToken
│   │   ├── patient.service.ts      # search, getById, create, update, bulkGet
│   │   ├── booking.service.ts      # listOrders, getOrder, payments, cancel
│   │   ├── lab.service.ts          # tests, departments, categories, templates
│   │   └── report.service.ts       # entries, verify, bulkDownload
│   │
│   └── types/
│       └── index.ts                # ApiResponse<T>, PaginatedResponse<T>
│
├── tests/
│   ├── setup.ts                    # Mock localStorage, next/navigation, sonner
│   ├── unit/
│   │   ├── guards/
│   │   │   ├── RoleGuard.test.tsx
│   │   │   └── DoctorGuard.test.tsx
│   │   └── api/
│   │       └── client.test.ts
│   └── e2e/
│       └── login.spec.ts
│
├── public/
│   ├── robots.txt
│   └── sitemap.xml
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # lint → typecheck → build → security audit
│
├── middleware.ts                   # Security headers; auth gate ready (commented out)
├── next.config.ts                  # CSP + 6 security headers
├── vitest.config.ts
├── playwright.config.ts
└── tsconfig.json                   # @/* → ./src/*
```

---

## Data Flow

```
Browser
  │
  ├── Page component (src/app/...)
  │     └── uses React Query hook
  │           └── calls service function (src/services/...)
  │                 └── calls API client (src/lib/api/client.ts)
  │                       └── HTTP request (Axios instance)
  │                             └── Backend API
  │
  └── Route guard
        ├── RoleGuard — checks localStorage.token + role
        └── DoctorGuard — checks localStorage.doctor-token
```

---

## Guard Architecture

| Guard | Applied via | Protects |
|---|---|---|
| `RoleGuard` | `src/app/layout.tsx` → `RootLayoutClient` | All staff routes |
| `DoctorGuard` | `src/app/forDoctors/layout.tsx` | /forDoctors/** |
| `DoctorGuard` | `src/app/doctor-profile/layout.tsx` | /doctor-profile/** |
| `middleware.ts` | Next.js middleware | Security headers on all routes |

**Phase 3 (future)**: Migrate tokens to httpOnly cookies, then uncomment the middleware auth gate to enforce auth at the edge (before React runs).

---

## API Client Architecture

```
createApiClient(baseURL, options)
  ├── authClient        → NEXT_PUBLIC_API_AUTH   (login, refresh)
  ├── doctorAuthClient  → NEXT_PUBLIC_API_AUTH   (doctor-login, doctor-token key)
  ├── patientClient     → NEXT_PUBLIC_API_URL1
  ├── labClient         → NEXT_PUBLIC_API_Test
  ├── reportClient      → NEXT_PUBLIC_API_Report
  ├── bookingClient     → NEXT_PUBLIC_API_Booking
  └── ordersClient      → NEXT_PUBLIC_API_Booking (orders sub-path)
```

All clients share:
- 15 s timeout
- `Authorization: Bearer <token>` request interceptor
- 401 → remove only auth localStorage keys → redirect to /login
- Consistent `new Error(message)` error shape

---

## Key Decisions

| Decision | Rationale |
|---|---|
| `src/` directory migration | Native Next.js support; `@/*` alias update means zero import changes across 335 files |
| localStorage for auth (not httpOnly cookies) | Preserving existing behaviour; httpOnly migration is Phase 3 |
| Zod schemas in `src/lib/schemas/` | Runtime validation at system boundaries (API responses) |
| Dynamic import for AdvancedTemplateEditor | Tiptap requires DOM; ~300 KB removed from initial bundle |
| `loading.tsx` over manual Suspense | Next.js automatic streaming; simpler and more maintainable |
| console.log removal via Python regex | sed/perl missed multi-line calls; Python regex handles nested parens |

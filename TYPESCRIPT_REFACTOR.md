# TypeScript Refactor Report

> Phase 5 — Applied automatically during refactoring — 2026-06-13

---

## Applied Changes

| File | Change |
|---|---|
| `src/app/components/layouts/Topbar.tsx` | Added `TopbarProps` interface, `Record<string,string>` for `ROLE_LABELS` |
| `src/app/components/layouts/Sidebar.tsx` | Added `SidebarProps`, `NavItem`, `NavChild` interfaces |
| `src/app/components/layouts/DoctorSidebar.tsx` | Added `DoctorSidebarProps`, `NavItem`, `NavChild` interfaces; typed map callbacks |
| `src/app/components/layouts/DoctorTopbar.tsx` | Added `DoctorTopbarProps` interface |
| `src/components/guards/RoleGuard.tsx` | Uses `AUTHORIZED_ROLES` from constants, `AUTH_STORAGE_KEYS` for targeted removal |
| `src/config/constants.ts` | `AUTHORIZED_ROLES as const`, `AuthorizedRole` type |
| `src/types/index.ts` | `ApiResponse<T>`, `PaginatedResponse<T>` generics |
| `src/services/*.ts` | Fully typed service files with explicit request/response types |

---

## Remaining `any` Usages

```bash
# Check current count:
grep -rn ": any\|as any\|<any>" src/ --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules\|\.next" | wc -l
```

### Priority Fixes (highest-risk paths)

#### Pattern A — Error handlers

```ts
// ❌ Before (found in ~30 mutation onError callbacks):
onError: (error: any) => { toast.error(error.message); }

// ✅ After:
onError: (error: unknown) => {
  toast.error(error instanceof Error ? error.message : 'An error occurred');
}
```

#### Pattern B — React.cloneElement

```ts
// ❌ Before (dashboard/page.tsx):
React.cloneElement(stat.icon as any, { size: 20 })

// ✅ After:
React.cloneElement(stat.icon as React.ReactElement<{ size?: number }>, { size: 20 })
```

#### Pattern C — next.config.ts

```ts
// ❌ Before:
devIndicators: { buildActivity: false } as any

// ✅ After: removed — devIndicators with buildActivity is valid without cast
```

---

## Enable Stricter Lint Rules

Add to `eslint.config.mjs`:

```js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    plugins: { '@typescript-eslint': tseslint },
    parser: tsparser,
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
];
```

---

## Install TypeScript ESLint

```bash
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

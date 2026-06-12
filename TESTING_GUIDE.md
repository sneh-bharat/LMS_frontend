# Testing Guide

> Phase 8 — Infrastructure created 2026-06-13

---

## Setup

### Install dependencies

```bash
# Unit tests
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

# E2E tests
npm install --save-dev @playwright/test
npx playwright install chromium
```

---

## Unit Tests (Vitest)

### Run

```bash
npm test              # run once
npm run test:watch    # watch mode (re-runs on save)
npm run test:coverage # coverage report in ./coverage/
```

### Test files

| File | Tests |
|---|---|
| `tests/unit/guards/RoleGuard.test.tsx` | 7 — redirect, role validation, spinner, key removal |
| `tests/unit/guards/DoctorGuard.test.tsx` | 4 — doctor auth flow |
| `tests/unit/api/client.test.ts` | 4 — axios factory baseURL, headers, timeout |

### Config

`vitest.config.ts` — jsdom environment, `@` alias → `./src`, setup file at `tests/setup.ts`.

`tests/setup.ts` — mocks:
- `localStorage` (get/set/remove/clear + stored values)
- `next/navigation` (useRouter, usePathname, redirect)
- `sonner` (toast.success, toast.error, toast.warning)

### Adding a test

```tsx
// tests/unit/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders a heading', () => {
    render(<MyComponent title="Hello" />);
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
  });
});
```

---

## E2E Tests (Playwright)

### Run

```bash
npm run test:e2e        # headless
npm run test:e2e:ui     # interactive UI mode

# Single file:
npx playwright test tests/e2e/login.spec.ts
```

### Test files

| File | Tests |
|---|---|
| `tests/e2e/login.spec.ts` | Login form visibility, empty submit, password toggle, redirect, title, security headers |

### Config

`playwright.config.ts` — chromium only, `baseURL: http://localhost:3000`, screenshots on failure, traces on first retry.

### Adding an E2E test

```ts
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard shows welcome message', async ({ page }) => {
  // Seed localStorage with a valid token before navigating
  await page.addInitScript(() => {
    localStorage.setItem('token', 'fake-jwt-for-tests');
    localStorage.setItem('role', 'ADMIN');
  });
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

---

## CI Integration

`.github/workflows/ci.yml` runs:
1. `npm run lint`
2. `npm run typecheck`
3. `npm run build`
4. `npm audit --audit-level=high`

Add test job once Vitest is installed:

```yaml
- name: Unit tests
  run: npm test

- name: Upload coverage
  uses: actions/upload-artifact@v4
  with:
    name: coverage
    path: coverage/
```

---

## Coverage Goals

| Category | Current | Target |
|---|---|---|
| Guards | ~0% (no tests before) | 80% |
| API client | ~0% | 80% |
| Service layer | ~0% | 70% |
| Page components | ~0% | 50% |

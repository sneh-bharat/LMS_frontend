# Performance Report

> Phase 6 — Applied automatically during refactoring — 2026-06-13

---

## Applied Optimisations

### 1. Dynamic Import — AdvancedTemplateEditor

**File**: `src/app/lab/templates/template_management/page.tsx`

```ts
// Before — eager, synchronous import (~300 KB bundle on every page load)
import AdvancedTemplateEditor from '@/app/components/editor/AdvancedTemplateEditor';

// After — lazy, code-split, SSR disabled (Tiptap requires DOM)
const AdvancedTemplateEditor = dynamic(
  () => import('@/app/components/editor/AdvancedTemplateEditor'),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);
```

**Estimated saving**: ~300 KB removed from initial JS bundle.  
Users who never open template management do not pay for Tiptap.

---

### 2. Loading States — Route Suspense Boundaries

Added `loading.tsx` to 5 routes so Next.js renders a spinner instantly:

| Route | File |
|---|---|
| Root | `src/app/loading.tsx` |
| Diagnosis invoice list | `src/app/diagnosis/invoice-list/loading.tsx` |
| Lab sample receipt | `src/app/lab/sample-receipt/loading.tsx` |
| Reports entry | `src/app/reports/reportEntry/loading.tsx` |
| Diagnostic booking | `src/app/diagnosis/diagnostic-booking/booking/loading.tsx` |

---

### 3. API Client Timeout

`src/lib/api/client.ts` sets `timeout: 15_000` (15 s) on every instance.  
Previously: no timeout — slow API could hang the browser indefinitely.

---

### 4. QueryProvider — TanStack Query Stale Time

`src/app/providers/QueryProvider.tsx`:
```ts
defaultOptions: {
  queries: { staleTime: 5 * 60 * 1000 }, // 5 min — avoids hammering the API on focus
}
```

---

## Recommended Further Optimisations

### A. React.memo on pure list items

```ts
// components/PatientRow.tsx
export default React.memo(PatientRow);
```

Apply to any row/card component inside long lists (invoice list, test catalog).

### B. Image Optimisation

Replace `<img>` tags with `next/image`:
```tsx
// Before:
<img src={profile.photo} alt="Doctor" className="w-10 h-10 rounded-full" />

// After:
import Image from 'next/image';
<Image src={profile.photo} alt="Doctor" width={40} height={40} className="rounded-full" />
```

### C. Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer
# Add to next.config.ts:
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });
module.exports = withBundleAnalyzer(nextConfig);

# Run:
ANALYZE=true npm run build
```

### D. Route Prefetching

For commonly navigated links in Sidebar:
```tsx
<Link href="/dashboard" prefetch={true}>Dashboard</Link>
```

### E. Server Components

Pages that are display-only (no client state) can be Server Components.  
Currently every page is `'use client'`. Review which pages genuinely need interactivity.

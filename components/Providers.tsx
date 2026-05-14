'use client';

import QueryProvider from '@/app/providers/QueryProvider';

/**
 * Main Providers Component
 * Wraps the application with all necessary providers
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}

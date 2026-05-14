'use client';

import QueryProvider from '@/app/providers/QueryProvider';
import { Toaster } from 'sonner';

/**
 * Main Providers Component
 * Wraps the application with all necessary providers
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </QueryProvider>
  );
}

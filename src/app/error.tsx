'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service (replace console.error with Sentry in production)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Sentry.captureException(error);
    } else {
      console.error('[ErrorBoundary]', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#eceff1] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto">
          <AlertTriangle className="text-rose-600" size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            An unexpected error occurred. Please try refreshing the page.
            {error.digest && (
              <span className="block mt-1 text-xs font-mono text-slate-400">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#00ac80] text-white text-sm font-semibold hover:bg-[#006d77] transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Home size={16} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

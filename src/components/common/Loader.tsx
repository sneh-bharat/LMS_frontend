'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = 'Loading…', className }: LoaderProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
      {label ? (
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">{label}</p>
      ) : null}
    </div>
  );
}

export default Loader;

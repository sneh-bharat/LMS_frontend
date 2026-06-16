'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No records found',
  description = 'Try adjusting your search or filters.',
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-8 py-16 text-center', className)}>
      {Icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-300">
          <Icon size={24} />
        </div>
      ) : null}
      <div>
        <h4 className="mb-0.5 text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-xs font-semibold tracking-tight text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export default EmptyState;

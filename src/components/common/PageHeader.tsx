'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Standard page header: icon + title + subtitle on the left, actions slot on the right.
 * Replaces the bespoke header block hand-rolled at the top of nearly every page.
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  /** Right-aligned actions (buttons, etc.). */
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6 flex items-center justify-between gap-4', className)}>
      <div>
        <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-slate-900">
          {Icon ? <Icon size={28} className="text-[#FF671F]" /> : null}
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;

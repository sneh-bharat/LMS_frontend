'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Single stat tile used in the stats-card grids the audit found re-implemented
 * on every list page.
 */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  /** Tailwind tone, e.g. 'emerald' | 'rose' | 'amber' | 'blue'. Defaults to 'blue'. */
  tone?: 'blue' | 'emerald' | 'rose' | 'amber' | 'slate';
  className?: string;
}

const TONES: Record<NonNullable<StatCardProps['tone']>, { bg: string; icon: string; label: string }> = {
  blue: { bg: 'bg-blue-400/30', icon: 'text-[#FF671F]', label: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-400/30', icon: 'text-emerald-600', label: 'text-emerald-700' },
  rose: { bg: 'bg-rose-400/30', icon: 'text-rose-600', label: 'text-rose-700' },
  amber: { bg: 'bg-amber-400/30', icon: 'text-amber-600', label: 'text-amber-700' },
  slate: { bg: 'bg-slate-400/30', icon: 'text-slate-600', label: 'text-slate-700' },
};

export function StatCard({ label, value, icon: Icon, tone = 'blue', className }: StatCardProps) {
  const t = TONES[tone];
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/20 bg-white/60 p-4 shadow-sm backdrop-blur-sm',
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-3">
        {Icon ? (
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', t.bg)}>
            <Icon size={20} className={t.icon} />
          </div>
        ) : null}
        <span className={cn('text-xs font-bold uppercase tracking-wider', t.label)}>{label}</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

export interface StatCardGridProps {
  children: React.ReactNode;
  className?: string;
}

export function StatCardGrid({ children, className }: StatCardGridProps) {
  return (
    <div className={cn('mb-6 grid grid-cols-1 gap-4 md:grid-cols-4', className)}>{children}</div>
  );
}

export default StatCard;

'use client';

import * as React from 'react';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectFilter {
  /** Stable identifier for the filter. */
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  /** Optional fixed width class, e.g. 'lg:w-40'. */
  widthClass?: string;
}

export interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  selects?: SelectFilter[];
  /** Extra controls rendered after the selects. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Search input + select filters bar. Replaces the bespoke filter row repeated
 * across list pages.
 */
export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  selects = [],
  children,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row',
        className,
      )}
    >
      <div className="group relative w-full flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500"
        />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
        />
      </div>
      {selects.length > 0 || children ? (
        <div className="flex w-full items-center gap-3 lg:w-auto">
          {selects.map((sel) => (
            <div key={sel.name} className={cn('group relative flex-1', sel.widthClass ?? 'lg:w-40')}>
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={sel.value}
                onChange={(e) => sel.onChange(e.target.value)}
                className="input-refined w-full appearance-none py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider"
              >
                {sel.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default FilterBar;

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Droplets, Loader2, Search } from 'lucide-react';
import { getCollectorName } from '@/app/Apis/collector/CollectorsApi';
import { useBloodCollectorsList } from '@/app/Apis/collector/useCollectors';
import { Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

export interface CollectorSearchSelectProps {
  value: string;
  onChange: (name: string) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export default function CollectorSearchSelect({
  value,
  onChange,
  className,
  label = 'Collector Name',
  disabled = false,
}: CollectorSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useBloodCollectorsList(
    { page: 0, size: 10, statusFilter: 'all' },
    { enabled: !disabled }
  );

  const collectors = data?.data?.content ?? [];

  const results = useMemo(() => {
    const term = value.trim().toLowerCase();
    if (!term) return collectors;
    return collectors.filter((row) =>
      getCollectorName(row).toLowerCase().includes(term)
    );
  }, [collectors, value]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <div ref={containerRef} className={cn('space-y-1 relative', className)}>
      <Label className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
        <Droplets size={12} className="text-rose-400" aria-hidden />
        {label}
      </Label>

      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden
        />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search collector name…"
          className="pl-8 pr-8 border-gray-300"
          autoComplete="off"
          disabled={disabled}
        />
        {isLoading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-rose-500"
            aria-hidden
          />
        )}
      </div>

      {open && !disabled && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {isLoading ? (
            <li className="px-3 py-2.5 text-sm text-slate-500">Loading…</li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-slate-500">No collectors found</li>
          ) : (
            results.map((collector) => {
              const name = getCollectorName(collector);
              return (
                <li key={collector.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-rose-50 font-semibold text-slate-900"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                  >
                    {name}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

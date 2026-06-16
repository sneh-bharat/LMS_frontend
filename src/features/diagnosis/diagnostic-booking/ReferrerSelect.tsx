'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Loader2,
  AlertCircle,
  Building2,
  Search,
  X,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import {
  fetchReferrerById,
  getReferrerName,
  getReferrerPhone,
  searchReferrers,
  fetchActiveReferrers,
  type Referrer,
} from '@/app/Apis/Referrer/referrerApi';
import { Input, Label } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 400;

function referrerSubtitle(referrer: Referrer) {
  const parts: string[] = [];
  if (referrer.centre?.trim()) parts.push(referrer.centre.trim());
  if (referrer.branchName?.trim()) parts.push(referrer.branchName.trim());
  const phone = getReferrerPhone(referrer);
  if (phone !== '—') parts.push(phone);
  return parts.join(' · ') || 'Referrer';
}

export interface ReferrerSelectProps {
  value?: number | null;
  onChange?: (referrerId: number | null, referrer: Referrer | null) => void;
  className?: string;
  label?: string;
  disabled?: boolean;
  /** Controlled drawer open state — use with `onDrawerOpenChange` and `hideTrigger`. */
  drawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
  /** When true, only the drawer is rendered (no inline trigger field). */
  hideTrigger?: boolean;
}

export default function ReferrerSelect({
  value,
  onChange,
  className,
  label = 'Referrer',
  disabled = false,
  drawerOpen: drawerOpenProp,
  onDrawerOpenChange,
  hideTrigger = false,
}: ReferrerSelectProps) {
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const isDrawerControlled = drawerOpenProp !== undefined;
  const drawerOpen = isDrawerControlled ? drawerOpenProp : internalDrawerOpen;

  const setDrawerOpen = useCallback(
    (open: boolean) => {
      if (!isDrawerControlled) setInternalDrawerOpen(open);
      onDrawerOpenChange?.(open);
    },
    [isDrawerControlled, onDrawerOpenChange]
  );
  const [search, setSearch] = useState('');
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (value == null || value <= 0) {
      setSelectedReferrer(null);
      return;
    }

    let cancelled = false;
    setLoadingSelection(true);
    fetchReferrerById(value)
      .then((res) => {
        if (cancelled) return;
        const referrer = res?.data;
        setSelectedReferrer(referrer ?? null);
      })
      .catch(() => {
        if (!cancelled) setSelectedReferrer(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingSelection(false);
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  const loadReferrers = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const trimmed = query.trim();
      let list: Referrer[];
      if (trimmed) {
        list = await searchReferrers(trimmed);
      } else {
        const res = await fetchActiveReferrers({ pageNo: 0, pageSize: 200 });
        list = res?.data?.content ?? [];
      }
      setReferrers(list.filter((r) => r.isActive !== false));
    } catch {
      setReferrers([]);
      setError('Failed to load referrers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    setSearch('');
    setError(null);
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const timer = window.setTimeout(
      () => loadReferrers(search),
      search.trim() ? SEARCH_DEBOUNCE_MS : 0
    );
    return () => window.clearTimeout(timer);
  }, [search, drawerOpen, loadReferrers]);

  const handleSelect = useCallback(
    (referrer: Referrer) => {
      setSelectedReferrer(referrer);
      onChange?.(referrer.id, referrer);
      setDrawerOpen(false);
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedReferrer(null);
      onChange?.(null, null);
    },
    [onChange]
  );

  const filtered = referrers.filter((r) =>
    getReferrerName(r).toLowerCase().includes(search.toLowerCase())
  );

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        variant="outline"
        onClick={() => setDrawerOpen(false)}
        className="flex-1 rounded-xl border-gray-300"
      >
        Close
      </Button>
    </div>
  );

  return (
    <>
      {!hideTrigger ? (
        <div className={cn('space-y-2 min-w-[280px]', className)}>
          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
            <Building2 size={14} className="text-blue-500" />
            {label}
          </Label>

          <div
            className={cn(
              'relative w-full flex items-center gap-2 h-10 rounded-md border border-gray-300 bg-white px-3 transition-colors',
              disabled ? 'opacity-60 bg-slate-50' : 'hover:border-blue-300 hover:bg-slate-50'
            )}
          >
            <button
              type="button"
              disabled={disabled || loadingSelection}
              onClick={() => !disabled && setDrawerOpen(true)}
              className={cn(
                'flex flex-1 items-center gap-2 min-w-0 text-left',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              )}
            >
              <Search size={16} className="text-slate-400 shrink-0" aria-hidden />
              <span
                className={cn(
                  'flex-1 truncate text-sm font-semibold',
                  selectedReferrer ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                {loadingSelection
                  ? 'Loading referrer…'
                  : selectedReferrer
                    ? getReferrerName(selectedReferrer)
                    : 'Select referrer…'}
              </span>
            </button>
            {loadingSelection ? (
              <Loader2 size={16} className="animate-spin text-blue-500 shrink-0" aria-hidden />
            ) : selectedReferrer && !disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Clear referrer"
              >
                <X size={14} />
              </button>
            ) : (
              <ChevronRight size={16} className="text-slate-400 shrink-0 pointer-events-none" aria-hidden />
            )}
          </div>
        </div>
      ) : null}

      <RightDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          <>
            Select <span className="text-emerald-200">Referrer</span>
          </>
        }
        description="Choose from active referrers"
        footer={footer}
      >
        <div className="space-y-6">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search referrer name…"
              className="pl-10 border-gray-300"
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              <AlertCircle size={14} aria-hidden />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm font-medium">Loading referrers…</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-12">
              {search.trim() ? 'No matching referrers found.' : 'No active referrers available.'}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((referrer) => {
                const isSelected = selectedReferrer?.id === referrer.id;
                return (
                  <div
                    key={referrer.id}
                    onClick={() => handleSelect(referrer)}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group',
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all',
                          isSelected
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                        )}
                      >
                        {isSelected ? <CheckCircle2 size={24} /> : <Building2 size={20} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {getReferrerName(referrer)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {referrerSubtitle(referrer)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </RightDrawer>
    </>
  );
}

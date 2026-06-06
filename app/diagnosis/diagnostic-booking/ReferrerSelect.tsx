'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Building2, Search, X } from 'lucide-react';
import {
  fetchReferrerById,
  getReferrerName,
  getReferrerPhone,
  searchReferrers,
  fetchActiveReferrers,
  type Referrer,
} from '@/app/Apis/Referrer/referrerApi';
import { Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

const MIN_SEARCH_LEN = 2;
const SEARCH_DEBOUNCE_MS = 400;

export interface ReferrerSelectProps {
  value?: number | null;
  onChange?: (referrerId: number | null, referrer: Referrer | null) => void;
  className?: string;
  label?: string;
}

export default function ReferrerSelect({
  value,
  onChange,
  className,
  label = 'Referrer',
}: ReferrerSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchKey, setSearchKey] = useState('');
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
  const [results, setResults] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Load selected referrer by ID
  useEffect(() => {
    if (value == null || value <= 0) {
      setSelectedReferrer(null);
      setSearchKey('');
      return;
    }

    let cancelled = false;
    setLoadingSelection(true);
    fetchReferrerById(value)
      .then((res) => {
        if (cancelled) return;
        const referrer = res?.data;
        if (referrer) {
          setSelectedReferrer(referrer);
          setSearchKey(getReferrerName(referrer));
        }
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

  // Search on input change
  useEffect(() => {
    const trimmed = searchKey.trim();

    // When search is empty and dropdown is open, show all referrers
    if (trimmed.length < MIN_SEARCH_LEN) {
      if (open && !selectedReferrer) {
        let cancelled = false;
        setLoading(true);
        fetchActiveReferrers({ pageNo: 0, pageSize: 200 })
          .then((res) => {
            if (cancelled) return;
            setResults(res?.data?.content ?? []);
          })
          .catch(() => {
            if (!cancelled) setResults([]);
          })
          .finally(() => {
            if (!cancelled) setLoading(false);
          });
        return () => { cancelled = true; };
      }
      if (!open) {
        setResults([]);
        setLoading(false);
      }
      return;
    }

    if (selectedReferrer && trimmed === getReferrerName(selectedReferrer)) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const list = await searchReferrers(trimmed);
        if (cancelled) return;
        setResults(list);
        setOpen(true);
      } catch {
        if (!cancelled) {
          setResults([]);
          setError('Failed to search referrers.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchKey, selectedReferrer, open]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = useCallback(
    (referrer: Referrer) => {
      setSelectedReferrer(referrer);
      setSearchKey(getReferrerName(referrer));
      setResults([]);
      setOpen(false);
      onChange?.(referrer.id, referrer);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedReferrer(null);
    setSearchKey('');
    setResults([]);
    setOpen(false);
    onChange?.(null, null);
  }, [onChange]);

  const handleInputChange = (text: string) => {
    setSearchKey(text);
    setError(null);
    if (selectedReferrer && text !== getReferrerName(selectedReferrer)) {
      setSelectedReferrer(null);
      onChange?.(null, null);
    }
    if (text.trim().length >= MIN_SEARCH_LEN) {
      setOpen(true);
    }
  };

  const showDropdown = open;

  return (
    <div ref={containerRef} className={cn('space-y-2 min-w-[280px] relative', className)}>
      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
        <Building2 size={14} className="text-blue-500" />
        {label}
      </Label>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden
        />
        <Input
          value={searchKey}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search referrer name…"
          className="pl-9 pr-9 h-10 border-gray-300 font-semibold"
          autoComplete="off"
        />
        {(loading || loadingSelection) && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
            aria-hidden
          />
        )}
        {!loading && !loadingSelection && (searchKey || selectedReferrer) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Clear referrer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-rose-600">
          <AlertCircle size={14} aria-hidden />
          {error}
        </div>
      )}

      {showDropdown && (
        <ul
          className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {loading ? (
            <li className="px-3 py-2.5 text-sm text-slate-500 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              Searching…
            </li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-slate-500">No referrers found</li>
          ) : (
            results.map((r) => (
              <li key={r.id} role="option">
                <button
                  type="button"
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors',
                    selectedReferrer?.id === r.id && 'bg-blue-50 font-semibold text-blue-800'
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(r)}
                >
                  <span className="font-semibold text-slate-900">{getReferrerName(r)}</span>
                  {(r.centre || r.branchName || getReferrerPhone(r) !== '—') && (
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {r.centre?.trim() || r.branchName?.trim() || getReferrerPhone(r)}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Stethoscope, Search, X } from 'lucide-react';
import {
  extractReferringDoctorsList,
  fetchReferringDoctorById,
  searchReferringDoctors,
  type ReferringDoctor,
} from '@/app/Apis/doctor/referringDoctorApi';
import { Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';

const MIN_SEARCH_LEN = 2;
const SEARCH_DEBOUNCE_MS = 400;

export interface ReferringDoctorSelectProps {
  value?: number | null;
  onChange?: (doctorId: number | null, doctor: ReferringDoctor | null) => void;
  branchId?: number | null;
  className?: string;
  label?: string;
}

export default function ReferringDoctorSelect({
  value,
  onChange,
  branchId,
  className,
  label = 'Referring Doctor',
}: ReferringDoctorSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchKey, setSearchKey] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<ReferringDoctor | null>(null);
  const [results, setResults] = useState<ReferringDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (value == null || value <= 0) {
      setSelectedDoctor(null);
      setSearchKey('');
      return;
    }

    let cancelled = false;
    setLoadingSelection(true);
    fetchReferringDoctorById(value)
      .then((res) => {
        if (cancelled) return;
        const doctor = res?.data;
        if (doctor) {
          setSelectedDoctor(doctor);
          setSearchKey(doctor.doctorName);
        }
      })
      .catch(() => {
        if (!cancelled) setSelectedDoctor(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingSelection(false);
      });

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    const trimmed = searchKey.trim();
    if (trimmed.length < MIN_SEARCH_LEN) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (selectedDoctor && trimmed === selectedDoctor.doctorName) {
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const res = await searchReferringDoctors({ searchKey: trimmed });
        if (cancelled) return;
        const list = extractReferringDoctorsList(res?.data).filter((d) => d.isActive);
        setResults(list);
        setOpen(true);
      } catch {
        if (!cancelled) {
          setResults([]);
          setError('Failed to search referring doctors.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchKey, selectedDoctor]);

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
    (doctor: ReferringDoctor) => {
      setSelectedDoctor(doctor);
      setSearchKey(doctor.doctorName);
      setResults([]);
      setOpen(false);
      onChange?.(doctor.id, doctor);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    setSelectedDoctor(null);
    setSearchKey('');
    setResults([]);
    setOpen(false);
    onChange?.(null, null);
  }, [onChange]);

  const handleInputChange = (text: string) => {
    setSearchKey(text);
    setError(null);
    if (selectedDoctor && text !== selectedDoctor.doctorName) {
      setSelectedDoctor(null);
      onChange?.(null, null);
    }
    if (text.trim().length >= MIN_SEARCH_LEN) {
      setOpen(true);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const showDropdown =
    open && searchKey.trim().length >= MIN_SEARCH_LEN;

  return (
    <div ref={containerRef} className={cn('space-y-2 min-w-[280px] relative', className)}>
      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
        <Stethoscope size={14} className="text-blue-500" />
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
          onFocus={() => {
            if (searchKey.trim().length >= MIN_SEARCH_LEN) setOpen(true);
          }}
          placeholder="Search doctor name…"
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
        {!loading && !loadingSelection && (searchKey || selectedDoctor) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Clear referring doctor"
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
            <li className="px-3 py-2.5 text-sm text-slate-500">No doctors found</li>
          ) : (
            results.map((d) => (
              <li key={d.id} role="option">
                <button
                  type="button"
                  className={cn(
                    'w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 transition-colors',
                    selectedDoctor?.id === d.id && 'bg-blue-50 font-semibold text-blue-800'
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(d)}
                >
                  <span className="font-semibold text-slate-900">{d.doctorName}</span>
                  {(d.specialization || d.hospitalName) && (
                    <span className="block text-xs text-slate-500 mt-0.5">
                      {d.specialization?.trim() || d.hospitalName?.trim()}
                    </span>
                  )}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {searchKey.trim().length > 0 && searchKey.trim().length < MIN_SEARCH_LEN && (
        <p className="text-[10px] text-slate-400 pl-1">
          Type at least {MIN_SEARCH_LEN} characters to search
        </p>
      )}
    </div>
  );
}

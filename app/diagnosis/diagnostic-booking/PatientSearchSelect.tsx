'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Search, User, X } from 'lucide-react';
import {
  fetchPatientById,
  fetchPatients,
  searchPatientByMobile,
  type Patient,
} from '@/app/Apis/Patients/Patient_Service_API';
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { cn } from '@/lib/utils';

export const PATIENT_SEARCH_FIELDS = ['Name', 'Phone', 'UHID'] as const;
export type PatientSearchField = (typeof PATIENT_SEARCH_FIELDS)[number];

export const PATIENT_FIELD_LABELS: Record<PatientSearchField, string> = {
  Name: 'Patient Name',
  Phone: 'Phone Number',
  UHID: 'Patient ID',
};

const SEARCH_PLACEHOLDERS: Record<PatientSearchField, string> = {
  Name: 'Search name...',
  Phone: 'Search phone...',
  UHID: 'Search UHID...',
};

const SEARCH_DEBOUNCE_MS = 400;
const MIN_NAME_LEN = 2;
const MIN_UHID_LEN = 2;

function patientFullName(p: Patient): string {
  return [p.firstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim();
}

function patientDisplayLabel(p: Patient): string {
  const name = patientFullName(p);
  return name ? `${name} · ${p.patientCode}` : p.patientCode;
}

export interface PatientSearchSelectProps {
  patientId?: number | null;
  onPatientSelect: (patient: Patient) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  /** When true, the label reflects the active search field (Name / Phone / Patient ID). */
  dynamicFieldLabel?: boolean;
  lookupMessage?: string | null;
  required?: boolean;
}

export default function PatientSearchSelect({
  patientId,
  onPatientSelect,
  onClear,
  disabled = false,
  className,
  label = 'Patient',
  dynamicFieldLabel = false,
  lookupMessage = null,
  required = true,
}: PatientSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchField, setSearchField] = useState<PatientSearchField>('Name');
  const [searchKey, setSearchKey] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (patientId == null || patientId <= 0) {
      setSelectedPatient(null);
      if (!disabled) {
        setSearchKey('');
      }
      return;
    }

    let cancelled = false;
    setLoadingSelection(true);
    fetchPatientById(patientId)
      .then((res) => {
        if (cancelled || !res.data) return;
        setSelectedPatient(res.data);
        setSearchKey('');
        setOpen(false);
        setResults([]);
      })
      .catch(() => {
        if (!cancelled) setSelectedPatient(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingSelection(false);
      });

    return () => {
      cancelled = true;
    };
  }, [patientId, disabled]);

  const runSearch = useCallback(async (field: PatientSearchField, query: string) => {
    const trimmed = query.trim();

    if (field === 'Phone') {
      const digits = trimmed.replace(/\D/g, '');
      if (digits.length !== 10) {
        setResults([]);
        return;
      }
      const res = await searchPatientByMobile(digits);
      if (!res.data && res.message && !res.response) {
        throw new Error(res.message);
      }
      setResults(res.data ? [res.data] : []);
      return;
    }

    if (field === 'UHID') {
      const numericId = /^\d+$/.test(trimmed) ? Number(trimmed) : null;
      if (numericId != null && numericId > 0) {
        try {
          const res = await fetchPatientById(numericId);
          setResults(res.data ? [res.data] : []);
        } catch {
          setResults([]);
        }
        return;
      }
      if (trimmed.length < MIN_UHID_LEN) {
        setResults([]);
        return;
      }
      const res = await fetchPatients(0, 15, trimmed, 'All');
      setResults(res.data?.content ?? []);
      return;
    }

    if (trimmed.length < MIN_NAME_LEN) {
      setResults([]);
      return;
    }
    const res = await fetchPatients(0, 15, trimmed, 'All');
    setResults(res.data?.content ?? []);
  }, []);

  useEffect(() => {
    if (disabled || selectedPatient) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const trimmed = searchKey.trim();
    const phoneDigits = trimmed.replace(/\D/g, '');

    const tooShort =
      (searchField === 'Name' && trimmed.length < MIN_NAME_LEN) ||
      (searchField === 'UHID' &&
        !/^\d+$/.test(trimmed) &&
        trimmed.length < MIN_UHID_LEN) ||
      (searchField === 'Phone' && phoneDigits.length < 10);

    if (tooShort) {
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          await runSearch(searchField, searchKey);
          if (!cancelled) setSearchError(null);
        } catch (err) {
          if (!cancelled) {
            setResults([]);
            setSearchError(
              err instanceof Error ? err.message : 'Patient search failed. Please try again.'
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
            setOpen(true);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchKey, searchField, disabled, selectedPatient, runSearch]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleFieldChange = (field: PatientSearchField) => {
    setSearchField(field);
    setSearchKey('');
    setResults([]);
    setOpen(false);
    setSearchError(null);
  };

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchKey('');
    setResults([]);
    setOpen(false);
    onPatientSelect(patient);
  };

  const handleClear = () => {
    setSelectedPatient(null);
    setSearchKey('');
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  const handleInputChange = (text: string) => {
    setSearchKey(text);
    if (selectedPatient) {
      setSelectedPatient(null);
      onClear?.();
    }
    const trimmed = text.trim();
    const phoneDigits = trimmed.replace(/\D/g, '');
    const canSearch =
      (searchField === 'Name' && trimmed.length >= MIN_NAME_LEN) ||
      (searchField === 'UHID' &&
        (/^\d+$/.test(trimmed) || trimmed.length >= MIN_UHID_LEN)) ||
      (searchField === 'Phone' && phoneDigits.length >= 10);
    setOpen(canSearch);
  };

  const showDropdown = open && !selectedPatient && !disabled && !loadingSelection;
  const showIdleHint =
    !disabled &&
    !selectedPatient &&
    !loadingSelection &&
    !showDropdown &&
    !searchKey.trim();

  const minHint =
    searchField === 'Phone'
      ? 'Enter a 10-digit mobile number'
      : searchField === 'UHID'
        ? 'Enter UHID or numeric patient ID'
        : `Type at least ${MIN_NAME_LEN} characters`;

  const displayLabel = dynamicFieldLabel ? PATIENT_FIELD_LABELS[searchField] : label;

  return (
    <div ref={containerRef} className={cn('space-y-2', className)}>
      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1">
        {displayLabel}
        {required ? <span className="text-rose-500">*</span> : null}
      </Label>

      <div className="relative z-20">
        {selectedPatient ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 shadow-sm min-h-10">
            <div className="w-9 h-9 rounded-lg bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {patientDisplayLabel(selectedPatient)}
              </p>
              <p className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
                {selectedPatient.mobilePrimary}
              </p>
            </div>
            {!disabled ? (
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 transition-colors"
                aria-label="Clear patient"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        ) : disabled && patientId ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 font-medium flex items-center gap-2 min-h-10">
            <Loader2 size={14} className="animate-spin text-emerald-600" />
            Loading patient…
          </div>
        ) : disabled ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs text-slate-400 italic min-h-10 flex items-center">
            Patient locked in edit mode
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Select
                value={searchField}
                onValueChange={(v) => handleFieldChange(v as PatientSearchField)}
              >
                <SelectTrigger className="w-[108px] h-10 border-gray-300 font-bold text-xs shrink-0 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATIENT_SEARCH_FIELDS.map((field) => (
                    <SelectItem key={field} value={field} className="text-xs font-semibold">
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-0">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                  aria-hidden
                />
                <Input
                  value={searchKey}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => {
                    const trimmed = searchKey.trim();
                    const phoneDigits = trimmed.replace(/\D/g, '');
                    const canSearch =
                      (searchField === 'Name' && trimmed.length >= MIN_NAME_LEN) ||
                      (searchField === 'UHID' &&
                        (/^\d+$/.test(trimmed) || trimmed.length >= MIN_UHID_LEN)) ||
                      (searchField === 'Phone' && phoneDigits.length >= 10);
                    if (canSearch) setOpen(true);
                  }}
                  placeholder={SEARCH_PLACEHOLDERS[searchField]}
                  className="pl-9 pr-9 h-10 border-gray-300 font-semibold bg-white"
                  inputMode={searchField === 'Phone' ? 'numeric' : 'text'}
                  maxLength={searchField === 'Phone' ? 10 : undefined}
                  autoComplete="off"
                />
                {loading || loadingSelection ? (
                  <Loader2
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-500 z-10"
                    aria-hidden
                  />
                ) : null}

                {showDropdown ? (
                  <ul
                    className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                    role="listbox"
                  >
                    {loading ? (
                      <li className="px-3 py-2.5 text-sm text-slate-500 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-emerald-500" />
                        Searching…
                      </li>
                    ) : results.length === 0 ? (
                      <li className="px-3 py-2.5 text-sm text-slate-500">No patients found</li>
                    ) : (
                      results.map((p) => (
                        <li key={p.id ?? p.patientCode} role="option">
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-emerald-50 focus:bg-emerald-50 transition-colors rounded-lg mx-0"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(p)}
                          >
                            <span className="font-semibold text-slate-900 block truncate">
                              {patientDisplayLabel(p)}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {p.mobilePrimary}
                            </span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                ) : null}
              </div>
            </div>

            {showIdleHint ? (
              <p className="mt-2 text-xs text-slate-400 pl-1">
                Search by name, phone, or UHID — then pick a patient from the list.
              </p>
            ) : null}

            {!showDropdown &&
            !showIdleHint &&
            searchKey.trim().length > 0 &&
            !loading &&
            results.length === 0 ? (
              <p className="mt-1.5 text-[10px] text-slate-400 pl-1">{minHint}</p>
            ) : null}
          </>
        )}
      </div>

      {searchError ? (
        <p className="text-xs font-semibold pl-1 text-amber-600">{searchError}</p>
      ) : null}

      {lookupMessage ? (
        <p
          className={cn(
            'text-xs font-semibold pl-1',
            lookupMessage.includes('found') && !lookupMessage.includes('No')
              ? 'text-emerald-600'
              : lookupMessage.includes('No patient') || lookupMessage.includes('Multiple')
                ? 'text-amber-600'
                : 'text-rose-600'
          )}
        >
          {lookupMessage}
        </p>
      ) : null}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link2, Loader, Search, User, X, CheckCircle2, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { fetchPatients, fetchPatientById, type Patient } from '@/app/Apis/Patients/Patient_Service_API';
import {
  FAMILY_RELATIONS,
  type FamilyRelation,
  type PatientFamilyLink,
} from '@/app/Apis/Patients/patientFamilyLinkApi';
import { useCreateFamilyLink } from '@/app/Apis/Patients/usePatientFamilyLinks';

const LABEL_CLASS = 'text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block';
const SECTION_HEAD =
  'text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2';

function patientDisplayName(p: Patient): string {
  const parts = [p.firstName, p.middleName, p.lastName].filter(Boolean);
  const name = parts.join(' ').trim();
  return name ? `${name} (${p.patientCode})` : p.patientCode;
}

function PatientPickBlock({
  title,
  hint,
  search,
  onSearchChange,
  searching,
  results,
  selected,
  onSelect,
  onClear,
  excludePatientId,
  locked,
  lockedLoading,
  lockedError,
  minSearchChars = 2,
  selectedIdLabel = 'ID',
  searchPlaceholder = 'Search by name or patient code…',
}: {
  title: string;
  hint: string;
  search: string;
  onSearchChange: (v: string) => void;
  searching: boolean;
  results: Patient[];
  selected: Patient | null;
  onSelect: (p: Patient) => void;
  onClear: () => void;
  excludePatientId: number | null;
  locked?: boolean;
  lockedLoading?: boolean;
  lockedError?: string | null;
  minSearchChars?: number;
  selectedIdLabel?: string;
  searchPlaceholder?: string;
}) {
  if (locked && lockedLoading) {
    return (
      <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 flex items-center justify-center min-h-[140px]">
        <Loader className="animate-spin text-emerald-600" size={24} />
        <span className="text-sm font-medium text-slate-600 ml-3">Loading patient…</span>
      </div>
    );
  }

  if (locked && !lockedLoading && lockedError) {
    return (
      <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/50 text-sm font-medium text-rose-800">
        {lockedError}
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 relative">
      {selected && !locked ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
          aria-label="Clear selection"
        >
          <X size={16} />
        </button>
      ) : null}

      <div>
        <Label className={LABEL_CLASS}>{title}</Label>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-3">{hint}</p>
      </div>

      {selected ? (
        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-emerald-600 shadow-sm">
            <User size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{patientDisplayName(selected)}</p>
            <p className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {selectedIdLabel} {selected.id}
            </p>
            {locked ? (
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide mt-1">
                From patient registry
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
            />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-12 border-slate-200"
              autoComplete="off"
            />
            {searching ? (
              <Loader
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-500"
              />
            ) : null}
          </div>
          {results.length > 0 ? (
            <ul className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              {results.map((p) => {
                const id = p.id ?? 0;
                if (excludePatientId != null && id === excludePatientId) return null;
                return (
                  <li key={id || p.patientCode} className="border-b border-slate-100 last:border-0">
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-emerald-50/80"
                      onClick={() => onSelect(p)}
                    >
                      <User size={14} className="shrink-0 text-slate-400" />
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate font-semibold text-slate-800">{patientDisplayName(p)}</span>
                        <span className="block text-[10px] font-mono font-bold text-slate-400 tabular-nums">
                          patientId {p.id}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : search.trim().length >= minSearchChars && !searching ? (
            <p className="text-xs text-slate-500 font-medium px-1 py-3 text-center border border-dashed border-slate-200 rounded-xl bg-white">
              No patients match this search.
            </p>
          ) : search.trim().length > 0 && search.trim().length < minSearchChars ? (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Type at least {minSearchChars} character{minSearchChars === 1 ? '' : 's'} to search.
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export default function FamilyLinkForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lockedPatientId = useMemo(() => {
    const raw = searchParams.get('patientId');
    if (raw == null || raw === '') return null;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [searchParams]);

  const [primarySearch, setPrimarySearch] = useState('');
  const [familySearch, setFamilySearch] = useState('');
  const [primaryResults, setPrimaryResults] = useState<Patient[]>([]);
  const [familyResults, setFamilyResults] = useState<Patient[]>([]);
  const [primaryPatient, setPrimaryPatient] = useState<Patient | null>(null);
  const [familyMember, setFamilyMember] = useState<Patient | null>(null);
  const [relation, setRelation] = useState<FamilyRelation>(FAMILY_RELATIONS[0]);
  const [searchingPrimary, setSearchingPrimary] = useState(false);
  const [searchingFamily, setSearchingFamily] = useState(false);
  const createMutation = useCreateFamilyLink();
  const [lastCreated, setLastCreated] = useState<PatientFamilyLink | null>(null);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const [prefillError, setPrefillError] = useState<string | null>(null);

  useEffect(() => {
    if (lockedPatientId == null) {
      setPrefillError(null);
      return;
    }
    let cancelled = false;
    setPrefillLoading(true);
    setPrefillError(null);
    void (async () => {
      try {
        const res = await fetchPatientById(lockedPatientId);
        if (!cancelled && res.data) {
          setPrimaryPatient(res.data);
          setPrimarySearch('');
          setPrimaryResults([]);
        } else if (!cancelled) {
          setPrefillError('Patient record was not found.');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Could not load patient';
        if (!cancelled) {
          setPrefillError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setPrefillLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lockedPatientId]);

  const runPatientSearch = useCallback(
    async (q: string, setResults: (rows: Patient[]) => void, minChars = 2) => {
      const term = q.trim();
      if (term.length < minChars) {
        setResults([]);
        return;
      }
      try {
        const res = await fetchPatients(0, 20, term, 'All');
        setResults(res.data?.content ?? []);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Search failed';
        toast.error(msg);
        setResults([]);
      }
    },
    []
  );

  useEffect(() => {
    if (lockedPatientId != null) return;
    setSearchingPrimary(true);
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          await runPatientSearch(primarySearch, setPrimaryResults, 2);
        } finally {
          setSearchingPrimary(false);
        }
      })();
    }, 380);
    return () => window.clearTimeout(t);
  }, [primarySearch, runPatientSearch, lockedPatientId]);

  useEffect(() => {
    setSearchingFamily(true);
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          await runPatientSearch(familySearch, setFamilyResults, 1);
        } finally {
          setSearchingFamily(false);
        }
      })();
    }, 200);
    return () => window.clearTimeout(t);
  }, [familySearch, runPatientSearch]);

  const primaryId = primaryPatient?.id ?? null;
  const familyId = familyMember?.id ?? null;
  const samePatient = primaryId != null && familyId != null && primaryId === familyId;

  const canSubmit = useMemo(() => {
    return Boolean(primaryId && familyId && !samePatient && relation);
  }, [primaryId, familyId, samePatient, relation]);

  const resetForm = () => {
    if (lockedPatientId == null) {
      setPrimaryPatient(null);
      setPrimarySearch('');
      setPrimaryResults([]);
    }
    setFamilyMember(null);
    setFamilySearch('');
    setFamilyResults([]);
    setRelation(FAMILY_RELATIONS[0]);
    setLastCreated(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryId || !familyId || samePatient) {
      toast.error('Choose two different patients.');
      return;
    }
    setLastCreated(null);
    try {
      const res = await createMutation.mutateAsync({
        patientId: primaryId,
        familyMemberId: familyId,
        relation,
      });
      setLastCreated(res.data);
      setFamilyMember(null);
      setFamilySearch('');
      setFamilyResults([]);
      router.push(`/patient-family-link?patientId=${primaryId}`);
    } catch {
      /* error toast handled in useCreateFamilyLink */
    }
  };

  const primaryLocked = lockedPatientId != null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={primaryLocked ? `/patient-family-link?patientId=${lockedPatientId}` : '/patient-family-link'}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 uppercase tracking-widest w-fit"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to family links
        </Link>
      </div>

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Add <span className="text-emerald-600">Family Link</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Select the primary patient and a related family member, then choose the clinical relationship.
          </p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
        <input type="hidden" name="patientId" value={primaryId ?? ''} readOnly aria-hidden />
        <input type="hidden" name="familyMemberId" value={familyId ?? ''} readOnly aria-hidden />
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Link2 size={18} className="text-emerald-600" />
              Create family link
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Request body: patientId, familyMemberId, relation.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <section className="space-y-6">
              <h4 className={SECTION_HEAD}>
                <span className="w-4 h-px bg-slate-200" />
                01. Patients
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PatientPickBlock
                  title="Primary patient *"
                  hint={primaryLocked ? 'Patient opened from registry' : 'Anchor record (e.g. proband)'}
                  search={primarySearch}
                  onSearchChange={setPrimarySearch}
                  searching={searchingPrimary}
                  results={primaryResults}
                  selected={primaryPatient}
                  onSelect={(p) => {
                    setPrimaryPatient(p);
                    setPrimarySearch('');
                    setPrimaryResults([]);
                  }}
                  onClear={() => {
                    setPrimaryPatient(null);
                    setPrimarySearch('');
                    setPrimaryResults([]);
                  }}
                  excludePatientId={familyId}
                  locked={primaryLocked}
                  lockedLoading={primaryLocked && prefillLoading}
                  lockedError={primaryLocked && !prefillLoading ? prefillError : null}
                  selectedIdLabel={primaryLocked ? 'patientId' : 'ID'}
                />
                <PatientPickBlock
                  title="Family member *"
                  hint="Type a name or code; pick a patient to set familyMemberId (API) from their patient id."
                  search={familySearch}
                  onSearchChange={setFamilySearch}
                  searching={searchingFamily}
                  results={familyResults}
                  selected={familyMember}
                  onSelect={(p) => {
                    setFamilyMember(p);
                    setFamilySearch('');
                    setFamilyResults([]);
                  }}
                  onClear={() => {
                    setFamilyMember(null);
                    setFamilySearch('');
                    setFamilyResults([]);
                  }}
                  excludePatientId={primaryId}
                  minSearchChars={1}
                  selectedIdLabel="familyMemberId"
                  searchPlaceholder="Type patient name, code, or mobile — search updates automatically"
                />
              </div>
            </section>

            <section className="space-y-6">
              <h4 className={SECTION_HEAD}>
                <span className="w-4 h-px bg-slate-200" />
                02. Relationship
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="relation" className={LABEL_CLASS}>
                    Relation *
                  </Label>
                  <select
                    id="relation"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as FamilyRelation)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-sm text-slate-800 bg-white shadow-sm"
                  >
                    {FAMILY_RELATIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {samePatient ? (
                    <p className="text-xs font-semibold text-rose-600 mt-2">
                      Primary patient and family member must be different.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>

          <div className="px-6 md:px-8 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end w-full">
              <Button type="button" variant="outline" onClick={resetForm} disabled={createMutation.isPending}>
                Clear form
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || createMutation.isPending}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md flex items-center justify-center gap-2"
              >
                {createMutation.isPending && <Loader size={14} className="animate-spin" />}
                <UserPlus size={14} />
                Create family link
              </Button>
            </div>
          </div>
        </div>
      </form>

      {lastCreated ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col gap-4 md:flex-row md:items-start animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Redirecting to family links…</p>
              <p className="text-xs text-emerald-800/90 font-medium mt-0.5">
                Link id <span className="font-mono font-bold">{lastCreated.id}</span> ·{' '}
                <span className="font-bold">{lastCreated.relation}</span>
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

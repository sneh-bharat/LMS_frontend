'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Loader2, CheckCircle2, Stethoscope } from 'lucide-react';
import { RightDrawer, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  extractReferringDoctorsList,
  fetchReferringDoctors,
  searchReferringDoctors,
  type ReferringDoctor,
} from '@/app/Apis/doctor/referringDoctorApi';

function doctorSubtitle(doctor: ReferringDoctor) {
  const parts: string[] = [];
  if (doctor.specialization?.trim()) parts.push(doctor.specialization.trim());
  if (doctor.hospitalName?.trim()) parts.push(doctor.hospitalName.trim());
  if (doctor.doctorPhone?.trim()) parts.push(doctor.doctorPhone.trim());
  return parts.join(' · ') || 'Referring doctor';
}

function filterDoctorsForBranch(doctors: ReferringDoctor[], branchId: number): ReferringDoctor[] {
  return doctors.filter(
    (d) => d.isActive && (d.branchId == null || d.branchId === branchId)
  );
}

export interface AddReferringDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (doctors: ReferringDoctor[]) => void;
  branchId: number;
}

export default function AddReferringDoctorModal({
  isOpen,
  onClose,
  onAdd,
  branchId,
}: AddReferringDoctorModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [branchDoctors, setBranchDoctors] = useState<ReferringDoctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const loadDoctors = useCallback(async (query: string) => {
    if (!branchId || branchId < 1) {
      setBranchDoctors([]);
      setLoadError('Select a valid branch before adding referring doctors.');
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const trimmed = query.trim();
      let list: ReferringDoctor[];
      if (trimmed) {
        const res = await searchReferringDoctors({ searchKey: trimmed });
        list = extractReferringDoctorsList(res?.data);
      } else {
        const res = await fetchReferringDoctors({
          pageNo: 0,
          pageSize: 1000,
          branchId,
        });
        list = extractReferringDoctorsList(res?.data);
      }
      setBranchDoctors(filterDoctorsForBranch(list, branchId));
    } catch {
      setBranchDoctors([]);
      setLoadError('Failed to load referring doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setSearch('');
    setAddError(null);
  }, [isOpen, branchId]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => loadDoctors(search), search.trim() ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, isOpen, loadDoctors]);

  const doctorById = new Map(branchDoctors.map((d) => [d.id, d]));
  const filtered = branchDoctors.filter((d) =>
    d.doctorName.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleAdd = () => {
    const valid = selected
      .filter((id) => doctorById.has(id))
      .map((id) => doctorById.get(id)!);
    const invalidCount = selected.length - valid.length;

    if (valid.length === 0) {
      setAddError(
        invalidCount > 0
          ? 'Selected doctors are not available at this branch.'
          : 'Select at least one referring doctor.'
      );
      return;
    }

    if (invalidCount > 0) {
      setAddError(`${invalidCount} doctor(s) skipped — not available at this branch.`);
    } else {
      setAddError(null);
    }

    onAdd(valid);
    setSelected([]);
    if (invalidCount === 0) onClose();
  };

  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-300">
        Cancel
      </Button>
      <Button
        disabled={selected.length === 0 || loading}
        onClick={handleAdd}
        className="flex-[2] rounded-xl custom-gradient text-white font-bold"
      >
        Add {selected.length} Doctor{selected.length === 1 ? '' : 's'}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Add <span className="text-emerald-200">Referring Doctor</span>
        </>
      }
      description="Referring doctors available at the selected branch"
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
            placeholder="Search doctor name..."
            className="pl-10 border-gray-300"
            autoComplete="off"
          />
        </div>

        {loadError && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {loadError}
          </p>
        )}
        {addError && (
          <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {addError}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading referring doctors…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">
            {search.trim()
              ? 'No matching referring doctors at this branch.'
              : 'No active referring doctors configured for this branch.'}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => toggle(doctor.id)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group',
                  selected.includes(doctor.id)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all',
                      selected.includes(doctor.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                    )}
                  >
                    {selected.includes(doctor.id) ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <Stethoscope size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {doctor.doctorName}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                      {doctorSubtitle(doctor)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RightDrawer>
  );
}

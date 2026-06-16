'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import { zodFieldErrors } from '@/lib/zod';
import { concessionSchema } from '../schemas/concession.schema';
import { PERCENTAGE_OPTIONS } from '../constants/concession';
import type { ConcessionAuthority, ConcessionFormData } from '../types/concession.types';

interface NewConcessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConcessionFormData) => void;
  editData?: ConcessionAuthority | null;
}

export function NewConcessionModal({ isOpen, onClose, onSubmit, editData }: NewConcessionModalProps) {
  const [formData, setFormData] = useState<ConcessionFormData>({ name: '', allowedPercentage: 1 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({ name: editData?.name || '', allowedPercentage: editData?.allowedPercentage || 1 });
    setErrors({});
  }, [editData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = concessionSchema.safeParse(formData);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    onSubmit(parsed.data);
    onClose();
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Concession Authority' : 'New Concession Authority'}
      description={editData ? 'Update concession details' : 'Add a new concession authority'}
      footer={
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-6 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="concession-form"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:from-teal-600 hover:to-blue-600 hover:shadow-xl"
          >
            Save
          </button>
        </div>
      }
      maxWidth="md"
    >
      <form id="concession-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900">Name</label>
          <input
            type="text"
            placeholder="Enter concession name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900">Concession Allowed (%)</label>
          <div className="relative">
            <select
              value={formData.allowedPercentage}
              onChange={(e) => setFormData({ ...formData, allowedPercentage: Number(e.target.value) })}
              className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PERCENTAGE_OPTIONS.map((percentage) => (
                <option key={percentage} value={percentage}>
                  {percentage}%
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}

export default NewConcessionModal;

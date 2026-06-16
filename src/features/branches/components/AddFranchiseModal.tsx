'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, RightDrawer } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodFieldErrors } from '@/lib/zod';
import type { CreateBranchInput, UpdateBranchInput } from '../services/branch.service';
import { branchSchema, type BranchFormValues } from '../schemas/branch.schema';
import { BRANCH_TYPES, COUNTRIES } from '../constants/branch';
import { useBranchMutations } from '../hooks/useBranches';
import type { BranchFormInitialData } from '../types/branch.types';

interface AddFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: BranchFormInitialData;
}

function emptyForm(initialData?: BranchFormInitialData): BranchFormValues {
  const resolveActive = () => {
    if (typeof initialData?.isActive === 'boolean') return initialData.isActive;
    const status = initialData?.status?.trim().toUpperCase();
    if (status === 'ACTIVE') return true;
    if (status === 'INACTIVE') return false;
    return true;
  };
  return {
    branchName: initialData?.branchName || '',
    branchType: initialData?.branchType || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    postalCode: initialData?.postalCode || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    isActive: resolveActive(),
  };
}

/** Build the wire payload from validated form values. */
function toPayload(v: BranchFormValues): CreateBranchInput & UpdateBranchInput {
  return {
    branchName: v.branchName.trim(),
    branchType: v.branchType as CreateBranchInput['branchType'],
    address: v.address.trim() || undefined,
    city: v.city.trim() || undefined,
    state: v.state.trim() || undefined,
    country: v.country.trim() || 'India',
    postalCode: v.postalCode.trim() || undefined,
    contactEmail: v.contactEmail.trim().toLowerCase() || undefined,
    contactPhone: v.contactPhone.trim() || undefined,
    isActive: v.isActive === true,
  };
}

export default function AddFranchiseModal({ isOpen, onClose, initialData }: AddFranchiseModalProps) {
  const [formData, setFormData] = useState<BranchFormValues>(() => emptyForm(initialData));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { create, update } = useBranchMutations();
  const isSubmitting = create.isPending || update.isPending;

  useEffect(() => {
    if (isOpen) {
      setFormData(emptyForm(initialData));
      setErrors({});
    }
  }, [isOpen, initialData]);

  const set = <K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = branchSchema.safeParse(formData);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      toast.error('Please fix the form errors');
      return;
    }
    const payload = toPayload(parsed.data);
    if (initialData) {
      update.mutate({ id: Number(initialData.id), data: payload }, { onSuccess: onClose });
    } else {
      create.mutate(payload, { onSuccess: onClose });
    }
  };

  const footer = (
    <div className="flex w-full justify-end gap-3">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
      >
        {isSubmitting && <Loader size={14} className="animate-spin" />}
        <Plus size={14} />
        {initialData ? 'Update Branch' : 'Save Branch'}
      </Button>
    </div>
  );

  const sectionTitle = (n: string, label: string) => (
    <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
      <span className="h-[1px] w-4 bg-slate-200" />
      {n}. {label}
    </h4>
  );
  const labelCls = 'mb-2 block text-xs font-bold uppercase tracking-widest text-slate-700';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          {initialData ? 'Edit' : 'New'} <span className="text-emerald-200">Branch</span>
        </>
      }
      description="Complete Branch Information Form"
      footer={footer}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-6">
          {sectionTitle('01', 'Basic Information')}
          <div>
            <Label className={labelCls}>Branch Name *</Label>
            <Input
              value={formData.branchName}
              onChange={(e) => set('branchName', e.target.value)}
              placeholder="Enter Branch Name"
              className={errors.branchName ? 'border-rose-300' : 'border-slate-200'}
            />
            {errors.branchName && <p className="mt-1 text-xs font-medium text-rose-500">{errors.branchName}</p>}
          </div>
          <div>
            <Label className={labelCls}>Branch Type *</Label>
            <Select value={formData.branchType} onValueChange={(v) => set('branchType', v ?? 'MAIN')}>
              <SelectTrigger id="branchType">
                <SelectValue placeholder="Select branch type" />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-6">
          {sectionTitle('02', 'Address Details')}
          <div>
            <Label className={labelCls}>Street Address</Label>
            <Textarea
              value={formData.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="Enter complete street address"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <Label className={labelCls}>City</Label>
              <Input value={formData.city} onChange={(e) => set('city', e.target.value)} placeholder="Enter City" />
            </div>
            <div>
              <Label className={labelCls}>State *</Label>
              <Input value={formData.state} onChange={(e) => set('state', e.target.value)} placeholder="Enter State" />
            </div>
            <div>
              <Label className={labelCls}>Postal Code</Label>
              <Input value={formData.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="Enter Postal Code" />
            </div>
          </div>
          <div>
            <Label className={labelCls}>Country</Label>
            <Select value={formData.country} onValueChange={(v) => set('country', v ?? 'India')}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="space-y-6">
          {sectionTitle('03', 'Contact Information')}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label className={labelCls}>Contact Email</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => set('contactEmail', e.target.value)}
                placeholder="Enter Email"
                className={errors.contactEmail ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.contactEmail && <p className="mt-1 text-xs font-medium text-rose-500">{errors.contactEmail}</p>}
            </div>
            <div>
              <Label className={labelCls}>Contact Phone</Label>
              <Input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => set('contactPhone', e.target.value)}
                placeholder="+91-XX-XXXX-XXXX"
                className={errors.contactPhone ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.contactPhone && <p className="mt-1 text-xs font-medium text-rose-500">{errors.contactPhone}</p>}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {sectionTitle('04', 'Branch Status')}
          <div>
            <Label className={labelCls}>Status</Label>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive === true}
                onChange={(e) => set('isActive', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive" className="mb-0 cursor-pointer text-sm font-semibold text-slate-800">
                Active branch
              </Label>
            </div>
          </div>
        </section>
      </form>
    </RightDrawer>
  );
}

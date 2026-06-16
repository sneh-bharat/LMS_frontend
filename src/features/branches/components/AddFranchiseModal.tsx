'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Plus,
  Loader,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, RightDrawer } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { branchApi, CreateBranchInput, UpdateBranchInput } from '../services/branch.service';

// ─── Constants ───────────────────────────────────────────────────────────────

const BRANCH_TYPES = ['REGIONAL', 'COLLECTION_CENTER', 'FRANCHISE'];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia'];

// ─── Add Franchise Modal ────────────────────────────────────────────────────

interface AddFranchiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id: string;
    branchName: string;
    branchType: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactEmail: string;
    contactPhone: string;
    isActive?: boolean;
    status?: string;
  };
}

export default function AddFranchiseModal({ isOpen, onClose, initialData }: AddFranchiseModalProps) {
  const [formData, setFormData] = useState({
    branchName: initialData?.branchName || '',
    branchType: initialData?.branchType || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    postalCode: initialData?.postalCode || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened or edit target changes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, initialData]);

  const resolveInitialIsActive = (): boolean => {
    if (typeof initialData?.isActive === 'boolean') return initialData.isActive;
    const status = initialData?.status?.trim().toUpperCase();
    if (status === 'ACTIVE') return true;
    if (status === 'INACTIVE') return false;
    return true;
  };

  const resetForm = () => {
    setFormData({
      branchName: initialData?.branchName || '',
      branchType: initialData?.branchType || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || 'India',
      postalCode: initialData?.postalCode || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || '',
      isActive: resolveInitialIsActive(),
    });
    setErrors({});
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (formData.contactPhone && !/^[\d\s\-\+\(\)]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      if (initialData) {
        // Update existing branch
        const updateData: UpdateBranchInput = {
          branchName: formData.branchName.trim(),
          branchType: formData.branchType,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          country: formData.country.trim() || undefined,
          postalCode: formData.postalCode.trim() || undefined,
          contactEmail: formData.contactEmail.trim().toLowerCase() || undefined,
          contactPhone: formData.contactPhone.trim() || undefined,
          isActive: formData.isActive === true,
        };

        await branchApi.updateBranch(Number(initialData.id), updateData);
        toast.success('Branch updated successfully!');
      } else {
        // Create new branch
        const branchData: CreateBranchInput = {
          branchName: formData.branchName.trim(),
          branchType: formData.branchType as any,
          address: formData.address.trim() || undefined,
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          country: formData.country.trim() || 'India',
          postalCode: formData.postalCode.trim() || undefined,
          contactEmail: formData.contactEmail.trim().toLowerCase() || undefined,
          contactPhone: formData.contactPhone.trim() || undefined,
          isActive: formData.isActive === true,
        };
        
        await branchApi.createBranch(branchData);
        toast.success('Branch created successfully!');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to save branch:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.data?.errorCode || 
                          'Failed to save branch. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md flex items-center gap-2"
      >
        {isSubmitting && <Loader size={14} className="animate-spin" />}
        <Plus size={14} />
        {initialData ? 'Update Branch' : 'Save Branch'}
      </Button>
    </div>
  );

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
        {/* Section 1: Basic Information */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            01. Basic Information
          </h4>

          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Branch Name *</Label>
            <Input
              value={formData.branchName}
              onChange={e => setFormData(p => ({ ...p, branchName: e.target.value }))}
              placeholder="Enter Branch Name"
              className={errors.branchName ? 'border-rose-300' : 'border-slate-200'}
            />
            {errors.branchName && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.branchName}</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Branch Type *</Label>
            <Select
              value={formData.branchType}
              onValueChange={(value) => setFormData(p => ({ ...p, branchType: value ?? 'MAIN' }))}
            >
              <SelectTrigger id="branchType">
                <SelectValue placeholder="Select branch type" />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Section 2: Address Details */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            02. Address Details
          </h4>

          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Street Address</Label>
            <Textarea
              value={formData.address}
              onChange={e => setFormData(p => ({ ...p, address: e.target.value }))}
              placeholder="Enter complete street address"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">City</Label>
              <Input
                value={formData.city}
                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                placeholder="Enter City"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">State *</Label>
              <Input
                value={formData.state}
                onChange={e => setFormData(p => ({ ...p, state: e.target.value }))}
                placeholder="Enter State"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Postal Code</Label>
              <Input
                value={formData.postalCode}
                onChange={e => setFormData(p => ({ ...p, postalCode: e.target.value }))}
                placeholder="Enter Postal Code"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData(p => ({ ...p, country: value ?? 'India' }))}
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Section 3: Contact Information */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            03. Contact Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Contact Email</Label>
              <Input
                type="email"
                value={formData.contactEmail}
                onChange={e => setFormData(p => ({ ...p, contactEmail: e.target.value }))}
                placeholder="Enter Email"
                className={errors.contactEmail ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.contactEmail && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.contactEmail}</p>
              )}
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Contact Phone</Label>
              <Input
                type="tel"
                value={formData.contactPhone}
                onChange={e => setFormData(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="+91-XX-XXXX-XXXX"
                className={errors.contactPhone ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.contactPhone && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.contactPhone}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Status */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            04. Branch Status
          </h4>

          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Status</Label>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive === true}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                disabled={isSubmitting}
              />
              <Label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
                Active branch
              </Label>
            </div>
          </div>
        </section>
      </form>
    </RightDrawer>
  );
}

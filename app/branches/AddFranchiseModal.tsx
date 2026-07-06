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
import { branchApi, CreateBranchInput, UpdateBranchInput } from '@/app/Apis/branch/branchApi';
import {
  ADDRESS_OTHER_OPTION,
  getCitiesForState,
  getDistrictsForState,
  INDIAN_STATES,
  isListedOption,
} from '@/app/register-patient/indiaAddressOptions';

// ─── Constants ───────────────────────────────────────────────────────────────

const BRANCH_TYPES = ['MAIN', 'COLLECTION_CENTER', 'FRANCHISE'] as const;
type BranchTypeOption = (typeof BRANCH_TYPES)[number];
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia'];
const ADDRESS_SELECT_CLASS =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium';

const NAME_ONLY_PATTERN = /^[A-Za-z]*$/;
const ALPHA_SPACE_PATTERN = /^[A-Za-z ]*$/;
const DISTRICT_PATTERN = /^[A-Za-z0-9 ]*$/;
const PIN_CODE_PATTERN = /^\d{6}$/;

function sanitizeNameInput(value: string): string {
  return value.replace(/[^A-Za-z]/g, '');
}

function sanitizeAlphabeticInput(value: string): string {
  return value.replace(/[^A-Za-z ]/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '');
}

function sanitizeDistrictInput(value: string): string {
  return value.replace(/[^A-Za-z0-9 ]/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '');
}

function sanitizeNumericInput(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

function composeStreetAddress(address: string, district: string): string | undefined {
  const street = address.trim();
  const districtPart = district.trim();
  if (!street && !districtPart) return undefined;
  if (!districtPart) return street || undefined;
  if (!street) return districtPart;
  return `${street}, ${districtPart}`;
}

function normalizeBranchType(branchType: string | undefined): string {
  const value = branchType?.trim() ?? '';
  if (!value) return '';
  if (value === 'REGIONAL') return 'MAIN';
  return BRANCH_TYPES.includes(value as BranchTypeOption) ? value : '';
}

function extractBranchFieldErrors(error: unknown): Record<string, string> | null {
  if (typeof error !== 'object' || error === null) return null;
  const o = error as Record<string, unknown>;
  const responseData = (o.response as { data?: Record<string, unknown> } | undefined)?.data;
  const nested =
    responseData && typeof responseData.data === 'object' && responseData.data !== null
      ? (responseData.data as Record<string, unknown>)
      : responseData;
  const raw = nested?.fieldErrors ?? nested?.errors ?? responseData?.fieldErrors;
  if (!raw) return null;

  const mapped: Record<string, string> = {};

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (typeof item !== 'object' || item === null) continue;
      const entry = item as { field?: string; message?: string; defaultMessage?: string };
      const field = entry.field?.trim();
      const message = entry.message ?? entry.defaultMessage;
      if (field && typeof message === 'string' && message.trim()) {
        mapped[field] = message;
      }
    }
  } else if (typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim()) mapped[key] = value;
    }
  }

  return Object.keys(mapped).length > 0 ? mapped : null;
}

function getBranchSaveErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const o = error as Record<string, unknown>;
    const responseData = (o.response as { data?: Record<string, unknown> } | undefined)?.data;
    if (typeof responseData?.message === 'string' && responseData.message.trim()) {
      return responseData.message;
    }
    if (typeof o.message === 'string' && o.message.trim()) {
      return o.message;
    }
  }
  return 'Failed to save branch. Please check the form and try again.';
}

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
    branchType: normalizeBranchType(initialData?.branchType),
    address: initialData?.address || '',
    city: initialData?.city || '',
    district: '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    postalCode: initialData?.postalCode || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityOtherMode, setCityOtherMode] = useState(false);
  const [districtOtherMode, setDistrictOtherMode] = useState(false);

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
      branchType: normalizeBranchType(initialData?.branchType),
      address: initialData?.address || '',
      city: initialData?.city || '',
      district: '',
      state: initialData?.state || '',
      country: initialData?.country || 'India',
      postalCode: initialData?.postalCode || '',
      contactEmail: initialData?.contactEmail || '',
      contactPhone: initialData?.contactPhone || '',
      isActive: resolveInitialIsActive(),
    });
    setErrors({});
    setCityOtherMode(
      !!initialData?.city &&
        !isListedOption(initialData.city, getCitiesForState(initialData.state || '')),
    );
    setDistrictOtherMode(false);
  };

  const handleStateChange = (state: string) => {
    setFormData((prev) => ({ ...prev, state, city: '', district: '' }));
    setCityOtherMode(false);
    setDistrictOtherMode(false);
    if (errors.state) setErrors((p) => ({ ...p, state: '' }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    } else if (!NAME_ONLY_PATTERN.test(formData.branchName.trim())) {
      newErrors.branchName = 'Branch name must contain only letters';
    }

    if (!formData.branchType?.trim()) {
      newErrors.branchType = 'Branch type is required';
    } else if (!BRANCH_TYPES.includes(formData.branchType as BranchTypeOption)) {
      newErrors.branchType = 'Select a valid branch type';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (formData.district.trim() && !DISTRICT_PATTERN.test(formData.district.trim())) {
      newErrors.district = 'District must contain only letters and numbers';
    }

    if (formData.city.trim() && !ALPHA_SPACE_PATTERN.test(formData.city.trim())) {
      newErrors.city = 'City must contain only letters';
    }

    if (formData.postalCode.trim() && !PIN_CODE_PATTERN.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be exactly 6 digits';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    if (formData.contactPhone.trim()) {
      if (!/^\d+$/.test(formData.contactPhone.trim())) {
        newErrors.contactPhone = 'Contact phone must contain only numbers';
      } else if (!/^[6-9]\d{9}$/.test(formData.contactPhone.trim())) {
        newErrors.contactPhone = 'Contact phone must be a valid 10-digit Indian number';
      }
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
          branchType: formData.branchType.trim(),
          address: composeStreetAddress(formData.address, formData.district),
          city: formData.city.trim() || undefined,
          state: formData.state.trim() || undefined,
          country: formData.country.trim() || undefined,
          postalCode: formData.postalCode.trim() || undefined,
          contactEmail: formData.contactEmail.trim().toLowerCase() || undefined,
          contactPhone: formData.contactPhone.trim() || undefined,
          isActive: formData.isActive === true,
        };

        await branchApi.updateBranch(Number(initialData.id), updateData);
        await branchApi.toggleBranchStatus(
          Number(initialData.id),
          formData.isActive === true,
        );
        toast.success('Branch updated successfully!');
      } else {
        // Create new branch
        const branchData: CreateBranchInput = {
          branchName: formData.branchName.trim(),
          branchType: formData.branchType.trim(),
          address: composeStreetAddress(formData.address, formData.district),
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
    } catch (error: unknown) {
      console.error('Failed to save branch:', error);
      const fieldErrors = extractBranchFieldErrors(error);
      if (fieldErrors) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
      toast.error(getBranchSaveErrorMessage(error));
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
              onChange={e => {
                const branchName = sanitizeNameInput(e.target.value);
                setFormData(p => ({ ...p, branchName }));
                if (errors.branchName) setErrors(p => ({ ...p, branchName: '' }));
              }}
              placeholder="Enter Branch Name"
              className={errors.branchName ? 'border-rose-300' : 'border-slate-200'}
            />
            {errors.branchName && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.branchName}</p>
            )}
          </div>

          <div className="relative">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Branch Type *</Label>
            <Select
              value={formData.branchType || undefined}
              onValueChange={(value) => {
                setFormData(p => ({ ...p, branchType: value ?? '' }));
                if (errors.branchType) setErrors(p => ({ ...p, branchType: '' }));
              }}
            >
              <SelectTrigger
                id="branchType"
                className={`w-full ${errors.branchType ? 'border-rose-300' : ''}`}
              >
                <SelectValue placeholder="Select branch type" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" sideOffset={4}>
                {BRANCH_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.branchType && (
              <p className="text-xs text-rose-500 font-medium mt-1">{errors.branchType}</p>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">State *</Label>
              <select
                value={formData.state}
                onChange={e => handleStateChange(e.target.value)}
                className={`${ADDRESS_SELECT_CLASS} ${errors.state ? 'border-rose-300' : ''}`}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">District</Label>
              <select
                value={
                  districtOtherMode ||
                  (formData.district && !isListedOption(formData.district, getDistrictsForState(formData.state)))
                    ? ADDRESS_OTHER_OPTION
                    : formData.district
                }
                onChange={e => {
                  const selected = e.target.value;
                  if (selected === ADDRESS_OTHER_OPTION) {
                    setDistrictOtherMode(true);
                    setFormData(p => ({ ...p, district: '' }));
                  } else {
                    setDistrictOtherMode(false);
                    setFormData(p => ({ ...p, district: selected }));
                  }
                  if (errors.district) setErrors(p => ({ ...p, district: '' }));
                }}
                disabled={!formData.state}
                className={`${ADDRESS_SELECT_CLASS} ${errors.district ? 'border-rose-300' : ''}`}
              >
                <option value="">{formData.state ? 'Select district' : 'Select state first'}</option>
                {getDistrictsForState(formData.state).map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
                {formData.state && <option value={ADDRESS_OTHER_OPTION}>Other</option>}
              </select>
              {(districtOtherMode ||
                (formData.district &&
                  !isListedOption(formData.district, getDistrictsForState(formData.state)))) && (
                <Input
                  value={formData.district}
                  onChange={e => {
                    const district = sanitizeDistrictInput(e.target.value);
                    setFormData(p => ({ ...p, district }));
                    if (errors.district) setErrors(p => ({ ...p, district: '' }));
                  }}
                  placeholder="e.g. North 24 Parganas"
                  className={`mt-2 ${errors.district ? 'border-rose-300' : 'border-slate-200'}`}
                />
              )}
              {errors.district && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.district}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">City</Label>
              <select
                value={
                  cityOtherMode ||
                  (formData.city && !isListedOption(formData.city, getCitiesForState(formData.state)))
                    ? ADDRESS_OTHER_OPTION
                    : formData.city
                }
                onChange={e => {
                  const selected = e.target.value;
                  if (selected === ADDRESS_OTHER_OPTION) {
                    setCityOtherMode(true);
                    setFormData(p => ({ ...p, city: '' }));
                  } else {
                    setCityOtherMode(false);
                    setFormData(p => ({ ...p, city: selected }));
                  }
                  if (errors.city) setErrors(p => ({ ...p, city: '' }));
                }}
                disabled={!formData.state}
                className={`${ADDRESS_SELECT_CLASS} ${errors.city ? 'border-rose-300' : ''}`}
              >
                <option value="">{formData.state ? 'Select city' : 'Select state first'}</option>
                {getCitiesForState(formData.state).map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
                {formData.state && <option value={ADDRESS_OTHER_OPTION}>Other</option>}
              </select>
              {(cityOtherMode ||
                (formData.city && !isListedOption(formData.city, getCitiesForState(formData.state)))) && (
                <Input
                  value={formData.city}
                  onChange={e => {
                    const city = sanitizeAlphabeticInput(e.target.value);
                    setFormData(p => ({ ...p, city }));
                    if (errors.city) setErrors(p => ({ ...p, city: '' }));
                  }}
                  placeholder="Enter city"
                  className={`mt-2 ${errors.city ? 'border-rose-300' : 'border-slate-200'}`}
                />
              )}
              {errors.city && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Postal Code</Label>
              <Input
                value={formData.postalCode}
                onChange={e => {
                  const postalCode = sanitizeNumericInput(e.target.value, 6);
                  setFormData(p => ({ ...p, postalCode }));
                  if (errors.postalCode) setErrors(p => ({ ...p, postalCode: '' }));
                }}
                placeholder="6 digit pin code"
                maxLength={6}
                inputMode="numeric"
                className={errors.postalCode ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.postalCode && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.postalCode}</p>
              )}
            </div>
          </div>

          <div className="relative">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData(p => ({ ...p, country: value ?? 'India' }))}
            >
              <SelectTrigger id="country" className="w-full">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent side="bottom" align="start" sideOffset={4}>
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
                onChange={e => {
                  const contactPhone = sanitizeNumericInput(e.target.value, 10);
                  setFormData(p => ({ ...p, contactPhone }));
                  if (errors.contactPhone) setErrors(p => ({ ...p, contactPhone: '' }));
                }}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
                className={errors.contactPhone ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.contactPhone && (
                <p className="text-xs text-rose-500 font-medium mt-1">{errors.contactPhone}</p>
              )}
            </div>
          </div>
        </section>

        {/* Section 4: Status */}
        {/* <section className="space-y-6">
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
        </section> */}
      </form>
    </RightDrawer>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  FileText,
  Activity,
  Building,
  UserPlus,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import { RightDrawer } from '@/components/ui/right-drawer';
import { Input, Label } from '@/components/ui';
import {
  createPatient,
  CreatePatientInput,
  Patient,
} from '../Apis/Patients/Patient_Service_API';

// ─── Constants ───────────────────────────────────────────────────────────────

// Fallback used while API options are loading or if the request fails
const GENDERS_FALLBACK = ['MALE', 'FEMALE', 'OTHER', 'TRANSGENDER'];
const BLOOD_GROUPS = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const ADDRESS_TYPES = ['HOME', 'OFFICE', 'PERMANENT', 'COMMUNICATION'];
const ALLERGY_SEVERITY = ['Mild', 'Moderate', 'Severe'];
const WHATSAPP_CONSENT = ['YES', 'NO'];
const REPORT_LANGUAGES = ['ENGLISH', 'HINDI', 'MARATHI', 'TAMIL', 'TELUGU'];
const PATIENT_CATEGORIES = ['REGULAR', 'VIP', 'CORPORATE', 'TPA', 'CGHS', 'ECHS', 'ESI', 'BPL', 'STAFF'];
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024;

const NAME_ONLY_PATTERN = /^[A-Za-z]*$/;

function sanitizeNameInput(value: string): string {
  return value.replace(/[^A-Za-z]/g, '');
}

function sanitizeDateOfBirthInput(value: string): string {
  if (!value) return '';
  const [year = '', month = '', day = ''] = value.split('-');
  if (year.length <= 4) return value;
  return [year.slice(0, 4), month, day].filter(Boolean).join('-');
}

function isValidDateOfBirth(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) return false;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date <= today
  );
}

const POLICY_NUMBER_PATTERN = /^\d{8,16}$/;
const ALPHA_SPACE_PATTERN = /^[A-Za-z ]*$/;

function sanitizePolicyNumberInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 16);
}

function sanitizeAlphabeticInput(value: string): string {
  return value.replace(/[^A-Za-z ]/g, '').replace(/\s+/g, ' ').replace(/^\s+/, '');
}

function sanitizeNumericInput(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

function sanitizeAllergyNameInput(value: string): string {
  return value
    .replace(/[^A-Za-z,\- ]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '');
}

function sanitizeRemarksInput(value: string): string {
  return value
    .replace(/[^A-Za-z0-9 .,()\-\/]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '');
}

function extractPatientFieldErrors(source: unknown): Record<string, string> | null {
  if (!source || typeof source !== 'object') return null;

  const obj = source as Record<string, unknown>;
  const nested =
    obj.data && typeof obj.data === 'object' && obj.data !== null
      ? (obj.data as Record<string, unknown>)
      : obj;
  const fieldErrors = nested.fieldErrors ?? obj.fieldErrors;

  if (!fieldErrors || typeof fieldErrors !== 'object' || Array.isArray(fieldErrors)) {
    return null;
  }

  const parsed = Object.fromEntries(
    Object.entries(fieldErrors as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  );

  return Object.keys(parsed).length > 0 ? parsed : null;
}

function applyPatientFieldErrors(
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  fieldErrors: Record<string, string>,
) {
  setErrors(prev => ({ ...prev, ...fieldErrors }));
}

function getAddressFieldError(
  errors: Record<string, string>,
  index: number,
  field: string,
): string | undefined {
  return errors[`addresses[${index}].${field}`];
}

// ─── Add Patient Modal ──────────────────────────────────────────────────────

interface AddPatientProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddPatient({ isOpen, onClose }: AddPatientProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    mobilePrimary: '',
    mobileAlternate: '',
    email: '',
    clinicId: 1,
    abhaId: '',
    referringDoctorId: undefined as number | undefined,
    insuranceCompany: '',
    insurancePolicyNo: '',
    whatsappConsent: 'YES' as 'YES' | 'NO',
    reportLanguage: 'ENGLISH',
    photoUrl: '',
    photoFile: undefined as File | undefined,
    bloodGroup: '',
    patientCategory: 'REGULAR',
    isActive: true,
    addresses: [] as Array<{
      addressLine1: string;
      addressLine2: string;
      city: string;
      district: string;
      state: string;
      pinCode: string;
      addressType: string;
      isPrimary: boolean;
    }>,
    allergies: [] as Array<{
      allergyName: string;
      severity: string;
      notedBy: number;
      remarks: string;
    }>
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Photo preview effect
  useEffect(() => {
    if (formData.photoFile) {
      const objectUrl = URL.createObjectURL(formData.photoFile);
      setPhotoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPhotoPreview(null);
  }, [formData.photoFile]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      middleName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      mobilePrimary: '',
      mobileAlternate: '',
      email: '',
      clinicId: 1,
      abhaId: '',
      referringDoctorId: undefined,
      insuranceCompany: '',
      insurancePolicyNo: '',
      whatsappConsent: 'YES',
      reportLanguage: 'ENGLISH',
      photoUrl: '',
      photoFile: undefined,
      bloodGroup: '',
      patientCategory: 'REGULAR',
      isActive: true,
      addresses: [],
      allergies: [],
    });
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!NAME_ONLY_PATTERN.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name must contain only letters';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!NAME_ONLY_PATTERN.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name must contain only letters';
    }
    if (formData.middleName.trim() && !NAME_ONLY_PATTERN.test(formData.middleName.trim())) {
      newErrors.middleName = 'Middle name must contain only letters';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!isValidDateOfBirth(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'Enter a valid date of birth with a 4-digit year';
    }
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.mobilePrimary.trim()) {
      newErrors.mobilePrimary = 'Primary mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobilePrimary.replace(/\D/g, ''))) {
      newErrors.mobilePrimary = 'Primary mobile must be a valid 10-digit Indian number';
    }
    if (formData.mobileAlternate.trim() && !/^\d+$/.test(formData.mobileAlternate.trim())) {
      newErrors.mobileAlternate = 'Alternate mobile must contain only numbers';
    }
    if (formData.abhaId && formData.abhaId.length !== 14 && formData.abhaId.length !== 17) {
      newErrors.abhaId = 'ABHA ID must be 14 or 17 digits';
    }
    if (formData.insuranceCompany.trim() && !ALPHA_SPACE_PATTERN.test(formData.insuranceCompany.trim())) {
      newErrors.insuranceCompany = 'Insurance company must contain only letters';
    }
    if (formData.insurancePolicyNo.trim()) {
      if (!POLICY_NUMBER_PATTERN.test(formData.insurancePolicyNo.trim())) {
        newErrors.insurancePolicyNo = 'Policy number must be 8 to 16 digits only';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const patientDTO: CreatePatientInput = {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || null,
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as any,
        mobilePrimary: formData.mobilePrimary.replace(/\D/g, ''),
        mobileAlternate: formData.mobileAlternate ? formData.mobileAlternate.replace(/\D/g, '') : undefined,
        email: formData.email.toLowerCase().trim() || undefined,
        bloodGroup: formData.bloodGroup as any,
        patientCategory: formData.patientCategory as any,
        insuranceCompany: formData.insuranceCompany.trim() || undefined,
        insurancePolicyNo: formData.insurancePolicyNo.trim() || undefined,
        whatsappConsent: formData.whatsappConsent,
        reportLanguage: formData.reportLanguage,
        clinicId: formData.clinicId,
        isActive: formData.isActive,
        referringDoctorId: formData.referringDoctorId,
        abhaId: formData.abhaId.trim() || undefined,
        addresses: formData.addresses.length > 0 ? formData.addresses.map(addr => ({
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2 || undefined,
          city: addr.city,
          district: addr.district,
          state: addr.state,
          pinCode: addr.pinCode,
          addressType: addr.addressType as any,
          isPrimary: addr.isPrimary,
        })) : undefined,
        allergies: formData.allergies.length > 0 ? formData.allergies.map(allergy => ({
          allergyName: allergy.allergyName,
          severity: allergy.severity as any,
          notedBy: allergy.notedBy,
          remarks: allergy.remarks || undefined,
        })) : undefined,
      };

      const response = await createPatient({
        ...patientDTO,
        photoFile: formData.photoFile,
      } as any);

      if (response && (response.code === 200 || response.code === 201 || response.response === true)) {
        toast.success('Patient registered successfully!');
        onClose();
      } else {
        const fieldErrors = extractPatientFieldErrors(response);
        if (fieldErrors) {
          applyPatientFieldErrors(setErrors, fieldErrors);
          toast.error('Please fix the highlighted fields.');
        } else {
          toast.error(response?.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      const fieldErrors =
        err?.fieldErrors ??
        extractPatientFieldErrors(err?.response?.data) ??
        extractPatientFieldErrors(err);
      if (fieldErrors) {
        applyPatientFieldErrors(setErrors, fieldErrors);
        toast.error('Please fix the highlighted fields.');
      } else {
        toast.error(err.message || 'An error occurred');
      }
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, {
        allergyName: '',
        severity: 'Moderate',
        notedBy: 1,
        remarks: '',
      }]
    }));
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const updateAllergy = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newAllergies = [...prev.allergies];
      newAllergies[index] = { ...newAllergies[index], [field]: value };
      return { ...prev, allergies: newAllergies };
    });
  };

  const clearPhoto = () => {
    setFormData(p => ({ ...p, photoFile: undefined }));
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      toast.error('Please select a valid image (JPEG, PNG, or WEBP)');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error('Image must be smaller than 2MB');
      e.target.value = '';
      return;
    }

    setFormData(p => ({ ...p, photoFile: file }));
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
        <UserPlus size={14} />
        Register Patient
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          New <span className="text-emerald-200">Patient Registration</span>
        </>
      }
      description="Complete Patient Intake Form"
      footer={footer}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {Object.keys(errors).length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <div className="flex items-start gap-2 text-rose-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Please correct the following:</p>
                <ul className="text-xs font-medium space-y-0.5">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>
                      <span className="font-semibold">{field}:</span> {message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Basic Identity */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            01. Basic Identity
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={e => {
                  const firstName = sanitizeNameInput(e.target.value);
                  setFormData(p => ({ ...p, firstName }));
                  if (errors.firstName) setErrors(p => ({ ...p, firstName: '' }));
                }}
                placeholder="John"
                className={errors.firstName ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.firstName && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Middle Name</Label>
              <Input
                value={formData.middleName}
                onChange={e => {
                  const middleName = sanitizeNameInput(e.target.value);
                  setFormData(p => ({ ...p, middleName }));
                  if (errors.middleName) setErrors(p => ({ ...p, middleName: '' }));
                }}
                placeholder="Enter Middle Name"
              />
              {errors.middleName && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.middleName}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={e => {
                  const lastName = sanitizeNameInput(e.target.value);
                  setFormData(p => ({ ...p, lastName }));
                  if (errors.lastName) setErrors(p => ({ ...p, lastName: '' }));
                }}
                placeholder="Doe"
                className={errors.lastName ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.lastName && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Date of Birth *</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                min="1900-01-01"
                max={new Date().toISOString().split('T')[0]}
                onChange={e => {
                  const dateOfBirth = sanitizeDateOfBirthInput(e.target.value);
                  setFormData(p => ({ ...p, dateOfBirth }));
                  if (errors.dateOfBirth) setErrors(p => ({ ...p, dateOfBirth: '' }));
                }}
                className={errors.dateOfBirth ? 'border-rose-300' : 'border-slate-200'}
              />
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                Click the field and pick a date from the calendar. Year must be 4 digits (1900–{new Date().getFullYear()}).
              </p>
              {errors.dateOfBirth && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.dateOfBirth}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Gender *</Label>
              <select
                value={formData.gender}
                onChange={e => setFormData(p => ({ ...p, gender: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
              >
                <option value="">Select...</option>
                {GENDERS_FALLBACK.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Blood Group *</Label>
              <select
                value={formData.bloodGroup}
                onChange={e => setFormData(p => ({ ...p, bloodGroup: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              >
                <option value="">Select...</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg.replace('_POS', '+').replace('_NEG', '-')}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Category</Label>
              <select
                value={formData.patientCategory}
                onChange={e => setFormData(p => ({ ...p, patientCategory: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              >
                {PATIENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">ABHA ID (Digital Health ID)</Label>
            <Input
              value={formData.abhaId}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData(p => ({ ...p, abhaId: val }));
              }}
              placeholder="14 or 17 digit Health ID"
              maxLength={17}
              className={errors.abhaId ? 'border-rose-300' : 'border-slate-200'}
            />
            {errors.abhaId && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.abhaId}</p>}
          </div>
        </section>

        {/* Contact Section */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            02. Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Primary Mobile *</Label>
              <Input
                value={formData.mobilePrimary}
                onChange={e => {
                  const mobilePrimary = sanitizeNumericInput(e.target.value, 10);
                  setFormData(p => ({ ...p, mobilePrimary }));
                  if (errors.mobilePrimary) setErrors(p => ({ ...p, mobilePrimary: '' }));
                }}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
                className={errors.mobilePrimary ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.mobilePrimary && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.mobilePrimary}</p>}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Alternate Mobile</Label>
              <Input
                value={formData.mobileAlternate}
                onChange={e => {
                  const mobileAlternate = sanitizeNumericInput(e.target.value, 10);
                  setFormData(p => ({ ...p, mobileAlternate }));
                  if (errors.mobileAlternate) setErrors(p => ({ ...p, mobileAlternate: '' }));
                }}
                placeholder="9876543211"
                maxLength={10}
                inputMode="numeric"
                className={errors.mobileAlternate ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.mobileAlternate && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.mobileAlternate}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Email Address</Label>
              <Input
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="patient@example.com"
              />
            </div>
          </div>
        </section>

        {/* Photo Upload Section */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            03. Profile Photo
          </h4>
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-5">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-sm shrink-0 group hover:border-emerald-300 transition-colors"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-1.5 text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <ImageIcon size={28} strokeWidth={1.5} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Add Photo</span>
                  </div>
                )}
              </button>

              <div className="flex-1 w-full text-center sm:text-left space-y-3">
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {formData.photoFile ? 'Photo selected' : 'Upload patient photo'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    JPEG, PNG or WEBP. Maximum size 2MB.
                  </p>
                  {formData.photoFile && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 truncate max-w-xs mx-auto sm:mx-0">
                      {formData.photoFile.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-8 px-3 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Upload size={13} className="mr-1.5" />
                    {formData.photoFile ? 'Change Photo' : 'Choose Image'}
                  </Button>
                  {formData.photoFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={clearPhoto}
                      className="h-8 px-3 text-xs border-rose-200 text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 size={13} className="mr-1.5" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
        </section>

        {/* Insurance & Referral Section */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            04. Insurance & Referral
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Insurance Company</Label>
              <Input
                value={formData.insuranceCompany}
                onChange={e => {
                  const insuranceCompany = sanitizeAlphabeticInput(e.target.value);
                  setFormData(p => ({ ...p, insuranceCompany }));
                  if (errors.insuranceCompany) {
                    setErrors(p => ({ ...p, insuranceCompany: '' }));
                  }
                }}
                placeholder="e.g. Star Insurance"
                className={errors.insuranceCompany ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.insuranceCompany && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.insuranceCompany}</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Policy Number</Label>
              <Input
                value={formData.insurancePolicyNo}
                onChange={e => {
                  const insurancePolicyNo = sanitizePolicyNumberInput(e.target.value);
                  setFormData(p => ({ ...p, insurancePolicyNo }));
                  if (errors.insurancePolicyNo) {
                    setErrors(p => ({ ...p, insurancePolicyNo: '' }));
                  }
                }}
                placeholder="8 to 16 digit policy number"
                maxLength={16}
                inputMode="numeric"
                className={errors.insurancePolicyNo ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.insurancePolicyNo && (
                <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.insurancePolicyNo}</p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Referring Doctor ID (Optional)</Label>
            <Input
              type=""
              value={formData.referringDoctorId || ''}
              onChange={e => setFormData(p => ({ ...p, referringDoctorId: e.target.value ? parseInt(e.target.value) : undefined }))}
              placeholder="e.g. 101"
            />
          </div>
        </section>

        {/* Preferences Section */}
        <section className="space-y-6">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            05. Preferences
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">WhatsApp Consent</Label>
              <select
                value={formData.whatsappConsent}
                onChange={e => setFormData(p => ({ ...p, whatsappConsent: e.target.value as any }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
              >
                {WHATSAPP_CONSENT.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Report Language</Label>
              <select
                value={formData.reportLanguage}
                onChange={e => setFormData(p => ({ ...p, reportLanguage: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold"
              >
                {REPORT_LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Addresses Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              06. Address Details
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(p => ({
                ...p,
                addresses: [...p.addresses, {
                  addressLine1: '', addressLine2: '', city: '', district: '', state: '', pinCode: '', addressType: 'HOME', isPrimary: p.addresses.length === 0
                }]
              }))}
              className="text-[10px] h-7 px-3 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              <Plus size={12} className="mr-1" /> Add Address
            </Button>
          </div>

          <div className="space-y-4">
            {formData.addresses.map((addr, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30 space-y-4 relative group">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, addresses: p.addresses.filter((_, i) => i !== idx) }))}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Address Line 1</Label>
                    <Input
                      value={addr.addressLine1}
                      onChange={e => {
                        const newAddr = [...formData.addresses];
                        newAddr[idx].addressLine1 = e.target.value;
                        setFormData(p => ({ ...p, addresses: newAddr }));
                      }}
                      placeholder="e.g. 123 Main St"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">City</Label>
                    <Input
                      value={addr.city}
                      onChange={e => {
                        const newAddr = [...formData.addresses];
                        newAddr[idx].city = sanitizeAlphabeticInput(e.target.value);
                        setFormData(p => ({ ...p, addresses: newAddr }));
                      }}
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">District</Label>
                    <Input
                      value={addr.district}
                      onChange={e => {
                        const newAddr = [...formData.addresses];
                        newAddr[idx].district = sanitizeAlphabeticInput(e.target.value);
                        setFormData(p => ({ ...p, addresses: newAddr }));
                      }}
                      placeholder="e.g. Suburban"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">State</Label>
                    <Input
                      value={addr.state}
                      onChange={e => {
                        const newAddr = [...formData.addresses];
                        newAddr[idx].state = sanitizeAlphabeticInput(e.target.value);
                        setFormData(p => ({ ...p, addresses: newAddr }));
                      }}
                      placeholder="e.g. Maharashtra"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Pin Code</Label>
                    <Input
                      value={addr.pinCode}
                      onChange={e => {
                        const newAddr = [...formData.addresses];
                        newAddr[idx].pinCode = sanitizeNumericInput(e.target.value, 6);
                        setFormData(p => ({ ...p, addresses: newAddr }));
                        const pinCodeKey = `addresses[${idx}].pinCode`;
                        if (errors[pinCodeKey]) {
                          setErrors(p => {
                            const next = { ...p };
                            delete next[pinCodeKey];
                            return next;
                          });
                        }
                      }}
                      maxLength={6}
                      inputMode="numeric"
                      placeholder="e.g. 400001"
                      className={
                        getAddressFieldError(errors, idx, 'pinCode')
                          ? 'border-rose-300'
                          : 'border-slate-200'
                      }
                    />
                    {getAddressFieldError(errors, idx, 'pinCode') && (
                      <p className="text-[10px] text-rose-500 mt-1 font-semibold">
                        {getAddressFieldError(errors, idx, 'pinCode')}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Type</Label>
                    <select
                      value={addr.addressType}
                      onChange={e => {
                        const newAddr = [...formData.addresses];
                        newAddr[idx].addressType = e.target.value;
                        setFormData(p => ({ ...p, addresses: newAddr }));
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                    >
                      {ADDRESS_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Allergies Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              07. Clinical Allergies
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAllergy}
              className="text-[10px] h-7 px-3 border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <Plus size={12} className="mr-1" /> Add Allergy
            </Button>
          </div>

          <div className="space-y-4">
            {formData.allergies.map((allergy, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-rose-100 bg-rose-50/10 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => removeAllergy(idx)}
                  className="absolute top-4 right-4 text-rose-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold text-rose-600 uppercase mb-1 block">Allergy Name</Label>
                    <Input
                      value={allergy.allergyName}
                      onChange={e =>
                        updateAllergy(
                          idx,
                          'allergyName',
                          sanitizeAllergyNameInput(e.target.value),
                        )
                      }
                      placeholder="e.g. Peanuts, Penicillin"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-rose-600 uppercase mb-1 block">Severity</Label>
                    <select
                      value={allergy.severity}
                      onChange={e => updateAllergy(idx, 'severity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-rose-100 text-xs bg-white"
                    >
                      {ALLERGY_SEVERITY.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-rose-600 uppercase mb-1 block">Noted By (Doctor ID)</Label>
                  <Input
                    type="number"
                    value={allergy.notedBy || ''}
                    onChange={e => {
                      const notedBy = sanitizeNumericInput(e.target.value, 10);
                      updateAllergy(idx, 'notedBy', notedBy ? parseInt(notedBy, 10) : 1);
                    }}
                    inputMode="numeric"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-rose-600 uppercase mb-1 block">Remarks</Label>
                  <textarea
                    value={allergy.remarks}
                    onChange={e =>
                      updateAllergy(idx, 'remarks', sanitizeRemarksInput(e.target.value))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-rose-100 bg-white text-xs outline-none focus:ring-4 focus:ring-rose-500/5 transition-all"
                    rows={2}
                    placeholder="Describe reaction or symptoms..."
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Status Section */}
        <section className="pt-6 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
            />
            <span className="text-sm font-bold text-slate-700">Set as Active Patient</span>
          </label>
        </section>
      </form>
    </RightDrawer>
  );
}
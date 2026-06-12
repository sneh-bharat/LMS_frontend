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
  X,
  Trash2,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import { RightDrawer } from '@/components/ui/right-drawer';
import { Input, Label } from '@/components/ui';
import {
  createPatient,
  CreatePatientInput,
  Patient,
} from '@/app/Apis/Patients/Patient_Service_API';

// ─── Constants ───────────────────────────────────────────────────────────────

// Fallback used while API options are loading or if the request fails
const GENDERS_FALLBACK = ['MALE', 'FEMALE', 'OTHER', 'TRANSGENDER'];
const BLOOD_GROUPS = ['A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG'];
const ADDRESS_TYPES = ['HOME', 'OFFICE', 'PERMANENT', 'COMMUNICATION'];
const ALLERGY_SEVERITY = ['Mild', 'Moderate', 'Severe'];
const WHATSAPP_CONSENT = ['YES', 'NO'];
const REPORT_LANGUAGES = ['ENGLISH', 'HINDI', 'MARATHI', 'TAMIL', 'TELUGU'];
const PATIENT_CATEGORIES = ['REGULAR', 'VIP', 'CORPORATE', 'TPA', 'CGHS', 'ECHS', 'ESI', 'BPL', 'STAFF'];

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
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';
    if (!formData.mobilePrimary.trim()) {
      newErrors.mobilePrimary = 'Primary mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobilePrimary.replace(/\D/g, ''))) {
      newErrors.mobilePrimary = 'Primary mobile must be a valid 10-digit Indian number';
    }
    if (formData.abhaId && formData.abhaId.length !== 14 && formData.abhaId.length !== 17) {
      newErrors.abhaId = 'ABHA ID must be 14 or 17 digits';
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
        toast.error(response?.message || 'Registration failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
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
                onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
                className={errors.firstName ? 'border-rose-300' : 'border-slate-200'}
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Middle Name</Label>
              <Input
                value={formData.middleName}
                onChange={e => setFormData(p => ({ ...p, middleName: e.target.value }))}
                placeholder="Michael"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                placeholder="Doe"
                className={errors.lastName ? 'border-rose-300' : 'border-slate-200'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Date of Birth *</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))}
              />
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
                onChange={e => setFormData(p => ({ ...p, mobilePrimary: e.target.value }))}
                placeholder="9876543210"
                maxLength={10}
                className={errors.mobilePrimary ? 'border-rose-300' : 'border-slate-200'}
              />
              {errors.mobilePrimary && <p className="text-[10px] text-rose-500 mt-1 font-semibold">{errors.mobilePrimary}</p>}
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Alternate Mobile</Label>
              <Input
                value={formData.mobileAlternate}
                onChange={e => setFormData(p => ({ ...p, mobileAlternate: e.target.value }))}
                placeholder="9876543211"
                maxLength={10}
              />
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
          <div className="flex items-center gap-4">
            {photoPreview && (
              <div className="relative group w-20 h-20 rounded-2xl border-2 border-slate-100 overflow-hidden shadow-sm">
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFormData(p => ({ ...p, photoFile: undefined }));
                    setPhotoPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="flex-1">
              <Input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={e => setFormData(p => ({ ...p, photoFile: e.target.files?.[0] }))}
                className="w-full border-slate-200 bg-white"
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
                onChange={e => setFormData(p => ({ ...p, insuranceCompany: e.target.value }))}
                placeholder="e.g. Star Insurance"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Policy Number</Label>
              <Input
                value={formData.insurancePolicyNo}
                onChange={e => setFormData(p => ({ ...p, insurancePolicyNo: e.target.value }))}
                placeholder="POL-123456"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">Referring Doctor ID (Optional)</Label>
            <Input
              type="number"
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
                        newAddr[idx].city = e.target.value;
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
                        newAddr[idx].district = e.target.value;
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
                        newAddr[idx].state = e.target.value;
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
                        newAddr[idx].pinCode = e.target.value;
                        setFormData(p => ({ ...p, addresses: newAddr }));
                      }}
                      placeholder="e.g. 400001"
                    />
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
                      onChange={e => updateAllergy(idx, 'allergyName', e.target.value)}
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
                    onChange={e => updateAllergy(idx, 'notedBy', e.target.value ? parseInt(e.target.value) : 1)}
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-rose-600 uppercase mb-1 block">Remarks</Label>
                  <textarea
                    value={allergy.remarks}
                    onChange={e => updateAllergy(idx, 'remarks', e.target.value)}
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
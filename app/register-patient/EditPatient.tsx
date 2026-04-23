import { useState, useEffect } from 'react';
import {
  Edit3,
  Loader,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/button';
import { RightDrawer } from '@/components/ui/right-drawer';
import { Input, Label } from '@/components/ui';
import { 
  updatePatient, 
  CreatePatientInput, 
  Patient,
  fetchPatientById,
  fetchPatientPhoto,
} from '../Apis/Patients/Patient_Service_API';

// ─── Constants ───────────────────────────────────────────────────────────────

const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'TRANSGENDER'];
const BLOOD_GROUPS = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
const ADDRESS_TYPES = ['PERMANENT', 'COMMUNICATION', 'HOME', 'OFFICE'];
const ALLERGY_SEVERITY = ['LOW', 'MEDIUM', 'HIGH'];
const WHATSAPP_CONSENT = ['YES', 'NO'];
const REPORT_LANGUAGES = ['ENGLISH', 'HINDI', 'MARATHI', 'TAMIL', 'TELUGU'];
const PATIENT_CATEGORIES = ['GENERAL', 'REGULAR', 'VIP', 'CORPORATE', 'TPA', 'CGHS', 'ECHS', 'ESI', 'BPL', 'STAFF'];

// ─── Edit Modal ──────────────────────────────────────────────────────────────

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess?: (message: string) => void;
}

function EditPatientModal({ isOpen, onClose, patient, onSuccess }: EditPatientModalProps) {
  const normalizeBloodGroup = (value?: string) => {
    // Map UI display values to backend expected format
    const map: Record<string, string> = {
      'A_POSITIVE': 'A_POS',
      'A_NEGATIVE': 'A_NEG',
      'B_POSITIVE': 'B_POS',
      'B_NEGATIVE': 'B_NEG',
      'AB_POSITIVE': 'AB_POS',
      'AB_NEGATIVE': 'AB_NEG',
      'O_POSITIVE': 'O_POS',
      'O_NEGATIVE': 'O_NEG',
      // Also accept short format (pass-through)
      'A_POS': 'A_POS',
      'A_NEG': 'A_NEG',
      'B_POS': 'B_POS',
      'B_NEG': 'B_NEG',
      'AB_POS': 'AB_POS',
      'AB_NEG': 'AB_NEG',
      'O_POS': 'O_POS',
      'O_NEG': 'O_NEG',
    };
    if (!value) return '';
    return map[value] || value;
  };

  const normalizeAddressType = (value?: string) => {
    // Map UI values to backend expected format
    const map: Record<string, string> = {
      'PERMANENT': 'Permanent',
      'COMMUNICATION': 'Communication',
      'HOME': 'Home',
      'OFFICE': 'Office',
      // Pass-through if already in correct format
      'Permanent': 'Permanent',
      'Communication': 'Communication',
      'Home': 'Home',
      'Office': 'Office',
    };
    if (!value) return 'Home';
    return map[value] || value;
  };

  const normalizeSeverity = (value?: string) => {
    // Map UI values to backend expected format
    const map: Record<string, string> = {
      'LOW': 'Mild',
      'MEDIUM': 'Moderate',
      'HIGH': 'Severe',
      // Pass-through if already in correct format
      'Mild': 'Mild',
      'Moderate': 'Moderate',
      'Severe': 'Severe',
    };
    if (!value) return 'Mild';
    return map[value] || value;
  };

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
    referringDoctor: '',
    referringDoctorId: undefined as number | undefined,
    insuranceCompany: '',
    insurancePolicyNo: '',
    whatsappConsent: 'YES' as 'YES' | 'NO',
    reportLanguage: 'ENGLISH',
    photoUrl: '',
    photoFile: undefined as File | undefined,
    bloodGroup: '',
    patientCategory: 'GENERAL',
    isActive: true,
    addresses: [] as Array<{
      id?: number;
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
      id?: number;
      allergyName: string;
      severity: string;
      notedBy: string;
      remarks: string;
    }>
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [originalPatientData, setOriginalPatientData] = useState<any>(null);

  // ─── Load Patient Data When Opening Modal ──────────────────────────────────
  useEffect(() => {
    if (isOpen && patient?.id) {
      loadPatientForEdit(patient.id);
    }
  }, [isOpen, patient?.id]);

  const loadPatientForEdit = async (patientId: number) => {
    setIsLoadingPatient(true);
    try {
      const response = await fetchPatientById(patientId);
      if (response?.data) {
        const patientData = response.data;
        
        // Fetch patient photo separately and convert to displayable URL
        let photoUrlData = '';
        try {
          console.log('📸 Fetching patient photo for edit mode...');
          const photoResponse = await fetchPatientPhoto(patientId);
          
          if (photoResponse && photoResponse.imageBlob) {
            // Convert blob to data URL for display
            const reader = new FileReader();
            const dataUrlPromise = new Promise<string>((resolve) => {
              reader.onloadend = () => resolve(reader.result as string);
            });
            reader.readAsDataURL(photoResponse.imageBlob);
            photoUrlData = await dataUrlPromise;
            console.log('✅ Photo loaded and converted to data URL');
          } else {
            console.log('⚠️ No photo found for patient');
          }
        } catch (photoError) {
          console.warn('⚠️ Failed to load patient photo:', photoError);
          photoUrlData = ''; // Fallback to empty
        }
        
        const data = {
          firstName: patientData.firstName || '',
          middleName: patientData.middleName || '',
          lastName: patientData.lastName || '',
          dateOfBirth: patientData.dateOfBirth || '',
          gender: patientData.gender || '',
          mobilePrimary: patientData.mobilePrimary || '',
          mobileAlternate: patientData.mobileAlternate || '',
          email: patientData.email || '',
          clinicId: patientData.clinicId || 1,
          abhaId: patientData.abhaId || '',
          referringDoctor: patientData.referringDoctorId?.toString() || '',
          referringDoctorId: patientData.referringDoctorId,
          insuranceCompany: patientData.insuranceCompany || '',
          insurancePolicyNo: patientData.insurancePolicyNo || '',
          whatsappConsent: (patientData.whatsappConsent as 'YES' | 'NO') || 'YES',
          reportLanguage: patientData.reportLanguage || 'ENGLISH',
          photoUrl: photoUrlData,
          photoFile: undefined,
          bloodGroup: normalizeBloodGroup(patientData.bloodGroup),
          patientCategory: patientData.patientCategory || 'GENERAL',
          isActive: patientData.isActive ?? true,
          addresses: (patientData.addresses || []).map(addr => ({
            id: addr.id,
            addressLine1: addr.addressLine1 || '',
            addressLine2: addr.addressLine2 || '',
            city: addr.city || '',
            district: addr.district || '',
            state: addr.state || '',
            pinCode: addr.pinCode || '',
            addressType: normalizeAddressType(addr.addressType),
            isPrimary: addr.isPrimary || false,
          })),
          allergies: (patientData.allergies || []).map(allergy => ({
            id: allergy.id,
            allergyName: allergy.allergyName || '',
            severity: normalizeSeverity(allergy.severity),
            notedBy: allergy.notedBy?.toString() || '',
            remarks: allergy.remarks || '',
          })),
        };
        setFormData(data);
        setOriginalPatientData(data);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load patient data';
      setErrors({ submit: errorMsg });
      console.error('Error loading patient:', error);
    } finally {
      setIsLoadingPatient(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }

    if (!formData.mobilePrimary.trim()) {
      newErrors.mobilePrimary = 'Primary mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobilePrimary.replace(/\D/g, ''))) {
      newErrors.mobilePrimary = 'Primary mobile must be a valid 10-digit Indian number';
    }

    if (formData.mobileAlternate && !/^[6-9]\d{9}$/.test(formData.mobileAlternate.replace(/\D/g, ''))) {
      newErrors.mobileAlternate = 'Alternate mobile must be a valid 10-digit Indian number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (originalPatientData) {
        // Build object with ALL required fields + changed optional fields
        const updateDTO: any = {
          id: patient.id,
          patientCode: patient.patientCode,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER',
          mobilePrimary: formData.mobilePrimary.replace(/\D/g, ''),
          bloodGroup: normalizeBloodGroup(formData.bloodGroup) as CreatePatientInput['bloodGroup'],
          patientCategory: formData.patientCategory as CreatePatientInput['patientCategory'],
          clinicId: formData.clinicId,
          isActive: formData.isActive,
        };

        // Add optional fields only if they changed
        if (formData.middleName.trim() !== originalPatientData.middleName) {
          updateDTO.middleName = formData.middleName.trim() || undefined;
        }
        if (formData.mobileAlternate?.replace(/\D/g, '') !== originalPatientData.mobileAlternate?.replace(/\D/g, '')) {
          updateDTO.mobileAlternate = formData.mobileAlternate ? formData.mobileAlternate.replace(/\D/g, '') : undefined;
        }
        if (formData.email.toLowerCase().trim() !== originalPatientData.email.toLowerCase().trim()) {
          updateDTO.email = formData.email.toLowerCase().trim() || undefined;
        }
        if (formData.insuranceCompany.trim() !== originalPatientData.insuranceCompany) {
          updateDTO.insuranceCompany = formData.insuranceCompany.trim() || undefined;
        }
        if (formData.insurancePolicyNo.trim() !== originalPatientData.insurancePolicyNo) {
          updateDTO.insurancePolicyNo = formData.insurancePolicyNo.trim() || undefined;
        }
        if (formData.whatsappConsent !== originalPatientData.whatsappConsent) {
          updateDTO.whatsappConsent = formData.whatsappConsent;
        }
        if (formData.reportLanguage !== originalPatientData.reportLanguage) {
          updateDTO.reportLanguage = formData.reportLanguage;
        }
        if (formData.referringDoctorId !== originalPatientData.referringDoctorId) {
          updateDTO.referringDoctorId = formData.referringDoctorId;
        }
        if (formData.abhaId.trim() !== originalPatientData.abhaId) {
          updateDTO.abhaId = formData.abhaId.trim() || undefined;
        }

        console.log('\n========== EDIT MODE: PREPARING UPDATE ==========');
        console.log('📝 UPDATE DTO Summary:');
        console.log('  - Patient ID:', updateDTO.id);
        console.log('  - Name:', `${updateDTO.firstName} ${updateDTO.lastName}`);
        console.log('  - Gender:', updateDTO.gender);
        console.log('  - DOB:', updateDTO.dateOfBirth);
        console.log('  - Mobile:', updateDTO.mobilePrimary);
        console.log('  - Blood Group:', updateDTO.bloodGroup);
        console.log('  - Category:', updateDTO.patientCategory);
        console.log('  - Clinic ID:', updateDTO.clinicId);
        console.log('  - Active:', updateDTO.isActive);
        console.log('  - Addresses: EXCLUDED (managed via dedicated endpoint)');
        console.log('  - Allergies: EXCLUDED (managed via dedicated endpoint)');
        console.log('📷 Photo file:', formData.photoFile ? formData.photoFile.name : 'No photo change');
        console.log('🔑 Patient ID:', patient.id!);
        console.log('=================================================\n');

        let response;
        const wasPhotoUploaded = formData.photoFile !== undefined;

        // Call update with required fields + changed fields + photo if changed
        response = await updatePatient(patient.id!, {
          ...updateDTO,
          photoFile: formData.photoFile,
        } as any);
        
        console.log('✅ Patient updated successfully!', response);
        
        if (response && (response.code === 200 || response.code === 201 || response.response === true)) {
          console.log('✅ Operation completed successfully!');
          
          if (wasPhotoUploaded) {
            const successMessage = response.message || 'Patient updated successfully with photo!';
            console.log('📷 PHOTO UPDATE SUCCESS MESSAGE:', successMessage);
            onSuccess?.(successMessage);
          } else {
            onSuccess?.(response.message || 'Patient updated successfully!');
          }
          
          onClose();
        } else {
          console.warn('⚠️ Unexpected response:', response);
          throw new Error(response?.message || 'Operation failed');
        }
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setErrors({ submit: errorMessage });
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAddress = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        state: '',
        pinCode: '',
        addressType: 'PERMANENT',
        isPrimary: prev.addresses.length === 0,
      }]
    }));
  };

  const removeAddress = (index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
  };

  const updateAddress = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newAddresses = [...prev.addresses];
      newAddresses[index] = { ...newAddresses[index], [field]: value };
      return { ...prev, addresses: newAddresses };
    });
  };

  const addAllergy = () => {
    setFormData(prev => ({
      ...prev,
      allergies: [...prev.allergies, {
        allergyName: '',
        severity: 'MEDIUM',
        notedBy: 'SYSTEM',
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
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
        className="px-6 py-2 rounded-lg font-bold transition-all text-sm border-slate-300 text-slate-700 disabled:opacity-50"
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || isLoadingPatient}
        className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold hover:from-blue-600 hover:to-indigo-600 transition-all text-sm shadow-md disabled:opacity-50 flex items-center gap-2"
      >
        {isSubmitting && <Loader size={14} className="animate-spin" />}
        <Edit3 size={14} />
        Update Patient
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Edit <span className="text-blue-200">Patient Record</span>
        </>
      }
      description="Update Patient Information"
      footer={footer}
      maxWidth="xl"
    >
      {isLoadingPatient ? (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Loader className="animate-spin text-blue-500" size={32} />
          <p className="text-slate-600 font-medium">Loading patient data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Identity */}
          <section className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              01. Basic Identity
            </h4>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.firstName
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Middle Name
                </Label>
                <Input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData(prev => ({ ...prev, middleName: e.target.value }))}
                  placeholder="Michael"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                />
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.lastName
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* DOB, Gender, Blood Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.dateOfBirth
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.dateOfBirth}
                  </p>
                )}
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Gender <span className="text-red-500">*</span>
                </Label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-bold focus:ring-4 ${
                    errors.gender
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                >
                  <option value="">Select...</option>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
                {errors.gender && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.gender}
                  </p>
                )}
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Blood Group <span className="text-red-500">*</span>
                </Label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium focus:ring-4 ${
                    errors.bloodGroup
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                >
                  <option value="">Select...</option>
                  {BLOOD_GROUPS.map(bg => {
                    const displayValue = bg.replace('_POSITIVE', '+').replace('_NEGATIVE', '-');
                    return (
                      <option key={bg} value={bg}>
                        {displayValue}
                      </option>
                    );
                  })}
                </select>
                {errors.bloodGroup && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.bloodGroup}
                  </p>
                )}
              </div>
            </div>

            {/* ABHA ID */}
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                ABHA ID
              </Label>
              <Input
                type="text"
                value={formData.abhaId}
                onChange={(e) => setFormData(prev => ({ ...prev, abhaId: e.target.value }))}
                placeholder="ABHA123456789"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-mono font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
              />
            </div>
          </section>

          {/* Section 2: Contact Information */}
          <section className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              02. Contact Information
            </h4>

            {/* Primary Mobile */}
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Primary Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                type="tel"
                value={formData.mobilePrimary}
                onChange={(e) => setFormData(prev => ({ ...prev, mobilePrimary: e.target.value }))}
                placeholder="9876543210"
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.mobilePrimary
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                }`}
              />
              {errors.mobilePrimary && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.mobilePrimary}
                </p>
              )}
            </div>

            {/* Alternate Mobile and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Alternate Mobile
                </Label>
                <Input
                  type="tel"
                  value={formData.mobileAlternate}
                  onChange={(e) => setFormData(prev => ({ ...prev, mobileAlternate: e.target.value }))}
                  placeholder="9876543211"
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.mobileAlternate
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {errors.mobileAlternate && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.mobileAlternate}
                  </p>
                )}
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="patient@example.com"
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 italic focus:ring-4 ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* WhatsApp Consent */}
            <div>
              <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                WhatsApp Consent
              </Label>
              <div className="flex gap-6">
                {WHATSAPP_CONSENT.map(option => (
                  <label key={option} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="whatsappConsent"
                      value={option}
                      checked={formData.whatsappConsent === option}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsappConsent: e.target.value as 'YES' | 'NO' }))}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-bold text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3: Medical & Referral */}
          <section className="space-y-6">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-slate-200"></span>
              03. Medical & Referral
            </h4>

            {/* Referring Doctor and Patient Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Referring Doctor ID
                </Label>
                <Input
                  type="text"
                  value={formData.referringDoctor}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      referringDoctor: val,
                      referringDoctorId: val ? Number(val) : undefined,
                    }));
                  }}
                  placeholder="Doctor ID or Name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-mono font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                />
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Patient Category
                </Label>
                <select
                  value={formData.patientCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientCategory: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                >
                  {PATIENT_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            {/* Insurance Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Insurance Company
                </Label>
                <Input
                  type="text"
                  value={formData.insuranceCompany}
                  onChange={(e) => setFormData(prev => ({ ...prev, insuranceCompany: e.target.value }))}
                  placeholder="Health Insurance Co"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                />
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Insurance Policy No
                </Label>
                <Input
                  type="text"
                  value={formData.insurancePolicyNo}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurancePolicyNo: e.target.value }))}
                  placeholder="POL123456"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-mono font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                />
              </div>
            </div>

            {/* Report Language and Photo Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Report Language
                </Label>
                <select
                  value={formData.reportLanguage}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportLanguage: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                >
                  {REPORT_LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
                </select>
              </div>
              <div>
                <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Update Photo
                </Label>
                
                {/* Photo Preview */}
                {(formData.photoUrl || formData.photoFile) && (
                  <div className="mb-3 flex justify-center">
                    <div className="relative">
                      <img
                        src={
                          formData.photoFile
                            ? URL.createObjectURL(formData.photoFile)
                            : formData.photoUrl
                        }
                        alt="Patient Photo"
                        className="w-32 h-32 rounded-xl object-cover border-2 border-blue-200 shadow-md"
                        onError={(e) => {
                          console.warn('⚠️ Failed to load photo:', formData.photoUrl);
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* No Photo Placeholder */}
                {!formData.photoUrl && !formData.photoFile && (
                  <div className="mb-3 flex justify-center">
                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                      <div className="text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-xs text-slate-500 mt-2 font-medium">No Photo</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      photoFile: e.target.files?.[0],
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 transition-all outline-none text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                />
                {formData.photoFile && (
                  <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Selected: {formData.photoFile.name}
                  </p>
                )}
                {formData.photoUrl && !formData.photoFile && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Current photo from server
                  </p>
                )}
                {!formData.photoUrl && !formData.photoFile && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    No photo uploaded yet. Upload a photo to add one.
                  </p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                />
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Mark as Active Patient</span>
              </label>
            </div>
          </section>

          {/* Section 4: Addresses */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-200"></span>
                04. Addresses
              </h4>
              <button
                type="button"
                onClick={addAddress}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <Plus size={14} /> Add Address
              </button>
            </div>

            {formData.addresses.map((address, index) => (
              <div key={index} className="bg-slate-50 rounded-xl p-6 space-y-4 relative border border-slate-200">
                <button
                  type="button"
                  onClick={() => removeAddress(index)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Address Line 1
                    </Label>
                    <Input
                      value={address.addressLine1}
                      onChange={(e) => updateAddress(index, 'addressLine1', e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Address Line 2
                    </Label>
                    <Input
                      value={address.addressLine2}
                      onChange={(e) => updateAddress(index, 'addressLine2', e.target.value)}
                      placeholder="Apartment 4B"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      City
                    </Label>
                    <Input
                      value={address.city}
                      onChange={(e) => updateAddress(index, 'city', e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      District
                    </Label>
                    <Input
                      value={address.district}
                      onChange={(e) => updateAddress(index, 'district', e.target.value)}
                      placeholder="Mumbai Suburban"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      State
                    </Label>
                    <Input
                      value={address.state}
                      onChange={(e) => updateAddress(index, 'state', e.target.value)}
                      placeholder="Maharashtra"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Pin Code
                    </Label>
                    <Input
                      value={address.pinCode}
                      onChange={(e) => updateAddress(index, 'pinCode', e.target.value)}
                      placeholder="400001"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-mono font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Address Type
                    </Label>
                    <select
                      value={address.addressType}
                      onChange={(e) => updateAddress(index, 'addressType', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 transition-all outline-none font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      {ADDRESS_TYPES.map(type => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id={`address-${index}-primary`}
                    checked={address.isPrimary}
                    onChange={(e) => {
                      const newAddresses = formData.addresses.map((addr, i) => ({
                        ...addr,
                        isPrimary: i === index ? e.target.checked : false,
                      }));
                      setFormData(prev => ({ ...prev, addresses: newAddresses }));
                    }}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <label htmlFor={`address-${index}-primary`} className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mark as Primary Address
                  </label>
                </div>
              </div>
            ))}

            {formData.addresses.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-slate-500 font-medium">No addresses added yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Address" to add patient address</p>
              </div>
            )}
          </section>

          {/* Section 5: Allergies */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-200"></span>
                05. Allergies
              </h4>
              <button
                type="button"
                onClick={addAllergy}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <Plus size={14} /> Add Allergy
              </button>
            </div>

            {formData.allergies.map((allergy, index) => (
              <div key={index} className="bg-rose-50 border border-rose-200 rounded-xl p-6 space-y-4 relative">
                <button
                  type="button"
                  onClick={() => removeAllergy(index)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Allergy Name
                    </Label>
                    <Input
                      value={allergy.allergyName}
                      onChange={(e) => updateAllergy(index, 'allergyName', e.target.value)}
                      placeholder="Penicillin"
                      className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Severity
                    </Label>
                    <select
                      value={allergy.severity}
                      onChange={(e) => updateAllergy(index, 'severity', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-slate-900 transition-all outline-none font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    >
                      {ALLERGY_SEVERITY.map(sev => <option key={sev}>{sev}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Noted By
                    </Label>
                    <Input
                      value={allergy.notedBy}
                      onChange={(e) => updateAllergy(index, 'notedBy', e.target.value)}
                      placeholder="Dr. Smith"
                      className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Remarks
                  </Label>
                  <textarea
                    value={allergy.remarks}
                    onChange={(e) => updateAllergy(index, 'remarks', e.target.value)}
                    placeholder="Avoid all penicillin-based medications"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-rose-200 bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 resize-none"
                  />
                </div>
              </div>
            ))}

            {formData.allergies.length === 0 && (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-slate-500 font-medium">No allergies recorded</p>
                <p className="text-xs text-slate-400 mt-1">Click "Add Allergy" to add patient allergies</p>
              </div>
            )}
          </section>

          {/* General Error Message */}
          {errors.submit && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-900 uppercase tracking-widest">Error</p>
                <p className="text-sm text-rose-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          )}
        </form>
      )}
    </RightDrawer>
  );
}

export default EditPatientModal;
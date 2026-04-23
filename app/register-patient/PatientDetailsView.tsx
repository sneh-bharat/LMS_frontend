'use client';

import { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Droplet,
  FileText,
  Edit3,
  Loader,
  AlertCircle,
  Heart,
  Building,
  Clock,
  Hash,
  UserCheck,
  Stethoscope,
  Home,
  Briefcase,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { fetchPatientById, Patient, fetchPatientPhoto } from '../Apis/Patients/Patient_Service_API';

// ─── Component Props ─────────────────────────────────────────────────────────

interface PatientDetailsViewProps {
  patientId: number;
  onEdit?: (patient: Patient) => void;
  onClose?: () => void;
}

// ─── Patient Details Component ───────────────────────────────────────────────

export default function PatientDetailsView({ patientId, onEdit, onClose }: PatientDetailsViewProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // ─── Load Patient Data ──────────────────────────────────────────────────
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (hasLoadedRef.current) {
      console.log('⏭️ Data already loaded, skipping duplicate call');
      return;
    }

    console.log('🔄 Loading patient details for ID:', patientId);
    hasLoadedRef.current = true;
    loadPatientDetails();
  }, [patientId]);

  const loadPatientDetails = async () => {
    console.log('📥 loadPatientDetails called');
    setLoading(true);
    setError(null);
    try {
      console.log('📡 Fetching patient details from API...');
      const response = await fetchPatientById(patientId);
      console.log('✅ Patient details received');
      
      if (response?.data) {
        setPatient(response.data);
        console.log('📸 Fetching patient photo...');
        // Fetch patient photo using the Photo API
        await loadPatientPhoto(patientId);
      } else {
        setError('Patient not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patient details';
      setError(errorMessage);
      console.error('❌ Error loading patient:', err);
    } finally {
      setLoading(false);
      console.log('✅ Patient details loading complete');
    }
  };

  // ─── Load Patient Photo ──────────────────────────────────────────────────
  const loadPatientPhoto = async (id: number) => {
    setPhotoLoading(true);
    console.log('📸 Starting photo load for patient ID:', id);
    try {
      console.log('📤 Calling fetchPatientPhoto...');
      const photoResponse = await fetchPatientPhoto(id);

      if (!photoResponse) {
        console.log('ℹ️ No photo available for this patient');
        setPhotoUrl(null);
        return;
      }

      console.log('📦 Photo response received:', photoResponse);
      console.log('Blob size:', photoResponse.imageBlob.size);
      console.log('Content type:', photoResponse.contentType);
      
      // Create blob URL for display
      const blobUrl = URL.createObjectURL(photoResponse.imageBlob);
      console.log('✅ Blob URL created:', blobUrl);
      
      setPhotoUrl(blobUrl);
      console.log(`✅ Patient photo loaded successfully`);
    } catch (err) {
      console.error('❌ FAILED TO LOAD PHOTO:');
      console.error('Error:', err);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown error');
      console.warn(`⚠️ Setting photoUrl to null`);
      setPhotoUrl(null);
    } finally {
      setPhotoLoading(false);
    }
  };

  // ─── Cleanup blob URL on unmount ─────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  // ─── Helper Functions ───────────────────────────────────────────────────

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      'MALE': 'Male',
      'FEMALE': 'Female',
      'OTHER': 'Other',
      'TRANSGENDER': 'Transgender',
    };
    return labels[gender] || gender;
  };

  const getBloodGroupLabel = (bloodGroup: string) => {
    const labels: Record<string, string> = {
      A_POS: 'A+',
      A_NEG: 'A-',
      B_POS: 'B+',
      B_NEG: 'B-',
      AB_POS: 'AB+',
      AB_NEG: 'AB-',
      O_POS: 'O+',
      O_NEG: 'O-',
      A_POSITIVE: 'A+',
      A_NEGATIVE: 'A-',
      B_POSITIVE: 'B+',
      B_NEGATIVE: 'B-',
      AB_POSITIVE: 'AB+',
      AB_NEGATIVE: 'AB-',
      O_POSITIVE: 'O+',
      O_NEGATIVE: 'O-',
    };
    return labels[bloodGroup] || bloodGroup;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'GENERAL': 'General',
      'REGULAR': 'Regular',
      'VIP': 'VIP',
      'CORPORATE': 'Corporate',
      'TPA': 'TPA',
      'CGHS': 'CGHS',
      'ECHS': 'ECHS',
      'ESI': 'ESI',
      'BPL': 'BPL',
      'STAFF': 'Staff',
    };
    return labels[category] || category;
  };

  const getAddressTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'Home': 'Home',
      'Office': 'Office',
      'Permanent': 'Permanent',
      'Communication': 'Communication',
      'HOME': 'Home',
      'OFFICE': 'Office',
      'PERMANENT': 'Permanent',
      'COMMUNICATION': 'Communication',
    };
    return labels[type] || type;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getGenderColor = (gender: string) => {
    if (gender === 'MALE') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (gender === 'FEMALE') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const getCategoryColor = (category: string) => {
    if (category === 'VIP') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (category === 'CORPORATE') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'Mild' || severity === 'LOW') return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (severity === 'Moderate' || severity === 'MEDIUM') return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  // ─── Loading State ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader className="animate-spin text-emerald-500" size={40} />
        <p className="text-slate-600 font-medium">Loading patient details...</p>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center">
        <AlertCircle className="mx-auto text-rose-500 mb-3" size={48} />
        <h3 className="text-lg font-bold text-rose-700 mb-2">Error Loading Patient</h3>
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <button
          onClick={loadPatientDetails}
          className="px-6 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Patient Not Found ──────────────────────────────────────────────────
  if (!patient) {
    return null;
  }

  // ─── Main Render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* ═══ HEADER WITH PHOTO AND BASIC INFO ════════════════════════════ */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-6">
            {/* Patient Photo */}
            <div className="relative">
              {photoLoading ? (
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border-4 border-emerald-100 shadow-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : photoUrl ? (
                <img
                  src={photoUrl}
                  alt={`${patient.firstName} ${patient.lastName}`}
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center border-4 border-emerald-100 shadow-lg">
                  <User size={48} className="text-emerald-400" />
                </div>
              )}
              {patient.isActive && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-white shadow-md">
                  Active
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900">
                  {patient.firstName} {patient.middleName} {patient.lastName}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className={`px-3 py-1 border ${getGenderColor(patient.gender)}`}>
                  <User size={12} className="mr-1" />
                  {getGenderLabel(patient.gender)}
                </Badge>
                
                <Badge className={`px-3 py-1 border ${getCategoryColor(patient.patientCategory)}`}>
                  <Shield size={12} className="mr-1" />
                  {getCategoryLabel(patient.patientCategory)}
                </Badge>
                
                <Badge variant="outline" className="px-3 py-1 border-2 border-emerald-300 text-emerald-700">
                  <Droplet size={12} className="mr-1" />
                  Blood: {getBloodGroupLabel(patient.bloodGroup)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <Calendar size={14} />
                    Age
                  </div>
                  <p className="text-xl font-black text-slate-900">{getAge(patient.dateOfBirth)} yrs</p>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <Hash size={14} />
                    Patient ID
                  </div>
                  <p className="text-sm font-black text-slate-900 font-mono">{patient.id}</p>
                </div>
                
                {patient.patientCode && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      <FileText size={14} />
                      Patient Code
                    </div>
                    <p className="text-sm font-black text-slate-900 font-mono">{patient.patientCode}</p>
                  </div>
                )}
                
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                    <UserCheck size={14} />
                    Status
                  </div>
                  <p className={`text-sm font-black ${patient.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onEdit && (
              <Button
                onClick={() => onEdit(patient)}
                className="px-4 py-2 bg-white border-2 border-emerald-500 text-emerald-600 font-bold hover:bg-emerald-50 transition-colors rounded-xl shadow-sm"
              >
                <Edit3 size={16} className="mr-2" />
                Edit
              </Button>
            )}
            {onClose && (
              <Button
                onClick={onClose}
                variant="outline"
                className="px-4 py-2 rounded-xl border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT GRID ═══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Personal Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-blue-100">
              <h3 className="text-sm font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
                <Phone size={16} />
                Contact Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Primary Mobile</p>
                    <p className="text-base font-bold text-slate-900">{patient.mobilePrimary}</p>
                  </div>
                </div>
                
                {patient.mobileAlternate && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alternate Mobile</p>
                      <p className="text-base font-bold text-slate-900">{patient.mobileAlternate}</p>
                    </div>
                  </div>
                )}
                
                {patient.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</p>
                      <p className="text-base font-bold text-slate-900">{patient.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp Consent</p>
                    <p className="text-base font-bold text-slate-900">{patient.whatsappConsent === 'YES' ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Personal Details */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
              <h3 className="text-sm font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                <User size={16} />
                Personal Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date of Birth</p>
                  <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-purple-500" />
                    {formatDate(patient.dateOfBirth)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</p>
                  <p className="text-base font-bold text-slate-900">{getGenderLabel(patient.gender)}</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</p>
                  <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Droplet size={16} className="text-rose-500" />
                    {getBloodGroupLabel(patient.bloodGroup)}
                  </p>
                </div>
                
                {patient.abhaId && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">ABHA ID</p>
                    <p className="text-base font-bold text-slate-900 font-mono">{patient.abhaId}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Addresses */}
          {patient.addresses && patient.addresses.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} />
                  Addresses ({patient.addresses.length})
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {patient.addresses.map((address, index) => (
                  <div
                    key={address.id || index}
                    className={`p-5 rounded-xl border-2 ${
                      address.isPrimary
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {(address.addressType === 'Home' || address.addressType === 'HOME' || address.addressType === 'PERMANENT') && (
                          <Home size={16} className="text-emerald-600" />
                        )}
                        {(address.addressType === 'Office' || address.addressType === 'OFFICE') && (
                          <Briefcase size={16} className="text-blue-600" />
                        )}
                        <span className="text-sm font-bold text-slate-700">
                          {getAddressTypeLabel(address.addressType || 'Home')}
                        </span>
                      </div>
                      {address.isPrimary && (
                        <Badge variant="success" className="px-2 py-0.5 text-xs">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {address.addressLine1}
                      {address.addressLine2 && <>, {address.addressLine2}</>}
                      <br />
                      {address.city}, {address.district}
                      <br />
                      {address.state} - {address.pinCode}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Allergies */}
          {patient.allergies && patient.allergies.length > 0 && (
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-rose-50 to-red-50 px-6 py-4 border-b border-rose-100">
                <h3 className="text-sm font-black text-rose-900 uppercase tracking-wider flex items-center gap-2">
                  <Heart size={16} />
                  Allergies ({patient.allergies.length})
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {patient.allergies.map((allergy, index) => (
                  <div
                    key={allergy.id || index}
                    className="p-4 rounded-xl bg-rose-50 border border-rose-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-base font-bold text-slate-900">{allergy.allergyName}</p>
                      <Badge className={`px-2 py-1 border ${getSeverityColor(allergy.severity)}`}>
                        {allergy.severity}
                      </Badge>
                    </div>
                    {allergy.remarks && (
                      <p className="text-sm text-slate-600 italic">Remarks: {allergy.remarks}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Medical & Additional Info */}
        <div className="space-y-6">
          {/* Medical Information */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
              <h3 className="text-sm font-black text-teal-900 uppercase tracking-wider flex items-center gap-2">
                <Stethoscope size={16} />
                Medical Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Patient Category</p>
                <Badge className={`px-3 py-2 border ${getCategoryColor(patient.patientCategory)} text-sm`}>
                  {getCategoryLabel(patient.patientCategory)}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Blood Group</p>
                <div className="flex items-center gap-2">
                  <Droplet size={20} className="text-rose-500" />
                  <p className="text-xl font-black text-slate-900">{getBloodGroupLabel(patient.bloodGroup)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Referral & Insurance */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
              <h3 className="text-sm font-black text-amber-900 uppercase tracking-wider flex items-center gap-2">
                <Building size={16} />
                Referral & Insurance
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {patient.referringDoctorId && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Referring Doctor</p>
                  <p className="text-sm font-bold text-slate-900">Doctor ID: {patient.referringDoctorId}</p>
                </div>
              )}
              
              {patient.insuranceCompany && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Insurance Company</p>
                  <p className="text-sm font-bold text-slate-900">{patient.insuranceCompany}</p>
                </div>
              )}
              
              {patient.insurancePolicyNo && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Policy Number</p>
                  <p className="text-sm font-bold text-slate-900 font-mono">{patient.insurancePolicyNo}</p>
                </div>
              )}
            </div>
          </section>

          {/* Report Settings */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-indigo-100">
              <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} />
                Report Settings
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Report Language</p>
                <p className="text-sm font-bold text-slate-900">{patient.reportLanguage || 'ENGLISH'}</p>
              </div>
              
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp Notifications</p>
                <p className="text-sm font-bold text-slate-900">
                  {patient.whatsappConsent === 'YES' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </section>

          {/* System Information */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock size={16} />
                System Information
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {patient.createdAt && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Created At</p>
                  <p className="text-xs text-slate-700">{formatDate(patient.createdAt)}</p>
                </div>
              )}
              {patient.updatedAt && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="text-xs text-slate-700">{formatDate(patient.updatedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Clinic ID</p>
                <p className="text-xs text-slate-700 font-mono">{patient.clinicId}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Need to import MessageSquare
import { MessageSquare } from 'lucide-react';

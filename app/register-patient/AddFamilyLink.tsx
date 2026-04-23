'use client';

import { useState, useRef } from 'react';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import { createFamilyLink } from '../Apis/Patients/family-link';
import { searchPatientsByType } from '../Apis/Patients/Patient_Service_API';



interface FamilyLinkFormData {
  patientId: number;
  patientName: string;
  familyMemberId: number;
  familyMemberName: string;
  relation: string;
}

interface AddFamilyLinkProps {
  patientId?: number;
  patientName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface FormErrors {
  patientId?: string;
  patientName?: string;
  familyMemberId?: string;
  familyMemberName?: string;
  relation?: string;
}

// Relation types
const RELATION_OPTIONS = [
  'Father',
  'Mother',
  'Spouse',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Guardian',
  'Other'
] as const;

export default function AddFamilyLink({ patientId, patientName, isOpen, onClose, onSuccess }: AddFamilyLinkProps) {
  const [formData, setFormData] = useState<FamilyLinkFormData>({
    patientId: patientId || 0,
    patientName: patientName || '',
    familyMemberId: 0,
    familyMemberName: '',
    relation: 'Father',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  // Patient search state
  const [patientSearchResults, setPatientSearchResults] = useState<Array<{id: number, firstName: string, lastName: string, patientCode: string, mobilePrimary: string, email?: string}>>([]);
  const [isSearchingPatients, setIsSearchingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [searchType, setSearchType] = useState<'NAME' | 'MOBILE' | 'EMAIL'>('NAME');

  // ─── Validation ──────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patientId || formData.patientId <= 0) {
      newErrors.patientId = 'Patient ID is required';
    }

    if (!formData.patientName?.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.familyMemberId || formData.familyMemberId <= 0) {
      newErrors.familyMemberId = 'Family member ID is required';
    }

    if (!formData.familyMemberName?.trim()) {
      newErrors.familyMemberName = 'Family member name is required';
    }

    if (!formData.relation?.trim()) {
      newErrors.relation = 'Relation is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handle Patient Search ─────────────────────────────────────────────
  const handlePatientSearch = async (searchTerm: string) => {
    handleChange('patientName', searchTerm);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchTerm.trim() || searchTerm.length < 2) {
      setPatientSearchResults([]);
      setShowPatientDropdown(false);
      return;
    }

    setShowPatientDropdown(true);
    setIsSearchingPatients(true);

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // Use the new search by type API
        const response = await searchPatientsByType(searchType, searchTerm, 0, 10);
        if (response.data && response.data.content && Array.isArray(response.data.content)) {
          setPatientSearchResults(response.data.content.map(p => ({
            id: p.id!,
            firstName: p.firstName,
            lastName: p.lastName,
            patientCode: p.patientCode,
            mobilePrimary: p.mobilePrimary || ''
          })));
        }
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearchingPatients(false);
      }
    }, 300);
  };

  // ─── Handle Patient Selection ──────────────────────────────────────────
  const handlePatientSelect = (patient: {id: number, firstName: string, lastName: string, patientCode: string, mobilePrimary: string, email?: string}) => {
    setFormData(prev => ({
      ...prev,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`
    }));
    setShowPatientDropdown(false);
    setPatientSearchResults([]);
    if (errors.patientName) {
      setErrors(prev => ({ ...prev, patientName: undefined }));
    }
  };

  // ─── Handle Input Change ─────────────────────────────────────────────────
  const handleChange = (field: keyof FamilyLinkFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // ─── Handle Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      console.log('📤 Creating family link:', formData);

      // Use the API service
      const responseData = await createFamilyLink({
        patientId: formData.patientId,
        patientName: formData.patientName,
        familyMemberId: formData.familyMemberId,
        familyMemberName: formData.familyMemberName,
        relation: formData.relation,
      });

      console.log('✅ Family link created:', responseData);

      setSubmitSuccess(responseData.message || 'Family link created successfully');
      
      // Notify parent component
      onSuccess(responseData.message || 'Family link created successfully');
      
      // Close modal after delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('❌ Error creating family link:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create family link');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Error Alert ─────────────────────────────────────────────────────────
  const ErrorAlert = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-900">Error</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
    </div>
  );

  // ─── Success Alert ───────────────────────────────────────────────────────
  const SuccessAlert = ({ message }: { message: string }) => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-emerald-900">{message}</p>
      </div>
    </div>
  );

  // ─── Render Drawer Content ─────────────────────────────────────────────
  const renderContent = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Alerts */}
      {submitError && <ErrorAlert message={submitError} />}
      {submitSuccess && <SuccessAlert message={submitSuccess} />}

      {/* ─── Patient Information ─────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1 h-4 bg-emerald-500 rounded-full"></div>
          Patient Information
        </h3>

        <div className="space-y-4">
         
    

          {/* Patient Name - Search Input */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Patient Name <span className="text-red-500">*</span>
              </label>
              {/* Search Type Toggle */}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  type="button"
                  onClick={() => setSearchType('NAME')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    searchType === 'NAME'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  NAME
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('MOBILE')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    searchType === 'MOBILE'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  MOBILE
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('EMAIL')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                    searchType === 'EMAIL'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  EMAIL
                </button>
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => handlePatientSearch(e.target.value)}
                onFocus={() => patientSearchResults.length > 0 && setShowPatientDropdown(true)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.patientName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all pr-10`}
                placeholder={
                  searchType === 'NAME' ? "Search patient by name..." :
                  searchType === 'MOBILE' ? "Search patient by mobile number..." :
                  "Search patient by email..."
                }
              />
              {isSearchingPatients && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Patient Dropdown */}
            {showPatientDropdown && patientSearchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {patientSearchResults.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => handlePatientSelect(patient)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          ID: {patient.id} | Code: {patient.patientCode}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {patient.mobilePrimary && (
                            <span className="text-xs text-slate-500">
                              📞 {patient.mobilePrimary}
                            </span>
                          )}
                          {patient.email && (
                            <span className="text-xs text-slate-500">
                              ✉️ {patient.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-emerald-600 font-bold">
                        Select
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {errors.patientName && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.patientName}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Divider ─────────────────────────────────────────────────── */}
      <div className="border-t border-slate-200"></div>

      {/* ─── Family Member Information ───────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
          Family Member Information
        </h3>

        <div className="space-y-4">
          {/* Family Member ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Family Member ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.familyMemberId || ''}
              onChange={(e) => handleChange('familyMemberId', parseInt(e.target.value) || 0)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.familyMemberId ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
              } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              placeholder="Enter family member ID"
            />
            {errors.familyMemberId && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.familyMemberId}</p>
            )}
          </div>

          {/* Family Member Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Family Member Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.familyMemberName}
              onChange={(e) => handleChange('familyMemberName', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.familyMemberName ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
              } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
              placeholder="Enter family member name"
            />
            {errors.familyMemberName && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.familyMemberName}</p>
            )}
          </div>

          {/* Relation */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Relation <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.relation}
              onChange={(e) => handleChange('relation', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.relation ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
              } text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
            >
              {RELATION_OPTIONS.map((relation) => (
                <option key={relation} value={relation}>
                  {relation}
                </option>
              ))}
            </select>
            {errors.relation && (
              <p className="text-xs text-red-600 mt-1.5 font-medium">{errors.relation}</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Action Buttons ──────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-sm hover:shadow-md transition-all ${
            isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:from-emerald-600 hover:to-teal-700'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={16} />
              Create Family Link
            </span>
          )}
        </button>
      </div>
    </form>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Family Link"
      description="Connect patient with family member"
      maxWidth="md"
    >
      {renderContent()}
    </RightDrawer>
  );
}

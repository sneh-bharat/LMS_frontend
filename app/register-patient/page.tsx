'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Edit2,
  Shield,
  Zap,
  ChevronDown,
  X,
  UserPlus,
  MoreVertical,
  Database,
  ArrowRightCircle,
  Loader,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  Activity
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import RegistrationModal from './AddPatient';

// ─── Data Types ──────────────────────────────────────────────────────────────
interface Patient {
  id: number;
  uhid: number;
  patientCode?: string;
  title: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  age?: string;
  branch?: string;
  gender: string;
  contact: string;
  email?: string;
  country?: string;
  mobile: string;
  mobileAlternate?: string;
  nationality?: string;
  abhaId?: string;
  docType?: string;
  docNumber?: string;
  bloodGroup?: string;
  patientCategory?: string;
  isActive: boolean;
  referringDoctorId?: number;
  photoUrl?: string;
}

const SAMPLE_PATIENTS: Patient[] = [
  { 
    id: 1, 
    uhid: 69, 
    patientCode: 'P001',
    title: 'Dr.', 
    firstName: 'Mohib',
    middleName: 'Ahmed',
    lastName: 'Khan', 
    dateOfBirth: '1974-01-01',
    age: '50 Y',
    branch: 'Customer Support', 
    gender: 'MALE', 
    contact: '+(91)9934362019', 
    email: 'mohib@example.com',
    country: 'IND +91', 
    mobile: '9934362019', 
    mobileAlternate: '9934362020',
    nationality: 'IND-India', 
    abhaId: 'ABHA123456789',
    bloodGroup: 'O_POS',
    patientCategory: 'GENERAL',
    isActive: true,
  },
  { 
    id: 2, 
    uhid: 65, 
    patientCode: 'P002',
    title: 'Ms.', 
    firstName: 'Srabanti',
    lastName: 'Dash', 
    dateOfBirth: '1980-02-05',
    age: '44 Y',
    branch: 'Quality Assurance', 
    gender: 'FEMALE', 
    contact: '+(91)8617269047', 
    email: 'srabanti@example.com',
    country: 'IND +91', 
    mobile: '8617269047', 
    nationality: 'IND-India', 
    bloodGroup: 'A_POS',
    patientCategory: 'TPA',
    isActive: true,
  },
  { 
    id: 3, 
    uhid: 63, 
    patientCode: 'P003',
    title: 'Mr.', 
    firstName: 'Saber',
    lastName: 'Khan', 
    dateOfBirth: '1979-03-10',
    age: '45 Y',
    branch: 'Internal Medicine', 
    gender: 'MALE', 
    contact: '+(91)9848834451', 
    country: 'IND +91', 
    mobile: '9848834451', 
    nationality: 'IND-India', 
    bloodGroup: 'B_POS',
    patientCategory: 'CASH',
    isActive: true,
  },
];

interface PaginationState {
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

// ─── Alert Components ───────────────────────────────────────────────────────

function ErrorAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-900">Error</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 flex-shrink-0 transition-colors"
        aria-label="Dismiss error alert"
      >
        ✕
      </button>
    </div>
  );
}

function SuccessAlert({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <CheckCircle2 className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
      <div className="flex-1">
        <p className="text-sm font-semibold text-emerald-900">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-emerald-400 hover:text-emerald-600 flex-shrink-0 transition-colors"
        aria-label="Dismiss success alert"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FindRegisterPatientPage() {
  const [patients, setPatients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [regOpen, setRegOpen] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageNo: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: SAMPLE_PATIENTS.length,
  });
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    error: null,
    success: null,
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadPatients();
  }, [pagination.pageNo, pagination.pageSize, search, catFilter]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const loadPatients = async () => {
    setLoading({ isLoading: true, error: null, success: null });
    try {
      // Simulating API call - replace with actual fetchPatients API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPatients(SAMPLE_PATIENTS);
      setPagination({
        pageNo: 0,
        pageSize: 10,
        totalPages: 1,
        totalElements: SAMPLE_PATIENTS.length,
      });
      setLoading({ isLoading: false, error: null, success: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load patients';
      setLoading({
        isLoading: false,
        error: errorMessage,
        success: null,
      });
    }
  };

  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPagination(prev => ({ ...prev, pageNo: 0 }));
  }, []);

  const handlePrevPage = () => {
    if (pagination.pageNo > 0) {
      setPagination(prev => ({ ...prev, pageNo: prev.pageNo - 1 }));
    }
  };

  const handleNextPage = () => {
    if (pagination.pageNo < pagination.totalPages - 1) {
      setPagination(prev => ({ ...prev, pageNo: prev.pageNo + 1 }));
    }
  };

  const getCategories = (): string[] => {
    const categories = new Set<string>();
    categories.add('All');
    patients.forEach(patient => {
      if (patient.patientCategory) {
        categories.add(patient.patientCategory);
      }
    });
    return Array.from(categories);
  };

  const categories = getCategories();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <RegistrationModal isOpen={regOpen} onClose={() => setRegOpen(false)} />

      {/* ═══ ALERTS ═════════════════════════════════════════════ */}
      <div className="space-y-3">
        {loading.error && (
          <ErrorAlert
            message={loading.error}
            onDismiss={() => setLoading(prev => ({ ...prev, error: null }))}
          />
        )}
        {loading.success && (
          <SuccessAlert
            message={loading.success}
            onDismiss={() => setLoading(prev => ({ ...prev, success: null }))}
          />
        )}
      </div>

      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Patient <span className="text-emerald-600">Registry</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Universal master index for patient health records and histories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6">
            <LayoutGrid size={16} /> Patient View
          </Button>
          <Button 
            variant="gradient" 
            size="sm" 
            onClick={() => setRegOpen(true)}
            className="gap-2 shadow-sm px-8"
          >
            <UserPlus size={16} /> New Registration
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by UHID, patient name, or code..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search patients by name, UHID, or code"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Filter patients by category"
            >
              {categories.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* ═══ LOADING STATE ═══════════════════════════════════════ */}
      {loading.isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="text-slate-400 animate-spin" size={32} />
          <p className="text-slate-600 font-medium">Loading patient records...</p>
        </div>
      ) : (
        <>
          {/* ═══ PATIENTS TABLE ══════════════════════════════════════ */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Patient Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      UHID / Code
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Date of Birth
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Category
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {patients.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors text-sm">
                              {p.title} {p.firstName} {p.middleName || ''} {p.lastName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.isActive && (
                                <Badge variant="success" className="px-1 text-[8px] tracking-tight">
                                  Active
                                </Badge>
                              )}
                              {p.bloodGroup && (
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  Blood: {p.bloodGroup.replace('_', '+')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[9px] font-bold uppercase">
                            UHID: {p.uhid}
                          </Badge>
                          {p.patientCode && (
                            <div className="text-[10px] font-mono text-slate-500 font-bold">
                              {p.patientCode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs ${
                          p.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 
                          p.gender === 'FEMALE' ? 'bg-rose-50 text-rose-600' : 
                          'bg-purple-50 text-purple-600'
                        }`}>
                          {p.gender.charAt(0)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold font-mono">
                          <CalendarIcon size={12} className="text-slate-300" />
                          {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-IN') : p.age || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                            <Phone size={10} className="text-emerald-500" />
                            {p.contact || p.mobile}
                          </div>
                          {p.email && (
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[10px] italic">
                              <Mail size={10} />
                              {p.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {p.patientCategory ? (
                          <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[10px] font-bold uppercase">
                            {p.patientCategory}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Edit Patient"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                            title="More actions"
                          >
                            <MoreVertical size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ═══ FOOTER / PAGINATION ═════════════════════════════════════ */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                    {pagination.totalElements} Patient Records
                  </span>
                </div>
                <div className="hidden xl:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Database size={12} /> System Resilience High
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={pagination.pageNo === 0}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-600">
                  Page {pagination.pageNo + 1} of {pagination.totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pagination.pageNo >= pagination.totalPages - 1}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-emerald-50 rounded-[2.5rem] p-8 flex items-center justify-between border border-emerald-100 shadow-xl shadow-green-500/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
            <Activity size={24} />
          </div>
          <p className="text-xs font-black text-emerald-900 uppercase tracking-tight italic">
            Patient master indexing active. Real-time synchronization enabled.
          </p>
        </div>
        <Badge variant="success" className="px-5 py-2">System Optimal</Badge>
      </div>
    </div>
  );
}
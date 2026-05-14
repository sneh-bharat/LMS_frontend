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
  Trash2,
  Database,
  ArrowRightCircle,
  Loader,
  Filter,
  Settings,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  Activity,
  RefreshCw,
  Link2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { AddPatient } from './AddPatient';
import { EditPatient } from './EditPatient';

import { PatientDetails } from './PatientDetails';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import { fetchPatients, Patient, ApiResponse, PaginatedResponse, fetchPatientById, deletePatient } from '../Apis/Patients/Patient_Service_API';

// ─── Data Types ──────────────────────────────────────────────────────────────
interface PatientListState {
  patients: Patient[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  loading: {
    isLoading: boolean;
    error: string | null;
    success: string | null;
  };
  filters: {
    search: string;
    category: string;
  };
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

// ─── Empty State Component ──────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
        <User className="text-slate-400" size={32} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-slate-900 font-semibold text-lg">No Patients Found</p>
        <p className="text-slate-500 text-sm max-w-sm">
          Try adjusting your search criteria or filters to find patient records.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function FindRegisterPatientPage() {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [patientIdToDelete, setPatientIdToDelete] = useState<number | null>(null);
  const [state, setState] = useState<PatientListState>({
    patients: [],
    pagination: {
      pageNo: 0,
      pageSize: 10,
      totalPages: 0,
      totalElements: 0,
    },
    loading: {
      isLoading: true,
      error: null,
      success: null,
    },
    filters: {
      search: '',
      category: 'All',
    },
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ─── Initial Load ────────────────────────────────────────────────────────
  useEffect(() => {
    loadPatients(0, 10, '', 'All');
  }, []);

  // ─── Load Patients from API ──────────────────────────────────────────────
  const loadPatients = useCallback(
    async (pageNo: number, pageSize: number, search: string, category: string) => {
      setState(prev => ({
        ...prev,
        loading: { isLoading: true, error: null, success: null },
      }));

      try {
        const response = await fetchPatients(
          pageNo,
          pageSize,
          search || undefined,
          category !== 'All' ? category : undefined
        );

        if (!response.data) {
          throw new Error('Invalid response from API');
        }

        const paginatedData = response.data as PaginatedResponse<Patient>;

        setState(prev => ({
          ...prev,
          patients: paginatedData.content || [],
          pagination: {
            pageNo: paginatedData.pageNo,
            pageSize: paginatedData.pageSize,
            totalPages: paginatedData.totalPages,
            totalElements: paginatedData.totalElements,
          },
          loading: {
            isLoading: false,
            error: null,
            success: null,
          },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load patients';
        toast.error(errorMessage);
        setState(prev => ({
          ...prev,
          loading: {
            isLoading: false,
            error: errorMessage,
            success: null,
          },
          patients: [],
        }));
      }
    },
    []
  );

  // ─── Handle Search ──────────────────────────────────────────────────────
  const handleSearch = useCallback(
    (searchTerm: string) => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, search: searchTerm },
      }));

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        setState(prev => {
          loadPatients(0, prev.pagination.pageSize, searchTerm, prev.filters.category);
          return prev;
        });
      }, 300);
    },
    [loadPatients]
  );

  // ─── Handle Category Filter ──────────────────────────────────────────────
  const handleCategoryFilter = useCallback(
    (category: string) => {
      setState(prev => ({
        ...prev,
        filters: { ...prev.filters, category },
      }));

      setState(prev => {
        loadPatients(0, prev.pagination.pageSize, prev.filters.search, category);
        return prev;
      });
    },
    [loadPatients]
  );

  // ─── Pagination Handlers ────────────────────────────────────────────────
  const handlePrevPage = useCallback(() => {
    if (state.pagination.pageNo > 0) {
      const newPageNo = state.pagination.pageNo - 1;
      loadPatients(newPageNo, state.pagination.pageSize, state.filters.search, state.filters.category);
    }
  }, [state, loadPatients]);

  const handleNextPage = useCallback(() => {
    if (state.pagination.pageNo < state.pagination.totalPages - 1) {
      const newPageNo = state.pagination.pageNo + 1;
      loadPatients(newPageNo, state.pagination.pageSize, state.filters.search, state.filters.category);
    }
  }, [state, loadPatients]);

  // ─── Retry Load ─────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    loadPatients(state.pagination.pageNo, state.pagination.pageSize, state.filters.search, state.filters.category);
  }, [state, loadPatients]);

  // ─── Get Unique Categories ──────────────────────────────────────────────
  const categories = useCallback(() => {
    const categorySet = new Set<string>();
    categorySet.add('All');
    state.patients.forEach(patient => {
      if (patient.patientCategory) {
        categorySet.add(patient.patientCategory);
      }
    });
    return Array.from(categorySet);
  }, [state.patients]);

  const categoryList = categories();

  // ─── Cleanup ────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ─── Handle Edit Patient ─────────────────────────────────────────────────
  const handleEditPatient = useCallback((patient: Patient) => {
    if (patient.id) {
      setEditingPatientId(patient.id);
      setIsEditModalOpen(true);
    }
  }, []);

  // ─── Handle Close Modal ──────────────────────────────────────────────────
  const handleCloseRegistration = useCallback(() => {
    setIsRegistrationModalOpen(false);
    loadPatients(state.pagination.pageNo, 10, '', 'All');
  }, [loadPatients, state.pagination.pageNo]);

  const handleCloseEdit = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingPatientId(null);
    loadPatients(state.pagination.pageNo, 10, '', 'All');
  }, [loadPatients, state.pagination.pageNo]);

  // ─── Handle View Details ────────────────────────────────────────────────
  const handleViewDetails = async (patientId: number) => {
    try {
      const response = await fetchPatientById(patientId);
      if (response?.data) {
        setSelectedPatientForDetails(response.data);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      toast.error('Failed to fetch patient details');
      console.error('Error fetching patient details:', error);
    }
  };

  // ─── Handle Delete Patient ──────────────────────────────────────────────
  const handleDeletePatient = async (patientId: number) => {
    setPatientIdToDelete(patientId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientIdToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deletePatient(patientIdToDelete);
      if (response.response === true || response.code === 200 || response.code === 204 || (!response.code && response.data === null)) {
        toast.success('Patient record deleted successfully');
        setIsDetailsOpen(false);
        setIsDeleteConfirmOpen(false);
        loadPatients(state.pagination.pageNo, state.pagination.pageSize, state.filters.search, state.filters.category);
      } else {
        throw new Error(response.message || 'Deletion failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete patient';
      toast.error(errorMessage);
      console.error('Error deleting patient:', error);
    } finally {
      setIsDeleting(false);
      setPatientIdToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AddPatient
        isOpen={isRegistrationModalOpen}
        onClose={handleCloseRegistration}
      />

      <EditPatient
        isOpen={isEditModalOpen}
        onClose={handleCloseEdit}
        patientId={editingPatientId}
      />

      <DeleteAlertDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />

      <PatientDetails
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedPatientForDetails(null);
        }}
        patient={selectedPatientForDetails}
        onDelete={handleDeletePatient}
      />

      {/* ═══ ALERTS ═════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {state.loading.error && (
          <ErrorAlert
            message={state.loading.error}
            onDismiss={() =>
              setState(prev => ({
                ...prev,
                loading: { ...prev.loading, error: null },
              }))
            }
          />
        )}
        {state.loading.success && (
          <SuccessAlert
            message={state.loading.success}
            onDismiss={() =>
              setState(prev => ({
                ...prev,
                loading: { ...prev.loading, success: null },
              }))
            }
          />
        )}
      </div>

      {/* ═══ HEADER ═════════════════════════════════════════════════════════ */}
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
            className="gap-2 shadow-sm px-8"
            onClick={() => setIsRegistrationModalOpen(true)}
          >
            <UserPlus size={16} /> New Registration
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            value={state.filters.search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by patient name, UHID, or code..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search patients by name, UHID, or code"
            disabled={state.loading.isLoading}
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={state.filters.category}
              onChange={e => handleCategoryFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Filter patients by category"
              disabled={state.loading.isLoading}
            >
              {categoryList.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200"
            onClick={handleRetry}
            disabled={state.loading.isLoading}
            title="Refresh patient list"
          >
            <RefreshCw size={18} className={state.loading.isLoading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* ═══ LOADING STATE ═══════════════════════════════════════════════════ */}
      {state.loading.isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="text-slate-400 animate-spin" size={32} />
          <p className="text-slate-600 font-medium">Loading patient records...</p>
        </div>
      ) : state.patients.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ═══ PATIENTS TABLE ══════════════════════════════════════════════ */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Patient Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Code / ID
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
                  {state.patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                            <User size={20} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors text-sm">
                              {patient.firstName} {patient.middleName || ''} {patient.lastName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {patient.isActive && (
                                <Badge variant="success" className="px-1 text-[8px] tracking-tight">
                                  Active
                                </Badge>
                              )}
                              {patient.bloodGroup && (
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                  Blood: {patient.bloodGroup.replace('_', '+')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[9px] font-bold uppercase">
                            ID: {patient.id}
                          </Badge>
                          {patient.patientCode && (
                            <div className="text-[10px] font-mono text-slate-500 font-bold">
                              {patient.patientCode}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs ${patient.gender === 'MALE' ? 'bg-blue-50 text-blue-600' :
                          patient.gender === 'FEMALE' ? 'bg-rose-50 text-rose-600' :
                            'bg-purple-50 text-purple-600'
                          }`}>
                          {patient.gender?.charAt(0) || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold font-mono">
                          <CalendarIcon size={12} className="text-slate-300" />
                          {patient.dateOfBirth
                            ? new Date(patient.dateOfBirth).toLocaleDateString('en-IN')
                            : 'N/A'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                            <Phone size={10} className="text-emerald-500" />
                            {patient.mobilePrimary}
                          </div>
                          {patient.email && (
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[10px] italic">
                              <Mail size={10} />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {patient.patientCategory ? (
                          <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[10px] font-bold uppercase">
                            {patient.patientCategory}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                            title="View Details"
                            onClick={() => patient.id && handleViewDetails(patient.id)}
                          >
                            <ArrowRightCircle size={14} />
                          </Button>
                          <Button
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Edit Patient"
                            onClick={() => handleEditPatient(patient)}
                          >
                            <Edit2 size={14} />
                          </Button>
                          {patient.id ? (
                            <Link
                              href={`/patient-family-link?patientId=${patient.id}`}
                              className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all inline-flex items-center justify-center"
                              title="Family links by patient ID"
                              aria-label="Family links by patient ID"
                            >
                              <Link2 size={14} />
                            </Link>
                          ) : null}
                          <Button
                            className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Delete Patient"
                            onClick={() => patient.id && handleDeletePatient(patient.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 size={14} />
                          </Button>
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
                    {state.pagination.totalElements} Patient Records
                  </span>
                </div>
                <div className="hidden xl:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Database size={12} /> System Resilience High
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevPage}
                  disabled={state.pagination.pageNo === 0 || state.loading.isLoading}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-600">
                  Page {state.pagination.pageNo + 1} of {state.pagination.totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={state.pagination.pageNo >= state.pagination.totalPages - 1 || state.loading.isLoading}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ STATUS BANNER ═════════════════════════════════════════════════ */}
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
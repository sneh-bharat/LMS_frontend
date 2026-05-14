'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  CreditCard,
  Zap,
  LayoutGrid,
  ChevronDown,
  AlertCircle,
  Loader,
  FlaskConical,
  Activity,
  Check,
  X
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Input from '@/components/ui/input';
import NewTest from './NewTest';
import PackageDetailsView from './PackageDetailsView';
import {
  fetchTestPackages,
  createTestPackage,
  updateTestPackage,
  deleteTestPackage,
  TestPackage as ApiTestPackage,
  CreateTestPackageInput,
  UpdateTestPackageInput,
  TestPackageDetail,
  fetchTestPackageById,
 
} from '@/app/Apis/lab/TestPackage';

// ─── Data Types ──────────────────────────────────────────────────────────────

interface TestItem {
  testId: number;
  testName: string;
  testCode: string;
  category: string;
  discount: number;
  isMandatory?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface TestPackage extends ApiTestPackage {
  tests?: TestItem[];
}

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

// ─── Delete Confirmation Dialog ──────────────────────────────────────────────

function DeleteConfirmationDialog({
  isOpen,
  packageName,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  packageName: string;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  console.log('🗑️ Delete confirmation dialog shown for:', packageName);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Trash2 className="text-rose-600" size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Package?</h3>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">{packageName}</strong>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isDeleting && <Loader size={14} className="animate-spin" />}
            {isDeleting ? 'Deleting...' : 'Delete Package'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Package Actions Component ───────────────────────────────────────────────

function PackageActions({
  pkg,
  onEdit,
  onDelete,
  onViewDetails,
}: {
  pkg: TestPackage;
  onEdit: (pkg: TestPackage) => void;
  onDelete: (pkg: TestPackage) => Promise<void>;
  onViewDetails: (pkg: TestPackage) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleDelete = async () => {
    console.log('=== PACKAGE ACTIONS: HANDLE DELETE ===');
    console.log('Package:', pkg.packageName, 'ID:', pkg.id);
    
    setIsDeleting(true);
    try {
      await onDelete(pkg);
      setShowMoreMenu(false);
      setShowConfirmDelete(false);
      console.log('✅ Delete flow completed successfully');
    } catch (error) {
      console.error('❌ Delete flow failed:', error);
      setIsDeleting(false);
    }
  };

  const handleApprove = () => {
    console.log('Approve package:', pkg.packageName);
    // Add approve logic here
  };

  const handleReject = () => {
    console.log('Reject package:', pkg.packageName);
    // Add reject logic here
  };

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        {/* Edit Button */}
        <button
          onClick={() => onEdit(pkg)}
          className="p-2 hover:bg-blue-50 rounded-lg transition-all text-slate-400 hover:text-blue-600"
          title="Edit Package"
          aria-label="Edit package"
        >
          <Edit2 size={18} />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => {
            console.log('🗑️ Delete button clicked for:', pkg.packageName);
            setShowConfirmDelete(true);
          }}
          className="p-2 hover:bg-rose-50 rounded-lg transition-all text-slate-400 hover:text-rose-600"
          title="Delete Package"
          aria-label="Delete package"
        >
          <Trash2 size={18} />
        </button>

        {/* More Options Button */}
        <div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-600"
            title="More Options"
            aria-label="More package actions"
            aria-expanded={showMoreMenu}
          >
            <MoreHorizontal size={18} />
          </button>
          
          {showMoreMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    onViewDetails(pkg);
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Package size={14} /> View Details
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showConfirmDelete}
        packageName={pkg.packageName}
        isDeleting={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowConfirmDelete(false);
          setIsDeleting(false);
        }}
      />
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function TestPackagePage() {
  // State Management
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null);
  const [isFetchingPackage, setIsFetchingPackage] = useState(false);
  const [viewingPackage, setViewingPackage] = useState<TestPackageDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    pageNo: 0,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: true,
    error: null,
    success: null,
  });

  // Ref for debounce timeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // ─── Effects ────────────────────────────────────────────────────────────

  // ✅ FIX: Load packages when pageNo, pageSize, search, or category changes
  useEffect(() => {
    loadPackages();
  }, [pagination.pageNo, pagination.pageSize, search, catFilter]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ─── API Functions ──────────────────────────────────────────────────────

  const loadPackages = async () => {
    setLoading({ isLoading: true, error: null, success: null });
    try {
      // ✅ FIX: Pass all filter parameters to API
      const response = await fetchTestPackages(
        pagination.pageNo,
        pagination.pageSize,
        search || undefined,
        catFilter === 'All' ? undefined : catFilter
      );

      if (response.data?.content) {
        setPackages(response.data.content as TestPackage[]);
        setPagination({
          pageNo: response.data.pageNo,
          pageSize: response.data.pageSize,
          totalPages: response.data.totalPages,
          totalElements: response.data.totalElements,
        });
      }
      setLoading({ isLoading: false, error: null, success: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load packages';
      setLoading({
        isLoading: false,
        error: errorMessage,
        success: null,
      });
    }
  };

  // ✅ FIX: Debounced search handler
  const handleSearch = useCallback((searchTerm: string) => {
    setSearch(searchTerm);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Reset to first page on search
    setPagination(prev => ({ ...prev, pageNo: 0 }));
  }, []);

  const handleEdit = async (pkg: TestPackage) => {
    setIsFetchingPackage(true);
    setEditingPackage(null);
    setIsModalOpen(true);

    if (pkg.id) {
      try {
        const response = await fetchTestPackageById(pkg.id);

        // ✅ FIX: Use properly transformed response data
        const packageData = response.data;

        if (packageData) {
          setEditingPackage({
            id: packageData.id,
            packageCode: packageData.packageCode,
            packageName: packageData.packageName,
            description: packageData.description,
            packagePrice: packageData.packagePrice,
            specialInstructions: packageData.specialInstructions,
            isActive: packageData.isActive,
            tests: packageData.tests?.map(t => ({
              testId: t.testId,
              testName: t.testName,
              testCode: t.testCode,
              category: t.category,
              discount: t.discount || 0,
            })),
          });
        } else {
          throw new Error('Failed to transform package data');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load package details';
        setLoading({
          isLoading: false,
          error: errorMessage,
          success: null,
        });
        // Fallback to current data
        setEditingPackage(pkg);
      } finally {
        setIsFetchingPackage(false);
      }
    } else {
      setEditingPackage(pkg);
      setIsFetchingPackage(false);
    }
  };

  const handleViewDetails = async (pkg: TestPackage) => {
    setIsFetchingDetails(true);
    setViewingPackage(null);
    setIsDetailsOpen(true);

    if (pkg.id) {
      try {
        const response = await fetchTestPackageById(pkg.id);
        setViewingPackage(response.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load package details';
        setLoading({
          isLoading: false,
          error: errorMessage,
          success: null,
        });
      } finally {
        setIsFetchingDetails(false);
      }
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setViewingPackage(null);
  };

  // ✅ FIX: Better error handling and cleanup with proper delete flow
  const handleDelete = async (pkg: TestPackage) => {
    if (!pkg.id) {
      console.error('❌ Cannot delete package: No ID provided');
      return;
    }

    console.log('=== DELETE PACKAGE ===');
    console.log('Package ID:', pkg.id);
    console.log('Package Name:', pkg.packageName);

    const previousPackages = [...packages];
    const previousPagination = { ...pagination };

    try {
      // Optimistic update - remove from UI immediately
      setPackages(packages.filter(p => p.id !== pkg.id));
      
      // Update pagination if needed
      const newTotalElements = Math.max(0, previousPagination.totalElements - 1);
      const newTotalPages = Math.max(1, Math.ceil(newTotalElements / pagination.pageSize));
      
      setPagination(prev => ({
        ...prev,
        totalElements: newTotalElements,
        totalPages: newTotalPages,
      }));

      console.log('🗑️ Calling delete API for package:', pkg.id);
      
      // Call delete API
      await deleteTestPackage(pkg.id);

      console.log('✅ Package deleted successfully from backend');

      // Show success message
      setLoading({
        isLoading: false,
        error: null,
        success: `Package "${pkg.packageName}" deleted successfully!`,
      });

      // Reload packages to ensure data consistency
      console.log('🔄 Reloading packages to sync with backend...');
      await loadPackages();

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setLoading(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error) {
      console.error('❌ Failed to delete package:', error);
      
      // Rollback optimistic update
      console.log('↩️ Rolling back to previous state...');
      setPackages(previousPackages);
      setPagination(previousPagination);

      const errorMessage = error instanceof Error ? error.message : 'Failed to delete package';
      setLoading({
        isLoading: false,
        error: `Failed to delete package: ${errorMessage}`,
        success: null,
      });
    }
  };

  // ✅ FIX: Better error handling and cleanup
  const handleNewTestSubmit = async (
    newPackageData: CreateTestPackageInput | UpdateTestPackageInput
  ) => {
    try {
      if (editingPackage && editingPackage.id) {
        await updateTestPackage(editingPackage.id, newPackageData as UpdateTestPackageInput);
        setLoading({
          isLoading: false,
          error: null,
          success: 'Package updated successfully!',
        });
      } else {
        await createTestPackage(newPackageData as CreateTestPackageInput);
        setLoading({
          isLoading: false,
          error: null,
          success: 'Package created successfully!',
        });
      }

      // Reload packages
      await loadPackages();
      handleCloseModal();

      // Auto-dismiss success message
      setTimeout(() => {
        setLoading(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save package';
      setLoading({
        isLoading: false,
        error: errorMessage,
        success: null,
      });
      // Keep modal open on error
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

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

  // Get unique categories from loaded packages
  const getCategories = (): string[] => {
    const categories = new Set<string>();
    categories.add('All');
    packages.forEach(pkg => {
      pkg.tests?.forEach(test => {
        if (test.category) categories.add(test.category);
      });
    });
    return Array.from(categories);
  };

  const categories = getCategories();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
            Test <span className="text-[#FF671F]">Packages</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage diagnostic test packages and bundled offerings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6">
            <LayoutGrid size={16} /> Package View
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => {
              setEditingPackage(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Create Package
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
            placeholder="Search packages..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search test packages by name or code"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={catFilter}
              onChange={e => setCatFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Filter packages by category"
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
          <p className="text-slate-600 font-medium">Loading test packages...</p>
        </div>
      ) : (
        <>
          {/* ═══ PACKAGES TABLE ══════════════════════════════════════ */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Code
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Package Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Tests
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Price
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.length > 0 ? (
                    packages.map(pkg => (
                      <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-300 font-mono">
                            {pkg.packageCode}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                              <Package size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5">
                                {pkg.packageName}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1">
                                {pkg.description || 'No description provided'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="primary" className="px-2 py-1 text-[10px]">
                              {pkg.tests?.length || 0} Tests
                            </Badge>
                            <div className="flex -space-x-2">
                              {pkg.tests?.slice(0, 3).map((test, idx) => (
                                <div
                                  key={test.testId || idx}
                                  className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-700"
                                  title={test.testName || 'Test'}
                                >
                                  {((test as any).testCode || (test as any).testName || '?')
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                            ₹{(pkg.packagePrice || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={pkg.isActive ? 'success' : 'secondary'}>
                            {pkg.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <PackageActions
                            pkg={pkg}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onViewDetails={handleViewDetails}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Package className="text-slate-300" size={32} />
                          <p className="text-slate-500 font-medium">No test packages found</p>
                          {(search || catFilter !== 'All') && (
                            <p className="text-xs text-slate-400">
                              Try adjusting your search or filter criteria
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ═══ FOOTER ════════════════════════════════════════ */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>
                  Showing {packages.length} of {pagination.totalElements} Packages
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                <span>
                  Total Tests: {packages.reduce((sum, pkg) => sum + (pkg.tests?.length || 0), 0)}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                <span className="text-[#FF671F]">Test Packages v2.0</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 py-1 text-[10px]"
                  onClick={handlePrevPage}
                  disabled={pagination.pageNo === 0}
                >
                  Prev
                </Button>
                <span className="px-3 py-1 text-[10px] font-bold text-slate-600">
                  {pagination.pageNo + 1} of {pagination.totalPages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="px-4 py-1 text-[10px]"
                  onClick={handleNextPage}
                  disabled={pagination.pageNo >= pagination.totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ CREATE/EDIT MODAL ════════════════════════════════════ */}
      {isModalOpen && (
        <>
          {isFetchingPackage ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
                <Loader className="text-slate-400 animate-spin" size={32} />
                <p className="text-slate-600 font-medium">Loading package details...</p>
              </div>
            </div>
          ) : (
            <NewTest
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSubmit={handleNewTestSubmit}
              editData={editingPackage as TestPackageDetail | null}
              isEditMode={!!editingPackage}
            />
          )}
        </>
      )}

      {/* ═══ PACKAGE DETAILS VIEW ═════════════════════════════════ */}
      {isDetailsOpen && (
        <>
          {isFetchingDetails ? (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4">
                <Loader className="text-slate-400 animate-spin" size={32} />
                <p className="text-slate-600 font-medium">Loading package details...</p>
              </div>
            </div>
          ) : (
            <PackageDetailsView
              isOpen={isDetailsOpen}
              onClose={handleCloseDetails}
              packageData={viewingPackage}
              onEdit={(pkg) => {
                handleEdit(pkg as any);
              }}
              onDelete={(packageId) => {
                const pkg = packages.find(p => p.id === packageId);
                if (pkg) {
                  handleDelete(pkg);
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
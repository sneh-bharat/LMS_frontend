'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  FileText,
  Database,
  Tag,
  FlaskConical,
  Activity,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import NewTest from './NewTest';
import B2BPriceConfiguration from './b2b_price';
import TestDetailsView from './TestDetailsView';
import ViewTestTemplate from './ViewTestTemplate';
import DepartmentFilter, { ALL_DEPARTMENTS_VALUE } from './department_filter';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  fetchTests,
  fetchActiveTests,
  fetchTestsByDepartment,
  searchTestsByName,
  fetchTestParameters,
  normalizeParameterForForm,
  unwrapParametersList,
  createTest,
  updateTest,
  deleteTest,
  fetchSampleRequirements,
  type Test,
  type CreateTestInput,
} from '@/app/Apis/lab/TestApis';

// ─── Data Types ──────────────────────────────────────────────────────────────
import { TestVersion, TestParameter, SampleRequirement, ReferenceRange } from './types';

// Define TestItem to match the NewTest component's local interface
type TestItem = Omit<Test, 'id' | 'testCode' | 'branchId' | 'departmentName' | 'categoryName' | 'createdAt' | 'updatedAt' | 'isCalculated'> & {
  departmentId: string;
  categoryId: string;
  method: string;
  unit: string;
  price: string;
  cghsPrice: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  isCalculated?: boolean;
  parameters: Array<{
    id?: number;
    parameterCode?: string;
    parameterName: string;
    displayOrder?: number;
    unit: string;
    decimalPlaces?: number;
    criticalLow?: number;
    criticalHigh?: number;
    isCalculated: boolean;
    resultType: string;
    calculationFormula?: string;
    referenceRanges?: Array<{
      id?: number;
      gender: string;
      ageMin: number;
      ageMax: number;
      minValue: number;
      maxValue: number;
      unit: string;
    }>;
  }>;
  sampleRequirements: Array<{
    id?: number;
    sampleType: string;
    volumeMl: number;
    containerColor: string;
    storageCondition: string;
    isMandatory?: boolean;
  }>;
};

const DEPARTMENTS = [
  { id: 1, name: 'Biochemistry' },
  { id: 2, name: 'Hematology' },
  { id: 3, name: 'Microbiology' },
  { id: 4, name: 'Pathology' },
];

const CATEGORIES_LIST = [
  { id: 5, name: 'Lipid Profile' },
  { id: 6, name: 'Liver Function' },
  { id: 7, name: 'Kidney Function' },
  { id: 8, name: 'Thyroid Profile' },
];

const CATEGORIES = ['All', 'Biochemistry', 'Hematology', 'Microbiology', 'Pathology'];

// ─── Components ───────────────────────────────────────────────────────────────
function PackageActions({
  pkg,
  onView,
  onEditSample,
  onEditParameters,
  onDelete,
  onB2BPrice,
  onTemplate,
}: {
  pkg: Test;
  onView: (pkg: Test) => void;
  onEditSample: (pkg: Test) => void;
  onEditParameters: (pkg: Test) => void;
  onDelete: (testId: number) => void;
  onB2BPrice: (pkg: Test) => void;
  onTemplate: (pkg: Test) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
        suppressHydrationWarning
      >
        <MoreHorizontal size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              onView(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
          >
            <Eye size={14} /> View Details
          </button>
          <div className="h-px bg-slate-100 my-2"></div>
          <button
            onClick={() => {
              onEditSample(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-blue-600 hover:bg-blue-50 flex items-center gap-2"
          >
            <Package size={14} /> Edit Sample
          </button>
           <button
            onClick={() => {
              onB2BPrice(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-blue-600 hover:bg-blue-50 flex items-center gap-2"
          >
            <CreditCard size={14} /> B2B Price
          </button>
          <button
            onClick={() => {
              onEditParameters(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-purple-600 hover:bg-purple-50 flex items-center gap-2"
          >
            <FlaskConical size={14} /> Edit Parameters
          </button>
          <div className="h-px bg-slate-100 my-2"></div>
          <button
            onClick={() => {
              onDelete(pkg.id);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2"
          >
            <Trash2 size={14} /> Delete Test
          </button>
          <button
            onClick={() => {
              onTemplate(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-blue-600 hover:bg-blue-50 flex items-center gap-2"
          >
            <FileText size={14} /> View Template
          </button>
        </div>
      )}
    </div>
  );
}

interface NewTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TestItem) => void;
  editData?: Test | null;
  isEditMode?: boolean;
  activeTab?: 'test' | 'sample' | 'parameters' | 'pricing';
}

export default function TestPackagePage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Test[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState(ALL_DEPARTMENTS_VALUE);
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState<'test' | 'sample' | 'parameters' | 'pricing'>('test');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsRefreshKey, setDetailsRefreshKey] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTestId, setDeletingTestId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // B2B Price Configuration drawer state
  const [isB2BDrawerOpen, setIsB2BDrawerOpen] = useState(false);
  const [selectedTestForB2B, setSelectedTestForB2B] = useState<Test | null>(null);
  const [templateViewOpen, setTemplateViewOpen] = useState(false);
  const [selectedTestForTemplate, setSelectedTestForTemplate] = useState<Test | null>(null);

  useEffect(() => {
    loadTests();
  }, [currentPage, statusFilter, departmentFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(0);
  }, [departmentFilter]);

  // Reload tests when search, currentPage, statusFilter, or departmentFilter changes
  useEffect(() => {
    loadTests();
  }, [search, currentPage, statusFilter, departmentFilter]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const status = statusFilter === 'All' ? undefined : statusFilter === 'Active' ? 'true' : 'false';
      console.log('Converted status for API:', status);
      const trimmedSearch = search.trim();
      const selectedDepartmentId = departmentFilter
        ? Number(departmentFilter)
        : undefined;

      let testsArray: Test[] = [];
      let responseTotalPages = 0;
      let responseTotalElements = 0;

      const applyStatusFilter = (tests: Test[]) => {
        if (statusFilter === 'All') return tests;
        if (statusFilter === 'Active') return tests.filter((test) => Boolean(test.isActive));
        return tests.filter((test) => !test.isActive);
      };

      if (trimmedSearch) {
        console.log('🔍 Calling searchTestsByName with:', { name: trimmedSearch, currentPage, pageSize });
        const searchResponse = await searchTestsByName(trimmedSearch, currentPage, pageSize);
      
        const searchResults = searchResponse?.data?.content || [];
        console.log('✅ Search results count:', searchResults.length);

        testsArray = applyStatusFilter(searchResults);

        if (selectedDepartmentId) {
          testsArray = testsArray.filter(
            (test) => test.departmentId === selectedDepartmentId
          );
        }
        
        console.log('🔎 Filtered results count:', testsArray.length);
        responseTotalElements = searchResponse?.data?.totalElements || testsArray.length;
        responseTotalPages = searchResponse?.data?.totalPages || 0;
        
        console.log('📄 Pagination info:', {
          totalPages: responseTotalPages,
          totalElements: responseTotalElements,
          currentPage: searchResponse?.data?.pageNo || 0
        });
      } else if (selectedDepartmentId) {
        console.log('📡 Calling fetchTestsByDepartment with:', {
          departmentId: selectedDepartmentId,
          currentPage,
          pageSize,
        });
        const response = await fetchTestsByDepartment(
          selectedDepartmentId,
          currentPage,
          pageSize
        );
        testsArray = applyStatusFilter(response.data?.content || []);
        responseTotalPages = response.data?.totalPages || 0;
        responseTotalElements = response.data?.totalElements || 0;
      } else {
        const response =
          statusFilter === 'Active'
            ? await fetchActiveTests(currentPage, pageSize)
            : await fetchTests(currentPage, pageSize, undefined, status);
        console.log(
          statusFilter === 'Active'
            ? '📡 Calling fetchActiveTests with:'
            : '📡 Calling fetchTests with:',
          { currentPage, pageSize, status }
        );

        testsArray = response.data?.content || [];
        responseTotalPages = response.data?.totalPages || 0;
        responseTotalElements = response.data?.totalElements || 0;
      }
      
 
      // Use tests directly without fetching versions
      setPackages(testsArray);
      setTotalPages(responseTotalPages);
      setTotalElements(responseTotalElements);
  
    } catch (error) {
    
      setPackages([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
      console.log('🏁 Loading state set to false');
    }
  };

  const handleSearch = () => {
    // Just reset to page 0 - the useEffect will trigger loadTests
    setCurrentPage(0);
  };

  const handleViewTemplate = (pkg: Test) => {
    setSelectedTestForTemplate(pkg);
    setTemplateViewOpen(true);
  };

  const handleNewTestSubmit = async () => {
    console.log('=== PARENT COMPONENT NOTIFICATION ===');
    console.log('Test saved successfully, reloading list...');
    loadTests();
    setDetailsRefreshKey((key) => key + 1);
  };

  const handleEditSample = async (pkg: Test) => {
    console.log('=== EDIT SAMPLE CLICKED ===');
    console.log('Test ID:', pkg.id);
    
    try {
      // Fetch sample requirements from API
      console.log('📡 Fetching sample requirements from API...');
      const response = await fetchSampleRequirements(pkg.id);
      console.log('✅ Sample requirements response:', response);
      
      const samplePayload = response.data;
      console.log('📦 Sample data received:', samplePayload);

      const normalizedSamples = Array.isArray(samplePayload)
        ? samplePayload
        : samplePayload
          ? [samplePayload]
          : [];

      // Create a modified edit data with sample requirements
      const sampleEditData = {
        ...pkg,
        sampleRequirements: normalizedSamples.map((sample: any) => ({
          id: sample.id || 0,
          sampleType: sample.sampleType || '',
          volumeMl: sample.volumeMl ?? '',
          containerColor: sample.containerColor || '',
          storageCondition: sample.storageCondition || '',
        })),
      };
      
      console.log('📝 Edit data with sample:', sampleEditData);
      setEditingPackage(sampleEditData);
      setActiveTab('sample');
      setIsModalOpen(true);
    } catch (error) {
      console.error('❌ Failed to fetch sample requirements:', error);
      console.error('Error details:', error);
      
      // Fallback to using existing data if API fails
      console.log('⚠️ Using fallback sample data from existing test');
      setEditingPackage(pkg);
      setActiveTab('sample');
      setIsModalOpen(true);
    }
  };

  const handleEditParameters = async (pkg: Test) => {
    console.log('=== EDIT PARAMETERS CLICKED ===');
    console.log('Test ID:', pkg.id);

    try {
      console.log('📡 Fetching parameters from API...');
      const response = await fetchTestParameters(pkg.id);
      const normalizedParameters = unwrapParametersList(response.data).map(
        normalizeParameterForForm
      );

      const parameterEditData = {
        ...pkg,
        parameters: normalizedParameters,
      };

      setEditingPackage(parameterEditData);
      setActiveTab('parameters');
      setIsModalOpen(true);
    } catch (error) {
      console.error('❌ Failed to fetch parameters:', error);
      // If fetch fails, still open the modal with the test data
      setEditingPackage(pkg);
      setActiveTab('parameters');
      setIsModalOpen(true);
    }
  };

  const handleEditSingleParameter = async (pkg: Test, parameterId: number) => {
    try {
      console.log('📡 Fetching parameters from API...');
      const response = await fetchTestParameters(pkg.id);
      const normalizedParameters = unwrapParametersList(response.data).map(
        normalizeParameterForForm
      );

      // Find the specific parameter to edit
      const parameterToEdit = normalizedParameters.find((p: any) => p.id === parameterId);

      if (!parameterToEdit) {
        console.error('❌ Parameter not found with ID:', parameterId);
        alert('Parameter not found');
        return;
      }

      console.log('✅ Parameter found:', parameterToEdit);
      
      // Set editing data with only the selected parameter
      const parameterEditData = {
        ...pkg,
        parameters: [parameterToEdit],
        editingParameterId: parameterId, // Flag to indicate single parameter edit
      };

      setEditingPackage(parameterEditData);
      setActiveTab('parameters');
      setIsModalOpen(true);
    } catch (error) {
      console.error('❌ Failed to fetch parameters:', error);
      alert('Failed to load parameter data');
    }
  };

  const handleViewDetails = (pkg: Test) => {
    setSelectedPackage(pkg);
    setDetailsOpen(true);
  };

  // ─── Delete from Details View ─────────────────────────────────────────────
  const handleDetailsDelete = (testId: number) => {
    setDeletingTestId(testId);
    setIsDeleteDialogOpen(true);
  };

  // ─── Delete from List View ────────────────────────────────────────────────
  const handleDeleteFromList = (testId: number) => {
    setDeletingTestId(testId);
    setIsDeleteDialogOpen(true);
  };

  // ─── Confirm Delete ──────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deletingTestId) {
      toast.error('No test selected for deletion');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('🗑️ Deleting test with ID:', deletingTestId);
      await deleteTest(deletingTestId);
      
      toast.success('Test deleted successfully!');
      
      // Close dialog if it was opened from details view
      if (detailsOpen) {
        setDetailsOpen(false);
        setSelectedPackage(null);
      }
      
      // Reload the test list
      loadTests();
      
      // Close dialog
      setIsDeleteDialogOpen(false);
      setDeletingTestId(null);
    } catch (error: any) {
      console.error('❌ Failed to delete test:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to delete test. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Close Delete Dialog ─────────────────────────────────────────────────
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setDeletingTestId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
    setActiveTab('test');
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPackage(null);
  };

  const getLatestVersionPrice = (pkg: Test): number | null => {
    // Price is now directly on the test object (flat structure)
    if (typeof pkg.price === 'number') {
      return pkg.price;
    }

    const versions = ((pkg as any)?.versions || (pkg as any)?.testVersions) as Array<{
      versionNo?: number;
      price?: number;
    }> | undefined;

    if (!Array.isArray(versions) || versions.length === 0) {
      return null;
    }

    const latest = [...versions].sort((a, b) => (b.versionNo || 0) - (a.versionNo || 0))[0];
    return typeof latest?.price === 'number' ? latest.price : null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            <span className="text-[#006D77]">Test</span> <span className="text-highlight">Lists</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage diagnostic test packages and bundled offerings.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 px-6" 
            onClick={() => router.push('/lab/templates')}
            suppressHydrationWarning
          >
            <FileText size={16} /> Templates
          </Button>
          <Button variant="outline" size="sm" className="gap-2 px-6" suppressHydrationWarning>
            <LayoutGrid size={16} /> Package View
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => {
              setIsModalOpen(true);
              setEditingPackage(null);
              setActiveTab('test');
            }}
            suppressHydrationWarning
          >
            <Plus size={16} /> Create Test
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <DepartmentFilter
            value={departmentFilter}
            onChange={setDepartmentFilter}
          />
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              suppressHydrationWarning
            >
              <option>All</option>
              <option>Active</option>
             
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200" onClick={handleSearch} suppressHydrationWarning>
            <Settings size={18} />
          </Button>
        </div>
      </div>

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
                  Test Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Sample
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-[#006D77] border-t-transparent rounded-full"></div>
                      <span>Loading tests...</span>
                    </div>
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No tests found. Create your first test to get started.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <span className="text-xs font-bold text-slate-600 font-mono hover:text-[#00AC80] transition-colors">
                        {pkg.testCode}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#006D77] group-hover:text-white transition-all">
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#006D77] transition-colors text-sm mb-0.5">
                            {pkg.testName}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {pkg.method || 'N/A'} • {pkg.unit || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                        {pkg.categoryName || 'N/A'}
                      </Badge>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <span className="text-sm font-semibold text-slate-700">
                        {pkg.parameters?.[0]?.parameterName || 'N/A'}
                        {pkg.parameters && pkg.parameters.length > 1 && ` (+${pkg.parameters.length - 1} more)`}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      {(() => {
                        const price = getLatestVersionPrice(pkg);
                        return (
                      <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                            {price === null ? 'N/A' : `₹${new Intl.NumberFormat('en-IN').format(price)}`}
                      </div>
                        );
                      })()}
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <Badge
                        variant={pkg.isActive ? 'success' : 'secondary'}
                        className="text-[10px] font-bold"
                      >
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <PackageActions
                        pkg={pkg}
                        onView={handleViewDetails}
                        onEditSample={handleEditSample}
                        onEditParameters={handleEditParameters}
                        onDelete={handleDeleteFromList}
                        onB2BPrice={(pkg) => {
                          setSelectedTestForB2B(pkg);
                          setIsB2BDrawerOpen(true);
                        }}
                        onTemplate={handleViewTemplate}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Showing {packages.length} of {totalElements} Tests</span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-[#FF671F]">Test Packages v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px]"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              suppressHydrationWarning
            >
              Prev
            </Button>
            <span className="px-4 py-1 text-xs font-bold text-slate-600">
              Page {currentPage + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px]"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              suppressHydrationWarning
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ CREATE/EDIT MODAL ═════════════════════════════════════ */}
      <NewTest
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={() => handleNewTestSubmit()}
        editData={editingPackage}
        isEditMode={!!editingPackage}
        activeTab={activeTab}
      />

      {/* ═══ DETAILS VIEW MODAL ═══════════════════════════════════ */}
      <TestDetailsView
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        testData={selectedPackage}
        refreshKey={detailsRefreshKey}
        onDelete={(id) => handleDetailsDelete(Number(id))}
        onEditSample={handleEditSample}
        onEditParameters={handleEditParameters}
      />

      {/* ═══ B2B PRICE CONFIGURATION DRAWER ═══════════════════════ */}
      <B2BPriceConfiguration
        isOpen={isB2BDrawerOpen}
        onClose={() => {
          setIsB2BDrawerOpen(false);
          setSelectedTestForB2B(null);
        }}
        testId={selectedTestForB2B?.id}
        testName={selectedTestForB2B?.testName || 'Test'}
      />

      <ViewTestTemplate
        isOpen={templateViewOpen}
        onClose={() => {
          setTemplateViewOpen(false);
          setSelectedTestForTemplate(null);
        }}
        testId={selectedTestForTemplate?.id}
        testName={selectedTestForTemplate?.testName}
      />

      {/* ═══ DELETE CONFIRMATION DIALOG ══════════════════════════ */}
      <DeleteAlertDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Test"
        description="Are you sure you want to permanently delete this test? This action cannot be undone and all associated data including parameters and sample requirements will be lost."
      />
    </div>
  );
}
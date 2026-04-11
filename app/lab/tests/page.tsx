'use client';

import { useState, useEffect } from 'react';
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
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/form-group';
import NewTest from './NewTest';
import TestDetailsView from './TestDetailsView';
import {
  fetchTests,
  createTest,
  updateTest,
  deleteTest,
  toggleTestStatus,
  fetchSampleRequirements,
  type Test,
  type CreateTestInput,
} from '@/app/Apis/lab/TestApis';

// ─── Data Types ──────────────────────────────────────────────────────────────
import { TestVersion, TestParameter, SampleRequirement, ReferenceRange } from './types';

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
  onEdit,
  onEditSample,
  onEditParameters,
  onEditPricing,
}: {
  pkg: Test;
  onView: (pkg: Test) => void;
  onEdit: (pkg: Test) => void;
  onEditSample: (pkg: Test) => void;
  onEditParameters: (pkg: Test) => void;
  onEditPricing: (pkg: Test) => void;
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
          <div className="h-[1px] bg-slate-100 my-2"></div>
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
              onEditParameters(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-purple-600 hover:bg-purple-50 flex items-center gap-2"
          >
            <FlaskConical size={14} /> Edit Parameters
          </button>
          <button
            onClick={() => {
              onEditPricing(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-orange-600 hover:bg-orange-50 flex items-center gap-2"
          >
            <CreditCard size={14} /> Edit Pricing
          </button>
          <div className="h-[1px] bg-slate-100 my-2"></div>
          <button
            onClick={() => {
              onEdit(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit2 size={14} /> Edit Full Test
          </button>
          <div className="h-[1px] bg-slate-100 my-2"></div>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <Trash2 size={14} /> Deactivate
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
  const [packages, setPackages] = useState<Test[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState<'test' | 'sample' | 'parameters' | 'pricing'>('test');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadTests();
  }, [currentPage, statusFilter]);

  const loadTests = async () => {
    setLoading(true);
    try {
      console.log('=== LOAD TESTS FUNCTION CALLED ===');
      console.log('Current page:', currentPage);
      console.log('Status filter:', statusFilter);
      console.log('Search:', search);
      
      const status = statusFilter === 'All' ? undefined : statusFilter === 'Active' ? 'true' : 'false';
      console.log('Converted status for API:', status);
      
      console.log('Calling fetchTests with:', { currentPage, pageSize, search: search || undefined, status });
      const response = await fetchTests(currentPage, pageSize, search || undefined, status);
      
      console.log('=== FETCH RESPONSE ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Content array:', response.data?.content);
      console.log('Content length:', response.data?.content?.length);
      console.log('Total elements:', response.data?.totalElements);
      console.log('Total pages:', response.data?.totalPages);
      
      const testsArray = response.data?.content || [];
      console.log('Tests array to display:', testsArray);
      
      setPackages(testsArray);
      setTotalPages(response.data?.totalPages || 0);
      setTotalElements(response.data?.totalElements || 0);
      
      console.log('✅ Successfully loaded', testsArray.length, 'tests out of', response.data?.totalElements, 'total');
    } catch (error) {
      console.error('❌ FAILED TO LOAD TESTS');
      console.error('Error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error type:', error);
      
      
      setPackages([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
      console.log('Loading state set to false');
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadTests();
  };

  const handleNewTestSubmit = async (newPackageData: Test) => {
    console.log('=== PARENT COMPONENT NOTIFICATION ===');
    console.log('Test saved successfully, reloading list...');
    // Just reload the tests - the API call is already done in NewTest component
    loadTests();
  };

  const handleEdit = (pkg: Test) => {
    console.log('=== EDIT BUTTON CLICKED ===');
    console.log('Editing package:', pkg);
    console.log('Package ID:', pkg.id);
    setEditingPackage(pkg);
    setActiveTab('test');
    console.log('editingPackage state set');
    setIsModalOpen(true);
    console.log('isModalOpen set to true');
  };

  const handleEditSample = async (pkg: Test) => {
    console.log('=== EDIT SAMPLE CLICKED ===');
    console.log('Test ID:', pkg.id);
    
    try {
      // Fetch sample requirements from API
      console.log('📡 Fetching sample requirements from API...');
      const response = await fetchSampleRequirements(pkg.id);
      console.log('✅ Sample requirements response:', response);
      
      const sampleData = response.data;
      console.log('📦 Sample data received:', sampleData);
      
      // Create a modified edit data with sample requirements
      const sampleEditData = {
        ...pkg,
        sampleRequirements: [{
          id: sampleData.id || 0,
          sampleType: sampleData.sampleType,
          volumeMl: sampleData.volumeMl,
          containerColor: sampleData.containerColor,
          storageCondition: sampleData.storageCondition,
        }]
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

  const handleEditParameters = (pkg: Test) => {
    console.log('=== EDIT PARAMETERS CLICKED ===');
    setEditingPackage(pkg);
    setActiveTab('parameters');
    setIsModalOpen(true);
  };

  const handleEditPricing = (pkg: Test) => {
    console.log('=== EDIT PRICING CLICKED ===');
    setEditingPackage(pkg);
    setActiveTab('pricing');
    setIsModalOpen(true);
  };

  const handleViewDetails = (pkg: Test) => {
    setSelectedPackage(pkg);
    setDetailsOpen(true);
  };

  const handleDetailsEdit = (pkg: Test) => {
    setDetailsOpen(false);
    setSelectedPackage(null);
    setTimeout(() => {
      setEditingPackage(pkg);
      setActiveTab('test');
      setIsModalOpen(true);
    }, 300);
  };

  const handleDetailsDelete = async (testId: number) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      try {
        await deleteTest(testId);
        setDetailsOpen(false);
        setSelectedPackage(null);
        loadTests();
      } catch (error) {
        console.error('Failed to delete test:', error);
      }
    }
  };

  const handleToggleStatus = async (id: number, isActive: boolean) => {
    try {
      await toggleTestStatus(id, isActive);
      loadTests();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
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
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search tests..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
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
              <option>Inactive</option>
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
                            {pkg.version?.method || 'N/A'} • {pkg.version?.unit || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4"
                      onClick={() => handleViewDetails(pkg)}
                    >
                      <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                        {pkg.categoryId === 5 ? 'Lipid Profile' : 'Other'}
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
                      <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                        ₹{new Intl.NumberFormat('en-IN').format(Number(pkg.version?.price || 0))}
                      </div>
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
                        onEdit={handleEdit}
                        onEditSample={handleEditSample}
                        onEditParameters={handleEditParameters}
                        onEditPricing={handleEditPricing}
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
        onSubmit={(data) => handleNewTestSubmit(data as CreateTestInput)}
        editData={editingPackage}
        isEditMode={!!editingPackage}
        activeTab={activeTab}
      />

      {/* ═══ DETAILS VIEW MODAL ═══════════════════════════════════ */}
      <TestDetailsView
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        testData={selectedPackage}
        onEdit={handleDetailsEdit}
        onDelete={(id) => handleDetailsDelete(Number(id))}
        onEditSample={handleEditSample}
        onEditParameters={handleEditParameters}
        onEditPricing={handleEditPricing}
      />
    </div>
  );
}
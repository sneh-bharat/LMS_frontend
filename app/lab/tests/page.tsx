'use client';

import { useState } from 'react';
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

// ─── Data Types ──────────────────────────────────────────────────────────────
interface TestPackage {
  id: string;
  testCode: string;
  testName: string;
  description: string;
  category: string;
  sample: string;
  price: number;
  isActive: boolean;
  createdAt: string;
}

const CATEGORIES = ['All', 'Hematology', 'Pathology', 'Biochemistry', 'Serology', 'Microbiology'];

const SAMPLE_TESTS: TestPackage[] = [
  {
    id: '1',
    testCode: 'T001',
    testName: 'Complete Blood Count (CBC)',
    description: 'Measures different components of blood including RBC, WBC, hemoglobin, and platelets. This comprehensive test is essential for detecting anemia, infections, and blood disorders.',
    category: 'Hematology',
    sample: 'Blood',
    price: 500,
    isActive: true,
    createdAt: '2026-03-30T10:00:00Z',
  },
  {
    id: '2',
    testCode: 'T002',
    testName: 'Urine Test',
    description: 'Complete urinalysis including physical, chemical, and microscopic examination. Helps diagnose urinary tract infections, kidney disorders, and diabetes.',
    category: 'Pathology',
    sample: 'Urine',
    price: 300,
    isActive: true,
    createdAt: '2026-03-25T14:30:00Z',
  },
  {
    id: '3',
    testCode: 'T003',
    testName: 'Liver Function Test (LFT)',
    description: 'Evaluates liver health and function including bilirubin, albumin, and enzymes. Essential for monitoring liver disease and medication side effects.',
    category: 'Biochemistry',
    sample: 'Blood',
    price: 650,
    isActive: true,
    createdAt: '2026-03-20T09:15:00Z',
  },
  {
    id: '4',
    testCode: 'T004',
    testName: 'COVID-19 RT-PCR',
    description: 'Reverse transcription polymerase chain reaction for COVID-19 detection. Highly sensitive and specific test for active COVID-19 infection.',
    category: 'Serology',
    sample: 'Nasal Swab',
    price: 800,
    isActive: false,
    createdAt: '2026-03-15T11:45:00Z',
  },
  {
    id: '5',
    testCode: 'T005',
    testName: 'Blood Culture',
    description: 'Identifies bacteria or fungi in the bloodstream. Critical for diagnosing septicemia and bloodstream infections.',
    category: 'Microbiology',
    sample: 'Blood',
    price: 1200,
    isActive: true,
    createdAt: '2026-03-10T08:20:00Z',
  },
];

// ─── Components ───────────────────────────────────────────────────────────────
function PackageActions({
  pkg,
  onView,
  onEdit,
}: {
  pkg: TestPackage;
  onView: (pkg: TestPackage) => void;
  onEdit: (pkg: TestPackage) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => {
              onView(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
          >
            <Eye size={14} /> View Details
          </button>
          <button
            onClick={() => {
              onEdit(pkg);
              setOpen(false);
            }}
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit2 size={14} /> Edit Test
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

export default function TestPackagePage() {
  const [packages, setPackages] = useState<TestPackage[]>(SAMPLE_TESTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TestPackage | null>(null);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.testName.toLowerCase().includes(search.toLowerCase()) ||
      pkg.testCode.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || pkg.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && pkg.isActive) ||
      (statusFilter === 'Inactive' && !pkg.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleNewTestSubmit = (newPackageData: any) => {
    console.log('New package created:', newPackageData);

    if (editingPackage) {
      // Update existing package
      setPackages(
        packages.map((p) =>
          p.id === editingPackage.id ? { ...p, ...newPackageData } : p
        )
      );
      setEditingPackage(null);
    } else {
      // Create new package with auto-incremented ID
      const nextId = String(Math.max(...packages.map((p) => parseInt(p.id)), 0) + 1);
      const nextCode = `T${String(parseInt(nextId)).padStart(3, '0')}`;

      const newPackage: TestPackage = {
        id: nextId,
        testCode: nextCode,
        testName: newPackageData.testName,
        description: newPackageData.description,
        category: newPackageData.category,
        sample: newPackageData.sample,
        price: newPackageData.price,
        isActive: newPackageData.isActive !== false,
        createdAt: new Date().toISOString(),
      };
      setPackages([...packages, newPackage]);
    }
  };

  const handleEdit = (pkg: TestPackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleViewDetails = (pkg: TestPackage) => {
    setSelectedPackage(pkg);
    setDetailsOpen(true);
  };

  const handleDetailsEdit = (pkg: TestPackage) => {
    setDetailsOpen(false);
    setSelectedPackage(null);
    setTimeout(() => {
      setEditingPackage(pkg);
      setIsModalOpen(true);
    }, 300);
  };

  const handleDetailsDelete = (testId: string) => {
    setPackages(packages.filter((p) => p.id !== testId));
    setDetailsOpen(false);
    setSelectedPackage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
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
            Test <span className="text-emerald-600">Lists</span>
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
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} /> Create Test
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200">
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
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                  <td
                    className="px-6 py-4"
                    onClick={() => handleViewDetails(pkg)}
                  >
                    <span className="text-xs font-bold text-slate-600 font-mono hover:text-emerald-600 transition-colors">
                      {pkg.testCode}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => handleViewDetails(pkg)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5">
                          {pkg.testName}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {pkg.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => handleViewDetails(pkg)}
                  >
                    <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                      {pkg.category}
                    </Badge>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => handleViewDetails(pkg)}
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {pkg.sample}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => handleViewDetails(pkg)}
                  >
                    <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                      ₹{pkg.price.toLocaleString('en-IN')}
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
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Showing {filteredPackages.length} of {packages.length} Tests</span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-emerald-600">Test Packages v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]">
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="px-4 py-1 text-[10px]"
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]">
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ CREATE/EDIT MODAL ═════════════════════════════════════ */}
      <NewTest
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleNewTestSubmit}
        editData={editingPackage}
        isEditMode={!!editingPackage}
      />

      {/* ═══ DETAILS VIEW MODAL ═══════════════════════════════════ */}
      <TestDetailsView
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        testData={selectedPackage}
        onEdit={handleDetailsEdit}
        onDelete={handleDetailsDelete}
      />
    </div>
  );
}
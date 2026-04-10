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
import { TestPackage, TestVersion, TestParameter, SampleRequirement, ReferenceRange } from './types';

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

const SAMPLE_TESTS: TestPackage[] = [
  {
    id: '1',
    testCode: 'LIPID_001',
    testName: 'Lipid Profile',
    departmentId: 1,
    categoryId: 5,
    loincCode: '24331-1',
    tatHours: 24,
    isActive: true,
    version: {
      versionNo: 1,
      method: 'Enzymatic Colorimetric',
      unit: 'mg/dL',
      price: 500.00,
      cghsPrice: 350.00,
      criticalLow: 40.0,
      criticalHigh: 300.0,
      effectiveFrom: '2024-01-01',
      effectiveTo: null
    },
    parameters: [
      {
        parameterName: 'Total Cholesterol',
        unit: 'mg/dL',
        criticalLow: null,
        criticalHigh: 240.0,
        resultType: 'Numeric',
        isCalculated: false,
        referenceRanges: [
          {
            gender: 'Male',
            ageMin: 18,
            ageMax: 100,
            minValue: 125.0,
            maxValue: 200.0,
            unit: 'mg/dL'
          }
        ]
      },
      {
        parameterName: 'HDL Cholesterol',
        unit: 'mg/dL',
        criticalLow: 20.0,
        criticalHigh: null,
        resultType: 'Numeric',
        isCalculated: false,
        referenceRanges: []
      }
    ],
    sampleRequirements: [
      {
        sampleType: 'Blood_Serum',
        volumeMl: 5.0,
        containerColor: 'Yellow',
        storageCondition: 'Refrigerated',
        transportCondition: 'Cold Chain'
      }
    ],
    createdAt: '2026-03-30T10:00:00Z',
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
        suppressHydrationWarning
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

    const matchesCategory = categoryFilter === 'All' ||
      CATEGORIES.find(c => c === categoryFilter && DEPARTMENTS.some(d => d.id === pkg.departmentId)) || // This is a bit complex, let's simplify
      true; // For now let's just match search

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && pkg.isActive) ||
      (statusFilter === 'Inactive' && !pkg.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleNewTestSubmit = (newPackageData: TestPackage) => {
    console.log('New package created:', newPackageData);

    if (editingPackage) {
      setPackages(
        packages.map((p) =>
          p.id === editingPackage.id ? { ...newPackageData, id: p.id } : p
        )
      );
      setEditingPackage(null);
    } else {
      const nextId = String(Math.max(...packages.map((p) => parseInt(p.id)), 0) + 1);
      const newPackage: TestPackage = {
        ...newPackageData,
        id: nextId,
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
            onClick={() => setIsModalOpen(true)}
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
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              suppressHydrationWarning
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
              suppressHydrationWarning
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200" suppressHydrationWarning>
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
                          {pkg.version.method} • {pkg.version.unit}
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
                      {pkg.parameters[0]?.parameterName || 'Multiple'}
                      {pkg.parameters.length > 1 && ` (+${pkg.parameters.length - 1} more)`}
                    </span>
                  </td>
                  <td
                    className="px-6 py-4"
                    onClick={() => handleViewDetails(pkg)}
                  >
                    <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                      ₹{new Intl.NumberFormat('en-IN').format(Number(pkg.version.price || 0))}
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
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]" suppressHydrationWarning>
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="px-4 py-1 text-[10px]"
              suppressHydrationWarning
            >
              1
            </Button>
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]" suppressHydrationWarning>
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ CREATE/EDIT MODAL ═════════════════════════════════════ */}
      <NewTest
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={(data) => handleNewTestSubmit(data as TestPackage)}
        editData={editingPackage as any}
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
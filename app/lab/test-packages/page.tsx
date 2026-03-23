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
  Activity
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/form-group';
import NewTest from './NewTest'; // Import the new component

// ─── Data Types ──────────────────────────────────────────────────────────────
interface TestPackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  price: number;
  isActive: boolean;
  tests: TestItem[];
  createdAt: string;
}

interface TestItem {
  id: number;
  testName: string;
  testCode: string;
  category: string;
}

const SAMPLE_PACKAGES: TestPackage[] = [
  {
    id: 1,
    packageCode: 'PKG001',
    packageName: 'Basic Health Checkup',
    description: 'Comprehensive basic health screening including CBC, Lipid Profile, Liver Function',
    price: 2500,
    isActive: true,
    tests: [
      { id: 1, testName: 'Complete Blood Count', testCode: 'CBC', category: 'Hematology' },
      { id: 2, testName: 'Lipid Profile', testCode: 'LP', category: 'Biochemistry' },
      { id: 3, testName: 'Liver Function Test', testCode: 'LFT', category: 'Biochemistry' },
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    packageCode: 'PKG002',
    packageName: 'Advanced Cardiac Risk Profile',
    description: 'Detailed cardiac risk assessment with Troponin, NT-proBNP, Homocysteine',
    price: 4500,
    isActive: true,
    tests: [
      { id: 4, testName: 'Troponin T', testCode: 'TNT', category: 'Cardiology' },
      { id: 5, testName: 'NT-proBNP', testCode: 'NTBNP', category: 'Cardiology' },
      { id: 6, testName: 'Homocysteine', testCode: 'HCY', category: 'Biochemistry' },
    ],
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    packageCode: 'PKG003',
    packageName: 'Diabetes Screening Package',
    description: 'Complete diabetes screening with HbA1c, Fasting Insulin, Microalbuminuria',
    price: 1800,
    isActive: true,
    tests: [
      { id: 7, testName: 'HbA1c', testCode: 'HBA1C', category: 'Biochemistry' },
      { id: 8, testName: 'Fasting Insulin', testCode: 'FINS', category: 'Endocrinology' },
      { id: 9, testName: 'Microalbuminuria', testCode: 'MAU', category: 'Urinalysis' },
    ],
    createdAt: '2024-02-01',
  },
  {
    id: 4,
    packageCode: 'PKG004',
    packageName: 'Thyroid Profile Complete',
    description: 'Full thyroid function assessment with T3, T4, TSH, Anti-TPO',
    price: 2200,
    isActive: false,
    tests: [
      { id: 10, testName: 'T3 Total', testCode: 'T3', category: 'Endocrinology' },
      { id: 11, testName: 'T4 Total', testCode: 'T4', category: 'Endocrinology' },
      { id: 12, testName: 'TSH', testCode: 'TSH', category: 'Endocrinology' },
      { id: 13, testName: 'Anti-TPO', testCode: 'ATPO', category: 'Immunology' },
    ],
    createdAt: '2024-02-10',
  },
];

const CATEGORIES = ['All', 'Hematology', 'Biochemistry', 'Endocrinology', 'Cardiology', 'Immunology'];

// ─── Components ───────────────────────────────────────────────────────────────
function PackageActions({ pkg }: { pkg: TestPackage }) {
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
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Edit2 size={14} /> Edit Package
          </button>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <FlaskConical size={14} /> Manage Tests
          </button>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Zap size={14} /> B2B Pricing
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
  const [packages, setPackages] = useState<TestPackage[]>(SAMPLE_PACKAGES);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestPackage | null>(null);

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.packageName.toLowerCase().includes(search.toLowerCase()) ||
                         pkg.packageCode.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = catFilter === 'All' || 
                           pkg.tests.some(t => t.category === catFilter);
    return matchesSearch && matchesCategory;
  });

  const handleNewTestSubmit = (newPackageData: any) => {
    console.log('New package created:', newPackageData);
    
    if (editingPackage) {
      // Update existing package
      setPackages(packages.map(p => 
        p.id === editingPackage.id 
          ? { ...p, ...newPackageData }
          : p
      ));
      setEditingPackage(null);
    } else {
      // Create new package with auto-incremented ID
      const newPackage: TestPackage = {
        id: Math.max(...packages.map(p => p.id), 0) + 1,
        packageCode: newPackageData.packageCode,
        packageName: newPackageData.packageName,
        description: newPackageData.description,
        price: newPackageData.price,
        isActive: newPackageData.isActive,
        tests: newPackageData.tests,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPackages([...packages, newPackage]);
    }
    // Show success message or toast notification here
  };

  const handleEdit = (pkg: TestPackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Test <span className="text-emerald-600">Packages</span>
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
            <Plus size={16} /> Create Package
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Package Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tests</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-300 font-mono">{pkg.packageCode}</span>
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
                          {pkg.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" className="px-2 py-1 text-[10px]">
                        {pkg.tests.length} Tests
                      </Badge>
                      <div className="flex -space-x-2">
                        {pkg.tests.slice(0, 3).map(test => (
                          <div 
                            key={test.id}
                            className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-emerald-700"
                            title={test.testName}
                          >
                            {test.testCode.substring(0, 2)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                      ₹{pkg.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={pkg.isActive ? 'success' : 'secondary'}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <PackageActions pkg={pkg} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Showing {filteredPackages.length} Packages</span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-emerald-600">Test Packages v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]">Prev</Button>
            <Button variant="secondary" size="sm" className="px-4 py-1 text-[10px]">1</Button>
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]">Next</Button>
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
    </div>
  );
}
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
Microscope,
  Zap,
  LayoutGrid,
  ChevronDown,
  FileText,
  Database,
  Tag,
  FlaskConical,
  Activity,
  User,
  Eye
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/form-group';
import AddNewSample, { type TestSample } from './AddNewSample';

// ─── Data Types ──────────────────────────────────────────────────────────────
interface TubeDetail {
  type: string;
  quantity: number;
  confirmed: boolean;
}

const SAMPLE_DATA: TestSample[] = [
  {
    id: '1',
    sampleCode: 'S001',
    patientName: 'John Doe',
    collectedBy: '',
    testName: 'Complete Blood Count (CBC)',
    sampleType: 'Blood',
    collectedAt: '2026-03-30 10:30 AM',
    status: 'Pending',
    location: 'Clinic',
    createdAt: '2026-03-30T10:30:00Z',
  },
  {
    id: '2',
    sampleCode: 'S002',
    patientName: 'Sara Smith',
    collectedBy: '',
    testName: 'Urine Test',
    sampleType: 'Urine',
    collectedAt: '2026-03-30 11:00 AM',
    status: 'Complete',
    location: 'Laboratory',
    createdAt: '2026-03-30T11:00:00Z',
  },
  {
    id: '3',
    sampleCode: 'S003',
    patientName: 'Mike Johnson',
    collectedBy: '',
    testName: 'Liver Function Test (LFT)',
    sampleType: 'Blood',
    collectedAt: '2026-03-30 09:15 AM',
    status: 'Processing',
    location: 'Clinic',
    createdAt: '2026-03-30T09:15:00Z',
  },
  {
    id: '4',
    sampleCode: 'S004',
    patientName: 'Emma Wilson',
    collectedBy: '',
    testName: 'COVID-19 RT-PCR',
    sampleType: 'Nasal Swab',
    collectedAt: '2026-03-29 02:45 PM',
    status: 'Complete',
    location: 'Home',
    createdAt: '2026-03-29T14:45:00Z',
  },
  {
    id: '5',
    sampleCode: 'S005',
    patientName: 'David Brown',
    collectedBy: '',
    testName: 'Complete Blood Count (CBC)',
    sampleType: 'Blood',
    collectedAt: '2026-03-30 01:20 PM',
    status: 'Failed',
    location: 'Clinic',
    createdAt: '2026-03-30T13:20:00Z',
  },
];

const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Complete', 'Failed'];
const SAMPLE_TYPES = ['All', 'Blood', 'Urine', 'Serum', 'Plasma', 'CSF', 'Stool', 'Saliva', 'Nasal Swab', 'Throat Swab'];

// ─── Components ───────────────────────────────────────────────────────────────
function PackageActions({ pkg, onEdit }: { pkg: TestSample; onEdit: (pkg: TestSample) => void }) {
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
              onEdit(pkg);
              setOpen(false);
            }} 
            className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2"
          >
            <Edit2 size={14} /> Edit Sample
          </button>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <FlaskConical size={14} /> Manage Samples
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
  const [packages, setPackages] = useState<TestSample[]>(SAMPLE_DATA);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestSample | null>(null);

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.testName.toLowerCase().includes(search.toLowerCase()) ||
      pkg.sampleCode.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || pkg.sampleType === categoryFilter;

    const matchesStatus =
      statusFilter === 'All' || pkg.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleNewTestSubmit = (newPackageData: TestSample) => {
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

      const newPackage: TestSample = {
        id: nextId,
        sampleCode: nextCode,
        patientName: newPackageData.patientName,
        collectedBy: newPackageData.collectedBy,
        testName: newPackageData.testName,
        sampleType: newPackageData.sampleType,
        collectedAt: newPackageData.collectedAt,
        status: newPackageData.status,
        location: newPackageData.location || 'Clinic',
        createdAt: newPackageData.createdAt || new Date().toISOString(),
        notes: newPackageData.notes,
        tubes: newPackageData.tubes,
      };
      setPackages([...packages, newPackage]);
    }
  };

  const handleEdit = (pkg: TestSample) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleAddSample = () => {
    setEditingPackage(null);
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
        
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Microscope size={20} />
            </div>
            <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                    Test <span className="text-[#FF671F]">Samples Collection</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage diagnostic test packages and bundled offerings.
          </p>
            </div>
            <div>

            </div>

          
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6">
            <LayoutGrid size={16} /> Package View
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={handleAddSample}
          >
            <Plus size={16} /> Create Sample
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
            placeholder="Search Sample Code or Name..."
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
              {SAMPLE_TYPES.map((c) => (
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
              {STATUS_OPTIONS.map((status) => (
                <option key={status}>{status}</option>
              ))}
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
                  Sample Code
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                   Patient Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Test Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Sample Type
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Collected At
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 font-mono">
                      {pkg.sampleCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 line-clamp-1">
                          {pkg.patientName}
                        </div>
                      </div>
                    </div>
                  </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Package size={20} />
                            </div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5">
                                {pkg.testName}
                            </div>
                        </div> 
                    </td>
                    <td className="px-6 py-4">
                        <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                        {pkg.sampleType}
                        </Badge>
                    
                    </td>
                  <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-700">
                      {pkg.collectedAt}
                    </span>
                  
                  </td>
                  <td className="px-6 py-4 text-center"> 
                      <PackageActions pkg={pkg} onEdit={handleEdit} />
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
            <span className="text-[#FF671F]">Test Packages v1.0</span>
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
      <AddNewSample
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleNewTestSubmit}
        editData={editingPackage}
        isEditMode={!!editingPackage}
      />
      
    </div>
  );
}
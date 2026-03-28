'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Beaker,
  User,
} from 'lucide-react';
import AddLabTest, { LabTestFormData } from './AddNewLabTest';

interface Branch {
  id: number;
  branchId: string;
  branchName: string;
  location: string;
  testName: string;
  doctor: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUpdated: string;
}

const SAMPLE_LAB_TESTS: Branch[] = [
  {
    id: 1,
    branchId: 'BR001',
    branchName: 'Downtown Medical Center',
    location: 'Mumbai',
    testName: 'Blood Test (Complete Blood Count)',
    doctor: 'Dr. Rajesh Kumar',
    status: 'active',
    createdAt: '2024-01-15',
    lastUpdated: '2024-02-25',
  },
  {
    id: 2,
    branchId: 'BR001',
    branchName: 'Downtown Medical Center',
    location: 'Mumbai',
    testName: 'Urine Analysis',
    doctor: 'Dr. Priya Sharma',
    status: 'active',
    createdAt: '2024-01-20',
    lastUpdated: '2024-02-24',
  },
  {
    id: 3,
    branchId: 'BR002',
    branchName: 'Suburban Clinic',
    location: 'Pune',
    testName: 'X-Ray Imaging',
    doctor: 'Dr. Amit Patel',
    status: 'active',
    createdAt: '2024-01-10',
    lastUpdated: '2024-02-25',
  },
  {
    id: 4,
    branchId: 'BR003',
    branchName: 'North Campus Hospital',
    location: 'Delhi',
    testName: 'MRI Scan',
    doctor: 'Dr. Neha Singh',
    status: 'active',
    createdAt: '2024-02-01',
    lastUpdated: '2024-02-23',
  },
  {
    id: 5,
    branchId: 'BR002',
    branchName: 'Suburban Clinic',
    location: 'Pune',
    testName: 'CT Scan',
    doctor: 'Dr. Vishal Gupta',
    status: 'inactive',
    createdAt: '2024-01-25',
    lastUpdated: '2024-02-15',
  },
  {
    id: 6,
    branchId: 'BR003',
    branchName: 'North Campus Hospital',
    location: 'Delhi',
    testName: 'Ultrasound',
    doctor: 'Dr. Anita Verma',
    status: 'active',
    createdAt: '2024-02-05',
    lastUpdated: '2024-02-24',
  },
];

const BRANCHES = ['BR001', 'BR002', 'BR003', 'BR004'];
const TEST_TYPES = [
  'Blood Test (Complete Blood Count)',
  'Blood Test (Lipid Profile)',
  'Urine Analysis',
  'X-Ray Imaging',
  'MRI Scan',
  'CT Scan',
  'Ultrasound',
  'ECG',
  'Liver Function Test',
  'Thyroid Function Test',
];

function LabTestActionsMenu({
  labTest,
  onEdit,
  onDelete,
}: {
  labTest: Branch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-2">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} /> View
          </button>
          <div className="h-[1px] bg-slate-100 my-1"></div>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function BranchLabTestPage() {
  const [labTests, setLabTests] = useState<Branch[]>(SAMPLE_LAB_TESTS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLabTest, setEditingLabTest] = useState<Branch | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLabTests = labTests.filter((labTest) => {
    const matchesSearch =
      labTest.branchId.toLowerCase().includes(search.toLowerCase()) ||
      labTest.branchName.toLowerCase().includes(search.toLowerCase()) ||
      labTest.testName.toLowerCase().includes(search.toLowerCase()) ||
      labTest.doctor.toLowerCase().includes(search.toLowerCase()) ||
      labTest.location.toLowerCase().includes(search.toLowerCase());

    const matchesBranch = branchFilter === 'all' || labTest.branchId === branchFilter;
    const matchesStatus = statusFilter === 'all' || labTest.status === statusFilter;

    return matchesSearch && matchesBranch && matchesStatus;
  });

  const handleAddLabTest = (formData: LabTestFormData) => {
    if (editingLabTest) {
      setLabTests(
        labTests.map((l) =>
          l.id === editingLabTest.id
            ? {
                ...l,
                branchId: formData.branchId,
                branchName: formData.branchName,
                location: formData.location,
                testName: formData.testName,
                doctor: formData.doctor,
                status: formData.status,
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : l
        )
      );
      setEditingLabTest(null);
    } else {
      const newLabTest: Branch = {
        id: Math.max(...labTests.map((l) => l.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setLabTests([...labTests, newLabTest]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (labTest: Branch) => {
    setEditingLabTest(labTest);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this lab test?')) {
      setLabTests(labTests.filter((l) => l.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLabTest(null);
  };

  const activeTests = labTests.filter(l => l.status === 'active').length;
  const totalBranches = new Set(labTests.map(l => l.branchId)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-emerald-600">🧪 Branch Lab</span> Tests
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage laboratory tests, medical services, and diagnostic facilities across branches.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingLabTest(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg transition-all shadow-md"
            >
              <Plus size={20} /> ADD NEW TEST
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-sm text-slate-600 font-medium">Total Tests</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{labTests.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-slate-600 font-medium">Active Tests</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeTests}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4 border border-cyan-200">
              <p className="text-sm text-slate-600 font-medium">Branches Offering</p>
              <p className="text-3xl font-bold text-cyan-600 mt-1">{totalBranches}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Test Name, Branch, Doctor, or Location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative w-40">
                <select
                  value={branchFilter}
                  onChange={(e) => setBranchFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Branches</option>
                  {BRANCHES.map(branch => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Branch ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Branch Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Test Information
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Assigned Doctor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLabTests.length > 0 ? (
                  filteredLabTests.map((labTest) => (
                    <tr key={labTest.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          <Beaker size={14} /> {labTest.branchId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{labTest.branchName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">📍 {labTest.location}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Beaker size={14} className="text-emerald-600" />
                            {labTest.testName}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Created: {labTest.createdAt}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                            <User size={14} /> {labTest.doctor}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            labTest.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {labTest.status === 'active' ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {labTest.lastUpdated}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <LabTestActionsMenu
                          labTest={labTest}
                          onEdit={() => handleEdit(labTest)}
                          onDelete={() => handleDelete(labTest.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                      <Search className="mx-auto mb-4 text-slate-400" size={32} />
                      <p className="font-semibold text-slate-900 mb-1">No Lab Tests Found</p>
                      <p className="text-sm">Try adjusting your filters or create a new lab test</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredLabTests.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold">{filteredLabTests.length}</span> of{' '}
                <span className="font-bold">{labTests.length}</span> tests
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100">Prev</button>
                <button className="px-3 py-1 text-sm bg-emerald-600 text-white rounded">1</button>
                <button className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddLabTest
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddLabTest}
        editData={editingLabTest}
        branches={BRANCHES}
        testTypes={TEST_TYPES}
      />
    </div>
  );
}
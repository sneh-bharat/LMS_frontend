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
  MapPin,
  Phone,
} from 'lucide-react';
import AddBranch, { BranchFormData } from './Addnewbranch';

interface Branch {
  id: number;
  branchId: string;
  branchName: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phoneNumber: string;
  email: string;
  manager: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUpdated: string;
}

const SAMPLE_BRANCHES: Branch[] = [
  {
    id: 1,
    branchId: 'BR001',
    branchName: 'Downtown Medical Center',
    location: 'Downtown',
    address: '123 Healthcare Ave',
    city: 'Mumbai',
    state: 'Maharashtra',
    zipCode: '400001',
    phoneNumber: '+91-22-1234-5678',
    email: 'downtown@hospital.com',
    manager: 'Dr. Rajesh Kumar',
    status: 'active',
    createdAt: '2023-05-10',
    lastUpdated: '2024-02-25',
  },
  {
    id: 2,
    branchId: 'BR002',
    branchName: 'Suburban Clinic',
    location: 'Suburban',
    address: '456 Medical Plaza',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    phoneNumber: '+91-20-9876-5432',
    email: 'suburban@hospital.com',
    manager: 'Priya Sharma',
    status: 'active',
    createdAt: '2023-08-15',
    lastUpdated: '2024-02-24',
  },
  {
    id: 3,
    branchId: 'BR003',
    branchName: 'North Campus Hospital',
    location: 'North',
    address: '789 Hospital Lane',
    city: 'Delhi',
    state: 'Delhi',
    zipCode: '110001',
    phoneNumber: '+91-11-5555-8888',
    email: 'north@hospital.com',
    manager: 'Amit Patel',
    status: 'active',
    createdAt: '2023-03-20',
    lastUpdated: '2024-02-25',
  },
  {
    id: 4,
    branchId: 'BR004',
    branchName: 'South District Facility',
    location: 'South',
    address: '321 Care Center',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560001',
    phoneNumber: '+91-80-4444-2222',
    email: 'south@hospital.com',
    manager: 'Dr. Neha Singh',
    status: 'inactive',
    createdAt: '2023-11-05',
    lastUpdated: '2024-01-15',
  },
];

const CITIES = ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

function BranchActionsMenu({
  branch,
  onEdit,
  onDelete,
}: {
  branch: Branch;
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

function StaffBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
      👥 {count} Staff
    </span>
  );
}

function DepartmentBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
      🏢 {count} Depts
    </span>
  );
}

export default function BranchListPage() {
  const [branches, setBranches] = useState<Branch[]>(SAMPLE_BRANCHES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.branchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = cityFilter === 'all' || branch.city === cityFilter;
    const matchesStatus = statusFilter === 'all' || branch.status === statusFilter;

    return matchesSearch && matchesCity && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddBranch = (formData: BranchFormData) => {
    if (editingBranch) {
      setBranches(
        branches.map((b) =>
          b.id === editingBranch.id
            ? {
                ...b,
                branchId: formData.branchId,
                branchName: formData.branchName,
                location: formData.location,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                manager: formData.manager,
                status: formData.status,
                lastUpdated: new Date().toISOString().split('T')[0],
              }
            : b
        )
      );
      setEditingBranch(null);
    } else {
      const newBranch: Branch = {
        id: Math.max(...branches.map((b) => b.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setBranches([...branches, newBranch]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      setBranches(branches.filter((b) => b.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
  };

  const activeBranches = branches.filter(b => b.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-blue-600">🏥 Branch</span> Management
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage hospital branches, locations, staff, and departmental organization.
              </p>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => {
                setEditingBranch(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-lg hover:shadow-lg transition-all shadow-md"
            >
              <Plus size={20} /> ADD NEW BRANCH
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-slate-600 font-medium">Total Branches</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{branches.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-slate-600 font-medium">Active Branches</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeBranches}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Branch ID, Name, City, or Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative w-40">
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Cities</option>
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              <div className="relative w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  suppressHydrationWarning
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Location
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBranches.length > 0 ? (
                  paginatedBranches.map((branch) => (
                    <tr key={branch.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          <MapPin size={14} /> {branch.branchId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{branch.branchName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{branch.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{branch.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{branch.city}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{branch.state}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{branch.address}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{branch.manager}</p>
                      </td>
                   
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            branch.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {branch.status === 'active' ? '✓ Active' : '✗ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <BranchActionsMenu
                          branch={branch}
                          onEdit={() => handleEdit(branch)}
                          onDelete={() => handleDelete(branch.id)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-600">
                      <Search className="mx-auto mb-4 text-slate-400" size={32} />
                      <p className="font-semibold text-slate-900 mb-1">No Branches Found</p>
                      <p className="text-sm">Try adjusting your filters or create a new branch</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {paginatedBranches.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold">{paginatedBranches.length}</span> of{' '}
                <span className="font-bold">{branches.length}</span> branches
              </p>
              <div className="flex gap-2">
                <button
                  suppressHydrationWarning
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  suppressHydrationWarning
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                >
                  {currentPage}
                </button>
                <button
                  suppressHydrationWarning
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddBranch
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddBranch}
        editData={editingBranch}
        cities={CITIES}
      />
    </div>
  );
}
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
} from 'lucide-react';
import AddNew, { FormData } from './AddNew';

interface Instrument {
  id: number;
  department: string;
  name: string;
  description: string;
  operationType: 'purchase' | 'lease' | 'rental' | 'maintenance';
  vendorSupplierName: string;
  purchaseDate: string;
  amcRenewalDate: string;
  serviceInterval: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'asNeeded';
  serviceCallNumber: string;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed';
  createdAt: string;
}

const SAMPLE_INSTRUMENTS: Instrument[] = [
  {
    id: 1,
    department: 'Cardiology',
    name: 'ECG Machine Pro X1',
    description: 'Advanced electrocardiogram machine with wireless capability and digital reporting',
    operationType: 'purchase',
    vendorSupplierName: 'Med Supply Co.',
    purchaseDate: '2023-01-15',
    amcRenewalDate: '2024-01-15',
    serviceInterval: 'quarterly',
    serviceCallNumber: 'SC-001-2024',
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: 2,
    department: 'Orthopedics',
    name: 'Digital X-Ray System',
    description: 'High-resolution digital radiography system for orthopedic imaging',
    operationType: 'lease',
    vendorSupplierName: 'Healthcare Equipment Inc.',
    purchaseDate: '2023-03-20',
    amcRenewalDate: '2024-03-20',
    serviceInterval: 'monthly',
    serviceCallNumber: 'SC-002-2024',
    status: 'active',
    createdAt: '2023-03-20',
  },
  {
    id: 3,
    department: 'Dermatology',
    name: 'Laser Therapy Device',
    description: 'CO2 laser system for dermatological treatments and skin resurfacing',
    operationType: 'purchase',
    vendorSupplierName: 'Diagnostic Systems Ltd.',
    purchaseDate: '2022-06-10',
    amcRenewalDate: '2024-06-10',
    serviceInterval: 'biannual',
    serviceCallNumber: 'SC-003-2024',
    status: 'maintenance',
    createdAt: '2022-06-10',
  },
  {
    id: 4,
    department: 'Neurology',
    name: 'EEG Monitoring System',
    description: 'Multi-channel electroencephalography system for brain activity monitoring',
    operationType: 'rental',
    vendorSupplierName: 'Medical Devices Plus',
    purchaseDate: '2023-09-05',
    amcRenewalDate: '2024-09-05',
    serviceInterval: 'annual',
    serviceCallNumber: 'SC-004-2024',
    status: 'active',
    createdAt: '2023-09-05',
  },
];

const DEPARTMENTS = ['Cardiology', 'Dermatology', 'Orthopedics', 'Neurology', 'Pediatrics', 'General Surgery'];
const VENDORS = ['Med Supply Co.', 'Healthcare Equipment Inc.', 'Diagnostic Systems Ltd.', 'Medical Devices Plus'];

function InstrumentActionsMenu({
  instrument,
  onEdit,
  onDelete,
}: {
  instrument: Instrument;
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

export default function MachineInstrumentPage() {
  const [instruments, setInstruments] = useState<Instrument[]>(SAMPLE_INSTRUMENTS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance' | 'disposed'>('all');

  const filteredInstruments = instruments.filter((instrument) => {
    const matchesSearch =
      instrument.name.toLowerCase().includes(search.toLowerCase()) ||
      instrument.description.toLowerCase().includes(search.toLowerCase()) ||
      instrument.vendorSupplierName.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment = departmentFilter === 'all' || instrument.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || instrument.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddInstrument = (formData: FormData) => {
    if (editingInstrument) {
      setInstruments(
        instruments.map((i) =>
          i.id === editingInstrument.id
            ? { ...i, ...formData }
            : i
        )
      );
      setEditingInstrument(null);
    } else {
      const newInstrument: Instrument = {
        id: Math.max(...instruments.map((i) => i.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setInstruments([...instruments, newInstrument]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (instrument: Instrument) => {
    setEditingInstrument(instrument);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this instrument?')) {
      setInstruments(instruments.filter((i) => i.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInstrument(null);
  };

  const activeCount = instruments.filter((i) => i.status === 'active').length;
  const maintenanceCount = instruments.filter((i) => i.status === 'maintenance').length;
  const inactiveCount = instruments.filter((i) => i.status === 'inactive').length;
  const disposedCount = instruments.filter((i) => i.status === 'disposed').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Instrument <span className="text-blue-600">&</span> Machine
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage medical instruments, machines, AMC contracts, and maintenance schedules.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingInstrument(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} /> ADD NEW
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-1">Total Instruments</p>
              <p className="text-3xl font-bold text-blue-900">{instruments.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide mb-1">Active</p>
              <p className="text-3xl font-bold text-emerald-900">{activeCount}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-xl p-4">
              <p className="text-yellow-600 text-sm font-semibold uppercase tracking-wide mb-1">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-900">{maintenanceCount}</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200 rounded-xl p-4">
              <p className="text-rose-600 text-sm font-semibold uppercase tracking-wide mb-1">Inactive</p>
              <p className="text-3xl font-bold text-rose-900">{inactiveCount + disposedCount}</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by instrument name, description, or vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all"
              />
            </div>

            {/* Department Filter */}
            <div className="relative min-w-[180px]">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium appearance-none bg-white cursor-pointer text-slate-700"
              >
                <option value="all">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium appearance-none bg-white cursor-pointer text-slate-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="disposed">Disposed</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Instrument Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    AMC Renewal
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstruments.map((instrument) => (
                  <tr key={instrument.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{instrument.name}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{instrument.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                        {instrument.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {instrument.vendorSupplierName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{instrument.purchaseDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{instrument.amcRenewalDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          instrument.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : instrument.status === 'maintenance'
                            ? 'bg-yellow-100 text-yellow-700'
                            : instrument.status === 'inactive'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            instrument.status === 'active'
                              ? 'bg-emerald-500'
                              : instrument.status === 'maintenance'
                              ? 'bg-yellow-500'
                              : instrument.status === 'inactive'
                              ? 'bg-slate-500'
                              : 'bg-rose-500'
                          }`}
                        ></div>
                        {instrument.status.charAt(0).toUpperCase() + instrument.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <InstrumentActionsMenu
                        instrument={instrument}
                        onEdit={() => handleEdit(instrument)}
                        onDelete={() => handleDelete(instrument.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">
              Showing <span className="font-bold">{filteredInstruments.length}</span> of{' '}
              <span className="font-bold">{instruments.length}</span> instruments
            </p>
          </div>
        </div>

        {/* Empty State */}
        {filteredInstruments.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No instruments found</h3>
            <p className="text-slate-600">
              {search || departmentFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters or search criteria'
                : 'Start by adding your first instrument'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AddNew
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddInstrument}
        editData={editingInstrument}
        departments={DEPARTMENTS}
        vendors={VENDORS}
      />
    </div>
  );
}
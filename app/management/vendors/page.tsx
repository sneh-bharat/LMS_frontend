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
import NewVendor, { FormData } from './NewVendor';

interface Vendor {
  id: number;
  name: string;
  address: string;
  gstNumber: string;
  contactNumber: string;
  email: string;
  website: string;
  contactPersonName: string;
  mobile: string;
  contactPersonEmail: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

const SAMPLE_VENDORS: Vendor[] = [
  {
    id: 1,
    name: 'Tech Supplies Co.',
    address: '123 Business St, New York, NY 10001',
    gstNumber: '18AABCU9603R1Z5',
    contactNumber: '+1-212-555-0100',
    email: 'info@techsupplies.com',
    website: 'www.techsupplies.com',
    contactPersonName: 'John Smith',
    mobile: '+1-212-555-0101',
    contactPersonEmail: 'john@techsupplies.com',
    registrationDate: '2023-01-15',
    status: 'active',
    createdAt: '2023-01-15',
  },
  {
    id: 2,
    name: 'Office Materials Ltd.',
    address: '456 Commerce Ave, Los Angeles, CA 90001',
    gstNumber: '27AABCU9603R1Z5',
    contactNumber: '+1-213-555-0200',
    email: 'contact@officematerials.com',
    website: 'www.officematerials.com',
    contactPersonName: 'Sarah Johnson',
    mobile: '+1-213-555-0201',
    contactPersonEmail: 'sarah@officematerials.com',
    registrationDate: '2023-02-20',
    status: 'active',
    createdAt: '2023-02-20',
  },
  {
    id: 3,
    name: 'Industrial Goods Inc.',
    address: '789 Factory Rd, Chicago, IL 60601',
    gstNumber: '06AABCU9603R1Z5',
    contactNumber: '+1-312-555-0300',
    email: 'sales@industrialgoods.com',
    website: 'www.industrialgoods.com',
    contactPersonName: 'Michael Davis',
    mobile: '+1-312-555-0301',
    contactPersonEmail: 'michael@industrialgoods.com',
    registrationDate: '2023-03-10',
    status: 'active',
    createdAt: '2023-03-10',
  },
];

function VendorActionsMenu({ vendor, onEdit, onDelete }: { vendor: Vendor; onEdit: () => void; onDelete: () => void }) {
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

export default function VendorSupplierPage() {
  const [vendors, setVendors] = useState<Vendor[]>(SAMPLE_VENDORS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.email.toLowerCase().includes(search.toLowerCase()) ||
      vendor.contactNumber.includes(search) ||
      vendor.gstNumber.includes(search);

    const matchesStatus = statusFilter === 'all' || vendor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddVendor = (formData: FormData) => {
    if (editingVendor) {
      setVendors(
        vendors.map((v) =>
          v.id === editingVendor.id
            ? { ...v, ...formData }
            : v
        )
      );
      setEditingVendor(null);
    } else {
      const newVendor: Vendor = {
        id: Math.max(...vendors.map((v) => v.id), 0) + 1,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setVendors([...vendors, newVendor]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      setVendors(vendors.filter((v) => v.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  const activeCount = vendors.filter((v) => v.status === 'active').length;
  const inactiveCount = vendors.filter((v) => v.status === 'inactive').length;
  const pendingCount = vendors.filter((v) => v.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Vendor <span className="text-blue-600">&</span> Suppliers
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage vendor information, contact details, and registration status.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingVendor(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
             
            >
              <Plus size={20} /> ADD NEW
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wide mb-1">Total Vendors</p>
              <p className="text-3xl font-bold text-blue-900">{vendors.length}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-600 text-sm font-semibold uppercase tracking-wide mb-1">Active</p>
              <p className="text-3xl font-bold text-emerald-900">{activeCount}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-600 text-sm font-semibold uppercase tracking-wide mb-1">Pending</p>
              <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-rose-100/50 border border-rose-200 rounded-xl p-4">
              <p className="text-rose-600 text-sm font-semibold uppercase tracking-wide mb-1">Inactive</p>
              <p className="text-3xl font-bold text-rose-900">{inactiveCount}</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by vendor name, email, GST number, or contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[200px]">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium appearance-none bg-white cursor-pointer text-slate-700"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
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
                    Vendor Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    GST Number
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Email
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
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{vendor.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{vendor.contactPersonName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {vendor.gstNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <p>{vendor.contactNumber}</p>
                        <p className="text-xs text-slate-500 mt-1">{vendor.mobile}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <p className="text-blue-600 hover:text-blue-700 cursor-pointer">
                          {vendor.email}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{vendor.contactPersonEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                          vendor.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : vendor.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            vendor.status === 'active'
                              ? 'bg-emerald-500'
                              : vendor.status === 'pending'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        ></div>
                        {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <VendorActionsMenu
                        vendor={vendor}
                        onEdit={() => handleEdit(vendor)}
                        onDelete={() => handleDelete(vendor.id)}
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
              Showing <span className="font-bold">{filteredVendors.length}</span> of{' '}
              <span className="font-bold">{vendors.length}</span> vendors
            </p>
          </div>
        </div>

        {/* Empty State */}
        {filteredVendors.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No vendors found</h3>
            <p className="text-slate-600">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search criteria'
                : 'Start by adding your first vendor'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewVendor
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddVendor}
        editData={editingVendor}
      />
    </div>
  );
}
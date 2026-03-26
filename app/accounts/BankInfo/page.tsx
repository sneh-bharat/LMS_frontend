'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Building2,
  MapPin,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  ArrowRightLeft
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Table from '@/components/ui/table';
import AddNewBank from './AddNewBank';

// ─── Data Types ──────────────────────────────────────────────────────────────

interface Bank {
  id: number;
  bankName: string;
  branch: string;
  accountNumber: string;
  ifscCode: string;
  contactNumber: string;
  email: string;
  accountHolderName: string;
  status: 'Active' | 'Inactive';
  openingBalance?: number;
  currentBalance?: number;
  createdDate?: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function formatCurrency(amount: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SAMPLE_BANKS: Bank[] = [
  {
    id: 1,
    bankName: 'HDFC Bank',
    branch: 'Connaught Place',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    contactNumber: '+91 11 2345 6789',
    email: 'cp.branch@hdfcbank.com',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Active',
    openingBalance: 500000,
    currentBalance: 1250000,
    createdDate: '2023-06-15T10:30:00.000Z',
  },
  {
    id: 2,
    bankName: 'ICICI Bank',
    branch: 'Nehru Place',
    accountNumber: '002001567890',
    ifscCode: 'ICIC0000020',
    contactNumber: '+91 11 4567 8901',
    email: 'nehruplace@icicibank.com',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Active',
    openingBalance: 300000,
    currentBalance: 875000,
    createdDate: '2023-08-20T14:00:00.000Z',
  },
  {
    id: 3,
    bankName: 'State Bank of India',
    branch: 'Lajpat Nagar',
    accountNumber: '30567890123',
    ifscCode: 'SBIN0001234',
    contactNumber: '+91 11 2987 6543',
    email: 'lajpatnagar@sbi.co.in',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Active',
    openingBalance: 200000,
    currentBalance: 450000,
    createdDate: '2023-04-10T09:15:00.000Z',
  },
  {
    id: 4,
    bankName: 'Axis Bank',
    branch: 'South Extension',
    accountNumber: '912020067890123',
    ifscCode: 'UTIB0001234',
    contactNumber: '+91 11 4123 4567',
    email: 'southext@axisbank.com',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Inactive',
    openingBalance: 100000,
    currentBalance: 0,
    createdDate: '2022-12-05T11:45:00.000Z',
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BankInfoPage() {
  const [banks, setBanks] = useState<Bank[]>(SAMPLE_BANKS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);

  const handleCreateBank = (data: Omit<Bank, 'id'>) => {
    const newBank: Bank = {
      ...data,
      id: Math.max(...banks.map(b => b.id), 0) + 1,
      createdDate: new Date().toISOString(),
    };
    setBanks([...banks, newBank]);
    setIsModalOpen(false);
  };

  const handleUpdateBank = (data: Partial<Bank>) => {
    if (!editingBank) return;
    setBanks(banks.map(bank =>
      bank.id === editingBank.id ? { ...bank, ...data } : bank
    ));
    setIsModalOpen(false);
    setEditingBank(null);
  };

  const handleDeleteBank = (bank: Bank) => {
    if (!confirm(`Are you sure you want to delete ${bank.bankName}?`)) return;
    setBanks(banks.filter(b => b.id !== bank.id));
  };

  const handleToggleStatus = (bank: Bank) => {
    setBanks(banks.map(b =>
      b.id === bank.id
        ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' }
        : b
    ));
  };

  const filteredBanks = banks.filter(bank => {
    const matchesSearch =
      bank.bankName.toLowerCase().includes(search.toLowerCase()) ||
      bank.accountNumber.includes(search) ||
      bank.ifscCode.toLowerCase().includes(search.toLowerCase()) ||
      bank.branch.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || bank.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'bankName',
      label: 'Bank Details',
      render: (_: any, row: Bank) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-slate-400" />
            <span className="font-bold text-slate-900">{row.bankName}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin size={12} /> {row.branch}
          </div>
        </div>
      ),
    },
    {
      key: 'accountNumber',
      label: 'Account Info',
      render: (_: any, row: Bank) => (
        <div>
          <div className="font-mono font-bold text-slate-900 text-sm">
            {row.accountNumber}
          </div>
          <div className="text-xs text-slate-500">IFSC: {row.ifscCode}</div>
        </div>
      ),
    },
    {
      key: 'contactNumber',
      label: 'Contact',
      render: (_: any, row: Bank) => (
        <div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
            <Phone size={12} /> {row.contactNumber}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Mail size={12} /> {row.email}
          </div>
        </div>
      ),
    },
    {
      key: 'currentBalance',
      label: 'Current Balance',
      align: 'right' as const,
      render: (value: number, row: Bank) => (
        <div className="text-right">
          <div className={`text-sm font-black ${value > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {formatCurrency(value)}
          </div>
          {row.openingBalance && (
            <div className="text-[10px] text-slate-500">
              Open: {formatCurrency(row.openingBalance)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge className={`${getStatusColor(value)} border font-bold`}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (_: any, row: Bank) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleToggleStatus(row)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-blue-600"
            title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
          >
            {row.status === 'Active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          </button>
          <button
            onClick={() => { setEditingBank(row); setIsModalOpen(true); }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDeleteBank(row)}
            className="p-2 hover:bg-rose-50 rounded-lg transition-all text-slate-400 hover:text-rose-600"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <Building2 size={28} className="text-emerald-600" />
            Bank Information Management
          </h1>
          <p className="text-sm text-slate-500">Manage bank accounts and track transactions</p>
        </div>
        <Button
          variant="gradient"
          size="sm"
          className="gap-2 px-6"
          onClick={() => { setEditingBank(null); setIsModalOpen(true); }}
        >
          <Plus size={16} /> Add New Bank
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
              <Building2 size={20} className="text-emerald-600" />
            </div>
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Total Banks</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{banks.length}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/30 flex items-center justify-center">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Active</span>
          </div>
          <div className="text-3xl font-black text-slate-900">
            {banks.filter(b => b.status === 'Active').length}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
              <ArrowRightLeft size={20} className="text-amber-600" />
            </div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Total Balance</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0))}
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-400/30 flex items-center justify-center">
              <Shield size={20} className="text-violet-600" />
            </div>
            <span className="text-violet-700 font-bold text-xs uppercase tracking-wider">Avg Balance</span>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {formatCurrency(banks.reduce((sum, b) => sum + (b.currentBalance || 0), 0) / banks.length || 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bank name, account number, or IFSC..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <Table columns={columns} data={filteredBanks} />
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredBanks.length} of {banks.length} Banks
          </span>
          <span className="text-[10px] font-bold text-emerald-600">
            Total: {formatCurrency(filteredBanks.reduce((sum, b) => sum + (b.currentBalance || 0), 0))}
          </span>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AddNewBank
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBank(null); }}
        onSubmit={editingBank ? handleUpdateBank : handleCreateBank}
        editData={editingBank || undefined}
        isEditMode={!!editingBank}
      />
    </div>
  );
}
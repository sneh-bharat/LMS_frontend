'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Activity } from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Table from '@/components/ui/table';
import AddMemberModal from './AddMemberModal';

// ─── Types ────────────────────────────────────────────────────────────────────

type MembershipType = 'Basic' | 'Silver' | 'Gold' | 'Platinum' | 'Premium' | 'Loyalty';
type PaymentMode = 'Cash' | 'Card' | 'Online' | 'UPI';
type WalletStatus = 'Active' | 'Inactive';
type ValidityType = 'Lifetime' | 'Months';

interface MarketingStaff {
  id: number;
  name: string;
  employeeCode: string;
}

interface Member {
  id: number;
  cardId: string;
  type: MembershipType;
  cashbackPercentage: number;
  discountPercentage: number;
  validity: { type: ValidityType; value: number };
  walletStatus: WalletStatus;
  marketingStaff: MarketingStaff;
  createdDate: string;
  registrationCharges: number;
  paymentMode: PaymentMode;
}

interface MemberFormData {
  cardId: string;
  type: MembershipType;
  cashbackPercentage: number;
  discountPercentage: number;
  validityType: ValidityType;
  validityMonths: number;
  walletStatus: WalletStatus;
  marketingStaffId: number;
  marketingStaffName: string;
  marketingStaffCode: string;
  registrationCharges: number;
  paymentMode: PaymentMode;
  notes: string;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function getMembershipTypeColor(type: string): string {
  const map: Record<string, string> = {
    Basic:    'bg-slate-100  text-slate-600  border-slate-200',
    Silver:   'bg-gray-100   text-gray-600   border-gray-300',
    Gold:     'bg-amber-100  text-amber-700  border-amber-200',
    Platinum: 'bg-violet-100 text-violet-700 border-violet-200',
    Premium:  'bg-rose-100   text-rose-700   border-rose-200',
    Loyalty:  'bg-blue-100   text-blue-700   border-blue-200',
  };
  return map[type] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

function formatDate(isoString: string): string {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MEMBERS: Member[] = [
  {
    id: 1, cardId: 'MEM2024001', type: 'Gold',
    cashbackPercentage: 10, discountPercentage: 5,
    validity: { type: 'Months', value: 12 }, walletStatus: 'Active',
    marketingStaff: { id: 1, name: 'Ravi Sharma', employeeCode: 'EMP001' },
    createdDate: '2024-01-15T09:30:00.000Z', registrationCharges: 500, paymentMode: 'Cash',
  },
  {
    id: 2, cardId: 'MEM2024002', type: 'Platinum',
    cashbackPercentage: 15, discountPercentage: 10,
    validity: { type: 'Lifetime', value: 0 }, walletStatus: 'Active',
    marketingStaff: { id: 2, name: 'Priya Mehta', employeeCode: 'EMP002' },
    createdDate: '2024-02-20T11:00:00.000Z', registrationCharges: 2000, paymentMode: 'UPI',
  },
  {
    id: 3, cardId: 'MEM2024003', type: 'Silver',
    cashbackPercentage: 5, discountPercentage: 3,
    validity: { type: 'Months', value: 6 }, walletStatus: 'Inactive',
    marketingStaff: { id: 3, name: 'Arjun Singh', employeeCode: 'EMP003' },
    createdDate: '2024-03-10T14:45:00.000Z', registrationCharges: 250, paymentMode: 'Card',
  },
  {
    id: 4, cardId: 'MEM2024004', type: 'Basic',
    cashbackPercentage: 2, discountPercentage: 0,
    validity: { type: 'Months', value: 12 }, walletStatus: 'Active',
    marketingStaff: { id: 4, name: 'Neha Kapoor', employeeCode: 'EMP004' },
    createdDate: '2024-04-05T08:00:00.000Z', registrationCharges: 100, paymentMode: 'Online',
  },
  {
    id: 5, cardId: 'MEM2024005', type: 'Premium',
    cashbackPercentage: 20, discountPercentage: 15,
    validity: { type: 'Lifetime', value: 0 }, walletStatus: 'Active',
    marketingStaff: { id: 5, name: 'Vikram Patel', employeeCode: 'EMP005' },
    createdDate: '2024-05-18T16:20:00.000Z', registrationCharges: 5000, paymentMode: 'Card',
  },
  {
    id: 6, cardId: 'MEM2024006', type: 'Loyalty',
    cashbackPercentage: 8, discountPercentage: 6,
    validity: { type: 'Months', value: 24 }, walletStatus: 'Active',
    marketingStaff: { id: 1, name: 'Ravi Sharma', employeeCode: 'EMP001' },
    createdDate: '2024-06-22T10:10:00.000Z', registrationCharges: 750, paymentMode: 'UPI',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const handleCreateMember = (data: MemberFormData) => {
    const newMember: Member = {
      id: Math.max(...members.map(m => m.id), 0) + 1,
      cardId: data.cardId,
      type: data.type,
      cashbackPercentage: data.cashbackPercentage,
      discountPercentage: data.discountPercentage,
      validity: { type: data.validityType, value: data.validityMonths },
      walletStatus: data.walletStatus,
      marketingStaff: {
        id: data.marketingStaffId,
        name: data.marketingStaffName,
        employeeCode: data.marketingStaffCode,
      },
      createdDate: new Date().toISOString(),
      registrationCharges: data.registrationCharges,
      paymentMode: data.paymentMode,
    };
    setMembers([...members, newMember]);
    alert('Member created successfully! 🎉');
    setIsModalOpen(false);
  };

  const handleUpdateMember = (data: MemberFormData) => {
    if (!editingMember) return;
    setMembers(members.map(member =>
      member.id === editingMember.id
        ? {
            ...member,
            cardId: data.cardId,
            type: data.type,
            cashbackPercentage: data.cashbackPercentage,
            discountPercentage: data.discountPercentage,
            validity: { type: data.validityType, value: data.validityMonths },
            walletStatus: data.walletStatus,
            registrationCharges: data.registrationCharges,
            paymentMode: data.paymentMode,
          }
        : member
    ));
    alert('Member updated successfully! ✨');
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (member: Member) => {
    if (!confirm(`Are you sure you want to delete member ${member.cardId}?`)) return;
    setMembers(members.filter(m => m.id !== member.id));
    alert('Member deleted successfully! ✓');
  };

  const handleToggleStatus = (member: Member) => {
    setMembers(members.map(m =>
      m.id === member.id
        ? { ...m, walletStatus: m.walletStatus === 'Active' ? 'Inactive' : 'Active' as WalletStatus }
        : m
    ));
    alert('Status updated successfully! 🔄');
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch =
      member.cardId.toLowerCase().includes(search.toLowerCase()) ||
      member.marketingStaff.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || member.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || member.walletStatus === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const columns = [
    {
      key: 'cardId',
      label: 'Card ID',
      render: (value: string) => (
        <span className="text-xs font-bold text-slate-900 font-mono">{value}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <Badge className={`px-3 py-1.5 text-[10px] font-bold uppercase border ${getMembershipTypeColor(value)}`}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'cashbackPercentage',
      label: 'Cashback',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-sm font-bold text-emerald-600 tracking-tight">{value}%</div>
      ),
    },
    {
      key: 'discountPercentage',
      label: 'Discount',
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-sm font-bold text-blue-600 tracking-tight">{value}%</div>
      ),
    },
    {
      key: 'validity',
      label: 'Validity',
      render: (value: any) => (
        <span className="text-xs font-bold text-slate-700">
          {value.type === 'Lifetime' ? 'Lifetime' : `${value.value} Months`}
        </span>
      ),
    },
    {
      key: 'walletStatus',
      label: 'Wallet Status',
      render: (value: string) => (
        <Badge variant={value === 'Active' ? 'success' : 'secondary'}>{value}</Badge>
      ),
    },
    {
      key: 'marketingStaff',
      label: 'Marketing Staff',
      render: (value: any) => (
        <div>
          <div className="text-xs font-bold text-slate-900">{value.name}</div>
          {value.employeeCode && (
            <div className="text-[10px] text-slate-500 font-mono">{value.employeeCode}</div>
          )}
        </div>
      ),
    },
    {
      key: 'createdDate',
      label: 'Created Date',
      render: (value: string) => (
        <div className="text-xs font-bold text-slate-700">{formatDate(value)}</div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      render: (_: any, row: Member) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setEditingMember(row); setIsModalOpen(true); }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-blue-600"
            title={row.walletStatus === 'Active' ? 'Deactivate' : 'Activate'}
          >
            <Activity size={16} />
          </button>
          <button
            onClick={() => handleDeleteMember(row)}
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Membership Management</h1>
          <p className="text-sm text-slate-500">Manage membership cards and benefits</p>
        </div>
        <Button
          variant="gradient"
          size="sm"
          className="gap-2 px-6"
          onClick={() => { setEditingMember(null); setIsModalOpen(true); }}
        >
          <Plus size={16} /> Add New Member
        </Button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Card ID or Mobile..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Types</option>
              <option value="Basic">Basic</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
              <option value="Premium">Premium</option>
              <option value="Loyalty">Loyalty</option>
            </select>
          </div>
          <div className="relative flex-1 lg:w-40 group">
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
        <Table columns={columns} data={filteredMembers} />
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredMembers.length} Members
          </span>
        </div>
      </div>

      {/* Modal */}
      <AddMemberModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMember(null); }}
        onSubmit={editingMember ? handleUpdateMember : handleCreateMember}
        editData={editingMember}
        isEditMode={!!editingMember}
      />
    </div>
  );
}
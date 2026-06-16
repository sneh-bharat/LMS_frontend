'use client';

import { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Building2,
  CheckCircle,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shield,
  Trash2,
  XCircle,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  DataTable,
  type DataTableColumn,
  FilterBar,
  PageHeader,
  StatCard,
  StatCardGrid,
} from '@/components/common';
import { formatCurrency } from '@/lib/format';
import { BankForm } from '../components/BankForm';
import { BANK_STATUS_COLORS, BANK_STATUS_OPTIONS, SAMPLE_BANKS } from '../constants/bank-info';
import type { Bank } from '../types/accounts.types';
import type { BankFormValues } from '../schemas/bank.schema';

function toForm(bank: Bank): BankFormValues {
  return {
    bankName: bank.bankName,
    branch: bank.branch,
    accountNumber: bank.accountNumber,
    ifscCode: bank.ifscCode,
    contactNumber: bank.contactNumber,
    email: bank.email,
    accountHolderName: bank.accountHolderName,
    status: bank.status,
    openingBalance: bank.openingBalance ?? 0,
    currentBalance: bank.currentBalance ?? 0,
  };
}

/** Bank information management. TODO: replace `SAMPLE_BANKS` with `useBanks()`. */
export function BankInfoPage() {
  const [banks, setBanks] = useState<Bank[]>(SAMPLE_BANKS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bank | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return banks.filter((bank) => {
      const matchesSearch =
        bank.bankName.toLowerCase().includes(q) ||
        bank.accountNumber.includes(search) ||
        bank.ifscCode.toLowerCase().includes(q) ||
        bank.branch.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || bank.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [banks, search, statusFilter]);

  const totalBalance = banks.reduce((sum, b) => sum + (b.currentBalance ?? 0), 0);

  const handleSubmit = (values: BankFormValues) => {
    if (editing) {
      setBanks((prev) => prev.map((b) => (b.id === editing.id ? { ...b, ...values } : b)));
    } else {
      setBanks((prev) => [
        ...prev,
        { ...values, id: Math.max(0, ...prev.map((b) => b.id)) + 1, createdDate: new Date().toISOString() },
      ]);
    }
    setEditing(null);
  };

  const toggleStatus = (bank: Bank) =>
    setBanks((prev) =>
      prev.map((b) =>
        b.id === bank.id ? { ...b, status: b.status === 'Active' ? 'Inactive' : 'Active' } : b,
      ),
    );

  const remove = (bank: Bank) => {
    if (confirm(`Are you sure you want to delete ${bank.bankName}?`)) {
      setBanks((prev) => prev.filter((b) => b.id !== bank.id));
    }
  };

  const columns = useMemo<DataTableColumn<Bank>[]>(
    () => [
      {
        key: 'bankName',
        label: 'Bank Details',
        render: (row) => (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Building2 size={16} className="text-slate-400" />
              <span className="font-bold text-slate-900">{row.bankName}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} /> {row.branch}
            </div>
          </div>
        ),
      },
      {
        key: 'accountNumber',
        label: 'Account Info',
        render: (row) => (
          <div>
            <div className="font-mono text-sm font-bold text-slate-900">{row.accountNumber}</div>
            <div className="text-xs text-slate-500">IFSC: {row.ifscCode}</div>
          </div>
        ),
      },
      {
        key: 'contactNumber',
        label: 'Contact',
        render: (row) => (
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
        align: 'right',
        render: (row) => (
          <div className="text-right">
            <div className={`text-sm font-black ${(row.currentBalance ?? 0) > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
              {formatCurrency(row.currentBalance)}
            </div>
            {row.openingBalance ? (
              <div className="text-[10px] text-slate-500">Open: {formatCurrency(row.openingBalance)}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <Badge className={`${BANK_STATUS_COLORS[row.status] ?? ''} border font-bold`}>{row.status}</Badge>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        align: 'center',
        render: (row) => (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => toggleStatus(row)}
              className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-blue-600"
              title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
            >
              {row.status === 'Active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
            </button>
            <button
              onClick={() => {
                setEditing(row);
                setIsModalOpen(true);
              }}
              className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-emerald-600"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => remove(row)}
              className="rounded-lg p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const activeCount = banks.filter((b) => b.status === 'Active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 p-6">
      <PageHeader
        icon={Building2}
        title="Bank Information Management"
        subtitle="Manage bank accounts and track transactions"
        actions={
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 px-6"
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} /> Add New Bank
          </Button>
        }
      />

      <StatCardGrid>
        <StatCard tone="emerald" icon={Building2} label="Total Banks" value={banks.length} />
        <StatCard tone="blue" icon={CheckCircle} label="Active" value={activeCount} />
        <StatCard
          tone="amber"
          icon={ArrowRightLeft}
          label="Total Balance"
          value={<span className="text-2xl">{formatCurrency(totalBalance)}</span>}
        />
        <StatCard
          tone="slate"
          icon={Shield}
          label="Avg Balance"
          value={<span className="text-2xl">{formatCurrency(banks.length ? totalBalance / banks.length : 0)}</span>}
        />
      </StatCardGrid>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by bank name, account number, or IFSC…"
        selects={[
          { name: 'status', value: statusFilter, onChange: setStatusFilter, options: BANK_STATUS_OPTIONS, widthClass: 'lg:w-48' },
        ]}
      />

      <DataTable columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="No banks found" />

      <div className="mt-2 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span>
          Showing {filtered.length} of {banks.length} Banks
        </span>
        <span className="text-emerald-600">
          Total: {formatCurrency(filtered.reduce((sum, b) => sum + (b.currentBalance ?? 0), 0))}
        </span>
      </div>

      <BankForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={editing ? toForm(editing) : null}
        isEditMode={!!editing}
      />
    </div>
  );
}

export default BankInfoPage;

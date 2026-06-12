'use client';

import { useMemo, useState } from 'react';
import AddNewAdmin from './AddNewAdmin';
import {
  ChevronDown,
  Database,
  Filter,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  listingBadge,
  listingFilterSelect,
  listingPaginationText,
  listingRefreshBtn,
  listingRowMono,
  listingRowPhone,
  listingRowTitle,
  listingRowValue,
  listingSearchInput,
  listingSubtitle,
  listingTableCard,
  listingTableFooter,
  listingTableTh,
  listingTitle,
  listingToolbar,
  listingToolbarInner,
} from '@/lib/listingPageStyles';

type AdminType = 'SYSTEM' | 'TENANT';
type AdminRole = 'ADMIN' | 'LAB_MANAGER' | 'USER';

interface AdminRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  role: AdminRole;
  type: AdminType;
}

const STATIC_ADMINS: AdminRecord[] = [
  {
    id: 1,
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    username: 'johndoe',
    role: 'ADMIN',
    type: 'SYSTEM',
  },
  {
    id: 2,
    fullName: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '9123456789',
    username: 'sarahw',
    role: 'LAB_MANAGER',
    type: 'TENANT',
  },
  {
    id: 3,
    fullName: 'David Smith',
    email: 'david@example.com',
    phone: '9988776655',
    username: 'dsmith',
    role: 'USER',
    type: 'TENANT',
  },
];

type TypeFilter = 'all' | AdminType;
type RoleFilter = 'all' | AdminRole;

function roleBadgeClass(role: AdminRole): string {
  if (role === 'ADMIN') return 'bg-emerald-600 hover:bg-emerald-600 text-white';
  if (role === 'LAB_MANAGER') return 'bg-sky-600 hover:bg-sky-600 text-white';
  return 'bg-slate-600 hover:bg-slate-600 text-white';
}

function typeBadgeClass(type: AdminType): string {
  return type === 'SYSTEM'
    ? 'bg-violet-600 hover:bg-violet-600 text-white'
    : 'bg-amber-600 hover:bg-amber-600 text-white';
}

export default function AdminRegistrationPage() {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const filteredRows = useMemo(() => {
    const term = searchText.trim().toLowerCase();

    return STATIC_ADMINS.filter((row) => {
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;
      if (roleFilter !== 'all' && row.role !== roleFilter) return false;
      if (!term) return true;

      const haystack = [
        row.fullName,
        row.email,
        row.phone,
        row.username,
        row.role,
        row.type,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [searchText, typeFilter, roleFilter]);

  const handleRefresh = () => {
    setSearchText('');
    setTypeFilter('all');
    setRoleFilter('all');
  };

  return (
    <>
      <AddNewAdmin
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className={listingTitle}>
            Admin <span className="text-emerald-600">Registration</span>
          </h1>
          <p className={`${listingSubtitle} max-w-xl`}>
            View registered system and tenant administrators, managers, and users.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8 font-bold"
            onClick={() => setAddModalOpen(true)}
          >
            <UserPlus size={16} aria-hidden />
            New admin
          </Button>
        </div>
      </div>

      <div className={listingToolbar}>
        <div className={listingToolbarInner}>
        <div className="relative flex-1 group w-full min-w-0">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none"
            size={16}
            aria-hidden
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, email, phone, or username…"
            className={listingSearchInput}
            aria-label="Search admins"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
        
          <button
            type="button"
            className={listingRefreshBtn}
            onClick={handleRefresh}
            title="Reset filters"
          >
            <RefreshCw size={15} aria-hidden />
          </button>
        </div>
        </div>
      </div>

      <div className={listingTableCard}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className={listingTableTh}>
                  Full Name
                </th>
                <th className={listingTableTh}>
                  Email
                </th>
                <th className={listingTableTh}>
                  Phone
                </th>
                <th className={listingTableTh}>
                  Username
                </th>
                <th className={`${listingTableTh} text-center`}>
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    No admins match your search or filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                   
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                         <UserCheck size={18} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <div className={listingRowTitle}>
                            {row.fullName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className={`flex items-center gap-1.5 min-w-0 ${listingRowValue}`}>
                        <Mail size={12} className="text-emerald-500 shrink-0" aria-hidden />
                        <span className="truncate max-w-45">{row.email}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-5">
                      <div className={`flex items-center gap-1.5 ${listingRowPhone}`}>
                        <Phone size={12} className="text-emerald-500 shrink-0" aria-hidden />
                        {row.phone}
                      </div>
                    </td>
                    <td className={`px-4 sm:px-6 py-5 ${listingRowMono}`}>
                      {row.username}
                    </td>
                    <td className="px-4 sm:px-6 py-5 text-center">
                      <Badge
                        variant="default"
                        className={`${listingBadge} uppercase tracking-wide ${roleBadgeClass(row.role)}`}
                      >
                        {row.role}
                      </Badge>
                    </td>
                 
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={listingTableFooter}>
          <div className={`flex items-center gap-2 ${listingPaginationText}`}>
            <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
            <span>
              Showing {filteredRows.length} of {STATIC_ADMINS.length} admins
              <span className="text-slate-400 mx-2">·</span>
              Static preview data
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import AddNewAdmin, { type AdminEditInitial } from './AddNewAdmin';
import AdminSearchAutocomplete from './AdminSearchAutocomplete';
import {
  Database,
  Mail,
  Phone,
  RefreshCw,
  UserPlus,
  UserCheck,
  Users,
  ShieldCheck,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  DEFAULT_ADMIN_PAGE_SIZE,
  fetchActiveAdministrators,
  fetchVerifiedAdministrators,
  fetchAllAdministrators,
  type AllAdministratorItem,
} from '@/app/Apis/administrator/AdministratorApis';
import {
  listingBadge,
  listingPaginationText,
  listingRefreshBtn,
  listingRowMono,
  listingRowPhone,
  listingRowTitle,
  listingRowValue,
  listingSubtitle,
  listingTableCard,
  listingTableFooter,
  listingTableTh,
  listingTitle,
  listingToolbar,
  listingToolbarInner,
} from '@/lib/listingPageStyles';



type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'LAB_MANAGER' | string;
type AdminType = 'SUPER_ADMIN' | 'ADMIN' | string;
type TypeFilter = 'all' | AdminType;
type RoleFilter = 'all' | AdminRole;
type FilterMode = 'all' | 'active' | 'verified';

const FILTER_TABS: {
  mode: FilterMode;
  label: string;
  icon: ReactNode;
}[] = [
  { mode: 'all', label: 'All', icon: <Users size={14} /> },
  { mode: 'active', label: 'Active', icon: <UserCheck size={14} /> },
  { mode: 'verified', label: 'Verified', icon: <ShieldCheck size={14} /> },
];

interface AdminRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  role: AdminRole;
  type: AdminType;
  isActive: boolean;
  isVerified: boolean;
}

interface AdminRegistrationActionsProps {
  admin: AdminRecord;
  onEdit: (adminId: number) => void;
}



function roleBadgeClass(role: AdminRole): string {
  if (role === 'ADMIN') return 'bg-emerald-600 hover:bg-emerald-600 text-white';
  if (role === 'LAB_MANAGER') return 'bg-sky-600 hover:bg-sky-600 text-white';
  return 'bg-slate-600 hover:bg-slate-600 text-white';
}

function statusBadgeClass(isActive: boolean): string {
  return isActive
    ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
    : 'bg-rose-600 hover:bg-rose-600 text-white';
}

export default function AdminRegistrationPage() {
  const [activeSearchUsername, setActiveSearchUsername] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminEditInitial | null>(null);
  const [adminRows, setAdminRows] = useState<AdminRecord[]>([]);
  const [searchRows, setSearchRows] = useState<AdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isUsernameApiSearch = activeSearchUsername.length > 0;

  const mapAdminItem = (item: AllAdministratorItem): AdminRecord => ({
    id: item.id,
    fullName: item.fullName || '-',
    email: item.email || '-',
    phone: item.phone || '-',
    username: item.username || '-',
    role: (item.role || '').toUpperCase(),
    type: (item.adminType || '').toUpperCase(),
    isActive: item.isActive,
    isVerified: item.isVerified,
  });

  const loadAdmins = useCallback(async (mode: FilterMode) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const response =
        mode === 'active'
          ? await fetchActiveAdministrators({ pageNo: 0, pageSize: DEFAULT_ADMIN_PAGE_SIZE })
          : mode === 'verified'
            ? await fetchVerifiedAdministrators({ pageNo: 0, pageSize: DEFAULT_ADMIN_PAGE_SIZE })
            : await fetchAllAdministrators({ pageNo: 0, pageSize: DEFAULT_ADMIN_PAGE_SIZE });
      setAdminRows(response.items.map(mapAdminItem));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to fetch administrators.');
      setAdminRows([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isUsernameApiSearch) return;
    void loadAdmins(filterMode);
  }, [filterMode, loadAdmins, isUsernameApiSearch]);

  const tableRows = isUsernameApiSearch ? searchRows : adminRows;

  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;
      if (roleFilter !== 'all' && row.role !== roleFilter) return false;
      return true;
    });
  }, [tableRows, typeFilter, roleFilter]);

  const handleSearchResult = (items: AllAdministratorItem[], username: string) => {
    setActiveSearchUsername(username);
    setSearchRows(items.map(mapAdminItem));
    setLoadError(null);
  };

  const handleSearchClear = () => {
    setActiveSearchUsername('');
    setSearchRows([]);
  };

  const AdminRegistrationActions = ({ admin, onEdit }: AdminRegistrationActionsProps) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="font-semibold"
      onClick={() => onEdit(admin.id)}
    >
      Edit
    </Button>
  );

  const handleEdit = (adminId: number) => {
    const admin = tableRows.find((row) => row.id === adminId);
    if (!admin) return;

    const adminType: AdminEditInitial['adminType'] =
      admin.type === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';

    setEditingAdmin({
      id: admin.id,
      fullName: admin.fullName,
      email: admin.email,
      phone: admin.phone,
      adminType,
      isVerified: admin.isVerified,
      isActive: admin.isActive,
    });
    setAddModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setAddModalOpen(true);
  };

  const handleCloseDrawer = () => {
    setAddModalOpen(false);
    setEditingAdmin(null);
  };
  const handleRefresh = () => {
    handleSearchClear();
    setTypeFilter('all');
    setRoleFilter('all');
    void loadAdmins(filterMode);
  };


  return (
    <>
      <AddNewAdmin
        isOpen={addModalOpen}
        editAdmin={editingAdmin}
        onSuccess={() => loadAdmins(filterMode)}
        onClose={handleCloseDrawer}
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
            onClick={handleOpenCreate}
          >
            <UserPlus size={16} aria-hidden />
            New admin
          </Button>
        </div>
      </div>

      <div className={listingToolbar}>
        <div className={listingToolbarInner}>
          <AdminSearchAutocomplete
            sourceRows={adminRows}
            disabled={isLoading && !isUsernameApiSearch}
            onSearchResult={handleSearchResult}
            onSearchClear={handleSearchClear}
          />
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <button
              type="button"
              className={listingRefreshBtn}
              onClick={handleRefresh}
              title="Refresh"
              disabled={isLoading}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50/60 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
            Filter
          </span>
          {FILTER_TABS.map(({ mode, label, icon }) => {
            const isSelected = filterMode === mode && !isUsernameApiSearch;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  handleSearchClear();
                  setFilterMode(mode);
                }}
                disabled={isLoading && !isUsernameApiSearch}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all disabled:opacity-50 ${
                  isSelected
                    ? mode === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : mode === 'active'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
                }`}
              >
                {icon}
                {label}
              </button>
            );
          })}
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
                <th className={`${listingTableTh} text-center`}>
                  Status
                </th>
                <th className={listingTableTh}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    Loading administrators...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-rose-500 font-medium">
                    {loadError}
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-medium">
                    {isUsernameApiSearch
                      ? `No administrator found for username "${activeSearchUsername}".`
                      : 'No admins match your search or filters.'}
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                   
                    <td className="px-4 sm:px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                         <UserCheck size={14} aria-hidden />
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
                    <td className="px-6 py-5 text-center">
                          <Badge
                            variant={row.isActive ? "default" : "secondary"}
                            className={
                              row.isActive
                                ? "bg-orange-500 hover:bg-orange-500 text-white text-[10px] font-bold"
                                : "text-[10px] font-bold"
                            }
                          >
                            {(row.isActive ? 'Active' : 'Inactive')}
                          </Badge>
                        </td>

                    <td className="px-4 sm:px-6 py-5 text-center">
                    <AdminRegistrationActions
                      admin={row}
                      onEdit={handleEdit}
                    />
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
              {isUsernameApiSearch ? (
                <>
                  Showing search result for <span className="font-semibold">@{activeSearchUsername}</span>
                </>
              ) : (
                <>Showing {filteredRows.length} of {adminRows.length} admins</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Trash2,
  SlidersHorizontal,
  MapPin,
  Phone,
  Mail,
  Building2,
  MoreVertical,
  LayoutGrid,
  List,
  Plus,
  Building,
  Globe,
  CreditCard,
  ChevronRight,
  SearchX,
  ArrowUpRight,
  ListOrdered,
} from 'lucide-react';
import { Badge, Button, Input } from '@/components/ui';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import AddFranchiseModal from '../components/AddFranchiseModal';
import BranchDetailsDrawer from '../components/details-B2b';
import PriceConfiguration from '../components/Price-configuration';
import PriceListPage from '../components/PriceListPage';
import { branchApi, type Branch, type CreateBranchInput } from '../services/branch.service';

// Removed static BRANCHES array - now using real API data

function isBranchActive(branch: Branch): boolean {
  const status = branch.status?.trim().toUpperCase();
  if (status) return status === 'ACTIVE';
  return Boolean(branch.isActive);
}

function branchStatusLabel(branch: Branch): string {
  if (branch.status?.trim()) return branch.status.trim().toUpperCase();
  return branch.isActive ? 'ACTIVE' : 'INACTIVE';
}

type BranchPriceActionsProps = {
  onConfigure: () => void;
  onListing: () => void;
  variant: 'grid' | 'list';
};

/** Price actions — no extra API on page load; opens configure or listing drawer. */
function BranchPriceActions({ onConfigure, onListing, variant }: BranchPriceActionsProps) {
  if (variant === 'grid') {
    return (
      <>
        <Button
          variant="outline"
          className="rounded-2xl p-3 h-10 w-10 aspect-square text-green-700 border-green-200 hover:bg-green-50 hover:border-green-300"
          onClick={onConfigure}
          title="Configure prices"
        >
          <CreditCard size={18} />
        </Button>
        <Button
          variant="outline"
          className="rounded-2xl p-3 h-10 w-10 aspect-square text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          onClick={onListing}
          title="Price listing"
        >
          <ListOrdered size={18} />
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl font-black text-[10px] uppercase tracking-widest text-green-700 border-green-200 hover:bg-green-50"
        onClick={onConfigure}
      >
        <CreditCard size={14} className="mr-1" />
        Price
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-700 border-blue-200 hover:bg-blue-50"
        onClick={onListing}
      >
        <ListOrdered size={14} className="mr-1" />
        Listing
      </Button>
    </>
  );
}

export default function BranchesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);
  const [editingBranch, setEditingBranch] = useState<{
    id: string;
    branchName: string;
    branchType: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactEmail: string;
    contactPhone: string;
    isActive?: boolean;
    status?: string;
  } | null>(null);
  const [branchRows, setBranchRows] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [priceConfigBranch, setPriceConfigBranch] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [priceListBranch, setPriceListBranch] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const filterBranchesClient = useCallback((list: Branch[]) => {
    const term = search.trim().toLowerCase();
    return list.filter((branch) => {
      const haystack = [
        branch.branchName,
        branch.branchCode,
        branch.city,
        branch.state,
        branch.contactEmail,
        branch.contactPhone,
        branch.address,
        branch.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [search]);

  const loadBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await branchApi.listBranchesAll({
        page: currentPage,
        size: pageSize,
      });

      setBranchRows(response.data.content ?? []);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load branches:', error);
      setBranchRows([]);
      toast.error('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const branches = React.useMemo(
    () => filterBranchesClient(branchRows),
    [branchRows, filterBranchesClient]
  );

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearch = () => {
    setCurrentPage(0);
  };

  const handleViewDetails = (branchId: number) => {
    setSelectedBranchId(branchId);
    setShowDetailsDrawer(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch({
      id: branch.id.toString(),
      branchName: branch.branchName,
      branchType: branch.branchType,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || '',
      postalCode: branch.postalCode || '',
      contactEmail: branch.contactEmail || '',
      contactPhone: branch.contactPhone || '',
      isActive: branch.isActive,
      status: branch.status || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranchId) return;
    
    try {
      await branchApi.deleteBranch(deletingBranchId);
      toast.success('Branch deleted successfully!');
      loadBranches();
      setShowDeleteDialog(false);
      setDeletingBranchId(null);
    } catch (error: any) {
      console.error('Failed to delete branch:', error);
      const errorMessage = error?.response?.data?.message || 
                          'Failed to delete branch. Please try again.';
      toast.error(errorMessage);
    }
  };

  const openDeleteDialog = (branchId: number) => {
    setDeletingBranchId(branchId);
    setShowDeleteDialog(true);
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* ═══ HEADER ═════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Branches <span className="text-gradient">& B2B</span>
            </h1>
            <p className="text-slate-500 font-medium max-w-xl">
              Manage your diagnostic centers, collection points, and institutional partnerships.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass p-1.5 rounded-2xl border border-slate-200/60 hidden md:flex items-center h-12">
              <Button
                variant="ghost"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all h-full aspect-square flex items-center justify-center ${viewMode === 'grid' ? 'bg-white shadow-md text-green-600 hover:bg-white hover:text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all h-full aspect-square flex items-center justify-center ${viewMode === 'list' ? 'bg-white shadow-md text-green-600 hover:bg-white hover:text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={20} />
              </Button>
            </div>
             <Button variant="gradient" size="sm" className="gap-2 shadow-sm px-8"
                      onClick={() => setShowAddModal(true)}>
                        <Plus size={16} /> Add New Branch
              </Button>
          </div>
        </div>

        {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
        <div className="glass p-4 rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col md:flex-row items-center gap-4">
          <div className="relative group flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors z-10" size={20} />
            <Input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by branch name, location, or email..."
              className="pl-12 h-12 rounded-2xl bg-white/50 border-slate-200/60"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <SearchX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* ═══ CONTENT ════════════════════════════════════════════ */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 font-medium">Loading branches...</p>
            </div>
          </div>
        ) : branches.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Building2 size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-bold text-slate-700 mb-2">No Branches Found</h3>
              <p className="text-slate-500 mb-6">Create your first branch to get started</p>
              <Button variant="gradient" onClick={() => setShowAddModal(true)}>
                <Plus size={18} className="mr-2" />
                Create Branch
              </Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {branches.map((branch) => (
              <div key={branch.id} className="glass rounded-[3rem] p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-300 flex flex-col group relative overflow-hidden">
                {/* Entity Icon & Status */}
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner border border-slate-100 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                    <Building2 size={32} />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={isBranchActive(branch) ? 'success' : 'secondary'} size="md">
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isBranchActive(branch) ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      />
                      {branchStatusLabel(branch)}
                    </Badge>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-6 relative z-10 mb-8 border-b border-slate-50 pb-8">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-green-700 transition-colors">
                      {branch.branchName}
                    </h3>
                    {branch.address && (
                      <div className="flex items-start gap-2 text-slate-500 text-sm font-medium italic">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-slate-300" />
                        <span>{branch.address}</span>
                      </div>
                    )}
                    {(branch.city || branch.state) && (
                      <div className="text-xs text-slate-400 font-bold mt-1">
                        {[branch.city, branch.state].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {branch.contactEmail && (
                      <div className="flex items-center gap-3 text-slate-600 text-[13px] font-bold">
                        <div className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-400 border border-slate-200/30">
                          <Mail size={14} />
                        </div>
                        {branch.contactEmail}
                      </div>
                    )}
                    {branch.contactPhone && (
                      <div className="flex items-center gap-3 text-slate-600 text-[13px] font-bold">
                        <div className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-400 border border-slate-200/30">
                          <Phone size={14} />
                        </div>
                        {branch.contactPhone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ledger & Actions */}
                <div className="mt-auto flex items-center justify-between relative z-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Type</p>
                    <div className="text-sm font-bold text-slate-900 capitalize">
                      {branch.branchType.toLowerCase().replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      className="rounded-2xl p-3 h-10 w-10 aspect-square hover:bg-slate-50 hover:border-slate-300"
                      onClick={() => handleViewDetails(branch.id)}
                      title="Details"
                    >
                      <ChevronRight size={20} />
                    </Button>
                    <BranchPriceActions
                      variant="grid"
                      onConfigure={() =>
                        setPriceConfigBranch({ id: branch.id, name: branch.branchName })
                      }
                      onListing={() =>
                        setPriceListBranch({ id: branch.id, name: branch.branchName })
                      }
                    />
                    <Button 
                      variant="ghost" 
                      className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors h-10 w-10 aspect-square rounded-full"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Plus size={20} />
                    </Button>
                    <Button 
  variant="ghost" 
  className="font-bold gap-2 text-white bg-rose-600 hover:text-rose-600"
  onClick={() => openDeleteDialog(branch.id)}
>
  <Trash2 size={16} />
</Button>
                  </div>
                </div>

                {/* Decorative Background Element */}
                <Building size={120} className="absolute bottom-[-10%] right-[-10%] opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-[3rem] overflow-hidden border border-white/40 shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">S.No</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Entity & Location</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((branch, index) => (
                  <tr key={branch.id} className="hover:bg-green-50/30 transition-colors group">
                    <td className="px-8 py-6 text-center">
                      <div className="font-black text-slate-900">{currentPage * pageSize + index + 1}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-all border border-slate-200/40">
                          <Building2 size={24} />
                        </div>
                        <div>
                          <div className="font-black text-slate-900 group-hover:text-green-700 transition-colors">{branch.branchName}</div>
                          {branch.address && (
                            <div className="text-xs font-bold text-slate-400 underline decoration-slate-200">{branch.address}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Badge variant={isBranchActive(branch) ? 'success' : 'secondary'}>
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isBranchActive(branch) ? 'bg-emerald-500' : 'bg-slate-400'}`}
                          />
                          {branchStatusLabel(branch)}
                        </Badge>
                        <Badge variant="outline" className="px-2 py-1 text-[10px] capitalize">
                          {branch.branchType.toLowerCase().replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {branch.contactPhone && <div className="text-sm font-black text-slate-700">{branch.contactPhone}</div>}
                      {branch.contactEmail && <div className="text-xs font-bold text-slate-400 italic">{branch.contactEmail}</div>}
                    </td>
                    
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                          onClick={() => handleViewDetails(branch.id)}
                        >
                          Details
                        </Button>
                        <BranchPriceActions
                          variant="list"
                          onConfigure={() =>
                            setPriceConfigBranch({ id: branch.id, name: branch.branchName })
                          }
                          onListing={() =>
                            setPriceListBranch({ id: branch.id, name: branch.branchName })
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modals */}
      <AddFranchiseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBranch(null);
          loadBranches(); // Reload after modal closes
        }}
        initialData={editingBranch || undefined}
      />
      <BranchDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
        branchId={selectedBranchId}
        onEdit={(branch) => {
          setEditingBranch(branch);
          setShowDetailsDrawer(false);
          setShowAddModal(true);
        }}
      />
      <DeleteAlertDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingBranchId(null);
        }}
        onConfirm={handleDeleteBranch}
        title="Delete Branch"
        description="Are you sure you want to permanently delete this branch? This action cannot be undone and all associated data will be lost."
      />
      {priceConfigBranch && (
        <PriceConfiguration
          isOpen
          onClose={() => setPriceConfigBranch(null)}
          branchId={priceConfigBranch.id}
          branchName={priceConfigBranch.name}
        />
      )}
      {priceListBranch && (
        <PriceListPage
          isOpen
          onClose={() => setPriceListBranch(null)}
          branchId={priceListBranch.id}
          branchName={priceListBranch.name}
        />
      )}
    </>
  );
}

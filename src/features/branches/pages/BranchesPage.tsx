'use client';

import { useMemo, useState } from 'react';
import { Building2, LayoutGrid, List, Plus, Search, SearchX } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import AddFranchiseModal from '../components/AddFranchiseModal';
import BranchDetailsDrawer from '../components/details-B2b';
import PriceConfiguration from '../components/Price-configuration';
import PriceListPage from '../components/PriceListPage';
import { BranchCard } from '../components/BranchCard';
import { BranchListTable } from '../components/BranchListTable';
import { useBranches, useBranchMutations } from '../hooks/useBranches';
import { branchMatchesSearch } from '../utils/branch.utils';
import { BRANCH_PAGE_SIZE } from '../constants/branch';
import type { Branch } from '../services/branch.service';
import type { BranchFormInitialData } from '../types/branch.types';

function toInitialData(branch: Branch): BranchFormInitialData {
  return {
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
  };
}

export default function BranchesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [currentPage] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchFormInitialData | null>(null);
  const [detailsBranchId, setDetailsBranchId] = useState<number | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);
  const [priceConfigBranch, setPriceConfigBranch] = useState<{ id: number; name: string } | null>(null);
  const [priceListBranch, setPriceListBranch] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading } = useBranches({ page: currentPage, size: BRANCH_PAGE_SIZE });
  const { remove } = useBranchMutations();

  const branches = useMemo(
    () => (data?.data.content ?? []).filter((b) => branchMatchesSearch(b, search)),
    [data, search],
  );

  const openEdit = (branch: Branch) => {
    setEditingBranch(toInitialData(branch));
    setShowAddModal(true);
  };

  const confirmDelete = () => {
    if (deletingBranchId == null) return;
    remove.mutate(deletingBranchId, { onSuccess: () => setDeletingBranchId(null) });
  };

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-900">
              Branches <span className="text-gradient">&amp; B2B</span>
            </h1>
            <p className="max-w-xl font-medium text-slate-500">
              Manage your diagnostic centers, collection points, and institutional partnerships.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass hidden h-12 items-center rounded-2xl border border-slate-200/60 p-1.5 md:flex">
              <Button
                variant="ghost"
                onClick={() => setViewMode('grid')}
                className={`flex aspect-square h-full items-center justify-center rounded-xl p-2 transition-all ${viewMode === 'grid' ? 'bg-white text-green-600 shadow-md hover:bg-white hover:text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={20} />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode('list')}
                className={`flex aspect-square h-full items-center justify-center rounded-xl p-2 transition-all ${viewMode === 'list' ? 'bg-white text-green-600 shadow-md hover:bg-white hover:text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={20} />
              </Button>
            </div>
            <Button variant="gradient" size="sm" className="gap-2 px-8 shadow-sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Add New Branch
            </Button>
          </div>
        </div>

        <div className="glass flex flex-col items-center gap-4 rounded-[2.5rem] border border-white/40 p-4 shadow-xl md:flex-row">
          <div className="group relative flex-1">
            <Search className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-green-500" size={20} />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by branch name, location, or email..."
              className="h-12 rounded-2xl border-slate-200/60 bg-white/50 pl-12"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600">
                <SearchX size={18} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
              <p className="font-medium text-slate-500">Loading branches...</p>
            </div>
          </div>
        ) : branches.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Building2 size={64} className="mx-auto mb-4 text-slate-300" />
              <h3 className="mb-2 text-xl font-bold text-slate-700">No Branches Found</h3>
              <p className="mb-6 text-slate-500">Create your first branch to get started</p>
              <Button variant="gradient" onClick={() => setShowAddModal(true)}>
                <Plus size={18} className="mr-2" />
                Create Branch
              </Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                onViewDetails={setDetailsBranchId}
                onEdit={openEdit}
                onDelete={setDeletingBranchId}
                onConfigure={(b) => setPriceConfigBranch({ id: b.id, name: b.branchName })}
                onListing={(b) => setPriceListBranch({ id: b.id, name: b.branchName })}
              />
            ))}
          </div>
        ) : (
          <BranchListTable
            branches={branches}
            currentPage={currentPage}
            pageSize={BRANCH_PAGE_SIZE}
            onViewDetails={setDetailsBranchId}
            onConfigure={(b) => setPriceConfigBranch({ id: b.id, name: b.branchName })}
            onListing={(b) => setPriceListBranch({ id: b.id, name: b.branchName })}
          />
        )}
      </div>

      <AddFranchiseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBranch(null);
        }}
        initialData={editingBranch || undefined}
      />
      <BranchDetailsDrawer
        isOpen={detailsBranchId != null}
        onClose={() => setDetailsBranchId(null)}
        branchId={detailsBranchId}
        onEdit={(branch) => {
          setEditingBranch(branch);
          setDetailsBranchId(null);
          setShowAddModal(true);
        }}
      />
      <DeleteAlertDialog
        isOpen={deletingBranchId != null}
        onClose={() => setDeletingBranchId(null)}
        onConfirm={confirmDelete}
        title="Delete Branch"
        description="Are you sure you want to permanently delete this branch? This action cannot be undone and all associated data will be lost."
      />
      {priceConfigBranch && (
        <PriceConfiguration isOpen onClose={() => setPriceConfigBranch(null)} branchId={priceConfigBranch.id} branchName={priceConfigBranch.name} />
      )}
      {priceListBranch && (
        <PriceListPage isOpen onClose={() => setPriceListBranch(null)} branchId={priceListBranch.id} branchName={priceListBranch.name} />
      )}
    </>
  );
}

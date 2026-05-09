'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Search,
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
  ArrowUpRight
} from 'lucide-react';
import { Badge, Button, Input } from '@/components/ui';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import AddFranchiseModal from './AddFranchiseModal';
import BranchDetailsDrawer from './details-B2b';
import { branchApi, type Branch, type CreateBranchInput } from '@/app/Apis/branch/branchApi';

// Removed static BRANCHES array - now using real API data

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
  } | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadBranches();
  }, [currentPage, statusFilter]);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const response = await branchApi.getAllBranches({
        pageNo: currentPage,
        pageSize: pageSize,
        search: search || undefined,
        status: statusFilter
      });
      
      setBranches(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadBranches();
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
            <Button
              variant="gradient"
              className="gap-2 shadow-xl shadow-green-500/20 px-6 h-12"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={18} />
              Add New Entity
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
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <Button variant="outline" className="px-4 py-2.5 rounded-2xl border-slate-200/60 bg-white/50 whitespace-nowrap gap-2" onClick={handleSearch}>
              <SlidersHorizontal size={16} />
              Search
            </Button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
            <Badge variant="gradient" className="cursor-pointer px-4 py-2 text-[10px] shadow-md shadow-green-500/10">All Entities</Badge>
            <Badge variant="secondary" className="cursor-pointer px-4 py-2 text-[10px] hover:bg-slate-200 transition-colors">Main Branch</Badge>
            <Badge variant="secondary" className="cursor-pointer px-4 py-2 text-[10px] hover:bg-slate-200 transition-colors">Partner Labs</Badge>
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
                Add New Entity
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
                    <Badge variant={branch.isActive ? 'success' : 'secondary'} size="md">
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #{branch.id}</div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-6 relative z-10 mb-8 border-b border-slate-50 pb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={branch.isActive ? 'success' : 'secondary'} size="sm">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
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
                    >
                      <ChevronRight size={20} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors h-10 w-10 aspect-square rounded-full"
                      onClick={() => handleEditBranch(branch)}
                    >
                      <Plus size={20} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors h-10 w-10 aspect-square rounded-full"
                      onClick={() => openDeleteDialog(branch.id)}
                    >
                      <MoreVertical size={20} />
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
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Entity & Location</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                  <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-green-50/30 transition-colors group">
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
                        <Badge variant={branch.isActive ? 'success' : 'secondary'}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${branch.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {branch.isActive ? 'Active' : 'Inactive'}
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
                    <td className="px-8 py-6 text-right">
                      <div className="font-black text-slate-900">#{branch.id}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Details</Button>
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
    </>
  );
}

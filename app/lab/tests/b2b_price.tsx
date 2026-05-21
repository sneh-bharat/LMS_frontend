'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Edit2, Search, Save, X, Loader } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, RightDrawer } from '@/components/ui';
import { toast } from 'sonner';
import {
  branchApi,
  type Branch,
  type BranchTestPriceItem,
  type UpdateTestPriceInput,
} from '@/app/Apis/branch/branchApi';

// ─── Type Definitions ────────────────────────────────────────────────────────
interface B2BPriceEntry {
  id: number;
  branchId: number;
  testId: number;
  testCode: string;
  testName: string;
  branchName: string;
  branchType: string;
  price: number | null;
  cghsPrice: number | null;
  b2bPrice: number | null;
  ipPrice: number | null;
  isActive: boolean | null;
  hasPricing: boolean;
  description?: string;
  termsAndConditions?: string;
}

function buildTestPricePayload(
  editData: B2BPriceEntry,
  testId: number
): UpdateTestPriceInput {
  const payload: UpdateTestPriceInput = {
    testId: editData.testId || testId,
    branchId: editData.branchId,
    price: editData.price ?? 0,
    cghsPrice: editData.cghsPrice ?? 0,
    b2bPrice: editData.b2bPrice ?? 0,
    isActive: editData.isActive ?? true,
  };

  if (editData.ipPrice != null && editData.ipPrice > 0) {
    payload.ipPrice = editData.ipPrice;
  }
  if (editData.description?.trim()) {
    payload.description = editData.description.trim();
  }
  if (editData.termsAndConditions?.trim()) {
    payload.termsAndConditions = editData.termsAndConditions.trim();
  }

  return payload;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatBranchType(type: string) {
  return type.replace(/_/g, ' ');
}

function branchTypeBadgeVariant(
  type: string
): 'success' | 'secondary' | 'warning' | 'default' {
  switch (type.toUpperCase()) {
    case 'MAIN':
      return 'success';
    case 'FRANCHISE':
      return 'warning';
    case 'COLLECTION_CENTER':
      return 'secondary';
    default:
      return 'default';
  }
}

function mapPriceItem(item: BranchTestPriceItem): B2BPriceEntry {
  return {
    id: item.id,
    branchId: item.branchId,
    testId: item.testId,
    testCode: item.testCode,
    testName: item.testName,
    branchName: item.branchName,
    branchType: item.branchType,
    price: item.price,
    cghsPrice: item.cghsPrice,
    b2bPrice: item.b2bPrice,
    ipPrice: item.ipPrice,
    isActive: item.isActive,
    hasPricing: true,
  };
}

function mergeBranchesWithPrices(
  branches: Branch[],
  pricedEntries: B2BPriceEntry[],
  testId: number,
  testName: string
): B2BPriceEntry[] {
  const priceByBranchId = new Map(
    pricedEntries.map((entry) => [Number(entry.branchId), entry])
  );

  return branches.map((branch) => {
    const existing = priceByBranchId.get(Number(branch.id));
    if (existing) return existing;

    return {
      id: -branch.id,
      branchId: branch.id,
      testId,
      testCode: '',
      testName,
      branchName: branch.branchName,
      branchType: '',
      price: null,
      cghsPrice: null,
      b2bPrice: null,
      ipPrice: null,
      isActive: null,
      hasPricing: false,
    };
  });
}

function formatPriceCell(value: number | null) {
  if (value === null || value === undefined) return '';
  return formatCurrency(value);
}

function rowKey(entry: B2BPriceEntry) {
  return entry.hasPricing ? `price-${entry.id}` : `branch-${entry.branchId}`;
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface B2BPriceConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  testId?: number;
  testName?: string;
}

export default function B2BPriceConfiguration({
  isOpen,
  onClose,
  testId,
  testName = 'Test',
}: B2BPriceConfigurationProps) {
  const [pricedEntries, setPricedEntries] = useState<B2BPriceEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [editData, setEditData] = useState<B2BPriceEntry | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    branchId: 0,
    branchName: '',
    branchType: '',
    b2bPrice: 0,
    price: 0,
  });

  const tableRows = useMemo(() => {
    if (allBranches.length === 0) return pricedEntries;
    return mergeBranchesWithPrices(
      allBranches,
      pricedEntries,
      testId ?? 0,
      testName
    );
  }, [allBranches, pricedEntries, testId, testName]);

  const pricedBranchIds = useMemo(
    () => new Set(pricedEntries.map((entry) => entry.branchId)),
    [pricedEntries]
  );

  const availableBranches = useMemo(
    () => allBranches.filter((branch) => !pricedBranchIds.has(branch.id)),
    [allBranches, pricedBranchIds]
  );

  const isTableLoading = loading || loadingBranches;

  const resetState = useCallback(() => {
    setPricedEntries([]);
    setAllBranches([]);
    setSearchTerm('');
    setEditingBranchId(null);
    setEditData(null);
    setShowAddForm(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }
    setSearchTerm('');
  }, [isOpen, testId, resetState]);

  const loadPrices = useCallback(async () => {
    if (!isOpen || !testId) return;

    setLoading(true);
    try {
      const response = await branchApi.getTestPricesByTestId(testId);
      const items = Array.isArray(response.data) ? response.data : [];
      setPricedEntries(items.map(mapPriceItem));
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to load branch prices'
      );
      setPricedEntries([]);
    } finally {
      setLoading(false);
    }
  }, [isOpen, testId]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const loadAllBranches = useCallback(async () => {
    if (!isOpen) return;

    setLoadingBranches(true);
    try {
      const response = await branchApi.getAllBranches({
        pageNo: 0,
        pageSize: 500,
        status: 'All',
      });
      setAllBranches(response.data.content ?? []);
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to load branches'
      );
      setAllBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadAllBranches();
    }
  }, [isOpen, loadAllBranches]);

  const handleOpenAddForm = () => {
    setNewEntry({
      branchId: 0,
      branchName: '',
      branchType: '',
      b2bPrice: 0,
      price: 0,
    });
    setShowAddForm(true);
  };

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAddEntry = () => {
    if (!newEntry.branchId) {
      toast.error('Please select a branch');
      return;
    }

    if (newEntry.b2bPrice <= 0) {
      toast.error('B2B price must be greater than 0');
      return;
    }

    if (newEntry.price <= 0) {
      toast.error('MRP must be greater than 0');
      return;
    }

    const entry: B2BPriceEntry = {
      id: Date.now(),
      branchId: newEntry.branchId,
      testId: testId ?? 0,
      testCode: '',
      testName: testName,
      branchName: newEntry.branchName,
      branchType: newEntry.branchType,
      price: newEntry.price,
      cghsPrice: 0,
      b2bPrice: newEntry.b2bPrice,
      ipPrice: 0,
      isActive: true,
      hasPricing: true,
    };

    setPricedEntries([...pricedEntries, entry]);
    setNewEntry({
      branchId: 0,
      branchName: '',
      branchType: '',
      b2bPrice: 0,
      price: 0,
    });
    setShowAddForm(false);
    toast.success('B2B price entry added successfully');
  };

  const handleEdit = (entry: B2BPriceEntry) => {
    const priceRecord = pricedEntries.find((e) => e.branchId === entry.branchId);
    setEditingBranchId(entry.branchId);
    setEditData(
      priceRecord
        ? { ...priceRecord }
        : {
            ...entry,
            price: entry.price ?? 0,
            b2bPrice: entry.b2bPrice ?? 0,
            cghsPrice: entry.cghsPrice ?? 0,
            ipPrice: entry.ipPrice ?? 0,
            isActive: entry.isActive ?? true,
          }
    );
  };

  const handleSaveEdit = async () => {
    if (!editData || !testId) return;

    const b2b = editData.b2bPrice ?? 0;
    const mrp = editData.price ?? 0;
    const cghs = editData.cghsPrice ?? 0;

    if (mrp <= 0) {
      toast.error('MRP must be greater than 0');
      return;
    }

    if (cghs <= 0) {
      toast.error('CGHS price must be greater than 0');
      return;
    }

    if (b2b <= 0) {
      toast.error('B2B price must be greater than 0');
      return;
    }

    const payload = buildTestPricePayload(
      { ...editData, price: mrp, cghsPrice: cghs, b2bPrice: b2b },
      testId
    );

    const existingPrice = pricedEntries.find((e) => e.branchId === editData.branchId);

    setSavingEdit(true);
    try {
      if (existingPrice) {
        await branchApi.updateTestPrice(existingPrice.id, payload);
        toast.success('Test price updated successfully');
      } else {
        await branchApi.createTestPrice(payload);
        toast.success('Test price created successfully');
      }
      setEditingBranchId(null);
      setEditData(null);
      await loadPrices();
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to save test price'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingBranchId(null);
    setEditData(null);
  };

  const handleDelete = (entry: B2BPriceEntry) => {
    if (!entry.hasPricing) {
      toast.info('No price record exists for this branch yet');
      return;
    }

    if (confirm('Are you sure you want to delete this price entry?')) {
      setPricedEntries(pricedEntries.filter((e) => e.id !== entry.id));
      toast.success('Entry deleted successfully');
    }
  };

  const handleSaveAll = () => {
    // TODO: Implement API call to save all entries
    toast.success('All B2B prices saved successfully');
  };

  // ─── Filtered Entries ────────────────────────────────────────────────────
  const filteredRows = tableRows.filter((entry) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    return (
      entry.branchName.toLowerCase().includes(term) ||
      entry.branchType.toLowerCase().includes(term) ||
      entry.testCode.toLowerCase().includes(term)
    );
  });

  const tableColSpan = 9;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="B2B Price Configuration"
      description={`Configure pricing for ${testName}`}
      maxWidth="2xl"
      footer={
        <div className="flex justify-between items-center w-full gap-3">
          <p className="text-xs font-semibold text-slate-500 shrink-0">
            {tableRows.length > 0
              ? `${tableRows.length} branch${tableRows.length === 1 ? '' : 'es'}`
              : 'No branches loaded'}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveAll} className="bg-emerald-600 hover:bg-emerald-700">
              <Save size={16} className="mr-2" />
              Save All
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              type="text"
              placeholder="Search by branch name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isTableLoading}
            />
          </div>
         
        </div>

        {/* Add New Entry Form *
        {showAddForm && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                Add New Entry
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-1"
              >
                <X size={14} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Branch Name *
                </Label>
                <select
                  value={newEntry.branchId || ''}
                  onChange={(e) => {
                    const branchId = Number(e.target.value);
                    const selectedBranch = availableBranches.find((b) => b.id === branchId);
                    setNewEntry({
                      ...newEntry,
                      branchId,
                      branchName: selectedBranch?.branchName ?? '',
                      branchType: selectedBranch?.branchType ?? '',
                    });
                  }}
                  disabled={loadingBranches || availableBranches.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {loadingBranches
                      ? 'Loading branches...'
                      : availableBranches.length === 0
                        ? 'All branches already have pricing'
                        : 'Select branch without pricing'}
                  </option>
                  {availableBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName} ({formatBranchType(branch.branchType)})
                    </option>
                  ))}
                </select>
                {!loadingBranches && availableBranches.length === 0 && (
                  <p className="text-[11px] text-amber-700 font-medium mt-1">
                    Every branch already has a price for this test.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  B2B * (₹)
                </Label>
                <Input
                  type="number"
                  value={newEntry.b2bPrice || ''}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, b2bPrice: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Enter B2B price"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  MRP * (₹)
                </Label>
                <Input
                  type="number"
                  value={newEntry.price || ''}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="Enter MRP"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleAddEntry}
                disabled={loadingBranches || availableBranches.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus size={16} className="mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {isTableLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
              <Loader size={32} className="animate-spin text-emerald-600" />
              <p className="text-sm font-semibold">Loading branches and prices…</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[min(60vh,520px)] overflow-y-auto">
              <table className="w-full text-left min-w-[900px] border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-12">
                      #
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Branch
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      MRP
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      CGHS
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      B2B
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      IP
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-24">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!testId ? (
                    <tr>
                      <td colSpan={tableColSpan} className="px-6 py-12 text-center text-slate-500">
                        No test selected.
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={tableColSpan} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <Search size={48} className="text-slate-300" />
                          <p className="text-lg font-semibold">No entries found</p>
                          <p className="text-sm">Add a new entry or adjust your search</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((entry, index) => (
                      <tr
                        key={rowKey(entry)}
                        className={`hover:bg-emerald-50/40 transition-colors ${
                          !entry.hasPricing ? 'bg-slate-50/60' : ''
                        }`}
                      >
                        {editingBranchId === entry.branchId && editData ? (
                          <>
                            <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 text-xs font-bold text-slate-800" colSpan={2}>
                              {editData.branchName}
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={editData.price ?? ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    price: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full h-9 text-right"
                                min="0"
                                placeholder="MRP"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={editData.cghsPrice ?? ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    cghsPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full h-9 text-right"
                                min="0"
                                placeholder="CGHS"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                value={editData.b2bPrice ?? ''}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    b2bPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full h-9 text-right"
                                min="0"
                                placeholder="B2B"
                              />
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-slate-500">
                              {formatPriceCell(editData.ipPrice)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {editData.hasPricing && editData.isActive !== null ? (
                                <Badge
                                  variant={editData.isActive ? 'success' : 'secondary'}
                                  size="sm"
                                >
                                  {editData.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              ) : null}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleSaveEdit}
                                  disabled={savingEdit}
                                  className="h-8 w-8 p-0 text-emerald-600"
                                  title="Save"
                                >
                                  {savingEdit ? (
                                    <Loader size={14} className="animate-spin" />
                                  ) : (
                                    <Save size={14} />
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={savingEdit}
                                  className="h-8 w-8 p-0"
                                  title="Cancel"
                                >
                                  <X size={14} />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs font-bold text-slate-900">{entry.branchName}</p>
                            </td>
                            <td className="px-4 py-3">
                              {entry.hasPricing && entry.branchType ? (
                                <Badge
                                  variant={branchTypeBadgeVariant(entry.branchType)}
                                  size="sm"
                                >
                                  {formatBranchType(entry.branchType)}
                                </Badge>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-semibold text-slate-800 whitespace-nowrap">
                              {formatPriceCell(entry.price)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {formatPriceCell(entry.cghsPrice)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {formatPriceCell(entry.b2bPrice)}
                            </td>
                            <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                              {formatPriceCell(entry.ipPrice)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {entry.hasPricing && entry.isActive !== null ? (
                                <Badge
                                  variant={entry.isActive ? 'success' : 'secondary'}
                                  size="sm"
                                >
                                  {entry.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              ) : null}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                                  title="Edit"
                                >
                                  <Edit2 size={15} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(entry)}
                                  className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RightDrawer>
  );
}

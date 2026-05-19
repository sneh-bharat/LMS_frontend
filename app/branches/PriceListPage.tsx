'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader,
  Search,
  SearchX,
  Building2,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button, Input, Label, RightDrawer } from '@/components/ui';
import {
  branchApi,
  type BranchPricePercentageInfo,
  type BranchTestPriceItem,
} from '@/app/Apis/branch/branchApi';
import EditTestPriceDrawer from './EditTestPriceDrawer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  branchName: string;
}

const PAGE_SIZE = 20;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

function PercentagePill({ label, value }: { label: string; value: number }) {
  const isNegative = value < 0;
  const isPositive = value > 0;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 min-w-[90px]">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p
        className={`text-sm font-black ${
          isNegative ? 'text-rose-600' : isPositive ? 'text-emerald-600' : 'text-slate-700'
        }`}
      >
        {value > 0 ? '+' : ''}
        {value}%
      </p>
    </div>
  );
}

export default function PriceListPage({ isOpen, onClose, branchId, branchName }: Props) {
  const [prices, setPrices] = useState<BranchTestPriceItem[]>([]);
  const [percentageInfo, setPercentageInfo] = useState<BranchPricePercentageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isEditingPercentages, setIsEditingPercentages] = useState(false);
  const [editPercentages, setEditPercentages] = useState({
    mrpPricePercentage: 0,
    cghsPercentage: 0,
    b2bPricePercentage: 0,
    ipPercentage: 0,
  });
  const [savingPercentages, setSavingPercentages] = useState(false);
  const [editingPriceItem, setEditingPriceItem] = useState<BranchTestPriceItem | null>(null);

  const resetState = useCallback(() => {
    setPrices([]);
    setPercentageInfo(null);
    setSearch('');
    setPageNo(0);
    setTotalPages(0);
    setTotalElements(0);
    setIsEditingPercentages(false);
    setEditingPriceItem(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      resetState();
      return;
    }
    setPageNo(0);
    setSearch('');
  }, [isOpen, branchId, resetState]);

  const loadPrices = useCallback(async () => {
    if (!isOpen || !branchId) return;

    setLoading(true);
    try {
      const response = await branchApi.getBranchTestPrices(branchId, {
        pageNo,
        pageSize: PAGE_SIZE,
      });
      setPrices(response.data.content ?? []);
      setPercentageInfo(response.data.percentageInfo ?? null);
      setTotalPages(response.data.totalPages ?? 0);
      setTotalElements(response.data.totalElements ?? 0);
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(err?.response?.data?.message || err?.message || 'Failed to load price list');
      setPrices([]);
      setPercentageInfo(null);
    } finally {
      setLoading(false);
    }
  }, [branchId, pageNo, isOpen]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const startEditingPercentages = () => {
    if (!percentageInfo) return;
    setEditPercentages({
      mrpPricePercentage: percentageInfo.mrpPricePercentage,
      cghsPercentage: percentageInfo.cghsPercentage,
      b2bPricePercentage: percentageInfo.b2bPricePercentage,
      ipPercentage: percentageInfo.ipPercentage,
    });
    setIsEditingPercentages(true);
  };

  const cancelEditingPercentages = () => {
    setIsEditingPercentages(false);
  };

  const parsePercentage = (value: string): number => {
    if (value === '' || value === '-') return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleSavePercentages = async () => {
    setSavingPercentages(true);
    try {
      await branchApi.createBranchPriceConfiguration({
        importBranchId: branchId,
        branchId,
        mrpPricePercentage: editPercentages.mrpPricePercentage,
        cghsPercentage: editPercentages.cghsPercentage,
        b2bPricePercentage: editPercentages.b2bPricePercentage,
        ipPercentage: editPercentages.ipPercentage,
      });
      toast.success('Price adjustments updated successfully!');
      setIsEditingPercentages(false);
      loadPrices();
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to update adjustments'
      );
    } finally {
      setSavingPercentages(false);
    }
  };

  const filteredPrices = prices.filter((item) => {
    if (!search.trim()) return true;
    const term = search.trim().toLowerCase();
    return (
      item.testName.toLowerCase().includes(term) ||
      item.testCode.toLowerCase().includes(term)
    );
  });

  const footer = (
    <div className="flex items-center justify-between w-full gap-3">
      <p className="text-xs font-semibold text-slate-500 shrink-0">
        {totalElements > 0 ? (
          <>
            Page {pageNo + 1} of {Math.max(totalPages, 1)} · {totalElements} tests
          </>
        ) : (
          'No prices loaded'
        )}
      </p>
      <div className="flex items-center gap-2">
        {totalPages > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1"
              disabled={pageNo === 0 || loading}
              onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={16} />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1"
              disabled={pageNo >= totalPages - 1 || loading}
              onClick={() => setPageNo((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <>
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Price <span className="text-emerald-200">Listing</span>
        </>
      }
      description={
        <span className="inline-flex items-center gap-2">
          <Building2 size={12} />
          {branchName}
        </span>
      }
      footer={footer}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {percentageInfo && (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-slate-200" />
                Applied adjustments
              </h4>
              {!isEditingPercentages ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1.5 h-8 text-xs font-bold"
                  onClick={startEditingPercentages}
                >
                  <Pencil size={14} />
                  Edit
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl h-8 w-8 p-0"
                    onClick={cancelEditingPercentages}
                    disabled={savingPercentages}
                  >
                    <X size={14} />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-xl gap-1.5 h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleSavePercentages}
                    disabled={savingPercentages}
                  >
                    {savingPercentages ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>

            {isEditingPercentages ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4">
                <div>
                  <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">
                    MRP %
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editPercentages.mrpPricePercentage}
                    onChange={(e) =>
                      setEditPercentages((p) => ({
                        ...p,
                        mrpPricePercentage: parsePercentage(e.target.value),
                      }))
                    }
                    className="h-10 rounded-xl bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">
                    CGHS %
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editPercentages.cghsPercentage}
                    onChange={(e) =>
                      setEditPercentages((p) => ({
                        ...p,
                        cghsPercentage: parsePercentage(e.target.value),
                      }))
                    }
                    className="h-10 rounded-xl bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">
                    B2B %
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editPercentages.b2bPricePercentage}
                    onChange={(e) =>
                      setEditPercentages((p) => ({
                        ...p,
                        b2bPricePercentage: parsePercentage(e.target.value),
                      }))
                    }
                    className="h-10 rounded-xl bg-white border-slate-200"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1.5 block">
                    IP %
                  </Label>
                  <Input
                    type="number"
                    step="any"
                    value={editPercentages.ipPercentage}
                    onChange={(e) =>
                      setEditPercentages((p) => ({
                        ...p,
                        ipPercentage: parsePercentage(e.target.value),
                      }))
                    }
                    className="h-10 rounded-xl bg-white border-slate-200"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3">
                <PercentagePill label="MRP %" value={percentageInfo.mrpPricePercentage} />
                <PercentagePill label="CGHS %" value={percentageInfo.cghsPercentage} />
                <PercentagePill label="B2B %" value={percentageInfo.b2bPricePercentage} />
                <PercentagePill label="IP %" value={percentageInfo.ipPercentage} />
              </div>
            )}
          </section>
        )}

        <section className="space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200" />
            Test prices
          </h4>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={18}
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by test name or code..."
              className="pl-10 h-11 rounded-xl bg-white border-slate-200"
            />
            {search && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearch('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400"
              >
                <SearchX size={16} />
              </Button>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200/80 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader size={28} className="animate-spin text-emerald-600" />
                <p className="text-sm text-slate-500 font-medium">Loading prices...</p>
              </div>
            ) : filteredPrices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <p className="text-sm font-semibold">No test prices found</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[min(60vh,520px)] overflow-y-auto">
                <table className="w-full text-left min-w-[760px]">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-12">
                        #
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Code
                      </th>
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Investigation
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
                      <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPrices.map((row, index) => (
                      <tr key={row.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="px-4 py-3 text-center text-xs font-bold text-slate-500">
                          {pageNo * PAGE_SIZE + index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {row.testCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-bold text-slate-900 leading-snug">{row.testName}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-slate-800 whitespace-nowrap">
                          {formatCurrency(row.price)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {formatCurrency(row.cghsPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {formatCurrency(row.b2bPrice)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700 whitespace-nowrap">
                          {formatCurrency(row.ipPrice)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={row.isActive ? 'success' : 'secondary'} size="sm">
                            {row.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Edit test price"
                            onClick={() => setEditingPriceItem(row)}
                          >
                            <Pencil size={15} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </RightDrawer>

    <EditTestPriceDrawer
      isOpen={!!editingPriceItem}
      item={editingPriceItem}
      branchId={branchId}
      onClose={() => setEditingPriceItem(null)}
      onSaved={loadPrices}
    />
    </>
  );
}

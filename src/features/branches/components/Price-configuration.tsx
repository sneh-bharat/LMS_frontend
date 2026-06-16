'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader, Save, Building2, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Label, RightDrawer } from '@/components/ui';
import {
  branchApi,
  type Branch,
  type BranchPriceConfigInput,
} from '../services/branch.service';

interface PriceConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  branchName: string;
}

const DEFAULT_FORM = {
  mrpPricePercentage: 0,
  cghsPercentage: 0,
  b2bPricePercentage: 0,
  ipPercentage: 0,
};

export default function PriceConfiguration({
  isOpen,
  onClose,
  branchId,
  branchName,
}: PriceConfigurationProps) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [importBranchId, setImportBranchId] = useState<number | null>(null);
  const [importSearch, setImportSearch] = useState('');
  const [importOptions, setImportOptions] = useState<Branch[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [selectedImportBranch, setSelectedImportBranch] = useState<Branch | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const importComboboxRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_FORM);
    setImportBranchId(null);
    setImportSearch('');
    setImportOptions([]);
    setSelectedImportBranch(null);
    setShowImportDropdown(false);
    setErrors({});
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, branchId, resetForm]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setImportLoading(true);
      try {
        const response = await branchApi.getAllBranches({
          pageNo: 0,
          pageSize: 20,
          term: importSearch.trim() || undefined,
          status: 'All',
        });
        const list = (response.data.content ?? []).filter((b) => b.id !== branchId);
        setImportOptions(list);
      } catch {
        setImportOptions([]);
      } finally {
        setImportLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [importSearch, isOpen, branchId]);

  useEffect(() => {
    if (!showImportDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        importComboboxRef.current &&
        !importComboboxRef.current.contains(event.target as Node)
      ) {
        setShowImportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showImportDropdown]);

  const handleSelectImportBranch = (branch: Branch) => {
    setImportBranchId(branch.id);
    setSelectedImportBranch(branch);
    setImportSearch(branch.branchName);
    setShowImportDropdown(false);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.importBranchId;
      return next;
    });
  };

  const parsePercentage = (value: string): number => {
    if (value === '' || value === '-') return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!importBranchId) {
      newErrors.importBranchId = 'Please select a branch to import prices from';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the form errors');
      return;
    }

    const payload: BranchPriceConfigInput = {
      importBranchId: importBranchId!,
      branchId,
      mrpPricePercentage: formData.mrpPricePercentage,
      cghsPercentage: formData.cghsPercentage,
      b2bPricePercentage: formData.b2bPricePercentage,
      ipPercentage: formData.ipPercentage,
    };

    setIsSubmitting(true);
    try {
      await branchApi.createBranchPriceConfiguration(payload);
      toast.success('Price configuration saved successfully!');
      onClose();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save price configuration. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex gap-3 justify-end w-full">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md flex items-center gap-2"
      >
        {isSubmitting && <Loader size={14} className="animate-spin" />}
        <Save size={14} />
        Save Configuration
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Price <span className="text-emerald-200">Configuration</span>
        </>
      }
      description={`Configure pricing for ${branchName}`}
      footer={footer}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-0">
        <input type="hidden" name="branchId" value={branchId} />

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <Building2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/80">
              Configuring prices for
            </p>
            <p className="truncate text-sm font-black text-slate-900">{branchName}</p>
          </div>
        </div>

        <section className="space-y-4 border-b border-slate-100 pb-8">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            01. Import From Branch
          </h4>

          <div
            ref={importComboboxRef}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-3"
          >
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
              Import Branch *
            </Label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                size={18}
              />
              <Input
                value={importSearch}
                onChange={(e) => {
                  setImportSearch(e.target.value);
                  setImportBranchId(null);
                  setSelectedImportBranch(null);
                  setShowImportDropdown(true);
                }}
                onFocus={() => setShowImportDropdown(true)}
                placeholder="Search branch by name..."
                className={`pl-10 pr-10 bg-white h-11 rounded-xl ${
                  errors.importBranchId ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {importLoading ? (
                <Loader
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400"
                />
              ) : (
                <ChevronDown
                  size={16}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform ${
                    showImportDropdown ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>

            {showImportDropdown && (
              <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md">
                <div className="max-h-48 overflow-y-auto">
                {importLoading && importOptions.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-slate-500 text-center">Searching branches...</p>
                ) : importOptions.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-slate-500 text-center">No branches found</p>
                ) : (
                  importOptions.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectImportBranch(branch)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-slate-100 last:border-0 ${
                        importBranchId === branch.id ? 'bg-emerald-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          importBranchId === branch.id
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Building2 size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{branch.branchName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                          {branch.branchType.replace(/_/g, ' ')}
                        </p>
                      </div>
                      {importBranchId === branch.id && (
                        <Check size={16} className="shrink-0 text-emerald-600" />
                      )}
                    </button>
                  ))
                )}
                </div>
              </div>
            )}

            {selectedImportBranch && !showImportDropdown && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <p className="text-xs font-semibold text-slate-700">
                  <span className="text-emerald-700">{selectedImportBranch.branchName}</span>
                  <span className="text-slate-400 font-medium"> · import source selected</span>
                </p>
              </div>
            )}
            {errors.importBranchId && (
              <p className="text-xs text-rose-500 font-medium">{errors.importBranchId}</p>
            )}
          </div>
        </section>

        <section className="space-y-4 pt-8">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            02. Price Percentages
          </h4>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Use positive values to increase and negative values to decrease imported prices
            (e.g. <span className="font-semibold text-slate-600">-5</span> = 5% discount).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                MRP Price %
              </Label>
              <Input
                type="number"
                step="any"
                value={formData.mrpPricePercentage}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    mrpPricePercentage: parsePercentage(e.target.value),
                  }))
                }
                placeholder="0"
                className="bg-white h-11 rounded-xl border-slate-200"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                CGHS %
              </Label>
              <Input
                type="number"
                step="any"
                value={formData.cghsPercentage}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    cghsPercentage: parsePercentage(e.target.value),
                  }))
                }
                placeholder="-5"
                className="bg-white h-11 rounded-xl border-slate-200"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                B2B Price %
              </Label>
              <Input
                type="number"
                step="any"
                value={formData.b2bPricePercentage}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    b2bPricePercentage: parsePercentage(e.target.value),
                  }))
                }
                placeholder="-10"
                className="bg-white h-11 rounded-xl border-slate-200"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 block">
                IP %
              </Label>
              <Input
                type="number"
                step="any"
                value={formData.ipPercentage}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    ipPercentage: parsePercentage(e.target.value),
                  }))
                }
                placeholder="-5"
                className="bg-white h-11 rounded-xl border-slate-200"
              />
            </div>
          </div>
        </section>
      </form>
    </RightDrawer>
  );
}


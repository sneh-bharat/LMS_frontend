'use client';

import { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui';
import { cn } from '@/lib/utils';

export interface SelectBranchProps {
  value?: number | null;
  onChange?: (branchId: number, branch: Branch | null) => void;
  className?: string;
  autoSelectFirst?: boolean;
}

function formatB2bType(branchType: string) {
  return branchType.replace(/_/g, ' ').toUpperCase();
}

export function BranchOptionLabel({ branch }: { branch: Pick<Branch, 'branchName' | 'branchType'> }) {
  return (
    <span className="flex items-center gap-2">
      <span className="font-semibold text-slate-900">{branch.branchName}</span>
      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
        {formatB2bType(branch.branchType)}
      </span>
    </span>
  );
}

export default function SelectBranch({
  value,
  onChange,
  className,
  autoSelectFirst = false,
}: SelectBranchProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await branchApi.getAllBranches({ pageNo: 0, pageSize: 200 });
        const list = res?.data?.content ?? [];
        if (cancelled) return;
        setBranches(list);

        if (value != null && value > 0) {
          setSelectedId(String(value));
        } else if (autoSelectFirst && list.length > 0) {
          const firstId = String(list[0].id);
          setSelectedId(firstId);
          onChange?.(list[0].id, list[0]);
        }
      } catch {
        if (!cancelled) {
          setBranches([]);
          setError('Failed to load branches.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [autoSelectFirst, value]);

  useEffect(() => {
    if (value != null && value > 0) {
      setSelectedId(String(value));
    }
  }, [value]);

  const handleChange = (id: string | null) => {
    if (!id) return;
    setSelectedId(id);
    const branch = branches.find((b) => b.id === Number(id)) ?? null;
    onChange?.(Number(id), branch);
  };

  const selectedBranch = branches.find((b) => b.id === Number(selectedId));

  return (
    <div className={cn('space-y-2', className)}>
      {loading ? (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-gray-300 bg-slate-50 px-3 text-sm text-slate-500">
          <Loader2 className="animate-spin text-emerald-600" size={16} aria-hidden />
          Loading branches…
        </div>
      ) : error ? (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm text-rose-600">
          <AlertCircle size={16} aria-hidden />
          {error}
        </div>
      ) : branches.length === 0 ? (
        <div className="flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm text-amber-700">
          <AlertCircle size={16} aria-hidden />
          No branches found.
        </div>
      ) : (
        <Select value={selectedId} onValueChange={handleChange}>
          <SelectTrigger className="border-gray-300 h-11">
            <span className="flex flex-1 text-left min-w-0">
              {selectedBranch ? (
                <BranchOptionLabel branch={selectedBranch} />
              ) : (
                <span className="text-muted-foreground font-medium">Select branch</span>
              )}
            </span>
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                <BranchOptionLabel branch={b} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}


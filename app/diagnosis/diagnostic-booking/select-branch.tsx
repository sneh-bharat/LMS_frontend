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
  disabled?: boolean;
}

function formatB2bType(branchType: string) {
  return branchType.replace(/_/g, ' ').toUpperCase();
}

export function getBranchDisplayName(
  branch: Pick<Branch, 'branchName' | 'branchCode'> & { id?: number },
) {
  const name = branch.branchName?.trim();
  if (name) return name;
  const code = branch.branchCode?.trim();
  if (code) return code;
  if (branch.id != null && branch.id > 0) return `Branch #${branch.id}`;
  return 'Unnamed branch';
}

export function BranchTypeBadge({ branchType, className }: { branchType: string; className?: string }) {
  if (!branchType?.trim()) return null;

  return (
    <span
      className={cn(
        'inline-flex max-w-[9.5rem] shrink-0 items-center justify-center truncate rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700',
        'group-data-highlighted:border-white/30 group-data-highlighted:bg-white/15 group-data-highlighted:text-white',
        className,
      )}
    >
      {formatB2bType(branchType)}
    </span>
  );
}

export function BranchOptionLabel({
  branch,
  reserveCheckSpace = false,
}: {
  branch: Pick<Branch, 'branchName' | 'branchType' | 'branchCode'> & { id?: number };
  reserveCheckSpace?: boolean;
}) {
  return (
    <span
      className={cn(
        'grid w-full min-w-0 items-center gap-2',
        reserveCheckSpace
          ? 'grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)] pr-1'
          : 'grid-cols-[minmax(0,1fr)_minmax(5.5rem,auto)]',
      )}
    >
      <span className="truncate font-semibold text-slate-900 group-data-highlighted:text-accent-foreground">
        {getBranchDisplayName(branch)}
      </span>
      {branch.branchType ? <BranchTypeBadge branchType={branch.branchType} /> : null}
    </span>
  );
}

export default function SelectBranch({
  value,
  onChange,
  className,
  autoSelectFirst = false,
  disabled = false,
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
    if (disabled) return;
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
        <Select value={selectedId} onValueChange={handleChange} disabled={disabled}>
          <SelectTrigger
            disabled={disabled}
            className="h-11 min-w-0 border-gray-300 whitespace-normal disabled:bg-slate-50 disabled:text-slate-500"
          >
            <span className="flex min-w-0 flex-1 text-left">
              {selectedBranch ? (
                <BranchOptionLabel branch={selectedBranch} />
              ) : (
                <span className="font-medium text-muted-foreground">Select branch</span>
              )}
            </span>
          </SelectTrigger>
          <SelectContent
            align="start"
            className="max-w-[min(var(--anchor-width),calc(100vw-1.5rem))]"
          >
            {branches.map((b) => (
              <SelectItem
                key={b.id}
                value={String(b.id)}
                className="group py-2.5 [&>span:first-child]:min-w-0 [&>span:first-child]:shrink [&>span:first-child]:whitespace-normal"
              >
                <BranchOptionLabel branch={b} reserveCheckSpace />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

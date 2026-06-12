'use client';

import { useCallback, useEffect, useState } from 'react';
import { Search, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { RightDrawer, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  fetchActiveReferrers,
  searchReferrers,
  getReferrerName,
  getReferrerPhone,
  type Referrer,
} from '@/app/Apis/Referrer/referrerApi';

function referrerSubtitle(referrer: Referrer) {
  const parts: string[] = [];
  if (referrer.centre?.trim()) parts.push(referrer.centre.trim());
  if (referrer.branchName?.trim()) parts.push(referrer.branchName.trim());
  const phone = getReferrerPhone(referrer);
  if (phone !== '—') parts.push(phone);
  return parts.join(' · ') || 'Referrer';
}

export interface AddReferrerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (referrer: Referrer) => void;
  selectedReferrerId?: number | null;
}

export default function AddReferrerModal({
  isOpen,
  onClose,
  onSelect,
  selectedReferrerId,
}: AddReferrerModalProps) {
  const [search, setSearch] = useState('');
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadReferrers = useCallback(async (query: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const trimmed = query.trim();
      let list: Referrer[];
      if (trimmed) {
        list = await searchReferrers(trimmed);
      } else {
        const res = await fetchActiveReferrers({ pageNo: 0, pageSize: 1000 });
        list = res?.data?.content ?? [];
      }
      setReferrers(list.filter((r) => r.isActive));
    } catch {
      setReferrers([]);
      setLoadError('Failed to load referrers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    setLoadError(null);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => loadReferrers(search), search.trim() ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, isOpen, loadReferrers]);

  const filtered = referrers.filter((r) =>
    getReferrerName(r).toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (referrer: Referrer) => {
    onSelect(referrer);
    onClose();
  };

  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-300">
        Close
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Add <span className="text-emerald-200">Referrer</span>
        </>
      }
      description="Select a referrer from the active list"
      footer={footer}
    >
      <div className="space-y-6">
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search referrer name..."
            className="pl-10 border-gray-300"
            autoComplete="off"
          />
        </div>

        {loadError && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading referrers…</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">
            {search.trim()
              ? 'No matching referrers found.'
              : 'No active referrers available.'}
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((referrer) => {
              const isSelected = selectedReferrerId === referrer.id;
              return (
                <div
                  key={referrer.id}
                  onClick={() => handleSelect(referrer)}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group',
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all',
                        isSelected
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <Building2 size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {getReferrerName(referrer)}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {referrerSubtitle(referrer)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RightDrawer>
  );
}

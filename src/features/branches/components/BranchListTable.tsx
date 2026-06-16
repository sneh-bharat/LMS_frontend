'use client';

import { Building2 } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { Branch } from '../services/branch.service';
import { isBranchActive, branchStatusLabel } from '../utils/branch.utils';
import { BranchPriceActions } from './BranchPriceActions';

export interface BranchListTableProps {
  branches: Branch[];
  currentPage: number;
  pageSize: number;
  onViewDetails: (id: number) => void;
  onConfigure: (branch: Branch) => void;
  onListing: (branch: Branch) => void;
}

/** List-view table of branches. */
export function BranchListTable({
  branches,
  currentPage,
  pageSize,
  onViewDetails,
  onConfigure,
  onListing,
}: BranchListTableProps) {
  return (
    <div className="glass overflow-hidden rounded-[3rem] border border-white/40 shadow-2xl">
      <table className="w-full text-left">
        <thead className="border-b border-slate-100 bg-slate-50/50">
          <tr>
            <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">S.No</th>
            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Entity &amp; Location</th>
            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Type</th>
            <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Contact</th>
            <th className="px-8 py-5 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {branches.map((branch, index) => (
            <tr key={branch.id} className="group transition-colors hover:bg-green-50/30">
              <td className="px-8 py-6 text-center">
                <div className="font-black text-slate-900">{currentPage * pageSize + index + 1}</div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/40 bg-slate-100 text-slate-400 transition-all group-hover:bg-green-600 group-hover:text-white">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <div className="font-black text-slate-900 transition-colors group-hover:text-green-700">{branch.branchName}</div>
                    {branch.address && (
                      <div className="text-xs font-bold text-slate-400 underline decoration-slate-200">{branch.address}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-2">
                  <Badge variant={isBranchActive(branch) ? 'success' : 'secondary'}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isBranchActive(branch) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {branchStatusLabel(branch)}
                  </Badge>
                  <Badge variant="outline" className="px-2 py-1 text-[10px] capitalize">
                    {branch.branchType.toLowerCase().replace(/_/g, ' ')}
                  </Badge>
                </div>
              </td>
              <td className="px-8 py-6">
                {branch.contactPhone && <div className="text-sm font-black text-slate-700">{branch.contactPhone}</div>}
                {branch.contactEmail && <div className="text-xs font-bold italic text-slate-400">{branch.contactEmail}</div>}
              </td>
              <td className="px-8 py-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-[10px] font-black uppercase tracking-widest"
                    onClick={() => onViewDetails(branch.id)}
                  >
                    Details
                  </Button>
                  <BranchPriceActions variant="list" onConfigure={() => onConfigure(branch)} onListing={() => onListing(branch)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BranchListTable;

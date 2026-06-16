'use client';

import {
  Building,
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import type { Branch } from '../services/branch.service';
import { isBranchActive, branchStatusLabel } from '../utils/branch.utils';
import { BranchPriceActions } from './BranchPriceActions';

export interface BranchCardProps {
  branch: Branch;
  onViewDetails: (id: number) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (id: number) => void;
  onConfigure: (branch: Branch) => void;
  onListing: (branch: Branch) => void;
}

/** Grid-view card for a single branch. */
export function BranchCard({ branch, onViewDetails, onEdit, onDelete, onConfigure, onListing }: BranchCardProps) {
  return (
    <div className="group glass relative flex flex-col overflow-hidden rounded-[3rem] border border-gray-300 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="relative z-10 mb-8 flex items-start justify-between">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-slate-100 bg-slate-50 text-slate-400 shadow-inner transition-all duration-500 group-hover:bg-green-600 group-hover:text-white">
          <Building2 size={32} />
        </div>
        <Badge variant={isBranchActive(branch) ? 'success' : 'secondary'} size="md">
          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isBranchActive(branch) ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {branchStatusLabel(branch)}
        </Badge>
      </div>

      <div className="relative z-10 mb-8 space-y-6 border-b border-slate-50 pb-8">
        <div>
          <h3 className="mb-2 text-xl font-black leading-tight text-slate-900 transition-colors group-hover:text-green-700">
            {branch.branchName}
          </h3>
          {branch.address && (
            <div className="flex items-start gap-2 text-sm font-medium italic text-slate-500">
              <MapPin size={16} className="mt-0.5 shrink-0 text-slate-300" />
              <span>{branch.address}</span>
            </div>
          )}
          {(branch.city || branch.state) && (
            <div className="mt-1 text-xs font-bold text-slate-400">
              {[branch.city, branch.state].filter(Boolean).join(', ')}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {branch.contactEmail && (
            <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/30 bg-slate-100/50 text-slate-400">
                <Mail size={14} />
              </div>
              {branch.contactEmail}
            </div>
          )}
          {branch.contactPhone && (
            <div className="flex items-center gap-3 text-[13px] font-bold text-slate-600">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/30 bg-slate-100/50 text-slate-400">
                <Phone size={14} />
              </div>
              {branch.contactPhone}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-auto flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Branch Type</p>
          <div className="text-sm font-bold capitalize text-slate-900">
            {branch.branchType.toLowerCase().replace(/_/g, ' ')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="aspect-square h-10 w-10 rounded-2xl p-3 hover:border-slate-300 hover:bg-slate-50"
            onClick={() => onViewDetails(branch.id)}
            title="Details"
          >
            <ChevronRight size={20} />
          </Button>
          <BranchPriceActions variant="grid" onConfigure={() => onConfigure(branch)} onListing={() => onListing(branch)} />
          <Button
            variant="ghost"
            className="aspect-square h-10 w-10 rounded-full p-3 text-slate-300 transition-colors hover:bg-blue-50 hover:text-blue-600"
            onClick={() => onEdit(branch)}
          >
            <Plus size={20} />
          </Button>
          <Button
            variant="ghost"
            className="gap-2 bg-rose-600 font-bold text-white hover:text-rose-600"
            onClick={() => onDelete(branch.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <Building size={120} className="absolute bottom-[-10%] right-[-10%] rotate-12 opacity-[0.03] transition-transform duration-700 group-hover:scale-110" />
    </div>
  );
}

export default BranchCard;

'use client';

import { Mail, Phone, UserCheck } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  getCollectorName,
  getCollectorPhone,
  getCollectorStatusLabel,
  getCollectorVerifiedLabel,
  type BloodCollector,
} from '../services/collector.service';

interface CollectorDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  collector: BloodCollector | null;
  onEdit?: (collector: BloodCollector) => void;
}

export default function CollectorDetails({
  isOpen,
  onClose,
  collector,
  onEdit,
}: CollectorDetailsProps) {
  if (!collector) return null;

  const formatCreatedAt = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <UserCheck className="text-white" size={24} />
          <span>
            Collector <span className="text-emerald-200">Details</span>
          </span>
        </div>
      }
      description={collector.username?.trim() || 'Blood collector profile'}
      footer={
        <div className="flex gap-3 w-full">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold">
            Close
          </Button>
          {onEdit ? (
            <Button
              type="button"
              variant="gradient"
              className="flex-1 font-bold"
              onClick={() => onEdit(collector)}
            >
              Edit collector
            </Button>
          ) : null}
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            Full name
          </p>
          <p className="text-lg font-bold text-slate-900">{getCollectorName(collector)}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Username
            </p>
            <p className="text-sm font-semibold text-slate-800 font-mono">
              {collector.username?.trim() || '—'}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Role
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {collector.role?.trim() || '—'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Phone
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Phone size={14} className="text-emerald-500 shrink-0" />
              {getCollectorPhone(collector)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Email
            </p>
            <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 break-all">
              <Mail size={14} className="text-emerald-500 shrink-0" />
              {collector.email?.trim() || '—'}
            </p>
          </div>
        </div>

        
       
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Collection center / Branch
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {collector.branchName?.trim() || '—'}
            </p>
          </div>
        

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant={collector.isVerified ? 'default' : 'secondary'}
            className={
              collector.isVerified
                ? 'bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold'
                : 'text-[10px] font-bold'
            }
          >
            {getCollectorVerifiedLabel(collector)}
          </Badge>
          <Badge
            variant={collector.isActive ? 'default' : 'secondary'}
            className={
              collector.isActive
                ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                : 'text-[10px] font-bold'
            }
          >
            {getCollectorStatusLabel(collector)}
          </Badge>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            Created
          </p>
          <p className="text-sm font-semibold text-slate-800">
            {formatCreatedAt(collector.createdAt)}
          </p>
        </div>
      </div>
    </RightDrawer>
  );
}

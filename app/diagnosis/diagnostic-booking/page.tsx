'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, ArrowRightCircle, Building2 } from 'lucide-react';
import { Button, Card, Label } from '@/components/ui';
import SelectBranch, { BranchTypeBadge, getBranchDisplayName } from './select-branch';
import type { Branch } from '@/app/Apis/branch/branchApi';

export default function DiagnosticBookingBranchPage() {
  const router = useRouter();
  const [branchId, setBranchId] = useState<number | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);

  const handleBranchChange = (id: number, selected: Branch | null) => {
    setBranchId(id);
    setBranch(selected);
  };

  const handleContinue = () => {
    if (!branchId || !branch) return;

    const params = new URLSearchParams({
      branchId: String(branchId),
      branchName: branch.branchName,
    });
    if (branch.branchCode) {
      params.set('branchCode', branch.branchCode);
    }
    if (branch.branchType) {
      params.set('branchType', branch.branchType);
    }

    router.push(`/diagnosis/diagnostic-booking/booking?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/50 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-1000">
      <div className="w-full max-w-lg relative group">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-emerald-500/20 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000" />

        <Card className="relative w-full p-8 border-slate-200/60 bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl space-y-10 overflow-visible transition-all hover:bg-white/60">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-teal-600 flex items-center justify-center text-white shadow-2xl shadow-teal-500/30 mx-auto transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <FlaskConical size={36} />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Branch <span className="text-teal-600">& B2B</span>
              </h1>
              <div className="flex items-center justify-center gap-2">
                <span className="h-[1px] w-8 bg-slate-200"></span>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                  Professional Intake System
                </p>
                <span className="h-[1px] w-8 bg-slate-200"></span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 ml-0.5 flex items-center gap-2">
                <Building2 size={12} className="text-teal-500" /> Select Operational Branch
              </Label>
              <SelectBranch
                value={branchId}
                onChange={handleBranchChange}
                autoSelectFirst={false}
              />
            </div>

            {branch ? (
              <div className="relative overflow-hidden rounded-3xl border border-teal-100/50 bg-teal-50/30 p-6 animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Building2 size={48} className="text-teal-600" />
                </div>
                <div className="relative space-y-1">
                  <p className="text-[9px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                    Active Selection
                  </p>
                  <p className="truncate text-xl font-black text-slate-900">
                    {getBranchDisplayName(branch)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {branch.branchType ? (
                      <BranchTypeBadge branchType={branch.branchType} />
                    ) : null}
                    {branch.branchCode && (
                      <span className="text-[10px] font-mono font-bold text-slate-400">#{branch.branchCode}</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-24 rounded-3xl border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300">
                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for selection...</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleContinue}
            disabled={!branchId || !branch}
            className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 gap-3 group disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            Enter Clinical Workflow
            <ArrowRightCircle size={20} className="group-hover:translate-x-1.5 transition-transform" />
          </Button>

          <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
            Identity Verified • Secure Session • v1.0.4
          </p>
        </Card>
      </div>
    </div>
  );
}


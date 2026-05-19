'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, ArrowRightCircle, Building2 } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import SelectBranch from './select-branch';
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6 animate-in fade-in duration-500">
      <Card className="w-full max-w-md p-8 border-gray-300 shadow-xl space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mx-auto">
            <FlaskConical size={28} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Branch <span className="text-gradient">& B2B</span>
          </h1>
          <p className="text-slate-500 text-sm font-semibold flex items-center justify-center gap-2">
            <Building2 size={16} className="text-emerald-600" />
            {branch ? 'You can change the branch below' : 'Select a branch to continue'}
          </p>
        </div>

        {branch ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-center space-y-1">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              Selected Branch
            </p>
            <p className="text-lg font-black text-slate-900">{branch.branchName}</p>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-600">
              {branch.branchType.replace(/_/g, ' ')}
            </p>
          </div>
        ) : null}

        <SelectBranch
          value={branchId}
          onChange={handleBranchChange}
          autoSelectFirst={false}
        />

        <Button
          onClick={handleContinue}
          disabled={!branchId || !branch}
          className="w-full h-12 rounded-xl custom-gradient text-white font-black text-sm uppercase tracking-wider gap-2 group disabled:opacity-50"
        >
          Continue to Booking
          <ArrowRightCircle size={20} className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </Card>
    </div>
  );
}


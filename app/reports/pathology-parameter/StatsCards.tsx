'use client';

import { Card } from '@/components/ui';

interface StatsCardsProps {
  total: number;
  active: number;
  linked: number;
}

export default function StatsCards({ total, active, linked }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-6 transition-all hover:shadow-xl hover:-translate-y-1 group">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">{total}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Parameters</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            📊
          </div>
        </div>
      </Card>
      <Card className="p-6 transition-all hover:shadow-xl hover:-translate-y-1 group">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">{active}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            ✓
          </div>
        </div>
      </Card>
      <Card className="p-6 transition-all hover:shadow-xl hover:-translate-y-1 group">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-3xl font-black text-slate-900">{linked}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Linked</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            🔗
          </div>
        </div>
      </Card>
    </div>
  );
}

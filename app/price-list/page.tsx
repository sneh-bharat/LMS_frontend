'use client';

import React from 'react';
import {
  Tag,
  ChevronRight,
  Search,
  Plus,
  TrendingUp,
  FileText,
  ExternalLink,
  Lock,
  Eye,
  Zap,
  Scale,
  Layers
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

export default function PriceListPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Pricing <span className="text-gradient">Master</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Centralized command for institutional pricing tiers, standard test MRPs, and B2B health packages.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200/60 bg-white/50 backdrop-blur-sm px-6">
            <Eye size={18} /> Public View
          </Button>
          <Button variant="gradient" className="gap-2 shadow-xl shadow-green-500/20 px-8">
            <Plus size={18} /> New Rate Card
          </Button>
        </div>
      </div>

      {/* ═══ CORE TIERS ═════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Standard MRP', count: '1,240 Items', color: 'blue', icon: <Tag size={20} /> },
          { title: 'Corporate Tiers', count: '12 Active Contracts', color: 'emerald', icon: <Layers size={20} /> },
          { title: 'Franchise Rates', count: '45 Active Partners', color: 'amber', icon: <Zap size={20} /> },
        ].map((tier, i) => (
          <div key={i} className="glass group p-8 rounded-[2.5rem] border border-white/40 shadow-xl hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${tier.color}-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${tier.color}-500/20 transition-all duration-500`}></div>
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-${tier.color}-500 transition-all group-hover:scale-110`}>
                {tier.icon}
              </div>
              <Badge variant="secondary" className="px-3">{tier.count}</Badge>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">{tier.title}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 group-hover:text-blue-600 transition-colors">
              Manage Catalog <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        ))}
      </div>

      {/* ═══ INITIALIZATION STATE ═══════════════════════════════ */}
      <div className="glass rounded-[4rem] p-16 border border-white/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-10 min-h-[500px] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:radial-gradient(white,transparent)] pointer-events-none opacity-50"></div>

        <div className="relative">
          <div className="w-32 h-32 rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner border border-slate-100 transition-all group hover:scale-110 hover:text-green-500">
            <Scale size={64} className="group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
            <Lock size={20} className="text-amber-500" />
          </div>
        </div>

        <div className="max-w-md relative space-y-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Configuration <span className="text-gradient">Required</span></h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Pricing structures for standard investigations and specialized health packages are ready for deployment. Initialize your base rate card to begin billing operations.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 relative">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input
              placeholder="Quick search rates..."
              className="bg-white border-2 border-slate-100 rounded-3xl py-4 pl-14 pr-10 text-sm font-black focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all w-72 shadow-lg"
            />
          </div>
          <Button variant="gradient" className="rounded-3xl px-12 py-4 shadow-xl shadow-green-500/30 font-black text-xs uppercase tracking-[0.2em] gap-2 group translate-y-[-2px]">
            <TrendingUp size={16} /> Deploy Master Card
          </Button>
        </div>

        <div className="flex items-center gap-8 pt-6">
          <div className="flex items-center gap-2 group cursor-pointer">
            <FileText size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Import CSV</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-100"></div>
          <div className="flex items-center gap-2 group cursor-pointer">
            <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">API Sync</span>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER INFO ════════════════════════════════════════ */}
      <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <Zap size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Live Synchronization</h4>
            <p className="text-xs font-medium text-blue-100 opacity-80 italic">Pricing changes automatically reflect across all billing terminals.</p>
          </div>
        </div>
        <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest">
          Force Cluster Sync
        </Button>
      </div>
    </div>
  );
}

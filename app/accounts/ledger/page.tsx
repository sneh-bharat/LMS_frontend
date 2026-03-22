'use client';

import React from 'react';
import {
  BookOpen,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  Calendar,
  Download,
  CreditCard,
  Building,
  History
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function LedgerPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Financial <span className="text-gradient">Ledger</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Real-time tracking of institutional credits, debits, and balance settlements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200/60 bg-white/50 backdrop-blur-sm">
            <Download size={18} />
            Export
          </Button>
          <Button variant="gradient" className="gap-2 shadow-xl shadow-green-500/20 px-6">
            <Plus size={18} />
            New Entry
          </Button>
        </div>
      </div>

      {/* ═══ QUICK STATS ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Credits', value: '₹4,85,200', trend: '+12%', up: true, color: 'emerald' },
          { label: 'Total Debits', value: '₹1,42,800', trend: '-5%', up: false, color: 'rose' },
          { label: 'Net Balance', value: '₹3,42,400', trend: '+18%', up: true, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="glass p-8 rounded-[2.5rem] hover:shadow-2xl transition-all duration-300 border border-white/40">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <div className={`flex items-center gap-1 font-black text-[10px] px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <h3 className={`text-3xl font-black tracking-tight ${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'rose' ? 'text-rose-600' : 'text-blue-600'}`}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* ═══ MAIN LEDGER CONTENT ═══════════════════════════════ */}
      <div className="glass rounded-[4rem] p-12 border border-white/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
        <div className="w-32 h-32 rounded-[3rem] bg-slate-50 flex items-center justify-center text-slate-200 shadow-inner border border-slate-100 transition-all group hover:scale-110 hover:text-green-500">
          <History size={64} className="group-hover:rotate-12 transition-transform duration-500" />
        </div>
        <div className="max-w-md">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Initialize Records</h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Ledger and accounting records are ready for deployment. Connect an institutional account to start tracking transactions.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="outline" className="rounded-2xl px-8 py-4 bg-white/50 border-slate-200/60 font-black text-xs uppercase tracking-widest gap-2">
            <Building size={16} /> Select Account
          </Button>
          <Button variant="gradient" className="rounded-2xl px-12 py-4 shadow-xl shadow-green-500/20 font-black text-xs uppercase tracking-widest gap-2">
            <CreditCard size={16} /> Sync Transactions
          </Button>
        </div>
      </div>

      {/* ═══ RECENT ACTIVITY (Placeholder) ═══════════════════════ */}
      <div className="glass p-8 rounded-[3rem] border border-white/40 shadow-xl space-y-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            Financial Audit Log
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          </h3>
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">
            View Full History
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { entry: 'Franchise Payout #823', date: '22 Mar, 2026', amount: '-₹42,000', type: 'debit' },
            { entry: 'Corporate Deposit #112', date: '21 Mar, 2026', amount: '+₹1,50,000', type: 'credit' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-slate-100 group hover:bg-white hover:shadow-xl transition-all cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {item.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-black text-slate-900">{item.entry}</div>
                  <div className="text-[10px] font-bold text-slate-400 italic flex items-center gap-1">
                    <Calendar size={10} /> {item.date}
                  </div>
                </div>
              </div>
              <div className={`text-lg font-black tracking-tight ${item.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {item.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

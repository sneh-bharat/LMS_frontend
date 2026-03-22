'use client';

import React from 'react';
import {
  DollarSign,
  Users,
  Zap,
  FlaskConical,
  Search,
  Plus,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import Button from './components/ui/Button';
import Badge from './components/ui/Badge';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HERO SECTION ═══════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            System <span className="text-emerald-600">Overview</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Real-time performance metrics and branch management.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal size={14} />
            Filters
          </Button>
          <Button variant="gradient" size="sm" className="gap-2">
            <Plus size={14} />
            Create Branch
          </Button>
        </div>
      </div>

      {/* ═══ STATS GRID ═════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$84,250', trend: '+12.5%', up: true, icon: <DollarSign />, color: 'blue' },
          { label: 'Active Patients', value: '1,284', trend: '+8.2%', up: true, icon: <Users />, color: 'emerald' },
          { label: 'Test Velocity', value: '45.2/hr', trend: '-2.4%', up: false, icon: <Activity />, color: 'rose' },
          { label: 'Lab Efficiency', value: '98.4%', trend: '+1.5%', up: true, icon: <FlaskConical />, color: 'amber' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white
                                ${stat.color === 'blue' ? 'bg-blue-600' :
                  stat.color === 'emerald' ? 'bg-emerald-600' :
                    stat.color === 'rose' ? 'bg-rose-600' : 'bg-amber-600'}`}
              >
                {React.cloneElement(stat.icon as any, { size: 20 })}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.up ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ MAIN CONTENT ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ── Table Section ── */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Institutional Branches
              <Badge variant="success" className="px-2">Live</Badge>
            </h2>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-4 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight">Entity Name</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight">Type</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight text-right">Balance</th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Customer Support & Quality', email: 'support@wellnesshive.com', type: 'Postpaid', balance: '$2,450.00' },
                  { name: 'Credit Franchise', email: 'credits@tech.lab', type: 'Prepaid', balance: '$1,200.00' },
                  { name: 'B2B Diagnostics', email: 'b2b@inst.net', type: 'Postpaid', balance: '$25,000.00' },
                  { name: 'Home Collection', email: 'care@home.com', type: 'On-Call', balance: '$450.00' },
                ].map((branch, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all border border-slate-100">
                          <FlaskConical size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{branch.name}</div>
                          <div className="text-[11px] font-medium text-slate-400 italic">{branch.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary">{branch.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm font-bold text-slate-900">{branch.balance}</div>
                      <div className="text-[10px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                        <ArrowUpRight size={10} /> Market Delta
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Side Cards ── */}
        <div className="space-y-6">
          <div className="custom-gradient2 p-6 rounded-xl text-white shadow-lg relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-80 text-white">Cloud Sync Active</h3>
              <p className="text-xl font-bold tracking-tight leading-tight mb-4">
                Your lab data is securely synced to Hive Cloud.
              </p>
              <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white font-bold border-white/20">
                View Reports
              </Button>
            </div>
            <Activity className="absolute bottom-4 right-4 opacity-10 group-hover:scale-110 transition-all duration-500 text-white" size={48} />
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              Security Logs
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </h3>
            <div className="space-y-3">
              {[
                { user: 'Admin', action: 'New Device Login', time: '2m ago' },
                { user: 'Collector', action: 'Report Signature', time: '14m ago' },
                { user: 'System', action: 'Automatic Backup', time: '1h ago' },
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition-all">
                  <div className="w-1 h-8 bg-slate-100 rounded-full group-hover:bg-emerald-500 transition-all"></div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{log.action}</div>
                    <div className="text-[10px] font-medium text-slate-400 italic">by {log.user} • {log.time}</div>
                  </div>
                  <ChevronRight size={12} className="text-slate-300 group-hover:text-emerald-500 transition-all" />
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full text-[10px]">
              View All Logs
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Phone,
  Mail,
  Building2,
  MoreVertical,
  LayoutGrid,
  List,
  Plus,
  Building,
  Globe,
  CreditCard,
  ChevronRight,
  SearchX,
  ArrowUpRight
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

const BRANCHES = [
  {
    id: 1,
    name: 'Customer Support & Quality',
    address: 'Sector 5, Salt Lake, Kolkata, WB 700091',
    type: 'Main Branch',
    email: 'support@wellnesshive.com',
    phone: '+91 8062179988',
    status: 'Active',
    balance: '$2,450.00'
  },
  {
    id: 2,
    name: 'North City Collection Point',
    address: 'MG Road, North Extension, Delhi 110001',
    type: 'Collection Center',
    email: 'north.care@wellnesshive.com',
    phone: '+91 9876543210',
    status: 'Active',
    balance: '$1,200.00'
  },
  {
    id: 3,
    name: 'Apex Diagnostic Hub',
    address: 'Indiranagar, Bangalore, KA 560038',
    type: 'B2B Partner',
    email: 'apex@partner.lab',
    phone: '+91 8022334455',
    status: 'Offline',
    balance: '$15,000.00'
  },
];

export default function BranchesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Branches <span className="text-gradient">& B2B</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Manage your diagnostic centers, collection points, and institutional partnerships.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass p-1 rounded-2xl border border-slate-200/60 hidden md:flex">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-green-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={20} />
            </button>
          </div>
          <Button variant="gradient" className="gap-2 shadow-xl shadow-green-500/20 px-6">
            <Plus size={18} />
            Add New Entity
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="glass p-4 rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search by branch name, location, or email..."
            className="w-full bg-slate-50/50 border border-slate-200/60 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <Button variant="outline" className="px-4 py-2.5 rounded-2xl border-slate-200/60 bg-white/50 whitespace-nowrap gap-2">
            <SlidersHorizontal size={16} />
            All Filters
          </Button>
          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>
          <Badge variant="gradient" className="cursor-pointer px-4 py-2 text-[10px] shadow-md shadow-green-500/10">All Entities</Badge>
          <Badge variant="secondary" className="cursor-pointer px-4 py-2 text-[10px] hover:bg-slate-200 transition-colors">Main Branch</Badge>
          <Badge variant="secondary" className="cursor-pointer px-4 py-2 text-[10px] hover:bg-slate-200 transition-colors">Partner Labs</Badge>
        </div>
      </div>

      {/* ═══ CONTENT ════════════════════════════════════════════ */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BRANCHES.map((branch) => (
            <div key={branch.id} className="glass rounded-[3rem] p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-white/40 flex flex-col group relative overflow-hidden">
              {/* Entity Icon & Status */}
              <div className="flex items-start justify-between mb-8 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner border border-slate-100 group-hover:bg-green-600 group-hover:text-white transition-all duration-500">
                  <Building2 size={32} />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={branch.status === 'Active' ? 'success' : 'secondary'} size="md">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${branch.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {branch.status}
                  </Badge>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #0{branch.id}82</div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6 relative z-10 mb-8 border-b border-slate-50 pb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-green-700 transition-colors">
                    {branch.name}
                  </h3>
                  <div className="flex items-start gap-2 text-slate-500 text-sm font-medium italic">
                    <MapPin size={16} className="shrink-0 mt-0.5 text-slate-300" />
                    <span>{branch.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 text-slate-600 text-[13px] font-bold">
                    <div className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-400 border border-slate-200/30">
                      <Mail size={14} />
                    </div>
                    {branch.email}
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-[13px] font-bold">
                    <div className="w-8 h-8 rounded-lg bg-slate-100/50 flex items-center justify-center text-slate-400 border border-slate-200/30">
                      <Phone size={14} />
                    </div>
                    {branch.phone}
                  </div>
                </div>
              </div>

              {/* Ledger & Actions */}
              <div className="mt-auto flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                  <div className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <CreditCard size={18} className="text-green-500" />
                    {branch.balance}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="rounded-2xl p-3 hover:bg-slate-50 hover:border-slate-300">
                    <ChevronRight size={20} />
                  </Button>
                  <button className="p-3 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Decorative Background Element */}
              <Building size={120} className="absolute bottom-[-10%] right-[-10%] opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-[3rem] overflow-hidden border border-white/40 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Entity & Location</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Balance</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BRANCHES.map((branch) => (
                <tr key={branch.id} className="hover:bg-green-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-green-600 group-hover:text-white transition-all border border-slate-200/40">
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 group-hover:text-green-700 transition-colors">{branch.name}</div>
                        <div className="text-xs font-bold text-slate-400 underline decoration-slate-200">{branch.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant="secondary" className="px-3">{branch.type}</Badge>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-black text-slate-700">{branch.phone}</div>
                    <div className="text-xs font-bold text-slate-400 italic">{branch.email}</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="font-black text-slate-900">{branch.balance}</div>
                    <div className="text-[10px] font-black text-emerald-500 flex items-center justify-end gap-1 uppercase tracking-tighter">
                      <ArrowUpRight size={10} /> Market High
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

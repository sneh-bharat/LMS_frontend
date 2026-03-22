'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Clock,
  CreditCard,
  Zap,
  LayoutGrid,
  ChevronDown,
  X,
  FileText,
  Database,
  Tag
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// ─── Data Types ──────────────────────────────────────────────────────────────
interface Investigation {
  id: number;
  category: string;
  subCategory: string;
  name: string;
  container?: string;
  tat: string;
  cost: number;
  point: number;
  mrp: number;
  status: 'Active' | 'Inactive';
}

const SAMPLE: Investigation[] = [
  { id: 1, category: 'Pathology', subCategory: 'ALLRGY', name: 'ASO TITRE (ASO)', tat: '0 Day', cost: 0, point: 0, mrp: 200, status: 'Active' },
  { id: 2, category: 'Pathology', subCategory: 'CYTOLOGY', name: 'CERVICAL/VAGINAL (SMEAR SENT)', tat: '3 Day', cost: 0, point: 0, mrp: 600, status: 'Active' },
  { id: 3, category: 'Pathology', subCategory: 'IMMUNOLOGY', name: '1, 25 (OH) VITAMIN D3', container: 'Clot (Powdered glass)', tat: '0 Day', cost: 144, point: 0, mrp: 1200, status: 'Active' },
  { id: 4, category: 'Pathology', subCategory: 'IMMUNOLOGY', name: '17 OH PROGESTERONE', container: 'Clot (Powdered glass)', tat: '1 Day', cost: 0, point: 0, mrp: 2000, status: 'Active' },
  { id: 5, category: 'Pathology', subCategory: 'IMMUNOLOGY', name: '17-KETOSTEROIDS-24HRS URINE', tat: '7 Day', cost: 0, point: 0, mrp: 3000, status: 'Active' },
  { id: 6, category: 'Pathology', subCategory: 'CLINI PATHO', name: '24 HOURS URINE CITRATE', tat: '5 Day', cost: 0, point: 0, mrp: 1500, status: 'Active' },
];

const CATEGORIES = ['All', 'Pathology', 'Radiology', 'Microbiology'];
const STATUSES = ['Active', 'Inactive'];

// ─── Components ───────────────────────────────────────────────────────────────
function ManageDropdown({ inv }: { inv: Investigation }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600">
        <MoreHorizontal size={20} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Edit2 size={14} /> Edit Catalog
          </button>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Zap size={14} /> B2B Pricing
          </button>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Settings size={14} /> Parameters
          </button>
          <div className="h-[1px] bg-slate-100 my-2"></div>
          <button className="w-full text-left px-5 py-2.5 text-xs font-black uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <Trash2 size={14} /> Deactivate
          </button>
        </div>
      )}
    </div>
  );
}

export default function InvestigationListPage() {
  const [investigations] = useState<Investigation[]>(SAMPLE);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Investigation <span className="text-emerald-600">Catalog</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Universal directory of diagnostic tests and procedures.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6">
            <LayoutGrid size={16} /> Catalog View
          </Button>
          <Button variant="gradient" size="sm" className="gap-2 shadow-sm px-8">
            <Plus size={16} /> Create Investigation
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {/* ═══ CATALOG TABLE ══════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">S.No</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investigation Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">TAT</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cost</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">MRP</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {investigations.map((inv, idx) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-300 font-mono">#{idx + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <FlaskConical size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Badge variant="primary" className="px-1.5 py-0 text-[8px] uppercase tracking-wider">
                            {inv.category}
                          </Badge>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                            {inv.subCategory}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">{inv.name}</div>
                        {inv.container && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Database size={10} className="text-slate-300" />
                            <span className="text-[10px] font-medium text-slate-400 italic">{inv.container}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">{inv.tat}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-slate-400 font-mono">₹{inv.cost.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">₹{inv.mrp.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={inv.status === 'Active' ? 'success' : 'secondary'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ManageDropdown inv={inv} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Showing {investigations.length} Investigations</span>
            <div className="w-1 h-1 rounded-full bg-slate-200"></div>
            <span className="text-emerald-600">Master Catalog v4.2</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]">Prev</Button>
            <Button variant="secondary" size="sm" className="px-4 py-1 text-[10px]">1</Button>
            <Button variant="outline" size="sm" className="px-4 py-1 text-[10px]">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
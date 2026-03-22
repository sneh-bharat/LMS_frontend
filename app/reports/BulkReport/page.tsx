'use client';

import { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Search,
  Calendar as CalendarIcon,
  Filter,
  CheckCircle2,
  Clock,
  ChevronDown,
  Globe,
  CreditCard,
  Stethoscope,
  Shield,
  Users,
  ArrowRightCircle,
  Zap,
  LayoutGrid,
  MoreVertical
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// ─── Types and Constants ──────────────────────────────────────────────────────
interface ReportRow {
  id: number;
  patientName: string;
  investigation: string;
  status: 'Ready' | 'Pending' | 'Delivered';
  reportId: string;
  checked: boolean;
}

const SAMPLE_DATA: ReportRow[] = [
  { id: 1, patientName: 'Aman Kumar', investigation: 'CBC (Complete Blood Count)', status: 'Ready', reportId: 'RP-2026-001', checked: false },
  { id: 2, patientName: 'Sarah Jenkins', investigation: 'Lipid Profile', status: 'Pending', reportId: 'RP-2026-002', checked: false },
  { id: 3, patientName: 'Michael Chen', investigation: 'Thyroid Profile', status: 'Delivered', reportId: 'RP-2026-003', checked: false }
];

export default function BulkReportPrintPage() {
  const [date, setDate] = useState('2026-03-22');
  const [rows, setRows] = useState<ReportRow[]>(SAMPLE_DATA);
  const [branding, setBranding] = useState('Branding+Signature');

  const allChecked = rows.length > 0 && rows.every(r => r.checked);
  const selectedCount = rows.filter(r => r.checked).length;

  const toggleAll = () => setRows(prev => prev.map(r => ({ ...r, checked: !allChecked })));
  const toggleRow = (id: number) => setRows(prev => prev.map(r => r.id === id ? { ...r, checked: !r.checked } : r));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Batch <span className="text-gradient">Publishing</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Streamlined system for bulk report generation, digital signature integration, and institutional printing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={18} />
            <select
              value={branding}
              onChange={e => setBranding(e.target.value)}
              className="bg-white border-2 border-slate-900 rounded-2xl py-3 pl-12 pr-10 text-xs font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer hover:bg-slate-50 transition-all"
            >
              <option>Report Only</option>
              <option>Branding+Signature</option>
              <option>With Signature</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-900 pointer-events-none" size={16} />
          </div>
          <Button variant="gradient" disabled={selectedCount === 0} className="gap-2 shadow-xl shadow-green-500/20 px-8 py-3.5">
            <Download size={20} /> Collect Batch ({selectedCount})
          </Button>
        </div>
      </div>

      {/* ═══ FILTER BAR ═════════════════════════════════════════ */}
      <div className="glass p-4 rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 group min-w-[180px]">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200/40 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all" />
          </div>
          <div className="relative flex-1 group min-w-[200px]">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select className="w-full bg-slate-50/50 border border-slate-200/40 rounded-2xl py-3.5 pl-12 pr-10 text-xs font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer">
              <option>H.O. Collection</option>
              <option>Cash Sales</option>
              <option>Credit Institutional</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
          </div>
        </div>
        <div className="relative flex-1 group w-full">
          <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select className="w-full bg-slate-50/50 border border-slate-200/40 rounded-2xl py-3.5 pl-12 pr-10 text-xs font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer">
            <option>All Specializations</option>
            <optgroup label="Pathology">
              <option>Biochemistry</option>
              <option>Hematology</option>
            </optgroup>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
        </div>
        <Button variant="outline" className="rounded-2xl border-slate-200/60 px-8 py-3.5 font-black uppercase text-xs tracking-widest bg-white shadow-sm hover:border-green-500 hover:text-green-600 transition-all">
          Filter Results
        </Button>
      </div>

      {/* ═══ DATA GRID ══════════════════════════════════════════ */}
      <div className="glass rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 w-12">
                  <div className={`w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all ${allChecked ? 'bg-green-600 border-green-600' : 'bg-white border-2 border-slate-200 hover:border-slate-300'}`} onClick={toggleAll}>
                    {allChecked && <CheckCircle2 size={16} className="text-white" />}
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Dynamics</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Investigation Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Protocol Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Digital Report ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/40 backdrop-blur-md">
              {rows.map((row, idx) => (
                <tr key={row.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-10 py-6">
                    <div className={`w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all ${row.checked ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20' : 'bg-white border-2 border-slate-100 hover:border-slate-200'}`} onClick={() => toggleRow(row.id)}>
                      {row.checked && <CheckCircle2 size={16} className="text-white" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                        {row.patientName.charAt(0)}
                      </div>
                      <div className="font-black text-slate-900 tracking-tight">{row.patientName}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-600">{row.investigation}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge variant={row.status === 'Ready' ? 'success' : row.status === 'Pending' ? 'secondary' : 'gradient'} className="px-4 py-1.5 rounded-xl uppercase text-[9px] font-black tracking-widest shadow-sm">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 font-mono text-xs font-black text-blue-600">
                    {row.reportId}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 text-slate-300 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all">
                      <Printer size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="p-10 border-t border-slate-100 bg-white/50 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-10">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-4 border-white"></div>)}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-black text-slate-900">Queue Active</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Monitoring {rows.length} publishing threads</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-8 py-3 rounded-2xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Previous Sync</button>
              <button className="px-10 py-3 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black text-[10px] uppercase tracking-widest group">
                Proceed Batch <ArrowRightCircle size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-3xl p-6 flex items-center justify-between border border-emerald-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">System ready for A5 High-Precision Invoice printing</p>
            </div>
            <Badge variant="success" className="px-3">Online</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
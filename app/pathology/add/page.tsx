'use client';

import React from 'react';
import {
  Plus,
  FlaskConical,
  Microscope,
  ClipboardCheck,
  Clock,
  User,
  Phone,
  LayoutGrid,
  ChevronRight,
  ShieldCheck,
  Droplets,
  Zap,
  Download
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function PathologyAddPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Pathology <span className="text-gradient">Creation</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Define new diagnostic protocols, laboratory benchmarks, and investigation parameters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200/60 bg-white shadow-sm px-6">
            <LayoutGrid size={18} /> Catalog
          </Button>
          <Button variant="gradient" className="gap-2 shadow-xl shadow-green-500/20 px-8">
            <Plus size={18} /> Initialize Record
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ═══ FORM AREA ═══════════════════════════════════════ */}
        <div className="xl:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[3.5rem] border border-white/40 shadow-2xl space-y-10">
            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-[1px] bg-slate-200"></span>
                01. Classification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary Department</label>
                  <select className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none cursor-pointer">
                    <option>Biochemistry</option>
                    <option>Hematology</option>
                    <option>Microbiology</option>
                    <option>Immunology</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Investigation Name</label>
                  <input placeholder="e.g. Ferritin Serum" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-[1px] bg-slate-200"></span>
                02. Technical Protocol
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Sample Container</label>
                  <input placeholder="Clot Activator" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">TAT (Days)</label>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="number" placeholder="1" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4 pl-14 pr-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Methodology</label>
                  <input placeholder="CLIA" className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl py-4 px-6 text-sm font-black focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-mono italic" />
                </div>
              </div>
            </section>

            <div className="pt-6 flex gap-4">
              <button className="flex-1 rounded-[1.8rem] py-4 font-black uppercase text-xs tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all">Clear Form</button>
              <Button variant="gradient" className="flex-[2] rounded-[1.8rem] py-4 font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-green-500/20">Commit to Database</Button>
            </div>
          </div>
        </div>

        {/* ═══ PREVIEW PANEL ═══════════════════════════════════ */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-[3rem] border border-white/40 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              Universal Standards
              <ShieldCheck size={14} className="text-blue-500" />
            </h3>
            <div className="space-y-4">
              {[
                { label: 'CAP Accredited', status: true },
                { label: 'ISO 15189 Ready', status: true },
                { label: 'Audit Trail Enforced', status: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/50 border border-slate-100 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <Zap size={14} className="text-green-500" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-10 rounded-[3.5rem] border border-white/40 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 shadow-inner border border-slate-100">
              <Microscope size={48} />
            </div>
            <div className="space-y-2">
              <h4 className="text-xl font-black text-slate-900 tracking-tight">Protocol Definition</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">System ready for pathology meta-data injection.</p>
            </div>
            <Button variant="outline" className="rounded-2xl border-slate-200 px-8 py-3 font-black uppercase text-[10px] tracking-widest">Load Template</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

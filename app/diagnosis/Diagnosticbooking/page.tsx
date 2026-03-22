'use client';

import { useState } from 'react';
import {
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Activity,
  Stethoscope,
  Search,
  X,
  ChevronRight,
  CreditCard,
  Trash2,
  FlaskConical,
  Heart,
  Droplets,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRightCircle,
  Download,
  MoreVertical,
  Zap,
  Scale,
  Ruler,
  Info
} from 'lucide-react';
import { 
  Button, 
  Badge, 
  RightDrawer, 
  Card,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Table
} from '@/components/ui';
import { cn } from '@/lib/utils';

// ─── Types & Constants ───────────────────────────────────────────────────────
interface Investigation {
  id: number;
  name: string;
  mrp: number;
  category: string;
}

interface FormState {
  country: string;
  mobile: string;
  title: string;
  patientName: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  address: string;
  email: string;
  diagnosis: string;
  nationality: string;
  drugAllergy: string;
  lmpDate: string;
  height: string;
  weight: string;
  diseases: string[];
  referredDoctor: string;
  referrer: string;
  processing: string;
  emergencyCharge: string;
  phlebotomist: string;
  phlebotomistCharge: string;
  contrast: string;
  discount: string;
  discountType: string;
  discountBy: string;
  payment: string;
  paymentMode: string;
  srfId: string;
  advanceBooking: boolean;
}

const DISEASES = ['Diabetes', 'Hypertension', 'Anaemia', 'Thyroid', 'Arthritis', 'Asthma'];
const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby', 'M/s'];
const GENDERS = ['Male', 'Female', 'Other'];
const PROCESSING = ['Normal', 'Urgent', 'STAT'];
const PAY_MODES = ['Cash', 'Card', 'UPI', 'Online', 'Credit'];
const DISC_TYPES = ['%', 'Flat'];

const SAMPLE_INVESTIGATIONS: Investigation[] = [
  { id: 1, name: 'CBC (Complete Blood Count)', mrp: 350, category: 'Haematology' },
  { id: 2, name: 'Lipid Profile', mrp: 600, category: 'Biochemistry' },
  { id: 3, name: 'Thyroid Profile (T3,T4,TSH)', mrp: 800, category: 'Immunology' },
  { id: 4, name: 'Blood Sugar Fasting', mrp: 120, category: 'Biochemistry' },
  { id: 5, name: 'Urine Routine', mrp: 150, category: 'Clinical Pathology' },
];

const BLANK: FormState = {
  country: 'IND +91', mobile: '', title: 'Mr.', patientName: '',
  age: '', month: '0', day: '0', gender: 'Male',
  address: '', email: '', diagnosis: '', nationality: 'IND-India',
  drugAllergy: '', lmpDate: '', height: '', weight: '',
  diseases: [], referredDoctor: '', referrer: '',
  processing: 'Normal', emergencyCharge: '',
  phlebotomist: '', phlebotomistCharge: '', contrast: '',
  discount: '0', discountType: '%', discountBy: 'N/A',
  payment: '', paymentMode: 'Cash', srfId: '', advanceBooking: false,
};

// ─── Modals ──────────────────────────────────────────────────────────────────
function AddInvestigationsModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (inv: Investigation[]) => void; }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = SAMPLE_INVESTIGATIONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const footer = (
    <div className="flex gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-300">Cancel</Button>
      <Button disabled={selected.length === 0} onClick={() => { onAdd(SAMPLE_INVESTIGATIONS.filter(i => selected.includes(i.id))); setSelected([]); onClose(); }} className="flex-[2] rounded-xl custom-gradient text-white font-bold">
        Add {selected.length} Tests
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Investigations"
      description="Search and select lab tests"
      footer={footer}
    >
      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search test name..."
            className="pl-10"
          />
        </div>
        <div className="space-y-2">
          {filtered.map(inv => (
            <div
              key={inv.id}
              onClick={() => toggle(inv.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                selected.includes(inv.id)
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-gray-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                  selected.includes(inv.id) ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                )}>
                  {selected.includes(inv.id) ? <CheckCircle2 size={24} /> : <FlaskConical size={20} />}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{inv.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{inv.category}</div>
                </div>
              </div>
              <div className="text-sm font-black text-slate-900">₹{inv.mrp}</div>
            </div>
          ))}
        </div>
      </div>
    </RightDrawer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiagnosticBookingPage() {
  const [form, setForm] = useState<FormState>(BLANK);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [addInvOpen, setAddInvOpen] = useState(false);

  const set = (key: keyof FormState) => (e: any) => {
    const value = e && e.target ? e.target.value : e;
    setForm(f => ({ ...f, [key]: value }));
  };

  const toggleDisease = (d: string) => setForm(f => ({ ...f, diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d], }));
  const removeInvestigation = (id: number) => setInvestigations(prev => prev.filter(i => i.id !== id));

  // Computed totals
  const amount = investigations.reduce((s, i) => s + i.mrp, 0);
  const totalAmount = amount + (Number(form.emergencyCharge) || 0) + (Number(form.phlebotomistCharge) || 0) + (Number(form.contrast) || 0);
  const discVal = form.discountType === '%' ? (totalAmount * (Number(form.discount) || 0)) / 100 : Number(form.discount) || 0;
  const totalDue = Math.max(0, totalAmount - discVal);
  const balance = totalDue - (Number(form.payment) || 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <AddInvestigationsModal 
        isOpen={addInvOpen} 
        onClose={() => setAddInvOpen(false)} 
        onAdd={(inv) => setInvestigations(prev => [...prev, ...inv])} 
      />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FlaskConical size={22} />
            </div>
            Diagnostic Booking
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1 flex items-center gap-2">
            Patient Intake Workflow <span className="w-1 h-1 rounded-full bg-slate-300"></span> 
            <span className="text-emerald-600 font-bold">HO(IP) Branch</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-gray-300 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs gap-2">
            <Download size={16} /> Export Draft
          </Button>
          <Button className="rounded-xl custom-gradient text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-500/10 px-6">
            <Zap size={16} /> Smart Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* ── Main Form Column ── */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Section 1: Identity & Sync */}
          <Card className="p-6 border-gray-300 overflow-hidden relative shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Activity size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Patient Identity</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Profile Sync & Access</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-gray-200">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Advance Mode</span>
                <div className={`w-9 h-5 rounded-full cursor-pointer relative transition-all ${form.advanceBooking ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setForm(f => ({ ...f, advanceBooking: !f.advanceBooking }))}>
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${form.advanceBooking ? 'left-5' : 'left-1'}`}></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Mobile Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                  <Input value={form.mobile} onChange={set('mobile')} placeholder="98765 43210" className="pl-10 border-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Digital ID (Email)</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                  <Input value={form.email} onChange={set('email')} placeholder="patient@example.com" className="pl-10 border-gray-300" />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Bio Information */}
          <Card className="p-0 border-gray-300 overflow-hidden relative shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="p-6 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Bio Information</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Clinical Demographics</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Name & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Title</Label>
                  <Select value={form.title} onValueChange={set('title')}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      {TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-6 space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Full Legal Name</Label>
                  <Input value={form.patientName} onChange={set('patientName')} placeholder="Enter patient name" className="border-gray-300" />
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase pl-1 text-center">Age</Label>
                    <Input value={form.age} onChange={set('age')} className="text-center font-black text-emerald-600 border-gray-300" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Gender</Label>
                    <Select value={form.gender} onValueChange={set('gender')}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Address & Context */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Permanent Address</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                    <Input value={form.address} onChange={set('address')} className="pl-10 border-gray-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-400 uppercase pl-1">Nationality</Label>
                  <div className="relative group">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                    <Input value={form.nationality} onChange={set('nationality')} className="pl-10 border-gray-300" />
                  </div>
                </div>
              </div>

              {/* Measurements row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Heart size={12} className="text-rose-500" /> LMP Date</Label>
                  <Input type="date" value={form.lmpDate} onChange={set('lmpDate')} className="text-xs font-bold border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Ruler size={12} className="text-blue-500" /> Height (cm)</Label>
                  <Input value={form.height} onChange={set('height')} className="text-center font-black border-gray-300" placeholder="--" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Scale size={12} className="text-amber-500" /> Weight (kg)</Label>
                  <Input value={form.weight} onChange={set('weight')} className="text-center font-black border-gray-300" placeholder="--" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1.5"><Droplets size={12} className="text-rose-600" /> Drug Allergy</Label>
                  <Input value={form.drugAllergy} onChange={set('drugAllergy')} className="bg-rose-50 border-rose-200 placeholder:text-rose-300 text-rose-700 font-bold border-gray-300" placeholder="None" />
                </div>
              </div>

              {/* History / Dynamics */}
              <div className="space-y-4 pt-2">
                <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Pre-Existing Dynamics</Label>
                <div className="flex flex-wrap gap-2">
                  {DISEASES.map(d => {
                    const active = form.diseases.includes(d);
                    return (
                      <button 
                        key={d} 
                        onClick={() => toggleDisease(d)} 
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 border",
                          active 
                            ? "bg-[#050b18] text-white border-transparent shadow-lg" 
                            : "bg-white border-gray-300 text-slate-400 hover:border-emerald-200 hover:text-slate-600 shadow-sm"
                        )}
                      >
                        {active ? <CheckCircle2 size={14} className="text-emerald-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Order Cart */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Order Cart</h3>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 font-black text-[10px] px-2.5">{investigations.length} ITEMS</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl border-gray-300 bg-white text-xs font-bold gap-2">
                  <Stethoscope size={14} className="text-blue-500" /> Referred Doctor
                </Button>
                <Button onClick={() => setAddInvOpen(true)} className="rounded-xl custom-gradient text-white text-xs font-black gap-2 px-5 group shadow-lg shadow-emerald-500/10">
                  <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Add Investigation
                </Button>
              </div>
            </div>

            {investigations.length > 0 ? (
              <Card className="overflow-hidden border-gray-300 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Name</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MRP</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {investigations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 border border-gray-200">
                                <FlaskConical size={16} />
                              </div>
                              <div className="text-sm font-bold text-slate-900">{inv.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[9px] font-black border-gray-200">{inv.category}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-black text-slate-900">₹{inv.mrp.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => removeInvestigation(inv.id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 h-52 flex flex-col items-center justify-center text-center p-8 transition-all hover:bg-slate-50 group cursor-pointer" onClick={() => setAddInvOpen(true)}>
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:text-emerald-400 transition-all border border-gray-100">
                  <FlaskConical size={32} />
                </div>
                <p className="text-slate-400 text-sm font-bold">No investigations added yet.</p>
                <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">Start by clicking "Add Investigation"</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Summary Column ── */}
        <div className="xl:col-span-4 space-y-8 sticky top-24">
          <Card className="p-0 border-gray-300 overflow-hidden shadow-xl">
            <div className="p-6 bg-blue-900 text-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 mb-1">
                Checkout Summary
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </h3>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-[10px] font-black opacity-50 uppercase">Balance Due</span>
                <span className="text-3xl font-black text-emerald-400">₹{balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Processing Priority</Label>
                  <Select value={form.processing} onValueChange={set('processing')}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROCESSING.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-2 border-b border-gray-100 pb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400">Order Sub-Total</span>
                    <span className="font-black text-slate-900">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-400 flex items-center gap-2 italic"><Timer size={14} className="text-rose-500" /> Emergency Fee</span>
                    <input type="number" value={form.emergencyCharge} onChange={set('emergencyCharge')} placeholder="0" className="w-20 text-right bg-white border border-gray-300 rounded-lg px-2 py-1.5 focus:border-emerald-500 outline-none font-black text-slate-900" />
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-black text-slate-900 uppercase">Gross Amount</span>
                    <span className="text-lg font-black text-emerald-600">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Adjustment */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment / Discount</span>
                    <Badge variant="secondary" className="bg-white text-emerald-600 text-[10px] font-black border-gray-200">APPLY</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input type="number" value={form.discount} onChange={set('discount')} className="bg-white border-gray-300" />
                    <Select value={form.discountType} onValueChange={set('discountType')}>
                      <SelectTrigger className="border-gray-300 bg-white">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISC_TYPES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Final Due & Pay */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-900 uppercase text-gray-500">Final Amount Due</span>
                    <span className="text-2xl font-black text-[#050b18]">₹{totalDue.toLocaleString()}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" size={16} />
                      <Input type="number" value={form.payment} onChange={set('payment')} placeholder="Payable amount..." className="pl-10 h-12 bg-white border-gray-300 font-black text-[#050b18] placeholder:text-gray-300 shadow-sm" />
                    </div>
                    <Select value={form.paymentMode} onValueChange={set('paymentMode')}>
                      <SelectTrigger className="border-gray-300 h-10 font-bold">
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAY_MODES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Confirm */}
              <div className="pt-2">
                <Button className="w-full h-14 rounded-2xl custom-gradient text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 gap-3 group">
                  Confirm Booking
                  <ArrowRightCircle size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </Button>
                <div className="mt-4 flex flex-col items-center gap-1 opacity-40">
                  <div className="flex items-center gap-1.5">
                    <Info size={10} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">WellnessHive® Precision Billing</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-tighter">System ID: DIAG-BOOK-PR13-2026</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
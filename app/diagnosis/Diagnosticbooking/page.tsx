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
  Ruler
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// ─── Data ───────────────────────────────────────────────────────────────────
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
const TITLES = ['', 'Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby', 'M/s'];
const GENDERS = ['', 'Male', 'Female', 'Other'];
const PROCESSING = ['Normal', 'Urgent', 'STAT'];
const PAY_MODES = ['Cash', 'Card', 'UPI', 'Online', 'Credit'];
const DISC_TYPES = ['--', '%', 'Flat'];

const SAMPLE_INVESTIGATIONS: Investigation[] = [
  { id: 1, name: 'CBC (Complete Blood Count)', mrp: 350, category: 'Haematology' },
  { id: 2, name: 'Lipid Profile', mrp: 600, category: 'Biochemistry' },
  { id: 3, name: 'Thyroid Profile (T3,T4,TSH)', mrp: 800, category: 'Immunology' },
  { id: 4, name: 'Blood Sugar Fasting', mrp: 120, category: 'Biochemistry' },
  { id: 5, name: 'Urine Routine', mrp: 150, category: 'Clinical Pathology' },
];

const BLANK: FormState = {
  country: 'IND +91', mobile: '', title: '', patientName: '',
  age: '', month: '0', day: '0', gender: '',
  address: '', email: '', diagnosis: '', nationality: 'IND-India',
  drugAllergy: '', lmpDate: '', height: '', weight: '',
  diseases: [], referredDoctor: '', referrer: '',
  processing: 'Normal', emergencyCharge: '',
  phlebotomist: '', phlebotomistCharge: '', contrast: '',
  discount: '0', discountType: '--', discountBy: 'N/A',
  payment: '', paymentMode: 'Cash', srfId: '', advanceBooking: false,
};

// ─── Modals (Redesigned) ───────────────────────────────────────────────────────
function AddInvestigationsModal({ isOpen, onClose, onAdd }: { isOpen: boolean; onClose: () => void; onAdd: (inv: Investigation[]) => void; }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  if (!isOpen) return null;
  const filtered = SAMPLE_INVESTIGATIONS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const toggle = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center"><Plus size={20} /></div>
            <h3 className="text-lg font-bold text-slate-900">Add Investigations</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search test name or code..." className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
          </div>
          <div className="space-y-2">
            {filtered.map(inv => (
              <div key={inv.id} onClick={() => toggle(inv.id)} className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer ${selected.includes(inv.id) ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected.includes(inv.id) ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                    {selected.includes(inv.id) ? <CheckCircle2 size={24} /> : <FlaskConical size={20} />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{inv.name}</div>
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{inv.category}</div>
                  </div>
                </div>
                <div className="text-base font-bold text-slate-900">₹{inv.mrp}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg py-2.5 font-bold text-xs uppercase tracking-wider">Cancel</Button>
          <Button variant="gradient" disabled={selected.length === 0} onClick={() => { onAdd(SAMPLE_INVESTIGATIONS.filter(i => selected.includes(i.id))); setSelected([]); onClose(); }} className="flex-[2] rounded-lg py-2.5 font-bold text-xs uppercase tracking-wider shadow-sm">
            Confirm Selection ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DiagnosticBookingPage() {
  const [form, setForm] = useState<FormState>(BLANK);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [addInvOpen, setAddInvOpen] = useState(false);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [key]: e.target.value }));
  const toggleDisease = (d: string) => setForm(f => ({ ...f, diseases: f.diseases.includes(d) ? f.diseases.filter(x => x !== d) : [...f.diseases, d], }));
  const removeInvestigation = (id: number) => setInvestigations(prev => prev.filter(i => i.id !== id));

  // Computed totals
  const amount = investigations.reduce((s, i) => s + i.mrp, 0);
  const totalAmount = amount + (Number(form.emergencyCharge) || 0) + (Number(form.phlebotomistCharge) || 0) + (Number(form.contrast) || 0);
  const discVal = form.discountType === '%' ? (totalAmount * (Number(form.discount) || 0)) / 100 : Number(form.discount) || 0;
  const totalDue = Math.max(0, totalAmount - discVal);
  const balance = totalDue - (Number(form.payment) || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AddInvestigationsModal isOpen={addInvOpen} onClose={() => setAddInvOpen(false)} onAdd={(inv) => setInvestigations(prev => [...prev, ...inv])} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Diagnostic <span className="text-emerald-600">Booking</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Streamlined patient intake and investigation workflow.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 font-bold tracking-wider uppercase text-[11px] text-slate-600">Branch: HO(IP)</div>
          <div className="flex gap-2">
            <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-all shadow-sm">
              <Download size={18} />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-all shadow-sm">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Profile Sync */}
          <div className="card-refined p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} className="text-blue-500" /> Patient Profile Sync
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="label-refined">Mobile Access</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input value={form.mobile} onChange={set('mobile')} placeholder="99XXX-XXXXX" className="input-refined w-full pl-10" />
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 w-full">
                  <div className={`w-9 h-5 rounded-full cursor-pointer relative transition-all ${form.advanceBooking ? 'bg-emerald-500' : 'bg-slate-300'}`} onClick={() => setForm(f => ({ ...f, advanceBooking: !f.advanceBooking }))}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${form.advanceBooking ? 'left-5' : 'left-1'}`}>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-700">Advance Booking Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio Details */}
          <div className="card-refined p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User size={14} className="text-emerald-500" /> Bio Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="label-refined">Title</label>
                <select value={form.title} onChange={set('title')} className="input-refined w-full px-2">
                  {TITLES.map(t => <option key={t} value={t}>{t || '-'}</option>)}
                </select>
              </div>
              <div className="md:col-span-6 space-y-1.5">
                <label className="label-refined">Patient Full Name</label>
                <input value={form.patientName} onChange={set('patientName')} className="input-refined w-full" />
              </div>
              <div className="md:col-span-4 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="label-refined">Age</label>
                  <input value={form.age} onChange={set('age')} className="input-refined w-full text-center font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="label-refined">Sex</label>
                  <select value={form.gender} onChange={set('gender')} className="input-refined w-full px-2">
                    {GENDERS.map(g => <option key={g} value={g}>{g || '-'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-refined">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input value={form.address} onChange={set('address')} className="input-refined w-full pl-10" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="label-refined">Email Digital ID</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="email" value={form.email} onChange={set('email')} className="input-refined w-full pl-10" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="label-refined">Nationality</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select value={form.nationality} onChange={set('nationality')} className="input-refined w-full pl-10 appearance-none">
                    <option>IND-India</option><option>USA-United States</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label className="label-refined">Primary Diagnosis</label>
                <input value={form.diagnosis} onChange={set('diagnosis')} placeholder="Routine Checkup..." className="input-refined w-full italic" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="label-refined flex items-center gap-1.5"><Heart size={10} className="text-rose-500" /> LMP Date</label>
                <input type="date" value={form.lmpDate} onChange={set('lmpDate')} className="input-refined w-full text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="label-refined flex items-center gap-1.5"><Ruler size={10} className="text-blue-500" /> Height (cm)</label>
                <input value={form.height} onChange={set('height')} className="input-refined w-full text-center font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="label-refined flex items-center gap-1.5"><Scale size={10} className="text-amber-500" /> Weight (kg)</label>
                <input value={form.weight} onChange={set('weight')} className="input-refined w-full text-center font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="label-refined flex items-center gap-1.5"><Droplets size={10} className="text-rose-600" /> Drug Allergy</label>
                <input value={form.drugAllergy} onChange={set('drugAllergy')} className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2 text-sm font-medium text-rose-700 outline-none w-full" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="label-refined">Pre-Existing Dynamics</label>
              <div className="flex flex-wrap gap-2">
                {DISEASES.map(d => (
                  <button key={d} onClick={() => toggleDisease(d)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${form.diseases.includes(d) ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {form.diseases.includes(d) ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Investigations Selection Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Order Cart
                <Badge variant="secondary" className="px-2 text-[10px]">{investigations.length} Items</Badge>
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 border-slate-200 bg-white shadow-sm rounded-lg py-1.5 px-3 text-xs">
                  <Stethoscope size={14} className="text-blue-500" /> Referred Doc
                </Button>
                <Button variant="gradient" onClick={() => setAddInvOpen(true)} className="gap-2 shadow-sm rounded-lg py-1.5 px-4 text-xs">
                  <Plus size={14} /> Add Test
                </Button>
              </div>
            </div>

            {investigations.length > 0 ? (
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight">Investigation Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight">Category</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight text-right">MRP</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-tight text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {investigations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <FlaskConical size={14} />
                            </div>
                            <div className="text-sm font-bold text-slate-900">{inv.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{inv.category}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900 text-sm">₹{inv.mrp}</td>
                        <td className="px-6 py-4 text-center">
                          <button onClick={() => removeInvestigation(inv.id)} className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-50 h-48 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-8 space-y-3">
                <FlaskConical size={32} className="text-slate-300" />
                <p className="text-slate-500 text-sm font-medium">Cart is empty. Click <span className="text-emerald-600 font-bold">Add Test</span>.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Column */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg space-y-6 sticky top-8">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              Order Billing
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </h3>

            <div className="space-y-4 text-slate-800">
              <div className="space-y-1.5">
                <label className="label-refined">Processing Priority</label>
                <select value={form.processing} onChange={set('processing')} className="input-refined w-full appearance-none">
                  {PROCESSING.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-3 border-b border-slate-100 pb-4">
                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                  <span>Sub-Total</span>
                  <span className="font-mono text-slate-900">₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-2"><Timer size={14} className="text-rose-500" /> Emergency Charge</span>
                  <input type="number" value={form.emergencyCharge} onChange={set('emergencyCharge')} placeholder="0" className="w-20 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:border-blue-500 focus:outline-none font-mono font-bold text-slate-900" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-base font-bold">
                  <span>Grand Total</span>
                  <span className="text-xl font-bold text-emerald-600 font-mono">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Adjustment / Discount</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={form.discount} onChange={set('discount')} className="input-refined w-full py-1.5 px-3" />
                  <select value={form.discountType} onChange={set('discountType')} className="input-refined w-full py-1.5 px-3">
                    {DISC_TYPES.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total Due</span>
                  <span className="text-xl font-bold text-slate-900 font-mono">₹{totalDue.toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="number" value={form.payment} onChange={set('payment')} placeholder="Pay Amount..." className="input-refined w-full pl-10 bg-emerald-50/30 border-emerald-200 focus:border-emerald-500" />
                  </div>
                  <select value={form.paymentMode} onChange={set('paymentMode')} className="input-refined w-full text-xs">
                    {PAY_MODES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className={`p-3 rounded-lg border flex justify-between items-center ${balance === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                <span className="text-[10px] font-bold uppercase">Balance</span>
                <span className="text-base font-bold font-mono">₹{balance.toLocaleString()}</span>
              </div>
            </div>

            <Button variant="gradient" className="w-full rounded-lg py-3.5 font-bold uppercase tracking-widest shadow-md gap-3 group">
              Confirm Booking
              <ArrowRightCircle size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <p className="text-center text-[10px] font-bold text-slate-400 italic">
            Secure checkout powered by WellnessHive®
          </p>
        </div>
      </div>
    </div>
  );
}
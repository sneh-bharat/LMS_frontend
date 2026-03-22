'use client';

import { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  Search,
  Edit2,
  Shield,
  Zap,
  ChevronDown,
  X,
  UserPlus,
  MoreVertical,
  Database,
  ArrowRightCircle
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { RightDrawer } from '@/components/ui/right-drawer';

// ─── Data Types ──────────────────────────────────────────────────────────────
interface Patient {
  id: number;
  uhid: number;
  title: string;
  name: string;
  branch: string;
  gender: string;
  age: string;
  dob: { month: string; day: string };
  contact: string;
  email: string;
  country: string;
  mobile: string;
  nationality: string;
  docType: string;
  docNumber: string;
  address: string;
  diseases: string[];
  drugAllergy: string;
  regCharges: boolean;
  payMode: string;
}

const SAMPLE_PATIENTS: Patient[] = [
  { id: 1, uhid: 69, title: 'Dr.', name: 'Mohib Ahmed', branch: 'Customer Support', gender: 'Male', age: '50 Y', dob: { month: '1', day: '1' }, contact: '+(91)9934362019', email: '', country: 'IND +91', mobile: '9934362019', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 2, uhid: 65, title: 'Ms.', name: 'Srabanti Dash', branch: 'Quality Assurance', gender: 'Female', age: '44 Y', dob: { month: '2', day: '5' }, contact: '+(91)8617269047', email: '', country: 'IND +91', mobile: '8617269047', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
  { id: 3, uhid: 63, title: 'Mr.', name: 'Saber Khan', branch: 'Internal Medicine', gender: 'Male', age: '45 Y', dob: { month: '3', day: '10' }, contact: '+(91)9848834451', email: '', country: 'IND +91', mobile: '9848834451', nationality: 'IND-India', docType: '', docNumber: '', address: '', diseases: [], drugAllergy: '', regCharges: true, payMode: 'Cash' },
];

const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby'];
const GENDERS = ['Male', 'Female', 'Other'];

// ─── Redesigned Registration Modal ───────────────────────────────────────────
function RegistrationModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  const footer = (
    <div className="flex gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider">Discard</Button>
      <Button variant="gradient" className="flex-[2] rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider shadow-sm">Initialize Profile</Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="New Registration"
      description="Institutional Patient Intake"
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-8">
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            01. Personal Identity
          </h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-refined">Salutation</label>
              <select className="input-refined w-full px-2">
                {TITLES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label-refined">Legal Full Name</label>
              <input placeholder="e.g. Jonathan Quincy Doe" className="input-refined w-full font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="label-refined">Age (Years)</label>
              <input type="number" placeholder="28" className="input-refined w-full text-center font-mono font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="label-refined">Biological Sex</label>
              <select className="input-refined w-full px-4 font-bold">
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label-refined">Identity Sync</label>
            <input placeholder="Aadhar / PAN" className="input-refined w-full" />
          </div>
        </section>

        <section className="space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            02. Global Connectivity
          </h4>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-refined">Primary Mobile</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input placeholder="+91 XXX XXX XXXX" className="input-refined w-full pl-10 font-mono font-bold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label-refined">Email Digital ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="email" placeholder="patient@wellnesshive.com" className="input-refined w-full pl-10 italic" />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="label-refined">Residential Coordinates</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input placeholder="Full street address, city..." className="input-refined w-full pl-10" />
            </div>
          </div>
        </section>
      </div>
    </RightDrawer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FindRegisterPatientPage() {
  const [patients] = useState<Patient[]>(SAMPLE_PATIENTS);
  const [search, setSearch] = useState('');
  const [regOpen, setRegOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <RegistrationModal isOpen={regOpen} onClose={() => setRegOpen(false)} />

      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Patient <span className="text-emerald-600">Information</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Universal master index for patient health records and histories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6">
            <UserPlus size={16} /> Master Sync
          </Button>
          <Button variant="gradient" size="sm" onClick={() => setRegOpen(true)} className="gap-2 px-8 shadow-sm">
            <UserPlus size={16} /> New Registration
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
            placeholder="Search by UHID or patient name..."
            className="input-refined w-full py-2.5 pl-12 pr-4 shadow-none"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-56 group">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select className="input-refined w-full py-2.5 pl-10 pr-10 text-[11px] appearance-none font-bold uppercase tracking-wider">
              <option>All Dynamic Clusters</option>
              <option>Active Records Only</option>
              <option>Archived Data</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* ═══ PATIENT GRID ═══════════════════════════════════════ */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient Cluster</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Gen</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors uppercase text-sm">{p.title} {p.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="px-1 text-[8px] tracking-tight">UHID: {p.uhid}</Badge>
                          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Biometric Confirmed</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[#475569] font-bold text-[10px] uppercase">
                      {p.branch}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center font-bold text-xs ${p.gender === 'Male' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                      {p.gender.charAt(0)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold font-mono">
                      <CalendarIcon size={12} className="text-slate-300" />
                      {p.age}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                        <Phone size={10} className="text-emerald-500" />
                        {p.contact}
                      </div>
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium text-[10px] italic">
                          <Mail size={10} />
                          {p.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all">
                        <MoreVertical size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══ FOOTER ═════════════════════════════════════════════ */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm"></div>
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">{patients.length} Institutional Records</span>
            </div>
            <div className="hidden xl:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Database size={12} /> System Resilience High
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="px-6 text-[10px]">Sync External</Button>
            <Button variant="secondary" size="sm" className="px-8 text-[10px]">
              Next Cluster <ArrowRightCircle size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 rounded-[2.5rem] p-8 flex items-center justify-between border border-emerald-100 shadow-xl shadow-green-500/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-emerald-600">
            <Zap size={24} />
          </div>
          <p className="text-xs font-black text-emerald-900 uppercase tracking-tight italic">Global biometric indexing active. Duplicate detection running in real-time.</p>
        </div>
        <Badge variant="success" className="px-5 py-2">System Optimal</Badge>
      </div>
    </div>
  );
}
'use client';
import { useState } from 'react';
import {
  Search,
  Plus,
  Calendar,
  MoreHorizontal,
  Filter,
  Stethoscope,
  Clock,
  User,
  Video,
  Home,
  Building2,
  CalendarCheck,
  Trash2,
  Edit3
} from 'lucide-react';
import NewAppointment, {
  Appointment,
  FormState,
  DEPARTMENTS,
} from './NewAppointment';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

// ─── Inline sample data ──────────────────────────────────────────────────────
const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientName: 'Rahul Sen',
    age: 32,
    gender: 'Male',
    phone: '9876543210',
    consultingType: 'Home Collection',
    department: 'Blood Test',
    selectedTest: 'Complete Blood Count (CBC)',
    slot: '10:00 AM - 10:30 AM',
    date: '2026-03-28',
    email: 'rahul@example.com',
    whatsapp: '9876543210',
    permanentAddress: 'Kolkata',
    localAddress: '',
    pincode: '700001',
    city: 'Kolkata',
    country: 'India',
    contactNumber: '9876543210',
    doctor: '',
  },
];

// ─── Type Badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const icons: Record<string, any> = {
    'Clinic Visit': { icon: <Building2 size={12} />, color: 'blue' },
    'Hospital Visit': { icon: <Home size={12} />, color: 'emerald' },
    'Video Consultation': { icon: <Video size={12} />, color: 'purple' },
  };
  const s = icons[type] ?? { icon: <CalendarCheck size={12} />, color: 'slate' };

  return (
    <Badge
      variant={s.color === 'blue' ? 'primary' : s.color === 'emerald' ? 'success' : s.color === 'purple' ? 'info' : 'secondary'}
      className="gap-1.5"
    >
      {s.icon}
      {type}
    </Badge>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppointmentBookingPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = appointments.filter(a =>
    (deptFilter === 'All' || a.department === deptFilter) &&
    (a.patientName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (form: FormState) => {
    if (editTarget) {
      setAppointments(prev =>
        prev.map(a => a.id === editTarget.id
          ? { ...a, ...form, age: Number(form.age) }
          : a
        )
      );
      setEditTarget(null);
    } else {
      setAppointments(prev => [
        { id: Date.now(), ...form, age: Number(form.age) },
        ...prev,
      ]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Modals ── */}
      <NewAppointment
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      <NewAppointment
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
        initial={editTarget}
      />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
         <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-900 tracking-tight mb-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <CalendarCheck size={20} />
              </div>

              <span>
                Test <span className="text-[#FF671F]">Appointments</span>
              </span>

            </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Schedule and manage patient visits across departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-1.5">
            {appointments.length} Bookings
          </Badge>
          <Button
            size="sm"
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            variant="gradient"
            className="gap-2 shadow-sm"
          >
            <Plus size={16} />
              Book Test
          </Button>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or test...."
            className="input-refined w-full py-2.5 pl-10 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="input-refined py-2 pl-8 pr-8 text-[11px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <Button variant="outline" size="sm" className="p-2 border-slate-200">
            <Calendar size={16} />
          </Button>
        </div>
      </div>

      {/* ── Appointments Table ── */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consultant</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Schedule</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                      <CalendarCheck size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">No appointments found</p>
                      <p className="text-xs font-medium text-slate-400">Try adjusting your filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map((appt, idx) => (
              <tr key={appt.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all border border-slate-100 relative">
                      <User size={18} />
                      {idx === 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">{appt.patientName}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-2 mt-0.5">
                        {appt.gender} • {appt.age} Y • {appt.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Stethoscope size={14} className="text-slate-300" />
                      {appt.department}
                    </div>
                    <TypeBadge type={appt.consultingType} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">
                    {appt.department}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar size={12} className="text-emerald-500" />
                      {appt.date}
                    </div>
                    <Badge variant="primary" className="text-[9px]">
                      <Clock size={10} className="mr-1" />
                      {appt.slot}
                    </Badge>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => setEditTarget(appt)}
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => setAppointments(prev => prev.filter(a => a.id !== appt.id))}
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-1.5 text-slate-300 hover:text-slate-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
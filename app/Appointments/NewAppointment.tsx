'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Stethoscope,
  User,
  Phone,
  Mail,
  MapPin,
  Video,
  Home,
  Building2,
  Clock,
  CreditCard,
  Check
} from 'lucide-react';
import Button from '@/components/ui/button';
import { RightDrawer } from '@/components/ui/right-drawer';

// ─── Shared Types ────────────────────────────────────────────────────────────
export interface Appointment {
  id: number;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  consultingType: string;
  department: string;
  doctor: string;
  slot: string;
  date: string;
  email: string;
  whatsapp: string;
  permanentAddress: string;
  localAddress: string;
  pincode: string;
  city: string;
  country: string;
  contactNumber: string;
}

export interface FormState {
  consultingType: string;
  department: string;
  doctor: string;
  slot: string;
  date: string;
  patientName: string;
  age: string;
  gender: string;
  phone: string;
  permanentAddress: string;
  localAddress: string;
  pincode: string;
  city: string;
  country: string;
  email: string;
  whatsapp: string;
  contactNumber: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
export const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Dermatology',
  'Orthopedics', 'Neurology', 'Pediatrics', 'Gynecology', 'Ophthalmology',
];

export interface DoctorInfo { name: string; fee: number; }
export const DOCTORS: Record<string, DoctorInfo[]> = {
  'General Medicine': [{ name: 'Dr. Rajan Mehta', fee: 800 }, { name: 'Dr. Priya Sharma', fee: 700 }],
  'Cardiology': [{ name: 'Dr. Suresh Kumar', fee: 1500 }, { name: 'Dr. Anita Nair', fee: 1200 }],
  'Dermatology': [{ name: 'Dr. Kavitha Rao', fee: 1000 }, { name: 'Dr. Farhan Sheikh', fee: 900 }],
  'Orthopedics': [{ name: 'Dr. Mohan Das', fee: 1200 }, { name: 'Dr. Sunita Pillai', fee: 1100 }],
  'Neurology': [{ name: 'Dr. Amit Verma', fee: 1800 }, { name: 'Dr. Deepa Iyer', fee: 1600 }],
  'Pediatrics': [{ name: 'Dr. Leena Joseph', fee: 600 }, { name: 'Dr. Rahul Bose', fee: 650 }],
  'Gynecology': [{ name: 'Dr. Nisha Reddy', fee: 1300 }, { name: 'Dr. Smita Patil', fee: 1100 }],
  'Ophthalmology': [{ name: 'Dr. Vikram Patel', fee: 950 }, { name: 'Dr. Anjali Singh', fee: 850 }],
};

export const ALL_SLOTS = [
  { time: '09:00 AM - 09:30 AM', booked: false },
  { time: '10:00 AM - 10:30 AM', booked: false, next: true },
  { time: '11:00 AM - 11:30 AM', booked: true },
  { time: '12:00 PM - 12:30 PM', booked: true },
  { time: '02:00 PM - 02:30 PM', booked: false },
  { time: '03:00 PM - 03:30 PM', booked: true },
  { time: '04:00 PM - 04:30 PM', booked: false },
  { time: '05:00 PM - 05:30 PM', booked: false },
];

const CONSULTING_TYPES = [
  { value: 'Clinic Visit', icon: <Building2 size={16} /> },
  { value: 'Hospital Visit', icon: <Home size={16} /> },
  { value: 'Video Consultation', icon: <Video size={16} /> },
];

export const getTodayStr = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getDoctorFee = (dept: string, doctorName: string): number | null => {
  const found = (DOCTORS[dept] ?? []).find(d => d.name === doctorName);
  return found ? found.fee : null;
};

export const BLANK_FORM: FormState = {
  consultingType: 'Clinic Visit', department: '', doctor: '', slot: '',
  date: '', patientName: '', age: '', gender: 'Male',
  phone: '', permanentAddress: '', localAddress: '',
  pincode: '', city: '', country: 'India',
  email: '', whatsapp: '', contactNumber: '',
};

interface NewAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormState) => void;
  initial?: Appointment | null;
}

export default function NewAppointment({
  isOpen, onClose, onSave, initial,
}: NewAppointmentProps) {
  const [form, setForm] = useState<FormState>({ ...BLANK_FORM, date: getTodayStr() });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (initial) {
      setForm({
        consultingType: initial.consultingType,
        department: initial.department,
        doctor: initial.doctor,
        slot: initial.slot,
        date: initial.date,
        patientName: initial.patientName,
        age: String(initial.age),
        gender: initial.gender,
        phone: initial.phone,
        permanentAddress: initial.permanentAddress,
        localAddress: initial.localAddress,
        pincode: initial.pincode,
        city: initial.city,
        country: initial.country,
        email: initial.email,
        whatsapp: initial.whatsapp,
        contactNumber: initial.contactNumber,
      });
    } else {
      setForm({ ...BLANK_FORM, date: getTodayStr() });
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const doctors = form.department ? (DOCTORS[form.department] ?? []) : [];

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.consultingType) e.consultingType = 'Required';
    if (!form.department) e.department = 'Required';
    if (!form.doctor) e.doctor = 'Required';
    if (!form.slot) e.slot = 'Required';
    if (!form.date) e.date = 'Required';
    if (!form.patientName.trim()) e.patientName = 'Required';
    if (!form.age || isNaN(Number(form.age))) e.age = 'Invalid';
    if (!form.phone.trim() || form.phone.length < 10) e.phone = 'Invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSave(form);
      setSubmitting(false);
      onClose();
    }, 800);
  };

  const footer = (
    <div className="flex items-center gap-3 w-full">
      <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider">
        Cancel Request
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        variant="gradient"
        className="flex-[2] rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider shadow-sm"
      >
        {submitting ? 'Authenticating...' : initial ? 'Confirm Updates' : 'Confirm Appointment'}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Update Visit' : 'Schedule Visit'}
      description="Patient Consultation Workflow"
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-8">
        {/* Section 1: Consultation */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            01. Consultation Specs
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {CONSULTING_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setForm(f => ({ ...f, consultingType: ct.value }))}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${form.consultingType === ct.value
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <div className={`${form.consultingType === ct.value ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {ct.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tight">{ct.value}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-refined">Visit Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="date" value={form.date} onChange={set('date')} min={getTodayStr()}
                  className="input-refined w-full pl-10 py-2.5 font-bold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label-refined">Specialty</label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value, doctor: '', slot: '' }))}
                  className="input-refined w-full pl-10 py-2.5 font-bold appearance-none">
                  <option value="">Select Specialty</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="label-refined">Consulting Physician</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select value={form.doctor} onChange={e => setForm(f => ({ ...f, doctor: e.target.value, slot: '' }))} disabled={!form.department}
                className="input-refined w-full pl-10 py-2.5 font-bold appearance-none disabled:opacity-50">
                <option value="">Choose Physician</option>
                {doctors.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {form.doctor && (() => {
            const fee = getDoctorFee(form.department, form.doctor);
            return fee !== null ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Consultation Fee</div>
                    <div className="text-xs font-bold text-emerald-700">{form.doctor}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 tracking-tight">₹{fee.toLocaleString()}</div>
                  <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Inc. Tax</div>
                </div>
              </div>
            ) : null;
          })()}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Available Slots</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SLOTS.map(slot => {
                const isSelected = form.slot === slot.time;
                return (
                  <button key={slot.time} disabled={slot.booked} onClick={() => !slot.booked && setForm(f => ({ ...f, slot: slot.time }))}
                    className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-tight transition-all relative overflow-hidden ${isSelected ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' :
                      slot.booked ? 'bg-slate-50 text-slate-200 border border-slate-100 cursor-not-allowed' :
                        'bg-white border text-slate-500 border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
                      }`}>
                    {slot.time}
                    {isSelected && <Check size={10} className="inline ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Patient Info */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-4 h-[1px] bg-slate-200"></span>
            02. Patient Profile
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-refined">Full Name</label>
              <input value={form.patientName} onChange={set('patientName')} placeholder="e.g. Johnathan Doe"
                className="input-refined w-full py-2.5 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="label-refined">Age</label>
                <input type="number" value={form.age} onChange={set('age')} placeholder="Yrs"
                  className="input-refined w-full py-2.5 font-bold text-center" />
              </div>
              <div className="space-y-1.5">
                <label className="label-refined">Gender</label>
                <select value={form.gender} onChange={set('gender')}
                  className="input-refined w-full py-2.5 font-bold appearance-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-refined">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 XXX XXX XXXX"
                  className="input-refined w-full pl-10 py-2.5 font-bold" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="label-refined">Email (Optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="email" value={form.email} onChange={set('email')} placeholder="dx@hive.com"
                  className="input-refined w-full pl-10 py-2.5" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </RightDrawer>
  );
}
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
import {
  Input,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui';
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
  selectedTest: string;
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
  doctor?: string;
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
  selectedTest: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
export interface TestInfo { name: string; fee: number; }

export const TESTS: Record<string, TestInfo[]> = {
  'Blood Test': [
    { name: 'Complete Blood Count (CBC)', fee: 400 },
    { name: 'Blood Sugar (Fasting)', fee: 200 },
  ],
  'Urine Test': [
    { name: 'Routine Urine Test', fee: 150 },
  ],
  'Imaging': [
    { name: 'X-Ray Chest', fee: 800 },
    { name: 'Ultrasound Abdomen', fee: 1200 },
  ],
};

export const DEPARTMENTS = [
  'Blood Test',
  'Urine Test',
  'Imaging',
];
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
   { value: 'Clinic Collection', icon: <Building2 size={16} /> },
  { value: 'Home Collection', icon: <Home size={16} /> },
  { value: 'Video Consultation', icon: <Video size={16} /> },
];

export const getTodayStr = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getTestFee = (dept: string, testName: string): number | null => {
  const found = (TESTS[dept] ?? []).find(d => d.name === testName);
  return found ? found.fee : null;
};

export const BLANK_FORM: FormState = {
  consultingType: 'Clinic Visit', department: '', doctor: '', slot: '',
  date: '', patientName: '', age: '', gender: 'Male',
  phone: '', permanentAddress: '', localAddress: '',
  pincode: '', city: '', country: 'India',
  email: '', whatsapp: '', contactNumber: '', selectedTest: '',
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
        doctor: '',
        selectedTest: initial.selectedTest,
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

  const tests = form.department ? (TESTS[form.department] ?? []) : [];

  const selectedTestFee = form.selectedTest ? getTestFee(form.department, form.selectedTest) : null;

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.consultingType) e.consultingType = 'Required';
    if (!form.department) e.department = 'Required';
    if (!form.selectedTest) e.selectedTest = 'Required';
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
      title={
        <>
          {initial ? 'Update' : 'Book Lab'} <span className="text-emerald-200">Test</span>
        </>
      }
      description="Lab Test Booking Workflow"
      footer={footer}
      maxWidth="md"
    >
      <div className="space-y-8">
        {/* Section 1: Consultation */}
        <section className="space-y-4">
         

          <div className="grid grid-cols-3 gap-2">
            {CONSULTING_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setForm(f => ({ ...f, consultingType: ct.value }))}
                className={`flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-lg border transition-all text-center ${form.consultingType === ct.value
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <div className={`${form.consultingType === ct.value ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {ct.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tight">{ct.value}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-refined">Test Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="date" value={form.date} onChange={set('date')} min={getTodayStr()}
                  className="input-refined w-full pl-10 py-2.5 font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-refined">Department</label>
              <select
                value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value, doctor: '', selectedTest: '' }))}
                className="input-refined w-full pl-10 py-2.5 font-bold appearance-none"
              >
                <option value="">Choose Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {form.department && (
              <div className="space-y-1.5">
                <label className="label-refined">Select Test</label>
                <select
                  value={form.selectedTest}
                  onChange={e => setForm(f => ({ ...f, selectedTest: e.target.value }))}
                  className="input-refined w-full py-2.5 font-bold appearance-none"
                >
                  <option value="">Choose Test</option>
                  {tests.map(test => (
                    <option key={test.name} value={test.name}>{test.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedTestFee !== null && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Test Price</div>
                    <div className="text-xs font-bold text-emerald-700">{form.selectedTest}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-600 tracking-tight">₹{selectedTestFee.toLocaleString()}</div>
                  <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Inc. Tax</div>
                </div>
              </div>
            )}

          </div>

         

   
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
          <div className='space-y-4'>
            <label className="label-refined  ">Refer by Doctor <span className="text-slate-400">(optional)</span></label>
              <Input type="text" value={form.doctor} onChange={set('doctor')} className="pl-10 border-gray-400  font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4" placeholder="Dr. Smith" />
          </div>
        </section>

        {/* Section 2: Patient Info */}
        <section className="space-y-4">
          

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Basic Information</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                  <User size={12} className="text-blue-500" />
                  Full Name
                </label>
                <input 
                  value={form.patientName} 
                  onChange={set('patientName')} 
                  placeholder="e.g. Johnathan Doe"
                  className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white/80 backdrop-blur-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Age</label>
                  <input 
                    type="number" 
                    value={form.age} 
                    onChange={set('age')} 
                    placeholder="Yrs"
                    className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white/80 backdrop-blur-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Gender</label>
                  <select 
                    value={form.gender} 
                    onChange={set('gender')}
                    className="w-full px-3 py-2.5 rounded-lg border border-blue-200 bg-white/80 backdrop-blur-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all appearance-none cursor-pointer"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Phone size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Contact Information</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={14} />
                  <input 
                    type="tel" 
                    value={form.phone} 
                    onChange={set('phone')} 
                    placeholder="+91 XXX XXX XXXX"
                    className="input-refined w-full pl-10 py-2.5 rounded-lg border border-emerald-200 bg-white/80 backdrop-blur-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={12} className="text-emerald-500" />
                  Email Address <span className="text-emerald-600/60 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={14} />
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={set('email')} 
                    placeholder="dx@hive.com"
                    className="input-refined w-full pl-10 py-2.5 rounded-lg border border-emerald-200 bg-white/80 backdrop-blur-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </RightDrawer>
  );
}
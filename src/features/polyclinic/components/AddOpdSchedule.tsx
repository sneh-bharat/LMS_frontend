'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Eye } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';

import { zodFieldErrors } from '@/lib/zod';
import type { Day, OpdSchedule, OpdScheduleFormData, ScheduleStatus } from '../types/opd-schedule.types';
import { opdScheduleSchema } from '../schemas/opdSchedule.schema';

// ─── Local Data ───────────────────────────────────────────────────────────────

const MOCK_DOCTORS = [
  { id: 1,  name: 'Dr. Arjun Mehta',    department: 'Cardiology' },
  { id: 2,  name: 'Dr. Priya Sharma',   department: 'Neurology' },
  { id: 3,  name: 'Dr. Rahul Verma',    department: 'Orthopedics' },
  { id: 4,  name: 'Dr. Sunita Patel',   department: 'Dermatology' },
  { id: 5,  name: 'Dr. Vikram Singh',   department: 'Pediatrics' },
  { id: 6,  name: 'Dr. Neha Kapoor',    department: 'Gynecology' },
  { id: 7,  name: 'Dr. Anil Kumar',     department: 'ENT' },
  { id: 8,  name: 'Dr. Meera Joshi',    department: 'Ophthalmology' },
  { id: 9,  name: 'Dr. Sanjay Gupta',   department: 'Cardiology' },
  { id: 10, name: 'Dr. Ritu Agarwal',   department: 'Psychiatry' },
  { id: 11, name: 'Dr. Karan Malhotra', department: 'Urology' },
  { id: 12, name: 'Dr. Pooja Reddy',    department: 'Endocrinology' },
];

const MOCK_CENTERS = ['Main Hospital', 'City Clinic', 'North Branch', 'South Campus', 'East Wing'];
const ALL_DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOT_DURATIONS = [5, 10, 15, 20, 30, 45, 60];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlots(start: string, end: string, duration: number): string[] {
  if (!start || !end || !duration) return [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const endTotal = eh * 60 + em;
  const slots: string[] = [];
  let cur = sh * 60 + sm;
  while (cur + duration <= endTotal) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    const nh = Math.floor((cur + duration) / 60);
    const nm = (cur + duration) % 60;
    const fmt = (hh: number, mm: number) => {
      const ampm = hh >= 12 ? 'PM' : 'AM';
      return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${ampm}`;
    };
    slots.push(`${fmt(h, m)} – ${fmt(nh, nm)}`);
    cur += duration;
  }
  return slots;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OpdScheduleFormData) => void;
  editData?: OpdSchedule | null;
  isEditMode?: boolean;
}

const EMPTY_FORM: OpdScheduleFormData = {
  doctorId: 0, doctorName: '', department: '', center: '',
  days: [], startTime: '', endTime: '',
  slotDuration: 15, maxPatients: 4, status: 'Active',
};

export default function AddOpdScheduleModal({
  isOpen, onClose, onSubmit, editData = null, isEditMode = false,
}: Props) {
  const [formData, setFormData] = useState<OpdScheduleFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editData) {
      const doc = MOCK_DOCTORS.find(d => d.name === editData.doctorName);
      setFormData({
        doctorId: doc?.id || 0,
        doctorName: editData.doctorName,
        department: editData.department,
        center: editData.center,
        days: editData.days,
        startTime: editData.startTime,
        endTime: editData.endTime,
        slotDuration: editData.slotDuration,
        maxPatients: editData.maxPatients,
        status: editData.status,
      });
    } else {
      setFormData(EMPTY_FORM);
    }
    setErrors({});
    setShowPreview(false);
  }, [editData, isOpen]);

  const handleDoctorChange = (id: number) => {
    const doc = MOCK_DOCTORS.find(d => d.id === id);
    setFormData(prev => ({
      ...prev,
      doctorId: id,
      doctorName: doc?.name || '',
      department: doc?.department || '',
    }));
    if (errors.doctorId) setErrors(prev => ({ ...prev, doctorId: '' }));
  };

  const handleDayToggle = (day: Day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
    if (errors.days) setErrors(prev => ({ ...prev, days: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const parsed = opdScheduleSchema.safeParse(formData);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    setErrors(zodFieldErrors(parsed.error));
    return false;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setShowPreview(false);
    onClose();
  };

  const previewSlots = generateSlots(formData.startTime, formData.endTime, formData.slotDuration);

  if (!isOpen) return null;

  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
      errors[field]
        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
    }`;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={<>{isEditMode ? 'Edit OPD' : 'New OPD'} <span className="text-emerald-200">Schedule</span></>}
      description={isEditMode ? 'Update schedule details' : 'Create a new OPD schedule for a doctor'}
      footer={
        <div className="flex gap-3 w-full">
          <button type="button" onClick={handleClose}
            className="flex-1 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="opd-form"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl">
            {isEditMode ? 'Update' : 'Save'} Schedule
          </button>
        </div>
      }
      maxWidth="lg"
    >
      <form id="opd-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-6">

        {/* Doctor & Department */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Doctor Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Doctor *</label>
              <select name="doctorId" value={formData.doctorId}
                onChange={e => handleDoctorChange(Number(e.target.value))}
                className={inputCls('doctorId')}>
                <option value={0}>Select Doctor</option>
                {MOCK_DOCTORS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              {errors.doctorId && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.doctorId}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Department</label>
              <input type="text" value={formData.department} readOnly
                placeholder="Auto-filled from doctor"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none font-medium text-slate-600 placeholder:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Center */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Location</h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Center / Location *</label>
            <select name="center" value={formData.center} onChange={handleChange} className={inputCls('center')}>
              <option value="">Select Center</option>
              {MOCK_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.center && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.center}</p>}
          </div>
        </div>

        {/* Days */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Available Days *</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_DAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border-2 ${
                  formData.days.includes(day)
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
          {errors.days && <p className="text-xs text-rose-600 mt-2 flex items-center gap-1"><AlertCircle size={12} />{errors.days}</p>}
        </div>

        {/* Timings */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Timings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Start Time *</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange}
                className={inputCls('startTime')} />
              {errors.startTime && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.startTime}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">End Time *</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange}
                className={inputCls('endTime')} />
              {errors.endTime && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.endTime}</p>}
            </div>
          </div>
        </div>

        {/* Slot Config */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Slot Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Slot Duration</label>
              <select name="slotDuration" value={formData.slotDuration} onChange={handleChange}
                className={inputCls('slotDuration')}>
                {SLOT_DURATIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Max Patients per Slot *</label>
              <input type="number" name="maxPatients" min="1" max="20"
                value={formData.maxPatients} onChange={handleChange}
                className={inputCls('maxPatients')} />
              {errors.maxPatients && <p className="text-xs text-rose-600 mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.maxPatients}</p>}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Status</h3>
          <div className="flex gap-3">
            {(['Active', 'Inactive'] as ScheduleStatus[]).map(s => (
              <button key={s} type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  formData.status === s
                    ? s === 'Active'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-slate-100 border-slate-400 text-slate-700'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Slot Preview */}
        {formData.startTime && formData.endTime && formData.endTime > formData.startTime && (
          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-emerald-600" />
                Slot Preview
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {previewSlots.length} slots
                </span>
              </h3>
              <button type="button" onClick={() => setShowPreview(p => !p)}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                <Eye size={13} /> {showPreview ? 'Hide' : 'Show'} Slots
              </button>
            </div>

            {/* Summary pill */}
            <div className="flex flex-wrap gap-3 mb-3">
              {[
                { label: 'Total Slots', value: previewSlots.length, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { label: 'Duration', value: `${formData.slotDuration} min`, color: 'text-blue-700 bg-blue-50 border-blue-200' },
                { label: 'Max Capacity', value: `${previewSlots.length * formData.maxPatients} pts`, color: 'text-violet-700 bg-violet-50 border-violet-200' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`flex flex-col items-center px-4 py-2 rounded-lg border text-center ${color}`}>
                  <span className="text-sm font-bold">{value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</span>
                </div>
              ))}
            </div>

            {showPreview && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1.5">
                  {previewSlots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-100 text-xs font-semibold text-slate-700">
                      <span className="w-4 h-4 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {slot}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </form>
    </RightDrawer>
  );
}
'use client';

import { useState, useEffect } from 'react';

// ─── Shared Types (exported for use in parent) ────────────────────────────────
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
  'General Medicine': [{ name: 'Dr. Rajan Mehta',  fee: 800  }, { name: 'Dr. Priya Sharma',  fee: 700  }],
  'Cardiology':       [{ name: 'Dr. Suresh Kumar', fee: 1500 }, { name: 'Dr. Anita Nair',    fee: 1200 }],
  'Dermatology':      [{ name: 'Dr. Kavitha Rao',  fee: 1000 }, { name: 'Dr. Farhan Sheikh', fee: 900  }],
  'Orthopedics':      [{ name: 'Dr. Mohan Das',    fee: 1200 }, { name: 'Dr. Sunita Pillai', fee: 1100 }],
  'Neurology':        [{ name: 'Dr. Amit Verma',   fee: 1800 }, { name: 'Dr. Deepa Iyer',    fee: 1600 }],
  'Pediatrics':       [{ name: 'Dr. Leena Joseph', fee: 600  }, { name: 'Dr. Rahul Bose',    fee: 650  }],
  'Gynecology':       [{ name: 'Dr. Nisha Reddy',  fee: 1300 }, { name: 'Dr. Smita Patil',   fee: 1100 }],
  'Ophthalmology':    [{ name: 'Dr. Vikram Patel', fee: 950  }, { name: 'Dr. Anjali Singh',  fee: 850  }],
};

export const ALL_SLOTS = [
  { time: '09:00 AM - 09:30 AM', booked: false },
  { time: '10:00 AM - 10:30 AM', booked: false, next: true },
  { time: '11:00 AM - 11:30 AM', booked: true  },
  { time: '12:00 PM - 12:30 PM', booked: true  },
  { time: '02:00 PM - 02:30 PM', booked: false },
  { time: '03:00 PM - 03:30 PM', booked: true  },
  { time: '04:00 PM - 04:30 PM', booked: false },
  { time: '05:00 PM - 05:30 PM', booked: false },
];

const CONSULTING_TYPES = [
  { value: 'Clinic Visit'     },
  { value: 'Hospital Visit' },
  { value: 'Video Consultation' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Shared Style Constants ───────────────────────────────────────────────────
const inputBase: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8,
  padding: '9px 12px', fontSize: 13, color: '#1e293b',
  outline: 'none', background: '#fff', boxSizing: 'border-box' as const,
  fontFamily: 'inherit', transition: 'border-color 0.15s',
};
const selectBase: React.CSSProperties = { ...inputBase, cursor: 'pointer' };
const labelBase: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: '#475569',
  marginBottom: 5, display: 'block', letterSpacing: '0.02em',
};
const sectionCard: React.CSSProperties = {
  background: '#fff', borderRadius: 12, padding: '20px 24px',
  border: '1px solid #e8edf5', marginBottom: 16,
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};
const sectionTitle: React.CSSProperties = {
  fontSize: 13, fontWeight: 700, color: '#1e293b',
  marginBottom: 18, paddingBottom: 10,
  borderBottom: '2px solid #f1f5f9',
  display: 'flex', alignItems: 'center', gap: 8,
  letterSpacing: '0.01em',
};
const errorStyle: React.CSSProperties = {
  fontSize: 11, color: '#ef4444', marginTop: 3,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface NewAppointmentProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormState) => void;
  initial?: Appointment | null;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NewAppointment({
  isOpen, onClose, onSave, initial,
}: NewAppointmentProps) {
  const [form, setForm]           = useState<FormState>({ ...BLANK_FORM, date: getTodayStr() });
  const [errors, setErrors]       = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Sync form when modal opens or initial data changes
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (initial) {
      setForm({
        consultingType:   initial.consultingType,
        department:       initial.department,
        doctor:           initial.doctor,
        slot:             initial.slot,
        date:             initial.date,
        patientName:      initial.patientName,
        age:              String(initial.age),
        gender:           initial.gender,
        phone:            initial.phone,
        permanentAddress: initial.permanentAddress,
        localAddress:     initial.localAddress,
        pincode:          initial.pincode,
        city:             initial.city,
        country:          initial.country,
        email:            initial.email,
        whatsapp:         initial.whatsapp,
        contactNumber:    initial.contactNumber,
      });
    } else {
      setForm({ ...BLANK_FORM, date: getTodayStr() });
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  // Generic change handler
  const set = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm(f => ({ ...f, [key]: e.target.value }));

  const doctors = form.department ? (DOCTORS[form.department] ?? []) : [];

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.consultingType)                           e.consultingType = 'Required';
    if (!form.department)                               e.department     = 'Please select a department';
    if (!form.doctor)                                   e.doctor         = 'Please select a doctor';
    if (!form.slot)                                     e.slot           = 'Please select a time slot';
    if (!form.date)                                     e.date           = 'Please select a date';
    if (!form.patientName.trim())                       e.patientName    = 'Patient name is required';
    if (!form.age || isNaN(Number(form.age)))           e.age            = 'Valid age required';
    if (!form.phone.trim() || form.phone.length < 10)   e.phone          = 'Valid phone required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      console.log('Appointment JSON:', JSON.stringify({
        consultingType:   form.consultingType,
        department:       form.department,
        doctor:           form.doctor,
        slot:             form.slot,
        date:             form.date,
        patientName:      form.patientName,
        age:              Number(form.age),
        gender:           form.gender,
        phone:            form.phone,
        permanentAddress: form.permanentAddress,
        localAddress:     form.localAddress,
        pincode:          form.pincode,
        city:             form.city,
        country:          form.country,
        email:            form.email,
        whatsapp:         form.whatsapp,
        contactNumber:    form.contactNumber,
      }, null, 2));
      onSave(form);
      setSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 1000, overflowY: 'auto', padding: '24px 16px',
    }}>
      <div style={{
        background: '#f8fafc', borderRadius: 16, width: 720, maxWidth: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}>

        {/* ── Modal Header ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          borderRadius: '16px 16px 0 0', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {initial ? 'Edit Appointment' : 'Book New Appointment'}
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#93c5fd' }}>
              Fill in the details to schedule a consultation
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            color: '#fff', fontSize: 18, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>

          {/* ══ Section 01: Consultation Details ══ */}
          <div style={sectionCard}>
            <div style={sectionTitle}>
              <span style={{ background: '#dbeafe', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#1d4ed8' }}>01</span>
              Consultation Details
            </div>

            {/* Consulting Type */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelBase}>Consulting Type *</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
                {CONSULTING_TYPES.map(ct => (
                  <button key={ct.value}
                    onClick={() => setForm(f => ({ ...f, consultingType: ct.value }))}
                    style={{
                      flex: 1, minWidth: 140, padding: '10px 14px',
                      border: form.consultingType === ct.value ? '2px solid #2563eb' : '2px solid #e2e8f0',
                      borderRadius: 10, cursor: 'pointer',
                      background: form.consultingType === ct.value ? '#eff6ff' : '#fff',
                      color: form.consultingType === ct.value ? '#1d4ed8' : '#64748b',
                      fontWeight: form.consultingType === ct.value ? 600 : 400,
                      fontSize: 13, transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <span style={{ fontSize: 16 }}></span>
                    {ct.value}
                  </button>
                ))}
              </div>
              {errors.consultingType && <p style={errorStyle}>{errors.consultingType}</p>}
            </div>

            {/* Date + Department + Doctor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={labelBase}>Appointment Date *</label>
                <input type="date" value={form.date} onChange={set('date')}
                  min={getTodayStr()} style={inputBase} />
                {errors.date && <p style={errorStyle}>{errors.date}</p>}
              </div>
              <div>
                <label style={labelBase}>Department *</label>
                <select value={form.department}
                  onChange={e => setForm(f => ({ ...f, department: e.target.value, doctor: '', slot: '' }))}
                  style={selectBase}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
                {errors.department && <p style={errorStyle}>{errors.department}</p>}
              </div>
              <div>
                <label style={labelBase}>Select Doctor *</label>
                <select value={form.doctor}
                  onChange={e => setForm(f => ({ ...f, doctor: e.target.value, slot: '' }))}
                  style={{ ...selectBase, color: form.doctor ? '#1e293b' : '#94a3b8' }}
                  disabled={!form.department}>
                  <option value="">Select Doctor</option>
                  {doctors.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                </select>
                {errors.doctor && <p style={errorStyle}>{errors.doctor}</p>}
              </div>
            </div>

            {/* Appointment Fee Banner */}
            {form.doctor && (() => {
              const fee = getDoctorFee(form.department, form.doctor);
              return fee !== null ? (
                <div style={{
                  margin: '0 0 16px',
                  padding: '12px 18px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1.5px solid #86efac',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>💳</span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#15803d', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>
                        Appointment Fee
                      </div>
                      <div style={{ fontSize: 11, color: '#4ade80', marginTop: 1 }}>
                        {form.doctor} · {form.department}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px' }}>
                      ₹{fee.toLocaleString('en-IN')}
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#4ade80', marginLeft: 2 }}>/–</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#86efac', marginTop: 1 }}>Inclusive of all charges</div>
                  </div>
                </div>
              ) : null;
            })()}

            {/* Time Slots */}
            <div>
              <label style={labelBase}>Available Time Slots *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {ALL_SLOTS.map(slot => {
                  const isSelected = form.slot === slot.time;
                  return (
                    <button key={slot.time}
                      disabled={slot.booked}
                      onClick={() => !slot.booked && setForm(f => ({ ...f, slot: slot.time }))}
                      style={{
                        padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
                        cursor: slot.booked ? 'not-allowed' : 'pointer',
                        border: isSelected ? '2px solid #2563eb'
                          : slot.booked ? '2px solid #fee2e2' : '2px solid #e2e8f0',
                        background: isSelected ? '#2563eb'
                          : slot.booked ? '#fef2f2' : '#fff',
                        color: isSelected ? '#fff' : slot.booked ? '#fca5a5' : '#475569',
                        position: 'relative' as const, transition: 'all 0.15s',
                      }}>
                      {slot.time}
                      {slot.next && !slot.booked && (
                        <span style={{
                          position: 'absolute', top: -8, right: -4,
                          background: '#16a34a', color: '#fff',
                          fontSize: 9, fontWeight: 700, borderRadius: 4,
                          padding: '1px 5px', letterSpacing: '0.03em',
                        }}>NEXT</span>
                      )}
                      {slot.booked && (
                        <span style={{ fontSize: 9, display: 'block', color: '#fca5a5' }}>Booked</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.slot && <p style={errorStyle}>{errors.slot}</p>}
            </div>
          </div>

          {/* ══ Section 02: Patient Information ══ */}
          <div style={sectionCard}>
            <div style={sectionTitle}>
              <span style={{ background: '#dcfce7', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#15803d' }}>02</span>
              Patient Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelBase}>Patient Name *</label>
                <input value={form.patientName} onChange={set('patientName')}
                  placeholder="Full name" style={inputBase} />
                {errors.patientName && <p style={errorStyle}>{errors.patientName}</p>}
              </div>
              <div>
                <label style={labelBase}>Age *</label>
                <input type="number" value={form.age} onChange={set('age')}
                  placeholder="Age in years" min="0" max="120" style={inputBase} />
                {errors.age && <p style={errorStyle}>{errors.age}</p>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelBase}>Gender *</label>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      cursor: 'pointer', fontSize: 13, color: '#374151',
                      padding: '6px 12px', borderRadius: 8,
                      border: form.gender === g ? '2px solid #2563eb' : '2px solid #e2e8f0',
                      background: form.gender === g ? '#eff6ff' : '#fff',
                      transition: 'all 0.12s',
                    }}>
                      <input type="radio" name="modal-gender" value={g}
                        checked={form.gender === g} onChange={set('gender')}
                        style={{ accentColor: '#2563eb' }} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelBase}>Phone Number *</label>
                <input type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="10-digit mobile number" style={inputBase} />
                {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* ══ Section 03: Address Details ══ */}
          <div style={sectionCard}>
            <div style={sectionTitle}>
              <span style={{ background: '#fef9c3', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#854d0e' }}>03</span>
              Address Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelBase}>Permanent Address</label>
                <textarea value={form.permanentAddress}
                  onChange={e => setForm(f => ({ ...f, permanentAddress: e.target.value }))}
                  placeholder="Permanent address" rows={3}
                  style={{ ...inputBase, resize: 'vertical' as const }} />
              </div>
              <div>
                <label style={labelBase}>Local Address</label>
                <textarea value={form.localAddress}
                  onChange={e => setForm(f => ({ ...f, localAddress: e.target.value }))}
                  placeholder="Local / temporary address" rows={3}
                  style={{ ...inputBase, resize: 'vertical' as const }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelBase}>Pincode</label>
                <input value={form.pincode} onChange={set('pincode')}
                  placeholder="e.g. 500001" style={inputBase} maxLength={10} />
              </div>
              <div>
                <label style={labelBase}>City</label>
                <input value={form.city} onChange={set('city')}
                  placeholder="City" style={inputBase} />
              </div>
              <div>
                <label style={labelBase}>Country</label>
                <select value={form.country}
                  onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  style={selectBase}>
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>UAE</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* ══ Section 04: Contact Details ══ */}
          <div style={{ ...sectionCard, marginBottom: 0 }}>
            <div style={sectionTitle}>
              <span style={{ background: '#fce7f3', borderRadius: 6, padding: '3px 8px', fontSize: 11, color: '#be185d' }}>04</span>
              Contact Details
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelBase}>Email ID</label>
                <input type="email" value={form.email} onChange={set('email')}
                  placeholder="email@example.com" style={inputBase} />
              </div>
              <div>
                <label style={labelBase}>WhatsApp Number</label>
                <input type="tel" value={form.whatsapp} onChange={set('whatsapp')}
                  placeholder="WhatsApp number" style={inputBase} />
              </div>
              <div>
                <label style={labelBase}>Contact Number</label>
                <input type="tel" value={form.contactNumber} onChange={set('contactNumber')}
                  placeholder="Alternate contact" style={inputBase} />
              </div>
            </div>
          </div>

          {/* ── Footer Actions ── */}
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            marginTop: 20, paddingTop: 16, borderTop: '1px solid #e8edf3',
          }}>
            <button onClick={onClose} style={{
              padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              border: '1.5px solid #cbd5e1', background: '#fff',
              color: '#475569', cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={submitting} style={{
              padding: '9px 28px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              border: 'none', background: submitting ? '#93c5fd' : '#2563eb',
              color: '#fff', cursor: submitting ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'background 0.15s',
            }}>
              {submitting && (
                <span style={{
                  width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
              )}
              {submitting ? 'Booking…' : initial ? 'Update Appointment' : 'Book Appointment'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
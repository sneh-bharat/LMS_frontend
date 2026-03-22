'use client';

import { useState } from 'react';
import NewAppointment, {
  Appointment,
  FormState,
  DEPARTMENTS,
} from './NewAppointment';

// ─── Inline sample data (re-exported from here for page use) ─────────────────
const SAMPLE_APPOINTMENTS: Appointment[] = [
  { id: 1, patientName: 'Dr. Mohib Ahmed', age: 50, gender: 'Male',   phone: '9934362019', consultingType: 'Clinic Visit',       department: 'Cardiology',       doctor: 'Dr. Suresh Kumar', slot: '10:00 AM - 10:30 AM', date: '2026-03-20', email: 'mohib@example.com',    whatsapp: '9934362019', permanentAddress: 'Hyderabad', localAddress: '', pincode: '500001', city: 'Hyderabad', country: 'India', contactNumber: '9934362019' },
  { id: 2, patientName: 'Ms. Srabanti',    age: 44, gender: 'Female', phone: '8617269047', consultingType: 'Video Consultation', department: 'Dermatology',      doctor: 'Dr. Kavitha Rao',  slot: '04:00 PM - 04:30 PM', date: '2026-03-20', email: 'srabanti@example.com', whatsapp: '8617269047', permanentAddress: 'Kolkata',   localAddress: '', pincode: '700001', city: 'Kolkata',   country: 'India', contactNumber: '8617269047' },
  { id: 3, patientName: 'Mr. Saber',       age: 45, gender: 'Male',   phone: '9848834451', consultingType: 'Hospital Visit',     department: 'General Medicine', doctor: 'Dr. Rajan Mehta',  slot: '11:00 AM - 11:30 AM', date: '2026-03-21', email: '',                    whatsapp: '9848834451', permanentAddress: 'Mumbai',    localAddress: '', pincode: '400001', city: 'Mumbai',    country: 'India', contactNumber: '9848834451' },
];

// ─── Type Badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string; icon: string }> = {
    'Clinic Visit':       { bg: '#dbeafe', color: '#1d4ed8', icon: '🏥' },
    'Hospital Visit':     { bg: '#dcfce7', color: '#15803d', icon: '🏨' },
    'Video Consultation': { bg: '#f3e8ff', color: '#7c3aed', icon: '🎥' },
  };
  const s = map[type] ?? { bg: '#f1f5f9', color: '#475569', icon: '📋' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {s.icon} {type}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AppointmentBookingPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Appointment | null>(null);
  const [search, setSearch]             = useState('');
  const [deptFilter, setDeptFilter]     = useState('All');

  const filtered = appointments.filter(a =>
    (deptFilter === 'All' || a.department === deptFilter) &&
    (a.patientName.toLowerCase().includes(search.toLowerCase()) ||
     a.doctor.toLowerCase().includes(search.toLowerCase()))
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
    <>
      {/* ── New Appointment Modal ── */}
      <NewAppointment
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      {/* ── Edit Appointment Modal ── */}
      <NewAppointment
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
        initial={editTarget}
      />

      <div style={{
        background: '#fff', borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
        fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', borderBottom: '1px solid #e8edf3',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#2563eb" strokeWidth="2.2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <h1 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>
              Doctor Appointments
            </h1>
            <span style={{
              background: '#eff6ff', color: '#2563eb', fontSize: 11,
              fontWeight: 700, padding: '2px 8px', borderRadius: 20,
            }}>
              {appointments.length} total
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient or doctor…"
              style={{
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                padding: '7px 12px', fontSize: 13, outline: 'none',
                width: 210, color: '#374151',
              }}
            />

            {/* Department filter */}
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{
                border: '1.5px solid #e2e8f0', borderRadius: 8,
                padding: '7px 10px', fontSize: 13, outline: 'none',
                background: '#fff', cursor: 'pointer', color: '#374151',
              }}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>

            {/* New Appointment button */}
            <button
              onClick={() => { setEditTarget(null); setModalOpen(true); }}
              style={{
                background: '#2563eb', color: '#fff', border: 'none',
                borderRadius: 8, padding: '8px 16px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Appointment
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                {['#', 'Patient', 'Department', 'Doctor', 'Type', 'Date', 'Slot', 'Action'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 14px', fontWeight: 600, color: '#374151',
                    textAlign: i === 0 || i === 7 ? 'center' : 'left',
                    whiteSpace: 'nowrap' as const, fontSize: 12,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                    No appointments found. Click <strong>New Appointment</strong> to book one.
                  </td>
                </tr>
              ) : filtered.map((appt, idx) => (
                <tr key={appt.id} style={{
                  borderBottom: '1px solid #f0f4f8',
                  background: idx % 2 === 0 ? '#fff' : '#fafbfd',
                }}>
                  <td style={{ padding: '11px 14px', textAlign: 'center', color: '#94a3b8', width: 36 }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{appt.patientName}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {appt.gender} · {appt.age}Y · {appt.phone}
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', color: '#475569' }}>{appt.department}</td>
                  <td style={{ padding: '11px 14px', color: '#1e293b', fontWeight: 500 }}>{appt.doctor}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <TypeBadge type={appt.consultingType} />
                  </td>
                  <td style={{ padding: '11px 14px', color: '#475569', whiteSpace: 'nowrap' as const }}>
                    {appt.date}
                  </td>
                  <td style={{ padding: '11px 14px', whiteSpace: 'nowrap' as const }}>
                    <span style={{
                      background: '#f0fdf4', color: '#15803d',
                      padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    }}>{appt.slot}</span>
                  </td>
                  <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => setEditTarget(appt)}
                        style={{
                          background: '#2563eb', color: '#fff', border: 'none',
                          borderRadius: 6, padding: '5px 12px', fontSize: 11,
                          fontWeight: 500, cursor: 'pointer',
                        }}
                      >Edit</button>
                      <button
                        onClick={() => setAppointments(prev => prev.filter(a => a.id !== appt.id))}
                        style={{
                          background: '#fef2f2', color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: 6, padding: '5px 10px', fontSize: 11,
                          fontWeight: 500, cursor: 'pointer',
                        }}
                      >✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
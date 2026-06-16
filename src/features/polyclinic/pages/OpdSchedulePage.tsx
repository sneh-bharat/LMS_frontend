'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Edit2, Trash2, Activity,
  Clock, Users, Calendar, ChevronLeft, ChevronRight,
} from 'lucide-react';
import AddOpdScheduleModal from '../components/AddOpdSchedule';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScheduleStatus = 'Active' | 'Inactive';
type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface OpdSchedule {
  id: number;
  doctorName: string;
  department: string;
  center: string;
  days: Day[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  status: ScheduleStatus;
}

interface OpdScheduleFormData {
  doctorId: number;
  doctorName: string;
  department: string;
  center: string;
  days: Day[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  status: ScheduleStatus;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_SCHEDULES: OpdSchedule[] = [
  {
    id: 1, doctorName: 'Dr. Arjun Mehta', department: 'Cardiology',
    center: 'Main Hospital', days: ['Mon', 'Wed', 'Fri'],
    startTime: '09:00', endTime: '13:00', slotDuration: 15, maxPatients: 4, status: 'Active',
  },
  {
    id: 2, doctorName: 'Dr. Priya Sharma', department: 'Neurology',
    center: 'City Clinic', days: ['Tue', 'Thu'],
    startTime: '10:00', endTime: '14:00', slotDuration: 20, maxPatients: 3, status: 'Active',
  },
  {
    id: 3, doctorName: 'Dr. Rahul Verma', department: 'Orthopedics',
    center: 'Main Hospital', days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '08:00', endTime: '12:00', slotDuration: 10, maxPatients: 6, status: 'Active',
  },
  {
    id: 4, doctorName: 'Dr. Sunita Patel', department: 'Dermatology',
    center: 'North Branch', days: ['Wed', 'Sat'],
    startTime: '11:00', endTime: '15:00', slotDuration: 15, maxPatients: 4, status: 'Inactive',
  },
  {
    id: 5, doctorName: 'Dr. Vikram Singh', department: 'Pediatrics',
    center: 'City Clinic', days: ['Mon', 'Wed', 'Fri', 'Sat'],
    startTime: '09:00', endTime: '17:00', slotDuration: 15, maxPatients: 5, status: 'Active',
  },
  {
    id: 6, doctorName: 'Dr. Neha Kapoor', department: 'Gynecology',
    center: 'Main Hospital', days: ['Tue', 'Thu', 'Sat'],
    startTime: '10:00', endTime: '14:00', slotDuration: 20, maxPatients: 3, status: 'Active',
  },
  {
    id: 7, doctorName: 'Dr. Anil Kumar', department: 'ENT',
    center: 'North Branch', days: ['Mon', 'Thu'],
    startTime: '08:30', endTime: '12:30', slotDuration: 10, maxPatients: 6, status: 'Inactive',
  },
  {
    id: 8, doctorName: 'Dr. Meera Joshi', department: 'Ophthalmology',
    center: 'City Clinic', days: ['Tue', 'Wed', 'Fri'],
    startTime: '09:00', endTime: '13:00', slotDuration: 15, maxPatients: 4, status: 'Active',
  },
  {
    id: 9, doctorName: 'Dr. Sanjay Gupta', department: 'Cardiology',
    center: 'Main Hospital', days: ['Mon', 'Tue', 'Wed'],
    startTime: '14:00', endTime: '18:00', slotDuration: 20, maxPatients: 3, status: 'Active',
  },
  {
    id: 10, doctorName: 'Dr. Ritu Agarwal', department: 'Psychiatry',
    center: 'North Branch', days: ['Wed', 'Thu', 'Sat'],
    startTime: '10:00', endTime: '16:00', slotDuration: 30, maxPatients: 2, status: 'Active',
  },
  {
    id: 11, doctorName: 'Dr. Karan Malhotra', department: 'Urology',
    center: 'City Clinic', days: ['Mon', 'Fri'],
    startTime: '11:00', endTime: '15:00', slotDuration: 15, maxPatients: 4, status: 'Inactive',
  },
  {
    id: 12, doctorName: 'Dr. Pooja Reddy', department: 'Endocrinology',
    center: 'Main Hospital', days: ['Tue', 'Thu', 'Sat'],
    startTime: '09:30', endTime: '13:30', slotDuration: 20, maxPatients: 3, status: 'Active',
  },
];

const ALL_DEPARTMENTS = ['Cardiology', 'Neurology', 'Orthopedics', 'Dermatology', 'Pediatrics', 'Gynecology', 'ENT', 'Ophthalmology', 'Psychiatry', 'Urology', 'Endocrinology'];
const ALL_DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── Utilities ────────────────────────────────────────────────────────────────

function getDepartmentColor(dept: string): string {
  const map: Record<string, string> = {
    Cardiology:    'bg-rose-100    text-rose-700    border-rose-200',
    Neurology:     'bg-violet-100  text-violet-700  border-violet-200',
    Orthopedics:   'bg-blue-100    text-blue-700    border-blue-200',
    Dermatology:   'bg-pink-100    text-pink-700    border-pink-200',
    Pediatrics:    'bg-amber-100   text-amber-700   border-amber-200',
    Gynecology:    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    ENT:           'bg-teal-100    text-teal-700    border-teal-200',
    Ophthalmology: 'bg-cyan-100    text-cyan-700    border-cyan-200',
    Psychiatry:    'bg-indigo-100  text-indigo-700  border-indigo-200',
    Urology:       'bg-orange-100  text-orange-700  border-orange-200',
    Endocrinology: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return map[dept] ?? 'bg-slate-100 text-slate-600 border-slate-200';
}

function formatTime(t: string): string {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function calcSlots(start: string, end: string, duration: number): number {
  if (!start || !end || !duration) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const totalMins = (eh * 60 + em) - (sh * 60 + sm);
  return totalMins > 0 ? Math.floor(totalMins / duration) : 0;
}

const PAGE_SIZE = 8;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OpdSchedulePage() {
  const [schedules, setSchedules] = useState<OpdSchedule[]>(MOCK_SCHEDULES);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<OpdSchedule | null>(null);

  // Stats
  const totalActive = schedules.filter(s => s.status === 'Active').length;
  const totalDoctors = new Set(schedules.map(s => s.doctorName)).size;
  const totalDepts = new Set(schedules.map(s => s.department)).size;

  // Filter
  const filtered = useMemo(() => schedules.filter(s => {
    const matchSearch = s.doctorName.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  }), [schedules, search, deptFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = (data: OpdScheduleFormData) => {
    const newSchedule: OpdSchedule = {
      id: Math.max(...schedules.map(s => s.id), 0) + 1,
      doctorName: data.doctorName,
      department: data.department,
      center: data.center,
      days: data.days,
      startTime: data.startTime,
      endTime: data.endTime,
      slotDuration: data.slotDuration,
      maxPatients: data.maxPatients,
      status: data.status,
    };
    setSchedules(prev => [newSchedule, ...prev]);
    setIsModalOpen(false);
  };

  const handleUpdate = (data: OpdScheduleFormData) => {
    if (!editingSchedule) return;
    setSchedules(prev => prev.map(s =>
      s.id === editingSchedule.id
        ? { ...s, doctorName: data.doctorName, department: data.department, center: data.center, days: data.days, startTime: data.startTime, endTime: data.endTime, slotDuration: data.slotDuration, maxPatients: data.maxPatients, status: data.status }
        : s
    ));
    setIsModalOpen(false);
    setEditingSchedule(null);
  };

  const handleDelete = (s: OpdSchedule) => {
    if (!confirm(`Delete schedule for ${s.doctorName}?`)) return;
    setSchedules(prev => prev.filter(x => x.id !== s.id));
  };

  const handleToggleStatus = (s: OpdSchedule) => {
    setSchedules(prev => prev.map(x =>
      x.id === s.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x
    ));
  };

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">OPD Schedule Management</h1>
          <p className="text-sm text-slate-500">Manage outpatient department schedules and doctor availability</p>
        </div>
        <button
          onClick={() => { setEditingSchedule(null); setIsModalOpen(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus size={16} /> Add OPD Schedule
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Schedules', value: schedules.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Schedules', value: totalActive, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Doctors', value: totalDoctors, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Departments', value: totalDepts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-xs text-slate-500 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by doctor name..."
            className="w-full py-2.5 pl-12 pr-4 rounded-xl border border-slate-200 outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-52">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 outline-none font-bold text-[10px] uppercase tracking-wider text-slate-700 appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              <option value="All">All Departments</option>
              {ALL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="relative flex-1 lg:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-slate-200 outline-none font-bold text-[10px] uppercase tracking-wider text-slate-700 appearance-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Doctor Name', 'Department', 'Center', 'Available Days', 'Timings', 'Slot / Max', 'Slots', 'Status', 'Actions'].map(col => (
                  <th key={col} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center text-sm text-slate-400 font-medium">
                    No schedules found
                  </td>
                </tr>
              ) : paginated.map(s => {
                const slots = calcSlots(s.startTime, s.endTime, s.slotDuration);
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">

                    {/* Doctor */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-slate-900 whitespace-nowrap">{s.doctorName}</div>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${getDepartmentColor(s.department)}`}>
                        {s.department}
                      </span>
                    </td>

                    {/* Center */}
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-slate-600 whitespace-nowrap">{s.center}</div>
                    </td>

                    {/* Days */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {ALL_DAYS.map(d => (
                          <span key={d} className={`w-8 h-6 inline-flex items-center justify-center rounded text-[9px] font-bold ${
                            s.days.includes(d)
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-300'
                          }`}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Timings */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700 whitespace-nowrap">
                        <Clock size={12} className="text-slate-400" />
                        {formatTime(s.startTime)} – {formatTime(s.endTime)}
                      </div>
                    </td>

                    {/* Slot / Max */}
                    <td className="px-4 py-3">
                      <div className="text-xs font-bold text-slate-700 whitespace-nowrap">
                        <span className="text-emerald-600">{s.slotDuration} min</span>
                        <span className="text-slate-300 mx-1">/</span>
                        <span className="text-blue-600">{s.maxPatients} pts</span>
                      </div>
                    </td>

                    {/* Total Slots */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-xs font-bold text-slate-700">
                        {slots}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        s.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {s.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingSchedule(s); setIsModalOpen(true); }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-emerald-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(s)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-blue-600"
                          title={s.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <Activity size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(s)}
                          className="p-2 hover:bg-rose-50 rounded-lg transition-all text-slate-400 hover:text-rose-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} schedules
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  p === page
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                    : 'border border-slate-200 text-slate-500 hover:bg-white hover:border-emerald-400 hover:text-emerald-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:border-emerald-400 hover:text-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AddOpdScheduleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingSchedule(null); }}
        onSubmit={editingSchedule ? handleUpdate : handleCreate}
        editData={editingSchedule}
        isEditMode={!!editingSchedule}
      />
    </div>
  );
}
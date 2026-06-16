'use client';

import { useMemo, useState } from 'react';
import { Calendar, CalendarCheck, Filter, Plus, Search } from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import NewAppointment from '../components/NewAppointment';
import { AppointmentsTable } from '../components/AppointmentsTable';
import { DEPARTMENTS, SAMPLE_APPOINTMENTS } from '../constants/appointment';
import type { Appointment, FormState } from '../types/appointment.types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (deptFilter === 'All' || a.department === deptFilter) &&
          a.patientName.toLowerCase().includes(search.toLowerCase()),
      ),
    [appointments, deptFilter, search],
  );

  const handleSave = (form: FormState) => {
    if (editTarget) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === editTarget.id ? { ...a, ...form, age: Number(form.age) } : a)),
      );
      setEditTarget(null);
    } else {
      setAppointments((prev) => [{ id: Date.now(), ...form, age: Number(form.age) }, ...prev]);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-700">
      <NewAppointment isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
      <NewAppointment isOpen={!!editTarget} onClose={() => setEditTarget(null)} onSave={handleSave} initial={editTarget} />

      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h1 className="mb-1 flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <CalendarCheck size={20} />
            </div>
            <span>
              Test <span className="text-[#FF671F]">Appointments</span>
            </span>
          </h1>
          <p className="max-w-xl text-sm font-medium text-slate-500">
            Schedule and manage patient visits across departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-1.5">
            {appointments.length} Bookings
          </Badge>
          <Button
            size="sm"
            onClick={() => {
              setEditTarget(null);
              setModalOpen(true);
            }}
            variant="gradient"
            className="gap-2 shadow-sm"
          >
            <Plus size={16} />
            Book Test
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="group relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient or test...."
            className="input-refined w-full py-2.5 pl-10 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="input-refined appearance-none py-2 pl-8 pr-8 text-[11px] font-bold uppercase tracking-wider"
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" size="sm" className="border-slate-200 p-2">
            <Calendar size={16} />
          </Button>
        </div>
      </div>

      <AppointmentsTable
        appointments={filtered}
        onEdit={setEditTarget}
        onDelete={(id) => setAppointments((prev) => prev.filter((a) => a.id !== id))}
      />
    </div>
  );
}

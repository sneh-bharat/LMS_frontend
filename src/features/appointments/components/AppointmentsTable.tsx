'use client';

import { Calendar, CalendarCheck, Clock, Edit3, MoreHorizontal, Stethoscope, Trash2, User } from 'lucide-react';
import Badge from '@/components/ui/badge';
import { AppointmentTypeBadge } from './AppointmentTypeBadge';
import type { Appointment } from '../types/appointment.types';

export interface AppointmentsTableProps {
  appointments: Appointment[];
  onEdit: (appt: Appointment) => void;
  onDelete: (id: number) => void;
}

export function AppointmentsTable({ appointments, onEdit, onDelete }: AppointmentsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Patient Details</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Department</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Consultant</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Schedule</th>
            <th className="px-6 py-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {appointments.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-200">
                    <CalendarCheck size={32} />
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight text-slate-900">No appointments found</p>
                    <p className="text-xs font-medium text-slate-400">Try adjusting your filters.</p>
                  </div>
                </div>
              </td>
            </tr>
          ) : (
            appointments.map((appt, idx) => (
              <tr key={appt.id} className="group transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-slate-100 text-slate-400 transition-all group-hover:bg-emerald-600 group-hover:text-white">
                      <User size={18} />
                      {idx === 0 && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700">{appt.patientName}</div>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                        {appt.gender} • {appt.age} Y • {appt.phone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Stethoscope size={14} className="text-slate-300" />
                      {appt.department}
                    </div>
                    <AppointmentTypeBadge type={appt.consultingType} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{appt.department}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
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
                      onClick={() => onEdit(appt)}
                      className="rounded-lg border border-transparent bg-slate-50 p-1.5 text-slate-400 transition-all hover:border-slate-100 hover:bg-white hover:text-emerald-600 hover:shadow-sm"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(appt.id)}
                      className="rounded-lg border border-transparent bg-slate-50 p-1.5 text-slate-400 transition-all hover:border-slate-100 hover:bg-white hover:text-rose-500 hover:shadow-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-1.5 text-slate-300 hover:text-slate-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AppointmentsTable;

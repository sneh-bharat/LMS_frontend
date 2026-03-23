'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Edit2,
  CheckCircle2,
} from 'lucide-react';

interface Schedule {
  id: number;
  day: string;
  scheduleStart: string;
  scheduleEnd: string;
  duration: string;
  doctorFees: number;
  scheduleNote: string;
  isActive: boolean;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  doctorFees: number;
  existingSchedules?: Schedule[];
  onSave?: (schedules: Schedule[]) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM',
];

const DURATION_OPTIONS = ['15 mins', '30 mins', '45 mins', '60 mins'];

export default function ScheduleModal({
  isOpen,
  onClose,
  doctorName,
  doctorFees,
  existingSchedules = [],
  onSave,
}: ScheduleModalProps) {
  const [schedules, setSchedules] = useState<Schedule[]>(existingSchedules);
  const [formData, setFormData] = useState({
    day: 'Choose',
    scheduleStart: '4:00 PM',
    scheduleEnd: '9:00 AM',
    duration: '30 mins',
    fees: doctorFees,
    scheduleNote: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSchedule = () => {
    if (formData.day === 'Choose') {
      alert('Please select a day');
      return;
    }

    // Check if schedule already exists for this day (excluding editing)
    if (schedules.some(s => s.day === formData.day && s.id !== (editingId || -1))) {
      alert('Schedule already exists for this day');
      return;
    }

    if (editingId) {
      // Update existing schedule
      setSchedules(schedules.map(s =>
        s.id === editingId
          ? {
              ...s,
              day: formData.day,
              scheduleStart: formData.scheduleStart,
              scheduleEnd: formData.scheduleEnd,
              duration: formData.duration,
              doctorFees: formData.fees,
              scheduleNote: formData.scheduleNote,
            }
          : s
      ));
      setEditingId(null);
    } else {
      // Add new schedule
      const newSchedule: Schedule = {
        id: Math.max(...schedules.map(s => s.id), 0) + 1,
        day: formData.day,
        scheduleStart: formData.scheduleStart,
        scheduleEnd: formData.scheduleEnd,
        duration: formData.duration,
        doctorFees: formData.fees,
        scheduleNote: formData.scheduleNote,
        isActive: true,
      };
      setSchedules([...schedules, newSchedule]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      day: 'Choose',
      scheduleStart: '4:00 PM',
      scheduleEnd: '9:00 AM',
      duration: '30 mins',
      fees: doctorFees,
      scheduleNote: '',
    });
    setEditingId(null);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      day: schedule.day,
      scheduleStart: schedule.scheduleStart,
      scheduleEnd: schedule.scheduleEnd,
      duration: schedule.duration,
      fees: schedule.doctorFees,
      scheduleNote: schedule.scheduleNote,
    });
  };

  const handleToggleActive = (id: number) => {
    setSchedules(schedules.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
  };

  const handleRemoveSchedule = (id: number) => {
    setSchedules(schedules.filter(s => s.id !== id));
    if (editingId === id) {
      resetForm();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(schedules);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 px-8 py-6 border-b border-teal-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                <Clock size={20} className="inline-block mr-2 text-teal-600" />
                List of <span className="text-teal-600">Schedule</span>
              </h2>
              <p className="text-sm text-slate-600">
                {doctorName} - Manage consultation schedules
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Schedules Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Current Schedules
              </h3>

              {schedules.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-left">
                          Day
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-left">
                          Schedule
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-left">
                          Fees
                        </th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedules.map(schedule => (
                        <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-900">{schedule.day}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-slate-900">
                                {schedule.scheduleStart}-{schedule.scheduleEnd}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {schedule.duration} for each patient
                              </p>
                              {schedule.scheduleNote && (
                                <p className="text-xs text-slate-600 mt-1 italic">
                                  Note: {schedule.scheduleNote}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-900">
                              ₹{schedule.doctorFees}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEditSchedule(schedule)}
                                className="inline-flex items-center justify-center px-3 py-1.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-xs font-bold"
                              >
                                <Edit2 size={12} className="mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => handleToggleActive(schedule.id)}
                                className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border ${
                                  schedule.isActive
                                    ? 'text-emerald-600 border-emerald-300 bg-emerald-50'
                                    : 'text-slate-600 border-slate-300'
                                }`}
                              >
                                <CheckCircle2 size={12} className="mr-1" />
                                {schedule.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <AlertCircle size={32} className="mx-auto text-blue-400 mb-2" />
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    No schedule created yet.
                  </p>
                  <p className="text-xs text-blue-700">
                    Add a new schedule to get started
                  </p>
                </div>
              )}
            </div>

            {/* Add New Schedule Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                {editingId ? 'Edit Schedule' : 'Add New Schedule'}
              </h3>

              <div className="space-y-4 mb-4">
                {/* First Row: Day, Schedule Start, Schedule End, Duration, Doctor Fees */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Day Select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Day
                    </label>
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium text-sm text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none appearance-none bg-white"
                    >
                      <option value="Choose">Choose</option>
                      {DAYS.map(day => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Schedule Start */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Schedule Start
                    </label>
                    <select
                      name="scheduleStart"
                      value={formData.scheduleStart}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium text-sm text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none appearance-none bg-white"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Schedule End */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Schedule End
                    </label>
                    <select
                      name="scheduleEnd"
                      value={formData.scheduleEnd}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium text-sm text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none appearance-none bg-white"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium text-sm text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none appearance-none bg-white"
                    >
                      {DURATION_OPTIONS.map(duration => (
                        <option key={duration} value={duration}>
                          {duration}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctor Fees */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                      Doctor Fees
                    </label>
                    <input
                      type="number"
                      name="fees"
                      value={formData.fees}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium text-sm text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none"
                    />
                  </div>
                </div>

                {/* Schedule Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Schedule Note
                  </label>
                  <input
                    type="text"
                    name="scheduleNote"
                    placeholder="e.g., Morning session, Limited slots available"
                    value={formData.scheduleNote}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 font-medium text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none"
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddSchedule}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
                >
                  <Plus size={18} />
                  {editingId ? 'Update Schedule' : 'Add New Schedule'}
                </button>
                {editingId && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-200 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold hover:from-teal-600 hover:to-blue-600 transition-all text-sm shadow-md"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
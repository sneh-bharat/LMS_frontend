'use client';

import { useState } from 'react';
import RightDrawer from '@/components/ui/right-drawer';
import { AlertCircle } from 'lucide-react';
import { QueueFormData, DoctorInfo } from './types';
import { zodFieldErrors } from '@/lib/zod';
import { queueSchema } from '../schemas/queue.schema';
import { DEPARTMENTS, VISIT_TYPES } from '../constants/polyclinic';

interface AddQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QueueFormData) => void;
  doctors: DoctorInfo[];
}

export default function AddQueueModal({
  isOpen,
  onClose,
  onSubmit,
  doctors,
}: AddQueueModalProps) {
  const [formData, setFormData] = useState<QueueFormData>({
    patientName: '',
    mobile: '',
    department: '',
    visitType: 'OPD',
    doctorId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' && value === '' ? 0 : type === 'number' ? Number(value) : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const parsed = queueSchema.safeParse(formData);
    if (parsed.success) {
      setErrors({});
      return true;
    }
    setErrors(zodFieldErrors(parsed.error));
    return false;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      patientName: '',
      mobile: '',
      department: '',
      visitType: 'OPD',
      doctorId: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          Add Patient to <span className="text-emerald-200">Queue</span>
        </>
      }
      description="Register a new patient"
      footer={
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="queue-form"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            Add to Queue
          </button>
        </div>
      }
      maxWidth="md"
    >
      <form id="queue-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        
        {/* Patient Information */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Patient Name *
              </label>
              <input
                type="text"
                name="patientName"
                placeholder="Enter patient name"
                value={formData.patientName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.patientName
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.patientName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.patientName}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="9876543210"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.mobile
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              />
              {errors.mobile && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.mobile}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Queue Details */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Queue Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.department
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.department}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Visit Type *
              </label>
              <select
                name="visitType"
                value={formData.visitType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {VISIT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Select Doctor *
              </label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                  errors.doctorId
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                }`}
              >
                <option value={0}>Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {errors.doctorId && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.doctorId}
                </p>
              )}
            </div>
          </div>
        </div>

      </form>
    </RightDrawer>
  );
}
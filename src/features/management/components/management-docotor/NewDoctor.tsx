'use client';

import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer'; 
interface Doctor {
  id: number;
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  clinic: string;
  location: string;
  phone: string;
  email: string;
  consultationFee: number;
  followUpFee: number;
  totalFees: number;
  patientSlots: number;
  availability: string;
  rating: number;
  status: 'available' | 'unavailable';
  createdAt: string;
}

export interface FormData {
  name: string;
  specialization: string;
  department: string;
  qualification: string;
  clinic: string;
  location: string;
  phone: string;
  email: string;
  consultationFee: number | '';
  followUpFee: number | '';
  totalFees: number | '';
  patientSlots: number | '';
  availability: string;
  rating: number | '';
}

interface NewDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: Doctor | null;
}

export default function NewDoctorModal({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
}: NewDoctorModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: editData?.name || '',
    specialization: editData?.specialization || '',
    department: editData?.department || '',
    qualification: editData?.qualification || '',
    clinic: editData?.clinic || '',
    location: editData?.location || '',
    phone: editData?.phone || '',
    email: editData?.email || '',
    consultationFee: editData?.consultationFee || '',
    followUpFee: editData?.followUpFee || '',
    totalFees: editData?.totalFees || '',
    patientSlots: editData?.patientSlots || '',
    availability: editData?.availability || 'Available',
    rating: editData?.rating || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: 
        type === 'number' && value === '' 
          ? '' 
          : type === 'number' 
            ? Number(value) 
            : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Doctor name is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.consultationFee === '' || Number(formData.consultationFee) <= 0) 
      newErrors.consultationFee = 'Valid consultation fee is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      specialization: '',
      department: '',
      qualification: '',
      clinic: '',
      location: '',
      phone: '',
      email: '',
      consultationFee: '',
      followUpFee: '',
      totalFees: '',
      patientSlots: '',
      availability: 'Available',
      rating: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Doctor' : 'New Doctor'}
      description={editData ? 'Update doctor details' : 'Add a new doctor'}
      footer={
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="concession-form"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            Save
          </button>
        </div>
      }
      maxWidth="md"
    >
          {/* Content */}
        
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Doctor Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Dr. John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                      errors.name
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.name}
                    </p>
                  )}
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Department
                  </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                        errors.department
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                          : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                      }`}
                    >
                      <option value="">Select Department</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                    </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    placeholder="Cardiology"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                      errors.specialization
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                    }`}
                  />
                  {errors.specialization && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.specialization}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="MD, DM"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="doctor@clinic.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                      errors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                      errors.phone
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.phone}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Clinic / Hospital
                  </label>
                  <select
                    name="clinic"
                    value={formData.clinic}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 appearance-none bg-white"
                  >
                    <option value="">Select Clinic/Hospital</option>
                    <option value="Heart Care Clinic">Heart Care Clinic</option>
                    <option value="Skin Care Center">Skin Care Center</option>
                    <option value="Joint Care Hospital">Joint Care Hospital</option>
                    <option value="Wellness Medical Center">Wellness Medical Center</option>
                    <option value="City General Hospital">City General Hospital</option>
                    <option value="Apollo Clinic">Apollo Clinic</option>
                    <option value="Fortis Hospital">Fortis Hospital</option>
                    <option value="Max Healthcare">Max Healthcare</option>
                    <option value="Manipal Hospital">Manipal Hospital</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Salt Lake, Kolkata, WB 700091"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Consultation Fees */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Consultation Fees
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    name="consultationFee"
                    placeholder="1500"
                    value={formData.consultationFee}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                      errors.consultationFee
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                        : 'border-slate-200 focus:border-teal-500 focus:ring-teal-500/10'
                    }`}
                  />
                  {errors.consultationFee && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.consultationFee}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Follow-up Fee (₹)
                  </label>
                  <input
                    type="number"
                    name="followUpFee"
                    placeholder="800"
                    value={formData.followUpFee}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Total Fees (₹)
                  </label>
                  <input
                    type="number"
                    name="totalFees"
                    placeholder="2300"
                    value={formData.totalFees}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Max Patient Slots
                  </label>
                  <input
                    type="number"
                    name="patientSlots"
                    placeholder="25"
                    value={formData.patientSlots}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 appearance-none bg-white"
                  >
                    <option>Available</option>
                    <option>Unavailable</option>
                    <option>On Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Rating
                  </label>
                  <input
                    type="number"
                    name="rating"
                    placeholder="4.8"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>
            </div>
          
    </RightDrawer>
    </>
  );
}

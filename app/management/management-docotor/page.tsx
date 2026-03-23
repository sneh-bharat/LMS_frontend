'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  ChevronDown,
  MapPin,
  Mail,
  Phone,
  Star,
  Edit2,
  Trash2,
  MoreHorizontal,
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import NewDoctorModal, { FormData } from './NewDoctor';
import ScheduleModal from './Schedule';

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

const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Rajesh Kumar',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    qualification: 'MD, DM',
    clinic: 'Heart Care Clinic',
    location: 'Salt Lake, Kolkata, WB 700091',
    phone: '+91 9876543210',
    email: 'rajesh@heartcare.com',
    consultationFee: 1500,
    followUpFee: 800,
    totalFees: 2300,
    patientSlots: 25,
    availability: 'Available',
    rating: 4.8,
    status: 'available',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    specialization: 'Dermatologist',
    department: 'Dermatology',
    qualification: 'MBBS, MD',
    clinic: 'Skin Care Center',
    location: 'New Town, Kolkata, WB 700156',
    phone: '+91 9876543211',
    email: 'priya@skincare.com',
    consultationFee: 1000,
    followUpFee: 600,
    totalFees: 1600,
    patientSlots: 20,
    availability: 'Available',
    rating: 4.6,
    status: 'available',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'Dr. Amit Patel',
    specialization: 'Orthopedist',
    department: 'Orthopedics',
    qualification: 'MBBS, MS',
    clinic: 'Joint Care Hospital',
    location: 'Sector V, Kolkata, WB 700091',
    phone: '+91 9876543212',
    email: 'amit@jointcare.com',
    consultationFee: 1200,
    followUpFee: 700,
    totalFees: 1900,
    patientSlots: 15,
    availability: 'Available',
    rating: 4.7,
    status: 'available',
    createdAt: '2024-02-01',
  },
];



function DoctorActionsMenu({ doctor }: { doctor: Doctor }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
          <button className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Edit2 size={14} /> Edit
          </button>
          <div className="h-[1px] bg-slate-100 my-1"></div>
          <button className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function DoctorPage() {
  const [doctors, setDoctors] = useState<Doctor[]>(SAMPLE_DOCTORS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingDoctor, setSchedulingDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(search.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(search.toLowerCase()) ||
    doctor.clinic.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDoctor = (formData: FormData) => {
    if (editingDoctor) {
      setDoctors(doctors.map(d =>
        d.id === editingDoctor.id
          ? { 
              ...d, 
              name: formData.name,
              specialization: formData.specialization,
              department: formData.department,
              qualification: formData.qualification,
              clinic: formData.clinic,
              location: formData.location,
              phone: formData.phone,
              email: formData.email,
              consultationFee: Number(formData.consultationFee) || 0,
              followUpFee: Number(formData.followUpFee) || 0,
              patientSlots: Number(formData.patientSlots) || 0,
              availability: formData.availability,
              rating: Number(formData.rating) || 0,
              totalFees: (Number(formData.consultationFee) || 0) + (Number(formData.followUpFee) || 0)
            }
          : d
      ));
      setEditingDoctor(null);
    } else {
      const newDoctor: Doctor = {
        id: Math.max(...doctors.map(d => d.id), 0) + 1,
        name: formData.name,
        specialization: formData.specialization,
        department: formData.department,
        qualification: formData.qualification,
        clinic: formData.clinic,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        consultationFee: Number(formData.consultationFee) || 0,
        followUpFee: Number(formData.followUpFee) || 0,
        totalFees: (Number(formData.consultationFee) || 0) + (Number(formData.followUpFee) || 0),
        patientSlots: Number(formData.patientSlots) || 0,
        availability: formData.availability,
        rating: Number(formData.rating) || 0,
        status: 'available',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setDoctors([...doctors, newDoctor]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSchedule = (doctor: Doctor) => {
    setSchedulingDoctor(doctor);
    setIsScheduleModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSchedulingDoctor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Doctor <span className="text-teal-600">Management</span>
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage doctors, consultations, and availability schedules.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} /> ADD NEW DOCTOR
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by doctor name, specialization, or clinic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none font-medium transition-all"
              />
            </div>

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-teal-100 text-teal-600'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map(doctor => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 transition-all hover:shadow-lg p-6 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-teal-600 font-semibold">{doctor.specialization}</p>
                  </div>
                  <DoctorActionsMenu doctor={doctor} />
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={16} className="text-slate-400" />
                    <span className="line-clamp-1">{doctor.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Mail size={16} className="text-slate-400" />
                    <span className="line-clamp-1">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span>{doctor.phone}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-slate-100 mb-6"></div>

                {/* Fees and Rating */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                      Consultation
                    </p>
                    <p className="text-2xl font-bold text-slate-900">₹{doctor.consultationFee}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                      Rating
                    </p>
                    <div className="flex items-center justify-end gap-1">
                      <Star size={16} className="fill-amber-400 text-amber-400" />
                      <span className="text-2xl font-bold text-slate-900">{doctor.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-emerald-700">{doctor.availability}</span>
                </div>

                {/* Action Buttons - FIXED: Added Schedule button */}
                <div className="flex gap-2 mt-auto">
              
                  <button
                    onClick={() => handleSchedule(doctor)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold border border-blue-200"
                  >
                    <Clock size={14} /> Schedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Fees
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map(doctor => (
                    <tr key={doctor.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">{doctor.name}</p>
                          <p className="text-xs text-slate-500">{doctor.clinic}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                          <span className="text-sm font-semibold text-slate-900">
                            {doctor.specialization}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <p>{doctor.phone}</p>
                          <p className="text-xs text-slate-500">{doctor.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-slate-900">
                          ₹{doctor.consultationFee}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-slate-900">{doctor.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                            doctor.status === 'available'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              doctor.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          ></div>
                          {doctor.status === 'available' ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
            
                          <button
                            onClick={() => handleSchedule(doctor)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold"
                          >
                            <Clock size={14} /> Schedule
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold">{filteredDoctors.length}</span> doctors
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No doctors found</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewDoctorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddDoctor}
        editData={editingDoctor}
      />

      {/* Schedule Modal */}
      {schedulingDoctor && (
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={handleCloseScheduleModal}
          doctorName={schedulingDoctor.name}
          doctorFees={schedulingDoctor.consultationFee}
        />
      )}
    </div>
  );
}
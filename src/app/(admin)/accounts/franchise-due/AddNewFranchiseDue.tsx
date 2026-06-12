'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';

export interface FranchiseDueFormData {
  date: string;
  invoiceNumber: string;
  patientName: string;
  ageDays: number;
  due: number;
  franchise: string;
  status: 'pending' | 'partial' | 'overdue';
}

export type { FranchiseDue };

interface AddNewFranchiseDueProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FranchiseDueFormData) => void;
  editData?: FranchiseDue | null;
  franchiseOptions?: string[];
}

interface FranchiseDue {
  id: number;
  date: string;
  invoiceNumber: string;
  patientName: string;
  ageDays: number;
  due: number;
  franchise: string;
  status: 'pending' | 'partial' | 'overdue';
  createdAt: string;
}

const DEFAULT_FRANCHISE_OPTIONS = [
  'Cash', 'HO(IP)', 'Credit', 'Credit Franchise',
  'sv prasad hospital', 'Wallet', 'wallet flexibility',
];

const STATUS_OPTIONS = ['pending', 'partial', 'overdue'];

export default function AddNewFranchiseDue({
  isOpen,
  onClose,
  onSubmit,
  editData,
  franchiseOptions = DEFAULT_FRANCHISE_OPTIONS,
}: AddNewFranchiseDueProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FranchiseDueFormData>({
    date: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
    patientName: '',
    ageDays: 0,
    due: 0,
    franchise: '',
    status: 'pending',
  });

  useEffect(() => {
    if (editData) {
      setFormData({
        date: editData.date,
        invoiceNumber: editData.invoiceNumber,
        patientName: editData.patientName,
        ageDays: editData.ageDays,
        due: editData.due,
        franchise: editData.franchise,
        status: editData.status,
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        patientName: '',
        ageDays: 0,
        due: 0,
        franchise: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'ageDays' || name === 'due' 
        ? (value === '' ? 0 : parseFloat(value)) 
        : value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.invoiceNumber) {
      newErrors.invoiceNumber = 'Invoice number is required';
    }

    if (!formData.patientName) {
      newErrors.patientName = 'Patient name is required';
    }

    if (!formData.franchise) {
      newErrors.franchise = 'Franchise is required';
    }

    if (!formData.due || Number(formData.due) <= 0) {
      newErrors.due = 'Valid due amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    
    if (!editData) {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        patientName: '',
        ageDays: 0,
        due: 0,
        franchise: '',
        status: 'pending',
      });
      setErrors({});
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (

    <RightDrawer 
          isOpen={isOpen}
          onClose={onClose}
          title={editData ? 'Edit Franchise Due' : ' Add New Franchise Due'}
          description={editData ? 'Update franchise due details' : 'Add a new franchise due'}
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
          maxWidth="md">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Date, Invoice Number, Franchise - Three Column */}
              <div className="grid grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 ${
                      errors.date ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-500">{errors.date}</p>
                  )}
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    placeholder="e.g., TL-INV-42"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 ${
                      errors.invoiceNumber ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.invoiceNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.invoiceNumber}</p>
                  )}
                </div>

                {/* Franchise */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Franchise <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="franchise"
                      value={formData.franchise}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer ${
                        errors.franchise ? 'border-red-500' : 'border-slate-300'
                      }`}
                    >
                      <option value="">Please Select</option>
                      {franchiseOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                  {errors.franchise && (
                    <p className="mt-1 text-xs text-red-500">{errors.franchise}</p>
                  )}
                </div>
              </div>

              {/* Patient Name, Age Days, Due Amount - Three Column */}
              <div className="grid grid-cols-3 gap-4">
                {/* Patient Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    placeholder="Enter patient name"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 ${
                      errors.patientName ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>
                  )}
                </div>

                {/* Age Days */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Age (Days)
                  </label>
                  <input
                    type="number"
                    name="ageDays"
                    placeholder="0"
                    value={formData.ageDays}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                  />
                </div>

                {/* Due Amount */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Due Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="due"
                    placeholder="0.00"
                    value={formData.due}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 placeholder-slate-400 ${
                      errors.due ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.due && (
                    <p className="mt-1 text-xs text-red-500">{errors.due}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              
            </form>
    
    </RightDrawer>
  );
}

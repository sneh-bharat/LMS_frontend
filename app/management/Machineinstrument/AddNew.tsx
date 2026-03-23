'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

export interface FormData {
  department: string;
  name: string;
  description: string;
  operationType: 'purchase' | 'lease' | 'rental' | 'maintenance';
  vendorSupplierName: string;
  purchaseDate: string;
  amcRenewalDate: string;
  serviceInterval: 'monthly' | 'quarterly' | 'biannual' | 'annual' | 'asNeeded';
  serviceCallNumber: string;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed';
}

interface AddNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: FormData | null;
  departments?: string[];
  vendors?: string[];
}

const OPERATION_TYPES = ['Purchase', 'Lease', 'Rental', 'Maintenance'];
const SERVICE_INTERVALS = ['Monthly', 'Quarterly', 'Biannual', 'Annual', 'As Needed'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Maintenance', 'Disposed'];

export default function AddNew({
  isOpen,
  onClose,
  onSubmit,
  editData,
  departments = ['Cardiology', 'Dermatology', 'Orthopedics', 'Neurology', 'Pediatrics'],
  vendors = ['Med Supply Co.', 'Healthcare Equipment Inc.', 'Diagnostic Systems Ltd.', 'Medical Devices Plus'],
}: AddNewProps) {
  const [formData, setFormData] = useState<FormData>(
    editData || {
      department: '',
      name: '',
      description: '',
      operationType: 'purchase',
      vendorSupplierName: '',
      purchaseDate: '',
      amcRenewalDate: '',
      serviceInterval: 'monthly',
      serviceCallNumber: '',
      status: 'active',
    }
  );

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    }
  }, [editData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editData) {
      setFormData({
        department: '',
        name: '',
        description: '',
        operationType: 'purchase',
        vendorSupplierName: '',
        purchaseDate: '',
        amcRenewalDate: '',
        serviceInterval: 'monthly',
        serviceCallNumber: '',
        status: 'active',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            {editData ? 'Edit Machine/Instrument' : 'Add New Machine/Instrument'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Department */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
              >
                <option value="">Please Select</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Machine/Instrument name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter description (will show on clinical report)"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">It will show on clinical report.</p>
          </div>

          {/* Operation Type and Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Operation Type
              </label>
              <div className="relative">
                <select
                  name="operationType"
                  value={formData.operationType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  {OPERATION_TYPES.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Vendor or Supplier Name
              </label>
              <div className="relative">
                <select
                  name="vendorSupplierName"
                  value={formData.vendorSupplierName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="">Please Select</option>
                  {vendors.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Purchase Date and AMC Renewal Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Purchase Date
              </label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                AMC Renewal Date
              </label>
              <input
                type="date"
                name="amcRenewalDate"
                value={formData.amcRenewalDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
            </div>
          </div>

          {/* Service Interval and Service Call Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Service Interval
              </label>
              <div className="relative">
                <select
                  name="serviceInterval"
                  value={formData.serviceInterval}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  {SERVICE_INTERVALS.map((interval) => (
                    <option key={interval} value={interval.toLowerCase().replace(' ', '')}>
                      {interval}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Service Call Number
              </label>
              <input
                type="text"
                name="serviceCallNumber"
                placeholder="Enter service call number"
                value={formData.serviceCallNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
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
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status.toLowerCase()}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
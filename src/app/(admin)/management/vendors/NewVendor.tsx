'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer'; 
import {
  Input,
  Button,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui';


export interface FormData {
  name: string;
  address: string;
  gstNumber: string;
  contactNumber: string;
  email: string;
  website: string;
  contactPersonName: string;
  mobile: string;
  contactPersonEmail: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'pending';
}

interface NewVendorProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: FormData | null;
}

export default function NewVendor({ isOpen, onClose, onSubmit, editData }: NewVendorProps) {
  const [formData, setFormData] = useState<FormData>(
    editData || {
      name: '',
      address: '',
      gstNumber: '',
      contactNumber: '',
      email: '',
      website: '',
      contactPersonName: '',
      mobile: '',
      contactPersonEmail: '',
      registrationDate: '',
      status: 'active',
    }
  );

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
    setFormData({
      name: '',
      address: '',
      gstNumber: '',
      contactNumber: '',
      email: '',
      website: '',
      contactPersonName: '',
      mobile: '',
      contactPersonEmail: '',
      registrationDate: '',
      status: 'active',
    });
  };

  if (!isOpen) return null;

  return (
     <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Vendor' : ' Add Vendor'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vendor Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Vendor Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Address
            </label>
            <textarea
              name="address"
              placeholder="Enter vendor address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* GST Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                placeholder="GST Number"
                value={formData.gstNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Contact Number
              </label>
              <input
                type="tel"
                name="contactNumber"
                placeholder="Contact Number"
                value={formData.contactNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="vendor@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Contact Person Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Contact Person Name
            </label>
            <input
              type="text"
              name="contactPersonName"
              placeholder="Contact person name"
              value={formData.contactPersonName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Mobile
              </label>
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile number"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Contact Person Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email
              </label>
              <input
                type="email"
                name="contactPersonEmail"
                placeholder="Email address"
                value={formData.contactPersonEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Registration Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Registration Date
              </label>
              <input
                type="date"
                name="registrationDate"
                value={formData.registrationDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
              />
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </form>
          
    </RightDrawer>
  );
}
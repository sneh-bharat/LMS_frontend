'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export interface LabTestFormData {
  branchId: string;
  branchName: string;
  location: string;
  testName: string;
  doctor: string;
  status: 'active' | 'inactive';
}

interface LabTest extends LabTestFormData {
  id: number;
  createdAt: string;
  lastUpdated: string;
}

interface AddLabTestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: LabTestFormData) => void;
  editData?: LabTest | null;
  branches: string[];
  testTypes: string[];
}

// Sample branch locations mapping
const BRANCH_LOCATIONS: Record<string, string> = {
  'BR001': 'Mumbai',
  'BR002': 'Pune',
  'BR003': 'Delhi',
  'BR004': 'Bangalore',
};

const BRANCH_NAMES: Record<string, string> = {
  'BR001': 'Downtown Medical Center',
  'BR002': 'Suburban Clinic',
  'BR003': 'North Campus Hospital',
  'BR004': 'South District Facility',
};

export default function AddLabTest({
  isOpen,
  onClose,
  onSubmit,
  editData,
  branches,
  testTypes,
}: AddLabTestProps) {
  const [formData, setFormData] = useState<LabTestFormData>({
    branchId: '',
    branchName: '',
    location: '',
    testName: '',
    doctor: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editData) {
      setFormData({
        branchId: editData.branchId,
        branchName: editData.branchName,
        location: editData.location,
        testName: editData.testName,
        doctor: editData.doctor,
        status: editData.status,
      });
      setErrors({});
    } else {
      setFormData({
        branchId: '',
        branchName: '',
        location: '',
        testName: '',
        doctor: '',
        status: 'active',
      });
      setErrors({});
    }
  }, [editData, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.branchId.trim()) newErrors.branchId = 'Branch ID is required';
    if (!formData.testName.trim()) newErrors.testName = 'Test name is required';
    if (!formData.doctor.trim()) newErrors.doctor = 'Doctor name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const branchId = e.target.value;
    setFormData(prev => ({
      ...prev,
      branchId: branchId,
      branchName: BRANCH_NAMES[branchId] || '',
      location: BRANCH_LOCATIONS[branchId] || '',
    }));
    if (errors.branchId) {
      setErrors(prev => ({
        ...prev,
        branchId: '',
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-8 py-6 border-b border-slate-200 bg-white">
          <h2 className="text-2xl font-bold text-slate-900">
            {editData ? 'Edit Lab Test' : 'Add New Lab Test'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Row 1: Branch Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Branch *
            </label>
            <select
              value={formData.branchId}
              onChange={handleBranchChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer ${
                errors.branchId ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Choose a Branch</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>
                  {BRANCH_NAMES[branch] || branch} ({branch}) - {BRANCH_LOCATIONS[branch] || 'Unknown'}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.branchId}
              </p>
            )}
          </div>

          {/* Row 2: Auto-filled Branch Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Branch Name (Auto-filled)
              </label>
              <input
                type="text"
                value={formData.branchName}
                readOnly
                placeholder="Select a branch"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location (Auto-filled)
              </label>
              <input
                type="text"
                value={formData.location}
                readOnly
                placeholder="Location"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
              />
            </div>
          </div>

          {/* Row 3: Test Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Test Name / Type *
            </label>
            <select
              name="testName"
              value={formData.testName}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer ${
                errors.testName ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value="">Select Test Type</option>
              {testTypes.map(test => (
                <option key={test} value={test}>
                  {test}
                </option>
              ))}
            </select>
            {errors.testName && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.testName}
              </p>
            )}
          </div>

          {/* Row 4: Doctor Assignment */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Assigned Doctor *
            </label>
            <input
              type="text"
              name="doctor"
              value={formData.doctor}
              onChange={handleChange}
              placeholder="e.g., Dr. Rajesh Kumar"
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 ${
                errors.doctor ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.doctor && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.doctor}
              </p>
            )}
          </div>

          {/* Row 5: Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              {editData ? 'Update Test' : 'Add Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
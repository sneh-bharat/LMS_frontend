'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

export interface FormData {
  userId: string;
  userName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  permissions: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    approve: boolean;
  };
}

interface AddUserProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: FormData | null;
  roles?: string[];
}

const DEFAULT_ROLES = [
  'Admin',
  'Doctor',
  'Technician',
  'Receptionist',
  'Lab Manager',
  'Data Analyst',
];

const PERMISSION_OPTIONS = [
  { key: 'view', label: 'View', icon: '👁' },
  { key: 'create', label: 'Create', icon: '➕' },
  { key: 'edit', label: 'Edit', icon: '✏️' },
  { key: 'delete', label: 'Delete', icon: '🗑' },
  { key: 'approve', label: 'Approve/Verify', icon: '✅' },
];

export default function AddUser({
  isOpen,
  onClose,
  onSubmit,
  editData,
  roles = DEFAULT_ROLES,
}: AddUserProps) {
  const [formData, setFormData] = useState<FormData>(
    editData || {
      userId: '',
      userName: '',
      email: '',
      role: '',
      status: 'active',
      permissions: {
        view: false,
        create: false,
        edit: false,
        delete: false,
        approve: false,
      },
    }
  );

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        userId: '',
        userName: '',
        email: '',
        role: '',
        status: 'active',
        permissions: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false,
        },
      });
    }
  }, [editData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: (e.target as HTMLInputElement).checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.userName || !formData.email || !formData.role) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
    if (!editData) {
      setFormData({
        userId: '',
        userName: '',
        email: '',
        role: '',
        status: 'active',
        permissions: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          approve: false,
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h2 className="text-xl font-bold">
              {editData ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-sm text-teal-100 mt-1">
              {editData ? 'Update user details and permissions' : 'Create a new user account with role-based access'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User ID and Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                User ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userId"
                placeholder="USR001"
                value={formData.userId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                User Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userName"
                placeholder="John Doe"
                value={formData.userName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Email and Role */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@hospital.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-3">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={handleChange}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={handleChange}
                  className="w-4 h-4 accent-teal-600"
                />
                <span className="text-sm text-slate-700">Inactive</span>
              </label>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200"></div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-4">
              🔑 Permissions <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {PERMISSION_OPTIONS.map(permission => (
                <label
                  key={permission.key}
                  className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    name={permission.key}
                    checked={formData.permissions[permission.key as keyof typeof formData.permissions]}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-slate-300 accent-teal-600 cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{permission.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Permission Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">📌 Permission Guide:</span>
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4">
              <li>👁 <span className="font-medium">View</span> - Access and view data</li>
              <li>➕ <span className="font-medium">Create</span> - Add new records</li>
              <li>✏️ <span className="font-medium">Edit</span> - Modify existing records</li>
              <li>🗑 <span className="font-medium">Delete</span> - Remove records</li>
              <li>✅ <span className="font-medium">Approve/Verify</span> - Approve or verify actions</li>
            </ul>
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
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {editData ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
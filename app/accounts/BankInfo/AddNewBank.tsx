'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';

interface BankFormData {
  bankName: string;
  branch: string;
  accountNumber: string;
  ifscCode: string;
  contactNumber: string;
  email: string;
  accountHolderName: string;
  status: 'Active' | 'Inactive';
  openingBalance?: number;
  currentBalance?: number;
}

interface AddNewBankProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BankFormData) => void;
  editData?: BankFormData & { id: number };
  isEditMode?: boolean;
}

export default function AddNewBank({
  isOpen,
  onClose,
  onSubmit,
  editData,
  isEditMode = false,
}: AddNewBankProps) {
  const [formData, setFormData] = useState<BankFormData>({
    bankName: editData?.bankName || '',
    branch: editData?.branch || '',
    accountNumber: editData?.accountNumber || '',
    ifscCode: editData?.ifscCode || '',
    contactNumber: editData?.contactNumber || '',
    email: editData?.email || '',
    accountHolderName: editData?.accountHolderName || '',
    status: editData?.status || 'Active',
    openingBalance: editData?.openingBalance || 0,
    currentBalance: editData?.currentBalance || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch name is required';
    if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
    if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
    if (formData.openingBalance !== undefined && formData.openingBalance < 0) {
      newErrors.openingBalance = 'Opening balance cannot be negative';
    }

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
      bankName: '',
      branch: '',
      accountNumber: '',
      ifscCode: '',
      contactNumber: '',
      email: '',
      accountHolderName: '',
      status: 'Active',
      openingBalance: 0,
      currentBalance: 0,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <RightDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={
          <>
            {isEditMode ? 'Edit Bank' : 'Add New Bank'}{' '}
            <span className="text-emerald-200">Account</span>
          </>
        }
        description={isEditMode ? 'Update bank account details' : 'Add a new bank account'}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={handleSubmit}
              className="flex-1"
            >
              Save Bank Account
            </Button>
          </div>
        }
        maxWidth="lg"
      >
        <form id="bank-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  name="bankName"
                  placeholder="e.g., HDFC Bank"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.bankName
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.bankName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.bankName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  name="branch"
                  placeholder="e.g., Connaught Place"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.branch
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.branch && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.branch}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Account Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  placeholder="e.g., 50200012345678"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.accountNumber
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.accountNumber && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.accountNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  placeholder="e.g., HDFC0001234"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.ifscCode
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.ifscCode && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.ifscCode}
                  </p>
                )}
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
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  placeholder="e.g., Think Lab Diagnostics Pvt Ltd"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.accountHolderName
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.accountHolderName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.accountHolderName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  placeholder="+91 11 2345 6789"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.contactNumber
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.contactNumber && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.contactNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="branch@bank.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
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
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Balance Information */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Balance Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  name="openingBalance"
                  min="0"
                  value={formData.openingBalance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                  Initial balance when account was opened
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Current Balance (₹)
                </label>
                <input
                  type="number"
                  name="currentBalance"
                  min="0"
                  value={formData.currentBalance}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                  Current available balance
                </p>
              </div>
            </div>
          </div>

        </form>
      </RightDrawer>
    </>
  );
}
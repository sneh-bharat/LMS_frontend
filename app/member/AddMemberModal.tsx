'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import { Member, MemberFormData, MembershipType, PaymentMode } from '@/app/member/types';

const MOCK_STAFF = [
  { id: 1, name: 'Ravi Sharma',  employeeCode: 'EMP001' },
  { id: 2, name: 'Priya Mehta',  employeeCode: 'EMP002' },
  { id: 3, name: 'Arjun Singh',  employeeCode: 'EMP003' },
  { id: 4, name: 'Neha Kapoor',  employeeCode: 'EMP004' },
  { id: 5, name: 'Vikram Patel', employeeCode: 'EMP005' },
];


interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
  editData?: Member | null;
  isEditMode?: boolean;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  editData = null,
  isEditMode = false,
}: AddMemberModalProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    cardId: editData?.cardId || '',
    type: editData?.type || 'Basic',
    cashbackPercentage: editData?.cashbackPercentage || 0,
    discountPercentage: editData?.discountPercentage || 0,
    validityType: editData?.validity.type || 'Months',
    validityMonths: editData?.validity.value || 12,
    walletStatus: editData?.walletStatus || 'Active',
    marketingStaffId: editData?.marketingStaff.id || 0,
    marketingStaffName: editData?.marketingStaff.name || '',
    marketingStaffCode: editData?.marketingStaff.employeeCode || '',
    registrationCharges: editData?.registrationCharges || 0,
    paymentMode: editData?.paymentMode || 'Cash',
    notes: '',
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

    if (!formData.cardId.trim()) newErrors.cardId = 'Card ID is required';
    if (!formData.type) newErrors.type = 'Membership type is required';
    if (formData.cashbackPercentage < 0 || formData.cashbackPercentage > 100) newErrors.cashbackPercentage = 'Must be between 0 and 100';
    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) newErrors.discountPercentage = 'Must be between 0 and 100';
    if (formData.validityType === 'Months' && (!formData.validityMonths || formData.validityMonths <= 0)) newErrors.validityMonths = 'Validity must be greater than 0';
    if (!formData.marketingStaffId) newErrors.marketingStaffId = 'Please select marketing staff';
    if (!formData.registrationCharges || formData.registrationCharges < 0) newErrors.registrationCharges = 'Valid amount required';
    if (!formData.paymentMode) newErrors.paymentMode = 'Payment mode is required';

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
      cardId: '',
      type: 'Basic',
      cashbackPercentage: 0,
      discountPercentage: 0,
      validityType: 'Months',
      validityMonths: 12,
      walletStatus: 'Active',
      marketingStaffId: 0,
      marketingStaffName: '',
      marketingStaffCode: '',
      registrationCharges: 0,
      paymentMode: 'Cash',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const MEMBERSHIP_TYPES: MembershipType[] = ['Basic', 'Silver', 'Gold', 'Platinum', 'Premium', 'Loyalty'];
  const PAYMENT_MODES: PaymentMode[] = ['Cash', 'Card', 'Online', 'UPI'];
  const CASHBACK_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30];

  return (
    <>
      <RightDrawer
        isOpen={isOpen}
        onClose={handleClose}
        title={
          <>
            {isEditMode ? 'Edit Membership' : 'Add New Member'}{' '}
            <span className="text-emerald-200">Card</span>
          </>
        }
        description={isEditMode ? 'Update membership details' : 'Add a new membership card'}
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
              form="membership-form"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
            >
              Save
            </button>
          </div>
        }
        maxWidth="lg"
      >
        <form id="membership-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
          
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Card ID *
                </label>
                <input
                  type="text"
                  name="cardId"
                  placeholder="MEM2024001 or scan barcode"
                  value={formData.cardId}
                  onChange={handleInputChange}
                  disabled={isEditMode}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.cardId
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.cardId && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.cardId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Membership Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.type
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                >
                  {MEMBERSHIP_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.type}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Benefits & Cashback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Cashback (%) 
                </label>
                <select
                  name="cashbackPercentage"
                  value={formData.cashbackPercentage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  {CASHBACK_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}%</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                  ℹ Cashback will be added to wallet based on invoice value
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </div>

          {/* Validity */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Validity Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Validity Type
                </label>
                <select
                  name="validityType"
                  value={formData.validityType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="Lifetime">Lifetime</option>
                  <option value="Months">Months</option>
                </select>
              </div>

              {formData.validityType === 'Months' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                    Validity Period (Months)
                  </label>
                  <input
                    type="number"
                    name="validityMonths"
                    min="1"
                    max="120"
                    value={formData.validityMonths}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Staff & Status */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Staff & Wallet Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Wallet Status
                </label>
                <select
                  name="walletStatus"
                  value={formData.walletStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Marketing Staff *
                </label>
                <select
                  name="marketingStaffId"
                  value={formData.marketingStaffId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.marketingStaffId
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                >
                  <option value={0}>Select Staff</option>
                  {MOCK_STAFF.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} {staff.employeeCode && `(${staff.employeeCode})`}
                    </option>
                  ))}
                </select>
                {errors.marketingStaffId && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.marketingStaffId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Registration & Payment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Registration Charges (₹) *
                </label>
                <input
                  type="number"
                  name="registrationCharges"
                  min="0"
                  value={formData.registrationCharges}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.registrationCharges
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                />
                {errors.registrationCharges && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.registrationCharges}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                  Payment Mode *
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:ring-4 ${
                    errors.paymentMode
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                      : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                >
                  {PAYMENT_MODES.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
                {errors.paymentMode && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.paymentMode}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Additional Information
            </h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                placeholder="Any additional notes..."
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 resize-none"
              />
            </div>
          </div>

        </form>
      </RightDrawer>
    </>
  );
}
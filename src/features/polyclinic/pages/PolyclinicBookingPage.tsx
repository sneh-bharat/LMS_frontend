'use client';

import { useState } from 'react';
import { ChevronDown, Copy, MessageCircle, Mail, Phone } from 'lucide-react';

interface BookingFormData {
  country: string;
  mobileNumber: string;
  title: string;
  patientName: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  address: string;
  emailAddress: string;
  remarks: string;
  nationality: string;
  primaryReason: string;
  height: string;
  weight: string;
  bloodPressure: string;
  preExistingDiseases: {
    bloodSugar: boolean;
    highBP: boolean;
    anaemia: boolean;
    thyroid: boolean;
    arthritis: boolean;
    asthma: boolean;
  };
  drugAllergy: string;
  selectedCentre: string;
  consultationDate: string;
  consultantDoctor: string;
  totalAmount: string;
  discount: string;
  actualPayable: string;
  dueAmount: string;
  paymentAmount: string;
  paymentMethod: string;
  registrationCharges60: boolean;
}

const COUNTRIES = ['IND +91', 'USA +1', 'UK +44', 'Canada +1', 'Australia +61'];
const TITLES = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'];
const GENDERS = ['Male', 'Female', 'Other'];
const NATIONALITIES = ['IND-India', 'USA-United States', 'UK-United Kingdom', 'Canada', 'Australia'];
const CENTRES = ['Select Centre', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'];
const DOCTORS = ['Select Doctor', 'Dr. Rajesh Kumar', 'Dr. Priya Sharma', 'Dr. Amit Patel', 'Dr. Anjali Singh'];
const PAYMENT_METHODS = ['Cash', 'Card', 'Online', 'Cheque'];

export default function PolyclinicBooking() {
  const [formData, setFormData] = useState<BookingFormData>({
    country: 'IND +91',
    mobileNumber: '',
    title: '',
    patientName: '',
    age: '',
    month: '0',
    day: '0',
    gender: '',
    address: '',
    emailAddress: '',
    remarks: '',
    nationality: 'IND-India',
    primaryReason: '',
    height: '',
    weight: '',
    bloodPressure: '',
    preExistingDiseases: {
      bloodSugar: false,
      highBP: false,
      anaemia: false,
      thyroid: false,
      arthritis: false,
      asthma: false,
    },
    drugAllergy: '',
    selectedCentre: '',
    consultationDate: '',
    consultantDoctor: '',
    totalAmount: '',
    discount: '',
    actualPayable: '0',
    dueAmount: '0',
    paymentAmount: '',
    paymentMethod: 'Cash',
    registrationCharges60: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        preExistingDiseases: {
          ...prev.preExistingDiseases,
          [field]: (e.target as HTMLInputElement).checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
      
      // Auto-calculate amounts
      if (name === 'totalAmount' || name === 'discount') {
        const total = parseInt(name === 'totalAmount' ? value : formData.totalAmount) || 0;
        const discount = parseInt(name === 'discount' ? value : formData.discount) || 0;
        const actualPayable = Math.max(0, total - discount);
        setFormData(prev => ({
          ...prev,
          actualPayable: actualPayable.toString(),
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Polyclinic booking submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Polyclinic Booking</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            <span className="text-lg">ℹ</span> Token Display Info
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg border border-slate-200">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Country and Mobile Number Section */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Country</label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                  >
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Mobile Number</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      name="mobileNumber"
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                    <button type="button" className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">
                      <Copy size={18} />
                    </button>
                    <button type="button" className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">
                      <MessageCircle size={18} />
                    </button>
                    <button type="button" className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">
                      <Mail size={18} />
                    </button>
                    <button type="button" className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-600">
                      <Phone size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Booking without number type 00</p>
                </div>
              </div>
            </div>

            {/* Title, Patient Name, Age, Month, Day, Gender */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Title</label>
                  <div className="relative">
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                    >
                      <option value="">Select Title</option>
                      {TITLES.map(title => (
                        <option key={title} value={title}>{title}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Patient name</label>
                  <input
                    type="text"
                    name="patientName"
                    placeholder="Enter patient name"
                    value={formData.patientName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Age <span className="text-blue-600 text-lg">●</span></label>
                  <input
                    type="number"
                    name="age"
                    placeholder="0"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Month</label>
                  <div className="relative">
                    <select
                      name="month"
                      value={formData.month}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                    >
                      {[...Array(13)].map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Day</label>
                  <div className="relative">
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                    >
                      {[...Array(32)].map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Gender</label>
                  <div className="relative">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                    >
                      <option value="">Select</option>
                      {GENDERS.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Address and Email */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  placeholder="Enter email"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            {/* Remarks and Nationality */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Remarks</label>
                <textarea
                  name="remarks"
                  placeholder="Enter remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Nationality <span className="text-blue-600 text-lg">●</span></label>
                <div className="relative">
                  <select
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                  >
                    {NATIONALITIES.map(nationality => (
                      <option key={nationality} value={nationality}>{nationality}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Primary Reason for Doctor Consultation */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Primary Reason for Doctor Consultation</label>
              <textarea
                name="primaryReason"
                placeholder="Enter primary reason for consultation"
                value={formData.primaryReason}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900"
              />
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Height <span className="text-xs text-slate-500">cm</span></label>
                <input
                  type="number"
                  name="height"
                  placeholder="cm"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Weight <span className="text-xs text-slate-500">kg</span></label>
                <input
                  type="number"
                  name="weight"
                  placeholder="kg"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Blood Pressure <span className="text-xs text-slate-500">120/80</span></label>
                <input
                  type="text"
                  name="bloodPressure"
                  placeholder="120/80"
                  value={formData.bloodPressure}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>
            </div>

            {/* Pre-existing Diseases */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-4">Pre existing disease</label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'bloodSugar', label: 'Blood Sugar' },
                  { name: 'highBP', label: 'High BP' },
                  { name: 'anaemia', label: 'Anaemia' },
                  { name: 'thyroid', label: 'Thyroid' },
                  { name: 'arthritis', label: 'Arthritis' },
                  { name: 'asthma', label: 'Asthma' },
                ].map(disease => (
                  <label key={disease.name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name={`preExistingDiseases.${disease.name}`}
                      checked={formData.preExistingDiseases[disease.name as keyof typeof formData.preExistingDiseases]}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                    />
                    <span className="text-sm text-slate-700">{disease.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Drug Allergy */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">Drug Allergy</label>
              <textarea
                name="drugAllergy"
                placeholder="Please mention if you have any drug allergy"
                value={formData.drugAllergy}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200"></div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-4">
              <button type="button" className="px-4 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors text-sm">
                Select Centre
              </button>
              <button type="button" className="px-4 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-colors text-sm flex items-center justify-center gap-1">
                <span>⊙</span> Consultation Date
              </button>
              <button type="button" className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-1">
                <span>👤</span> Consultant Doctor
              </button>
              <button type="button" className="px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1">
                <span>➕</span> Add Referrer
              </button>
            </div>

            {/* Centre Info and Payment Section */}
            <div className="space-y-6">
              {/* Centre Info */}
              <div className="bg-blue-100 rounded-lg p-4 border border-blue-300">
                <p className="text-sm font-semibold text-slate-900">Center Name → HO(P)</p>
              </div>

              {/* Payment Details Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Total Amount</label>
                  <input
                    type="number"
                    name="totalAmount"
                    value={formData.totalAmount}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Discount</label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Actual Payable</label>
                  <input
                    type="text"
                    name="actualPayable"
                    value={formData.actualPayable}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Due Amount</label>
                  <input
                    type="text"
                    name="dueAmount"
                    value={formData.dueAmount}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-100 text-slate-700 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Payment</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        name="paymentAmount"
                        placeholder="Amount"
                        value={formData.paymentAmount}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                    <div className="relative">
                      <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer text-slate-900"
                      >
                        {PAYMENT_METHODS.map(method => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Registration Charges for 60 months</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="registrationCharges60"
                      checked={formData.registrationCharges60}
                      onChange={(e) => setFormData(prev => ({ ...prev, registrationCharges60: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 accent-blue-600"
                    />
                    <span className="text-xs text-red-600 font-bold">🔴 Separately by cash</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                className="px-8 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
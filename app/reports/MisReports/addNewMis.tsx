'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { MISReport, TopTest, DoctorStat } from './page';

interface AddNewMISReportProps {
  onClose: () => void;
  onSave: (report: Omit<MISReport, 'id' | 'generatedAt'>) => void;
}

export default function AddNewMISReport({
  onClose,
  onSave,
}: AddNewMISReportProps) {
  const [formData, setFormData] = useState({
    fromDate: '2026-03-01',
    toDate: '2026-03-25',
    totalPatients: 320,
    newPatients: 120,
    returningPatients: 200,
    opdVisits: 180,
    diagnosticVisits: 140,
    totalRevenue: 500000,
    totalExpenses: 150000,
    netProfit: 350000,
    cashCollection: 150000,
    cardCollection: 100000,
    upiCollection: 200000,
    bankTransferCollection: 50000,
    totalTests: 450,
    pendingPayments: 20,
    completedPayments: 300,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const profit = formData.totalRevenue - formData.totalExpenses;
    if (profit !== formData.netProfit) {
      setFormData(prev => ({
        ...prev,
        netProfit: profit,
      }));
    }
  }, [formData.totalRevenue, formData.totalExpenses]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fromDate) {
      newErrors.fromDate = 'From date is required';
    }

    if (!formData.toDate) {
      newErrors.toDate = 'To date is required';
    }

    if (formData.fromDate && formData.toDate && formData.fromDate > formData.toDate) {
      newErrors.toDate = 'To date must be after from date';
    }

    if (formData.totalPatients <= 0) {
      newErrors.totalPatients = 'Total patients must be greater than 0';
    }

    if (formData.newPatients + formData.returningPatients !== formData.totalPatients) {
      newErrors.newPatients = 'New + Returning patients must equal total patients';
    }

    if (formData.opdVisits + formData.diagnosticVisits <= 0) {
      newErrors.opdVisits = 'Total visits must be greater than 0';
    }

    if (formData.totalRevenue <= 0) {
      newErrors.totalRevenue = 'Total revenue must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field.includes('Date') ? value : value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const topTests: TopTest[] = [
        { name: 'Blood Test', count: 150, revenue: 150000 },
        { name: 'X-Ray', count: 100, revenue: 100000 },
        { name: 'Ultrasound', count: 80, revenue: 80000 },
      ];

      const doctorStats: DoctorStat[] = [
        { doctorName: 'Dr. Kumar', patientCount: 120, revenue: 120000 },
        { doctorName: 'Dr. Singh', patientCount: 90, revenue: 90000 },
        { doctorName: 'Dr. Patel', patientCount: 80, revenue: 80000 },
      ];

      const report = {
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        totalPatients: formData.totalPatients,
        newPatients: formData.newPatients,
        returningPatients: formData.returningPatients,
        opdVisits: formData.opdVisits,
        diagnosticVisits: formData.diagnosticVisits,
        totalRevenue: formData.totalRevenue,
        totalExpenses: formData.totalExpenses,
        netProfit: formData.netProfit,
        cashCollection: formData.cashCollection,
        cardCollection: formData.cardCollection,
        upiCollection: formData.upiCollection,
        bankTransferCollection: formData.bankTransferCollection,
        totalTests: formData.totalTests,
        topTests,
        doctorStats,
        pendingPayments: formData.pendingPayments,
        completedPayments: formData.completedPayments,
      };

      onSave(report);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <RightDrawer
      isOpen={true}
      onClose={handleClose}
      title={
        <>
          Create Newt{' '}
          <span className="text-emerald-200"> MIS Report</span>
        </>
      }
      description="Add a new MIS report for urine sensitivity testing"
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
            type="submit"
            variant="gradient"
            className="flex-1"
          >
            Generate Report
          </Button>
        </div>
      }
      maxWidth="lg"
    >

         {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date Range Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
              Date Range
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  From Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => handleInputChange('fromDate', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                    errors.fromDate
                      ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
                {errors.fromDate && (
                  <p className="text-rose-600 text-xs font-bold mt-1">{errors.fromDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  To Date <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => handleInputChange('toDate', e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                    errors.toDate
                      ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
                {errors.toDate && (
                  <p className="text-rose-600 text-xs font-bold mt-1">{errors.toDate}</p>
                )}
              </div>
            </div>
          </div>

          {/* Patient Stats Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
              Patient Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Total Patients <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalPatients}
                  onChange={(e) => handleInputChange('totalPatients', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                    errors.totalPatients
                      ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
                {errors.totalPatients && (
                  <p className="text-rose-600 text-xs font-bold mt-1">{errors.totalPatients}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">New Patients</label>
                <input
                  type="number"
                  min="0"
                  value={formData.newPatients}
                  onChange={(e) => handleInputChange('newPatients', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Returning Patients</label>
                <input
                  type="number"
                  min="0"
                  value={formData.returningPatients}
                  onChange={(e) => handleInputChange('returningPatients', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {errors.newPatients && (
              <p className="text-rose-600 text-xs font-bold mt-2">{errors.newPatients}</p>
            )}
          </div>

          {/* Visit Stats Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
              Visit Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">OPD Visits</label>
                <input
                  type="number"
                  min="0"
                  value={formData.opdVisits}
                  onChange={(e) => handleInputChange('opdVisits', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Diagnostic Visits</label>
                <input
                  type="number"
                  min="0"
                  value={formData.diagnosticVisits}
                  onChange={(e) => handleInputChange('diagnosticVisits', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {errors.opdVisits && (
              <p className="text-rose-600 text-xs font-bold mt-2">{errors.opdVisits}</p>
            )}
          </div>

          {/* Financial Summary Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
              Financial Summary
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  Total Revenue <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalRevenue}
                  onChange={(e) => handleInputChange('totalRevenue', parseInt(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 rounded-lg border font-bold text-sm transition-colors ${
                    errors.totalRevenue
                      ? 'border-rose-500 bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500'
                      : 'border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  }`}
                />
                {errors.totalRevenue && (
                  <p className="text-rose-600 text-xs font-bold mt-1">{errors.totalRevenue}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Total Expenses</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalExpenses}
                  onChange={(e) => handleInputChange('totalExpenses', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Net Profit</label>
                <input
                  type="number"
                  value={formData.netProfit}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-100 font-bold text-sm text-slate-600"
                />
                <p className="text-slate-500 text-xs mt-1">Auto-calculated</p>
              </div>
            </div>
          </div>

          {/* Payment Collection Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
              Payment Collections
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Cash</label>
                <input
                  type="number"
                  min="0"
                  value={formData.cashCollection}
                  onChange={(e) => handleInputChange('cashCollection', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Card</label>
                <input
                  type="number"
                  min="0"
                  value={formData.cardCollection}
                  onChange={(e) => handleInputChange('cardCollection', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">UPI</label>
                <input
                  type="number"
                  min="0"
                  value={formData.upiCollection}
                  onChange={(e) => handleInputChange('upiCollection', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Bank Transfer</label>
                <input
                  type="number"
                  min="0"
                  value={formData.bankTransferCollection}
                  onChange={(e) => handleInputChange('bankTransferCollection', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tests & Payments Section */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider border-b border-slate-200 pb-2">
              Tests & Payments
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Total Tests</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalTests}
                  onChange={(e) => handleInputChange('totalTests', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Pending Payments</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pendingPayments}
                  onChange={(e) => handleInputChange('pendingPayments', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Completed Payments</label>
                <input
                  type="number"
                  min="0"
                  value={formData.completedPayments}
                  onChange={(e) => handleInputChange('completedPayments', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </form>
    </RightDrawer>
  );
}
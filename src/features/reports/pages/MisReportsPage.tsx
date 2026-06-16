'use client';

import { useState } from 'react';
import {
  Plus,
  Download,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  LineChart as LineChartIcon,
  Smartphone,
  CreditCard,
  Smartphone as UPIIcon,
  Building2 as BankIcon,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Table from '@/components/ui/table';

import {
  BarChart,
  Bar,
  PieChart as PieChartComponent,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import AddNewMISReport from '../components/MisReports/addNewMis';

// ─── Data Types ──────────────────────────────────────────────────────────────

export interface TopTest {
  name: string;
  count: number;
  revenue: number;
}

export interface DoctorStat {
  doctorName: string;
  patientCount: number;
  revenue: number;
}

export interface MISReport {
  id: number;
  // Date Range
  fromDate: string; // ISO
  toDate: string;
  // Patient Stats
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  // Visit Stats
  opdVisits: number;
  diagnosticVisits: number;
  // Financial Summary
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  // Payment Breakdown
  cashCollection: number;
  cardCollection: number;
  upiCollection: number;
  bankTransferCollection: number;
  // Test / Service Stats
  totalTests: number;
  topTests: TopTest[];
  // Doctor Stats
  doctorStats: DoctorStat[];
  // Status Counts
  pendingPayments: number;
  completedPayments: number;
  // Audit
  generatedAt: string;
}

export const SAMPLE_MIS_REPORT: MISReport = {
  id: 1,
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
  topTests: [
    { name: 'Blood Test', count: 150, revenue: 150000 },
    { name: 'X-Ray', count: 100, revenue: 100000 },
    { name: 'Ultrasound', count: 80, revenue: 80000 },
    { name: 'ECG', count: 70, revenue: 70000 },
  ],
  doctorStats: [
    { doctorName: 'Dr. Kumar', patientCount: 120, revenue: 120000 },
    { doctorName: 'Dr. Singh', patientCount: 90, revenue: 90000 },
    { doctorName: 'Dr. Patel', patientCount: 80, revenue: 80000 },
  ],
  pendingPayments: 20,
  completedPayments: 300,
  generatedAt: '2026-03-25T18:00:00Z',
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MISReportPage() {
  const [reports, setReports] = useState<MISReport[]>([SAMPLE_MIS_REPORT]);
  const [currentReport, setCurrentReport] = useState<MISReport>(SAMPLE_MIS_REPORT);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Chart Data
  const revenueExpenseData = [
    {
      category: 'Summary',
      Revenue: currentReport.totalRevenue,
      Expenses: currentReport.totalExpenses,
    },
  ];

  const paymentModeData = [
    { name: 'Cash', value: currentReport.cashCollection, color: '#10b981' },
    { name: 'Card', value: currentReport.cardCollection, color: '#3b82f6' },
    { name: 'UPI', value: currentReport.upiCollection, color: '#8b5cf6' },
    { name: 'Bank Transfer', value: currentReport.bankTransferCollection, color: '#f59e0b' },
  ];

  const patientGrowthData = [
    {
      period: 'New',
      count: currentReport.newPatients,
    },
    {
      period: 'Returning',
      count: currentReport.returningPatients,
    },
  ];

  const visitTypeData = [
    {
      type: 'OPD',
      visits: currentReport.opdVisits,
      color: '#0ea5e9',
    },
    {
      type: 'Diagnostic',
      visits: currentReport.diagnosticVisits,
      color: '#ec4899',
    },
  ];

  // Table Columns for Top Tests
  const testColumns = [
    {
      key: 'name',
      label: 'Test Name',
      render: (value: string) => (
        <div className="font-bold text-slate-900">{value}</div>
      ),
    },
    {
      key: 'count',
      label: 'Count',
      align: 'center' as const,
      render: (value: number) => (
        <div className="font-bold text-slate-900 text-center">{value}</div>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      render: (value: number) => (
        <div className="font-bold text-emerald-600 text-right">
          {formatCurrency(value)}
        </div>
      ),
    },
  ];

  // Table Columns for Doctor Stats
  const doctorColumns = [
    {
      key: 'doctorName',
      label: 'Doctor Name',
      render: (value: string) => (
        <div className="font-bold text-slate-900">{value}</div>
      ),
    },
    {
      key: 'patientCount',
      label: 'Patients',
      align: 'center' as const,
      render: (value: number) => (
        <div className="font-bold text-slate-900 text-center">{value}</div>
      ),
    },
    {
      key: 'revenue',
      label: 'Revenue',
      align: 'right' as const,
      render: (value: number) => (
        <div className="font-bold text-emerald-600 text-right">
          {formatCurrency(value)}
        </div>
      ),
    },
  ];

  const handleAddNew = (newReport: Omit<MISReport, 'id' | 'generatedAt'>) => {
    const report: MISReport = {
      ...newReport,
      id: Math.max(...reports.map(r => r.id), 0) + 1,
      generatedAt: new Date().toISOString(),
    };
    setReports([...reports, report]);
    setCurrentReport(report);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <BarChart3 size={28} className="text-indigo-600" />
            MIS Report
          </h1>
          <p className="text-sm text-slate-500">
            Management Information System - {formatDate(currentReport.fromDate)} to{' '}
            {formatDate(currentReport.toDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-bold py-2.5 px-4 rounded-xl transition-colors">
            <Download size={18} />
            Export
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
          >
            <Plus size={18} />
            New Report
          </button>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Patients */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/30 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Total Patients</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{currentReport.totalPatients}</div>
          <div className="text-xs text-slate-500 mt-2">
            New: {currentReport.newPatients} | Returning: {currentReport.returningPatients}
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Total Revenue</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(currentReport.totalRevenue)}</div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-400/30 flex items-center justify-center">
              <TrendingDown size={20} className="text-rose-600" />
            </div>
            <span className="text-rose-700 font-bold text-xs uppercase tracking-wider">Total Expenses</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{formatCurrency(currentReport.totalExpenses)}</div>
        </div>

        {/* Net Profit */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-400/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-indigo-600" />
            </div>
            <span className="text-indigo-700 font-bold text-xs uppercase tracking-wider">Net Profit</span>
          </div>
          <div className="text-2xl font-black text-indigo-600">{formatCurrency(currentReport.netProfit)}</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue vs Expense Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-indigo-600" />
            Revenue vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="Revenue" fill="#10b981" />
              <Bar dataKey="Expenses" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Mode Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-indigo-600" />
            Payment Mode Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChartComponent>
              <Pie
                data={paymentModeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentModeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChartComponent>
          </ResponsiveContainer>
        </div>

        {/* Visit Type Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <LineChartIcon size={20} className="text-indigo-600" />
            Visit Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitTypeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visits" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status Summary */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            Payment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600" />
                <span className="font-bold text-slate-900">Completed Payments</span>
              </div>
              <span className="text-2xl font-black text-emerald-600">{currentReport.completedPayments}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-amber-600" />
                <span className="font-bold text-slate-900">Pending Payments</span>
              </div>
              <span className="text-2xl font-black text-amber-600">{currentReport.pendingPayments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Tests Table */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Top Tests
            </h3>
          </div>
          <Table columns={testColumns} data={currentReport.topTests} />
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Tests: {currentReport.totalTests}
            </span>
          </div>
        </div>

        {/* Doctor Performance Table */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users size={20} className="text-indigo-600" />
              Doctor Performance
            </h3>
          </div>
          <Table columns={doctorColumns} data={currentReport.doctorStats} />
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Doctors: {currentReport.doctorStats.length}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Mode Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Cash Collection */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-400/30 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <span className="text-green-700 font-bold text-xs uppercase tracking-wider">Cash</span>
          </div>
          <div className="text-xl font-black text-green-600">{formatCurrency(currentReport.cashCollection)}</div>
        </div>

        {/* Card Collection */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/30 flex items-center justify-center">
              <CreditCard size={20} className="text-blue-600" />
            </div>
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Card</span>
          </div>
          <div className="text-xl font-black text-blue-600">{formatCurrency(currentReport.cardCollection)}</div>
        </div>

        {/* UPI Collection */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-400/30 flex items-center justify-center">
              <Smartphone size={20} className="text-purple-600" />
            </div>
            <span className="text-purple-700 font-bold text-xs uppercase tracking-wider">UPI</span>
          </div>
          <div className="text-xl font-black text-purple-600">{formatCurrency(currentReport.upiCollection)}</div>
        </div>

        {/* Bank Transfer Collection */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
              <BankIcon size={20} className="text-amber-600" />
            </div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Bank</span>
          </div>
          <div className="text-xl font-black text-amber-600">
            {formatCurrency(currentReport.bankTransferCollection)}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Calendar size={16} />
            <span>Report Generated: {new Date(currentReport.generatedAt).toLocaleString('en-IN')}</span>
          </div>
          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 border font-bold">
            Report ID: MIS-{currentReport.id}
          </Badge>
        </div>
      </div>

      {/* Add New Report Modal */}
      {isAddModalOpen && (
        <AddNewMISReport
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleAddNew}
        />
      )}
    </div>
  );
}
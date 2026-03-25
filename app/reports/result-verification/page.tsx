'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Modal from '@/components/ui/modal';
import {filterdata} from './filter';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FlaskConical, 
  Clock, 
  FileCheck,
  Edit2,
  Save,
  RotateCcw,
  Filter,
  ChevronDown,
  Activity,
  TestTube,
  User,
  Calendar,
  Microscope
} from 'lucide-react';

interface PendingResult {
  id: number;
  patientName: string;
  patientId: string;
  testCode: string;
  testName: string;
  machineValue: string | number;
  modifiedValue?: string | number;
  unit: string;
  referenceRange: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  collectedAt: string;
  receivedAt: string;
  machineName: string;
  technician?: string;
  priority: 'Routine' | 'Urgent' | 'STAT';
  department: string;
  flag?: 'H' | 'L' | 'HH' | 'LL' | '';
}

const SAMPLE_RESULTS: PendingResult[] = [
  {
    id: 1,
    patientName: 'Rajesh Kumar',
    patientId: 'P001234',
    testCode: 'GLU',
    testName: 'Blood Glucose (Fasting)',
    machineValue: 450,
    modifiedValue: 425,
    unit: 'mg/dL',
    referenceRange: '70-100',
    status: 'Pending',
    collectedAt: '2024-01-15T08:30:00',
    receivedAt: '2024-01-15T09:15:00',
    machineName: 'Roche Cobas c501',
    technician: 'Dr. Anita Sharma',
    priority: 'STAT',
    department: 'Biochemistry',
    flag: 'H'
  },
  {
    id: 2,
    patientName: 'Sunita Devi',
    patientId: 'P001235',
    testCode: 'HBA1C',
    testName: 'Glycated Hemoglobin',
    machineValue: 8.2,
    unit: '%',
    referenceRange: '4.0-5.6',
    status: 'Pending',
    collectedAt: '2024-01-15T09:00:00',
    receivedAt: '2024-01-15T09:45:00',
    machineName: 'Bio-Rad D-10',
    priority: 'Urgent',
    department: 'Biochemistry',
    flag: 'H'
  },
  {
    id: 3,
    patientName: 'Mohammad Ali',
    patientId: 'P001236',
    testCode: 'CBC',
    testName: 'Complete Blood Count - WBC',
    machineValue: 12500,
    unit: '/µL',
    referenceRange: '4000-11000',
    status: 'Pending',
    collectedAt: '2024-01-15T09:30:00',
    receivedAt: '2024-01-15T10:00:00',
    machineName: 'Sysmex XN-1000',
    priority: 'Routine',
    department: 'Hematology',
    flag: 'H'
  },
  {
    id: 4,
    patientName: 'Anita Singh',
    patientId: 'P001237',
    testCode: 'TSH',
    testName: 'Thyroid Stimulating Hormone',
    machineValue: 0.15,
    unit: 'mIU/L',
    referenceRange: '0.4-4.0',
    status: 'Pending',
    collectedAt: '2024-01-15T10:00:00',
    receivedAt: '2024-01-15T10:30:00',
    machineName: 'Abbott Architect i2000',
    priority: 'Routine',
    department: 'Endocrinology',
    flag: 'L'
  },
  {
    id: 5,
    patientName: 'Vikram Malhotra',
    patientId: 'P001238',
    testCode: 'CREAT',
    testName: 'Serum Creatinine',
    machineValue: 2.8,
    modifiedValue: 2.5,
    unit: 'mg/dL',
    referenceRange: '0.7-1.3',
    status: 'Pending',
    collectedAt: '2024-01-15T10:30:00',
    receivedAt: '2024-01-15T11:00:00',
    machineName: 'Siemens Dimension EXL',
    technician: 'Mr. Ramesh Patel',
    priority: 'Urgent',
    department: 'Biochemistry',
    flag: 'HH'
  },
];

export default function ResultVerificationPage() {
  const [results, setResults] = useState<PendingResult[]>(SAMPLE_RESULTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [selectedResult, setSelectedResult] = useState<PendingResult | null>(null);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyValue, setVerifyValue] = useState<string | number>('');
  const [verifyNotes, setVerifyNotes] = useState('');

  const filteredResults = results.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'All' || result.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || result.priority === filterPriority;
    const matchesDepartment = filterDepartment === 'All' || result.department === filterDepartment;

    return matchesSearch && matchesStatus && matchesPriority && matchesDepartment;
  });

  const handleVerifyClick = (result: PendingResult) => {
    setSelectedResult(result);
    setVerifyValue(result.modifiedValue || result.machineValue);
    setVerifyNotes('');
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerification = () => {
    if (!selectedResult) return;

    const updatedResults = results.map(r => 
      r.id === selectedResult.id 
        ? { 
            ...r, 
            status: 'Verified' as const,
            modifiedValue: verifyValue,
            verifiedAt: new Date().toISOString(),
            verifiedBy: 'Current User'
          }
        : r
    );

    setResults(updatedResults);
    setIsVerifyModalOpen(false);
    setSelectedResult(null);
  };

  const handleRejectResult = (result: PendingResult) => {
    const updatedResults = results.map(r => 
      r.id === result.id 
        ? { ...r, status: 'Rejected' as const, rejectedAt: new Date().toISOString() }
        : r
    );
    setResults(updatedResults);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'STAT': return 'bg-rose-500 text-white';
      case 'Urgent': return 'bg-orange-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getFlagColor = (flag: string) => {
    switch (flag) {
      case 'H': case 'L': return 'bg-amber-500 text-white';
      case 'HH': case 'LL': return 'bg-rose-600 text-white';
      default: return 'bg-slate-300 text-slate-700';
    }
  };

  const columns = [
    { 
      key: 'testCode', 
      label: 'Test Info',
      width: '200px',
      render: (_: any, row: PendingResult) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-slate-900">{row.testCode}</span>
            {row.flag && (
              <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black ${getFlagColor(row.flag)}`}>
                {row.flag}
              </span>
            )}
          </div>
          <div className="text-xs font-semibold text-slate-500">{row.testName}</div>
        </div>
      )
    },
    { 
      key: 'patientName', 
      label: 'Patient',
      render: (_: any, row: PendingResult) => (
        <div>
          <div className="font-bold text-slate-900">{row.patientName}</div>
          <div className="text-xs font-semibold text-slate-500">{row.patientId}</div>
        </div>
      )
    },
    { 
      key: 'machineValue', 
      label: 'Machine Value',
      render: (value: any, row: PendingResult) => (
        <div>
          <div className="font-bold text-slate-900">{value} {row.unit}</div>
          <div className="text-[10px] font-semibold text-slate-400">Ref: {row.referenceRange}</div>
        </div>
      )
    },
    { 
      key: 'modifiedValue', 
      label: 'Modified Value',
      render: (value: any, row: PendingResult) => (
        value ? (
          <div className="flex items-center gap-2">
            <Edit2 size={12} className="text-blue-500" />
            <span className="font-bold text-blue-600">{value} {row.unit}</span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs font-semibold">-</span>
        )
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string, row: PendingResult) => (
        <Badge className={`${getStatusColor(value)} border font-bold`}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'priority', 
      label: 'Priority',
      render: (value: string) => (
        <Badge className={`${getPriorityColor(value)} border-0 font-bold px-3 py-1`}>
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      align: 'right',
      render: (_: any, row: PendingResult) => (
        <div className="flex gap-2 justify-end">
          {row.status === 'Pending' && (
            <>
              <button
                onClick={() => handleVerifyClick(row)}
                className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Verify & Approve"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => handleRejectResult(row)}
                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                title="Reject"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
          {row.status === 'Verified' && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle size={14} /> Verified
            </span>
          )}
          {row.status === 'Rejected' && (
            <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
              <XCircle size={14} /> Rejected
            </span>
          )}
        </div>
      )
    },
  ];

  const stats = {
    pending: results.filter(r => r.status === 'Pending').length,
    verified: results.filter(r => r.status === 'Verified').length,
    rejected: results.filter(r => r.status === 'Rejected').length,
    stat: results.filter(r => r.priority === 'STAT' && r.status === 'Pending').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="from-emerald-600 via-teal-600 to-blue-600 text-white p-8 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              Result <span className="text-emerald-200">Verification</span>
            </h1>
            <p className="text-emerald-100 text-sm font-medium max-w-xl">
              Review and verify laboratory test results before release
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mx-8 mt-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
              <Clock size={20} className="text-amber-200" />
            </div>
            <span className="text-amber-100 font-bold text-xs uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-3xl font-black">{stats.pending}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-200" />
            </div>
            <span className="text-emerald-100 font-bold text-xs uppercase tracking-wider">Verified</span>
          </div>
          <div className="text-3xl font-black">{stats.verified}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-400/30 flex items-center justify-center">
              <XCircle size={20} className="text-rose-200" />
            </div>
            <span className="text-rose-100 font-bold text-xs uppercase tracking-wider">Rejected</span>
          </div>
          <div className="text-3xl font-black">{stats.rejected}</div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-400/30 flex items-center justify-center">
              <Activity size={20} className="text-red-200" />
            </div>
            <span className="text-red-100 font-bold text-xs uppercase tracking-wider">STAT Pending</span>
          </div>
          <div className="text-3xl font-black">{stats.stat}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-8 mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient, ID, or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium appearance-none bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium appearance-none bg-white"
          >
            <option value="All">All Priorities</option>
            <option value="STAT">STAT</option>
            <option value="Urgent">Urgent</option>
            <option value="Routine">Routine</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium appearance-none bg-white"
          >
            <option value="All">All Departments</option>
            <option value="Biochemistry">Biochemistry</option>
            <option value="Hematology">Hematology</option>
            <option value="Endocrinology">Endocrinology</option>
            <option value="Immunology">Immunology</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mx-8 mt-6 mb-8">
        <Table
          columns={columns}
          data={filteredResults}
        />
      </div>

      {/* Verification Modal */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={
          <>
            Verify <span className="text-emerald-600">Result</span>
          </>
        }
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsVerifyModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              onClick={handleConfirmVerification}
              className="flex-1 gap-2"
            >
              <CheckCircle size={16} /> Confirm Verification
            </Button>
          </div>
        }
      >
        {selectedResult && (
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <User size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Patient Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Patient Name</div>
                  <div className="text-sm font-bold text-slate-900">{selectedResult.patientName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Patient ID</div>
                  <div className="text-sm font-bold text-slate-900">{selectedResult.patientId}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Test Name</div>
                  <div className="text-sm font-bold text-slate-900">{selectedResult.testName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Department</div>
                  <div className="text-sm font-bold text-slate-900">{selectedResult.department}</div>
                </div>
              </div>
            </div>

            {/* Result Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Microscope size={16} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider">Machine Result</h3>
                </div>
                <div className="text-2xl font-black text-blue-900 mb-1">
                  {selectedResult.machineValue} <span className="text-sm font-bold">{selectedResult.unit}</span>
                </div>
                <div className="text-xs font-semibold text-blue-600">
                  Ref Range: {selectedResult.referenceRange}
                </div>
                {selectedResult.flag && (
                  <div className={`inline-block mt-2 px-2 py-1 rounded text-[10px] font-black ${getFlagColor(selectedResult.flag)}`}>
                    Flag: {selectedResult.flag}
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck size={16} className="text-emerald-600" />
                  <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Final Verified Value</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={verifyValue}
                    onChange={(e) => setVerifyValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-emerald-900"
                  />
                  <span className="text-sm font-bold text-emerald-700">{selectedResult.unit}</span>
                </div>
                <div className="text-xs font-semibold text-emerald-600">
                  Ref Range: {selectedResult.referenceRange}
                </div>
              </div>
            </div>

            {/* Machine Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <FlaskConical size={18} className="text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Machine Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Machine Name</div>
                  <div className="text-sm font-bold text-slate-900">{selectedResult.machineName}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500 mb-0.5">Received At</div>
                  <div className="text-sm font-bold text-slate-900">
                    {new Date(selectedResult.receivedAt).toLocaleString()}
                  </div>
                </div>
                {selectedResult.technician && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-0.5">Technician</div>
                    <div className="text-sm font-bold text-slate-900">{selectedResult.technician}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Verification Notes (Optional)
              </label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Add any notes about this verification..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium resize-none"
              />
            </div>

            {/* Warning for critical values */}
            {(selectedResult.flag === 'HH' || selectedResult.flag === 'LL') && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-700 mb-1">Critical Value Alert</h4>
                  <p className="text-xs text-rose-600">
                    This result is critically high/low. Please ensure proper clinical correlation and consider immediate notification to the treating physician.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
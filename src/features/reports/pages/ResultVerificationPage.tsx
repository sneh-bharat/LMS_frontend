'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  FlaskConical,
  Clock,
  FileCheck,
  Edit2,
  Filter,
  Activity,
  User,
  Microscope,
  ChevronRight
} from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  Card,
  Label,
  RightDrawer,
  Table
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const columns = [
    {
      key: 'testCode',
      label: 'Test Info',
      width: '200px',
      render: (_: any, row: PendingResult) => (
        <div className="py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-black text-slate-900">{row.testCode}</span>
            {row.flag && (
              <Badge variant={row.flag.includes('H') ? 'danger' : 'warning'} size="sm" className="px-1.5 h-5 min-w-[20px] justify-center rounded-md font-black">
                {row.flag}
              </Badge>
            )}
          </div>
          <div className="text-[11px] font-bold text-slate-500 leading-tight">{row.testName}</div>
        </div>
      )
    },
    {
      key: 'patientName',
      label: 'Patient',
      render: (_: any, row: PendingResult) => (
        <div className="py-1">
          <div className="font-black text-slate-900">{row.patientName}</div>
          <div className="text-[11px] font-bold text-slate-400">ID: {row.patientId}</div>
        </div>
      )
    },
    {
      key: 'machineValue',
      label: 'Machine Value',
      render: (value: any, row: PendingResult) => (
        <div className="py-1">
          <div className="font-black text-slate-900">{value} <span className="text-[10px] text-slate-400 uppercase">{row.unit}</span></div>
          <div className="text-[10px] font-bold text-slate-400">Ref: {row.referenceRange}</div>
        </div>
      )
    },
    {
      key: 'modifiedValue',
      label: 'Modified Value',
      render: (value: any, row: PendingResult) => (
        value ? (
          <div className="flex items-center gap-2 py-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Edit2 size={12} />
            </div>
            <span className="font-black text-emerald-600">{value} <span className="text-[10px] uppercase opacity-70">{row.unit}</span></span>
          </div>
        ) : (
          <span className="text-slate-300 font-bold">-</span>
        )
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'Verified' ? 'success' : value === 'Rejected' ? 'danger' : 'warning'} className="font-black">
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${value === 'Verified' ? 'bg-emerald-500' : value === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
          {value}
        </Badge>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value: string) => (
        <Badge variant={value === 'STAT' ? 'danger' : value === 'Urgent' ? 'warning' : 'secondary'} className="font-black">
          {value}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      align: 'right' as const,
      render: (_: any, row: PendingResult) => (
        <div className="flex gap-2 justify-end">
          {row.status === 'Pending' && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleVerifyClick(row)}
                className="text-emerald-600 hover:bg-emerald-50 rounded-xl"
                title="Verify & Approve"
              >
                <CheckCircle size={18} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRejectResult(row)}
                className="text-rose-600 hover:bg-rose-50 rounded-xl"
                title="Reject"
              >
                <XCircle size={18} />
              </Button>
            </>
          )}
          {row.status !== 'Pending' && (
            <div className="flex items-center gap-2 group cursor-pointer">
              <Button variant="outline" size="icon-sm" className="rounded-xl p-2 h-9 w-9">
                <ChevronRight size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </Button>
            </div>
          )}
        </div>
      )
    },
  ];

  const stats = [
    { label: 'Pending', value: results.filter(r => r.status === 'Pending').length, icon: Clock, color: 'amber' },
    { label: 'Verified', value: results.filter(r => r.status === 'Verified').length, icon: CheckCircle, color: 'emerald' },
    { label: 'Rejected', value: results.filter(r => r.status === 'Rejected').length, icon: XCircle, color: 'rose' },
    { label: 'STAT Pending', value: results.filter(r => r.priority === 'STAT' && r.status === 'Pending').length, icon: Activity, color: 'red' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Result <span className="text-gradient">Verification</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Review and verify laboratory test results before official release to patients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-2xl h-12 shadow-sm">
            <Filter size={18} />
            Advanced
          </Button>
          <Button variant="gradient" className="gap-2 shadow-xl shadow-green-500/20 px-6 h-12">
            <FileCheck size={18} />
            Quick Verify
          </Button>
        </div>
      </div>

      {/* ═══ STATS CARDS ════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6 transition-all hover:shadow-xl hover:-translate-y-1 group">
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600 group-hover:bg-gradient-to-br transition-all duration-500`}>
                <stat.icon size={24} />
              </div>
              <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-tighter">Live</Badge>
            </div>
            <div className="mt-4">
              <div className={`text-3xl font-black text-slate-900`}>{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <div className="glass p-4 rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col lg:grid lg:grid-cols-4 items-center gap-4">
        <div className="relative group col-span-1 lg:col-span-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors z-10" size={20} />
          <Input
            type="text"
            placeholder="Search patient, ID, test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-white/50 border-slate-200/60"
          />
        </div>

        <div className="w-full">
          <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value ?? '')}>
            <SelectTrigger className="h-12 rounded-2xl bg-white/50 border-slate-200/60 font-bold">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Verified">Verified</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value ?? '')}>
            <SelectTrigger className="h-12 rounded-2xl bg-white/50 border-slate-200/60 font-bold">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="STAT">STAT</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <Select value={filterDepartment} onValueChange={(value) => setFilterDepartment(value ?? '')}>
            <SelectTrigger className="h-12 rounded-2xl bg-white/50 border-slate-200/60 font-bold">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              <SelectItem value="Biochemistry">Biochemistry</SelectItem>
              <SelectItem value="Hematology">Hematology</SelectItem>
              <SelectItem value="Endocrinology">Endocrinology</SelectItem>
              <SelectItem value="Immunology">Immunology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ═══ CONTENT ════════════════════════════════════════════ */}
      <div className="glass rounded-[3rem] overflow-hidden border border-white/40 shadow-2xl transition-all">
        <Table
          columns={columns}
          data={filteredResults}
        />
      </div>

      {/* Verification Drawer */}
      <RightDrawer
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title={selectedResult ? `Verify ${selectedResult.testCode}` : 'Verify Result'}
        description={selectedResult ? `Patient: ${selectedResult.patientName}` : "Review and verify the test result before official release."}
        footer={
          <div className="flex w-full gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" className="flex-1 gap-2" onClick={handleConfirmVerification}>
              <CheckCircle size={18} /> Verify Result
            </Button>
          </div>
        }
      >
        {selectedResult && (
          <div className="space-y-8 pb-8">
            {/* Patient Summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                  <User size={20} />
                </div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Patient Context</h3>
              </div>
              <div className="grid grid-cols-2 gap-y-6">
                <div>
                  <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Full Name</Label>
                  <div className="font-black text-slate-900">{selectedResult.patientName}</div>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Patient ID</Label>
                  <div className="font-black text-slate-900">{selectedResult.patientId}</div>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Test</Label>
                  <div className="font-black text-slate-900">{selectedResult.testName}</div>
                </div>
                <div>
                  <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 block">Department</Label>
                  <div className="font-black text-slate-900 text-emerald-600">{selectedResult.department}</div>
                </div>
              </div>
            </div>

            {/* Comparative Analysis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-6 bg-slate-50/50 border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Microscope size={16} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Machine Data</span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {selectedResult.machineValue} <span className="text-sm font-bold text-slate-400 uppercase">{selectedResult.unit}</span>
                </div>
                <div className="mt-2 text-xs font-bold text-slate-500">Ref: {selectedResult.referenceRange}</div>
                {selectedResult.flag && (
                  <Badge variant="danger" className="mt-4 px-2 py-0.5 font-black text-[9px] uppercase">FLAG: {selectedResult.flag}</Badge>
                )}
              </Card>

              <Card className="p-6 border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck size={16} className="text-emerald-600" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Value</span>
                </div>
                <div className="flex items-end gap-2">
                  <Input
                    type="text"
                    value={verifyValue}
                    onChange={(e) => setVerifyValue(e.target.value)}
                    className="h-12 text-2xl font-black text-emerald-700 bg-white border-emerald-200 focus:ring-emerald-500/10"
                  />
                  <span className="text-sm font-black text-emerald-600 mb-2 uppercase">{selectedResult.unit}</span>
                </div>
                <div className="mt-2 text-[10px] font-black text-emerald-500 opacity-70 uppercase">Manually Adjusted</div>
              </Card>
            </div>

            {/* Machine Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <FlaskConical size={16} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equipment Log</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Source:</span>
                  <span className="font-black text-slate-900">{selectedResult.machineName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-500">Timestamp:</span>
                  <span className="font-black text-slate-600 underline underline-offset-4 decoration-slate-100">
                    {new Date(selectedResult.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <Label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-2 block">Clinical Observations</Label>
              <textarea
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder="Add any relevant observations..."
                className="w-full p-5 rounded-[2rem] border border-slate-100 bg-slate-50/50 text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-300 outline-none min-h-[120px] transition-all"
              />
            </div>

            {/* Critical Alert */}
            {(selectedResult.flag === 'HH' || selectedResult.flag === 'LL' || selectedResult.priority === 'STAT') && (
              <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-6 flex gap-4 animate-pulse">
                <AlertCircle className="text-rose-600 shrink-0 mt-1" size={24} />
                <div>
                  <div className="text-sm font-black text-rose-900 uppercase">Critical Action Required</div>
                  <p className="text-xs font-bold text-rose-600 leading-relaxed mt-1">
                    High-criticality result. Ensure physician notification is documented before release.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </RightDrawer>
    </div>
  );
}

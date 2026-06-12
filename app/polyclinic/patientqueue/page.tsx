
'use client';

import { useState, useEffect } from 'react';
import Table from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, Clock, CheckCircle, XCircle, Play, Check, X, RefreshCw, Calendar, Activity } from 'lucide-react';
import { QueuePatient, QueueStats, DoctorInfo, QueueStatus } from './types';
import AddQueueModal from './AddQueueModal';

function getStatusColor(status: QueueStatus): string {
  const colors: Record<QueueStatus, string> = {
    'Waiting': 'bg-amber-100 text-amber-700 border-amber-200',
    'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
    'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Cancelled': 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return colors[status] || colors['Waiting'];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

export default function PatientQueuePage() {
  const [patients, setPatients] = useState<QueuePatient[]>([
    {
      id: 1,
      tokenNumber: 'T001',
      patientName: 'Ramesh Gupta',
      mobile: '9876543210',
      department: 'Cardiology',
      doctorId: 1,
      doctorName: 'Dr. Rajesh Kumar',
      visitType: 'OPD',
      status: 'In Progress',
      checkInTime: '2024-01-15T09:30:00',
      consultationStartTime: '2024-01-15T10:15:00',
      createdAt: '2024-01-15T09:30:00',
    },
    {
      id: 2,
      tokenNumber: 'T002',
      patientName: 'Sunita Devi',
      mobile: '9123456789',
      department: 'Orthopedics',
      doctorId: 2,
      doctorName: 'Dr. Priya Sharma',
      visitType: 'Follow-up',
      status: 'Waiting',
      checkInTime: '2024-01-15T09:45:00',
      createdAt: '2024-01-15T09:45:00',
    },
    {
      id: 3,
      tokenNumber: 'T003',
      patientName: 'Mohammad Ali',
      mobile: '8765432109',
      department: 'Neurology',
      doctorId: 3,
      doctorName: 'Dr. Amit Patel',
      visitType: 'OPD',
      status: 'Waiting',
      checkInTime: '2024-01-15T10:00:00',
      createdAt: '2024-01-15T10:00:00',
    },
    {
      id: 4,
      tokenNumber: 'T004',
      patientName: 'Anita Singh',
      mobile: '7890123456',
      department: 'Pediatrics',
      doctorId: 4,
      doctorName: 'Dr. Sunita Reddy',
      visitType: 'Diagnostic',
      status: 'Completed',
      checkInTime: '2024-01-15T08:30:00',
      consultationStartTime: '2024-01-15T09:00:00',
      consultationEndTime: '2024-01-15T09:30:00',
      createdAt: '2024-01-15T08:30:00',
    },
    {
      id: 5,
      tokenNumber: 'T005',
      patientName: 'Kiran Kumar',
      mobile: '9988776655',
      department: 'General Medicine',
      doctorId: 5,
      doctorName: 'Dr. Vikram Singh',
      visitType: 'Emergency',
      status: 'Cancelled',
      checkInTime: '2024-01-15T11:00:00',
      createdAt: '2024-01-15T11:00:00',
    },
  ]);
  const [stats, setStats] = useState<QueueStats>({
    waiting: 2,
    inProgress: 1,
    completed: 1,
    cancelled: 1,
    currentToken: 'T001',
    nextToken: 'T002',
  });
  const [doctors] = useState<DoctorInfo[]>([
    { id: 1, name: 'Dr. Rajesh Kumar', department: 'Cardiology', specialization: 'Cardiologist' },
    { id: 2, name: 'Dr. Priya Sharma', department: 'Orthopedics', specialization: 'Orthopedic Surgeon' },
    { id: 3, name: 'Dr. Amit Patel', department: 'Neurology', specialization: 'Neurologist' },
    { id: 4, name: 'Dr. Sunita Reddy', department: 'Pediatrics', specialization: 'Pediatrician' },
    { id: 5, name: 'Dr. Vikram Singh', department: 'General Medicine', specialization: 'Physician' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, call API here to refresh data
      // For demo, just update stats
      updateStats();
    }, 15000);

    return () => clearInterval(interval);
  }, [patients]);

  const updateStats = () => {
    const waiting = patients.filter(p => p.status === 'Waiting').length;
    const inProgress = patients.filter(p => p.status === 'In Progress').length;
    const completed = patients.filter(p => p.status === 'Completed').length;
    const cancelled = patients.filter(p => p.status === 'Cancelled').length;
    
    const waitingPatients = patients.filter(p => p.status === 'Waiting');
    const currentToken = patients.find(p => p.status === 'In Progress')?.tokenNumber || '-';
    const nextToken = waitingPatients.length > 0 ? waitingPatients[0].tokenNumber : '-';

    setStats({
      waiting,
      inProgress,
      completed,
      cancelled,
      currentToken,
      nextToken,
    });
  };

  const handleAddToQueue = (data: any) => {
    const doctor = doctors.find(d => d.id === data.doctorId);
    const newPatient: QueuePatient = {
      id: patients.length + 1,
      tokenNumber: `T${String(patients.length + 1).padStart(3, '0')}`,
      patientName: data.patientName,
      mobile: data.mobile,
      department: data.department,
      doctorId: data.doctorId,
      doctorName: doctor?.name || '',
      visitType: data.visitType,
      status: 'Waiting',
      checkInTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setPatients([...patients, newPatient]);
    playNotificationSound();
    updateStats();
  };

  const handleStartConsultation = (patient: QueuePatient) => {
    setPatients(patients.map(p => 
      p.id === patient.id 
        ? { ...p, status: 'In Progress', consultationStartTime: new Date().toISOString() }
        : p
    ));
    updateStats();
  };

  const handleCompleteConsultation = (patient: QueuePatient) => {
    setPatients(patients.map(p => 
      p.id === patient.id 
        ? { ...p, status: 'Completed', consultationEndTime: new Date().toISOString() }
        : p
    ));
    updateStats();
  };

  const handleCancelConsultation = (patient: QueuePatient) => {
    setPatients(patients.map(p => 
      p.id === patient.id 
        ? { ...p, status: 'Cancelled' }
        : p
    ));
    updateStats();
  };

  const playNotificationSound = () => {
    // Simple beep sound using Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchQuery === '' || 
      patient.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mobile.includes(searchQuery) ||
      patient.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDoctor = filterDoctor === '' || patient.doctorId.toString() === filterDoctor;
    const matchesStatus = filterStatus === '' || patient.status === filterStatus;
    const matchesDepartment = filterDepartment === '' || patient.department === filterDepartment;

    return matchesSearch && matchesDoctor && matchesStatus && matchesDepartment;
  });

  const columns = [
    { 
      key: 'tokenNumber', 
      label: 'Token', 
      width: '80px',
      render: (value: string) => (
        <span className="font-black text-emerald-600">{value}</span>
      )
    },
    { 
      key: 'patientName', 
      label: 'Patient Name',
      render: (value: string, row: QueuePatient) => (
        <div>
          <div className="font-bold text-slate-900">{value}</div>
          <div className="text-xs font-semibold text-slate-500">{row.mobile}</div>
        </div>
      )
    },
    { 
      key: 'doctorName', 
      label: 'Doctor',
      render: (value: string, row: QueuePatient) => (
        <div>
          <div className="font-bold text-slate-900">{value}</div>
          <div className="text-xs font-semibold text-slate-500">{row.department}</div>
        </div>
      )
    },
    { 
      key: 'visitType', 
      label: 'Visit Type',
      render: (value: string) => (
        <Badge variant={value === 'Emergency' ? 'destructive' : 'secondary'} className="text-xs">
          {value}
        </Badge>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: QueueStatus) => (
        <Badge className={`${getStatusColor(value)} border font-bold`}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'checkInTime', 
      label: 'Check-in Time',
      render: (value: string, row: QueuePatient) => (
        <div>
          <div className="font-bold text-slate-900">{formatDate(value)}</div>
          {row.consultationStartTime && (
            <div className="text-[10px] font-semibold text-emerald-600">
              Started: {formatDate(row.consultationStartTime)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '200px',
      align: 'right' as const,
      render: (_: any, row: QueuePatient) => (
        <div className="flex gap-2 justify-end">
          {row.status === 'Waiting' && (
            <button
              onClick={() => handleStartConsultation(row)}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Start Consultation"
            >
              <Play size={16} />
            </button>
          )}
          {row.status === 'In Progress' && (
            <button
              onClick={() => handleCompleteConsultation(row)}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
              title="Complete Consultation"
            >
              <Check size={16} />
            </button>
          )}
          {(row.status === 'Waiting' || row.status === 'In Progress') && (
            <button
              onClick={() => handleCancelConsultation(row)}
              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          )}
          {row.status === 'Completed' && (
            <span className="text-xs font-bold text-emerald-600">Completed</span>
          )}
          {row.status === 'Cancelled' && (
            <span className="text-xs font-bold text-rose-600">Cancelled</span>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
        <div className="from-emerald-600 via-teal-600 to-blue-600 text-white p-8 shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
                    Patient <span className="text-emerald-600">Queue Management</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-xl">
                    Manage OPD patient queue and consultations
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
                    
                    >
                    <Plus size={20} />
                    Add Patient
                    </button>
                </div>
            </div>
        </div>  

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
            { label: 'Total Patients', value: patients.length, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'In Progress', value: patients.filter(p => p.status === 'In Progress').length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Completed', value: patients.filter(p => p.status === 'Completed').length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Cancelled', value: patients.filter(p => p.status === 'Cancelled').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
                </div>
                <div>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
                </div>
            </div>
            ))}
        </div>

      {/* Current Token Banner */}
      <div className="mx-8 mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play size={32} />
            </div>
            <div>
              <div className="text-emerald-100 font-bold text-xs uppercase tracking-wider mb-1">Current Token</div>
              <div className="text-4xl font-black">{stats.currentToken}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <RefreshCw size={32} />
            </div>
            <div>
              <div className="text-emerald-100 font-bold text-xs uppercase tracking-wider mb-1">Next Token</div>
              <div className="text-4xl font-black">{stats.nextToken}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-8 mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, mobile, or token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium"
            />
          </div>

          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium appearance-none bg-white"
          >
            <option value="">All Doctors</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none font-medium appearance-none bg-white"
          >
            <option value="">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mx-8 mt-6 mb-8">
        <Table
          columns={columns}
          data={filteredPatients}
        />
      </div>

      {/* Add Patient Modal */}
      <AddQueueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddToQueue}
        doctors={doctors}
      />
    </div>
  );
}
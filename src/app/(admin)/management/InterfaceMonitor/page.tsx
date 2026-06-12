'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Filter,
  AlertCircle,
  Server,
  FileText,
  Calendar,
} from 'lucide-react';
import Table from '@/components/ui/table';

export interface InterfaceLog {
  id: number;

  // Machine Info
  machineId: number;
  machineName: string;
  machineType: 'Hematology' | 'Biochemistry' | 'Immunoassay' | 'Other';

  // Sample / Patient Info
  sampleId: string;
  patientId?: number;
  patientName?: string;

  // Test Info
  testName: string;
  parameter?: string;

  // Data Flow
  direction: 'INBOUND' | 'OUTBOUND';

  // Result Data
  machineValue?: string;
  unit?: string;

  // Status
  status: 'Success' | 'Pending' | 'Failed';

  // Error Handling
  errorMessage?: string;
  retryCount?: number;

  // Timestamps
  receivedAt: string;
  processedAt?: string;

  // Raw Data
  rawPayload?: string;
}

export const SAMPLE_INTERFACE_LOGS: InterfaceLog[] = [
  {
    id: 1,
    machineId: 101,
    machineName: 'Sysmex XN-1000',
    machineType: 'Hematology',
    sampleId: 'SMP-001',
    patientId: 201,
    patientName: 'Rahul Sharma',
    testName: 'Complete Blood Count',
    parameter: 'Hemoglobin',
    direction: 'INBOUND',
    machineValue: '13.5',
    unit: 'g/dL',
    status: 'Success',
    receivedAt: '2026-03-25T10:00:00Z',
    processedAt: '2026-03-25T10:00:02Z',
  },
  {
    id: 2,
    machineId: 102,
    machineName: 'Cobas 6000',
    machineType: 'Biochemistry',
    sampleId: 'SMP-002',
    patientName: 'Priya Das',
    testName: 'Glucose',
    direction: 'INBOUND',
    machineValue: '180',
    unit: 'mg/dL',
    status: 'Failed',
    errorMessage: 'Invalid data format',
    retryCount: 2,
    receivedAt: '2026-03-25T11:15:00Z',
  },
  {
    id: 3,
    machineId: 103,
    machineName: 'Abbott Architect',
    machineType: 'Immunoassay',
    sampleId: 'SMP-003',
    testName: 'Thyroid Test',
    direction: 'OUTBOUND',
    status: 'Pending',
    receivedAt: '2026-03-25T12:30:00Z',
  },
  {
    id: 4,
    machineId: 101,
    machineName: 'Sysmex XN-1000',
    machineType: 'Hematology',
    sampleId: 'SMP-004',
    patientName: 'Amit Kumar',
    testName: 'CBC',
    parameter: 'WBC',
    direction: 'INBOUND',
    machineValue: '7500',
    unit: 'cells/μL',
    status: 'Success',
    receivedAt: '2026-03-25T13:00:00Z',
    processedAt: '2026-03-25T13:00:01Z',
  },
  {
    id: 5,
    machineId: 104,
    machineName: 'Beckman Coulter',
    machineType: 'Other',
    sampleId: 'SMP-005',
    testName: 'Electrolytes',
    direction: 'INBOUND',
    status: 'Pending',
    receivedAt: '2026-03-25T14:00:00Z',
  },
];

export default function InterfaceMonitorPage() {
  const [logs, setLogs] = useState<InterfaceLog[]>(SAMPLE_INTERFACE_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [machineFilter, setMachineFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<InterfaceLog | null>(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshLogs = () => {
    // Simulate fetching new logs (replace with actual API call)
    setLastRefreshed(new Date());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle size={18} className="text-emerald-600" />;
      case 'Failed':
        return <XCircle size={18} className="text-rose-600" />;
      case 'Pending':
        return <Clock size={18} className="text-amber-600" />;
      default:
        return <Activity size={18} className="text-slate-600" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Failed':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getDirectionBadgeClass = (direction: string) => {
    return direction === 'INBOUND'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-purple-100 text-purple-700 border-purple-200';
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.machineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sampleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.patientName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || log.status === statusFilter;

    const matchesMachine =
      machineFilter === 'All' || log.machineName === machineFilter;

    const matchesDate =
      !dateFilter ||
      log.receivedAt.startsWith(dateFilter);

    return matchesSearch && matchesStatus && matchesMachine && matchesDate;
  });

  const uniqueMachines = Array.from(
    new Set(logs.map((log) => log.machineName))
  );

  const columns = [
    {
      key: 'machineName',
      label: 'Machine Name',
      render: (value: string, row: InterfaceLog) => (
        <div>
          <div className="font-bold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{row.machineType}</div>
        </div>
      ),
    },
    {
      key: 'testName',
      label: 'Test / Parameter',
      render: (value: string, row: InterfaceLog) => (
        <div>
          <div className="font-bold text-slate-900">{value}</div>
          {row.parameter && (
            <div className="text-xs text-slate-500">{row.parameter}</div>
          )}
        </div>
      ),
    },
    {
      key: 'sampleId',
      label: 'Sample ID',
      render: (value: string, row: InterfaceLog) => (
        <div className="font-bold text-slate-900">
          <FileText size={14} className="inline mr-1" />
          {value}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
            value
          )}`}
        >
          {getStatusIcon(value)}
          {value}
        </span>
      ),
    },
    {
      key: 'direction',
      label: 'Direction',
      render: (value: string) => (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getDirectionBadgeClass(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'receivedAt',
      label: 'Date & Time',
      render: (value: string) => (
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Calendar size={14} className="text-slate-400" />
          {new Date(value).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: InterfaceLog) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLog(row)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="View Details"
          >
            <Eye size={16} className="text-slate-600" />
          </button>
          {row.status === 'Failed' && (
            <button
              className="p-2 rounded-lg hover:bg-emerald-50 transition-colors"
              title="Retry"
            >
              <RefreshCw size={16} className="text-emerald-600" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.status === 'Success').length,
    failed: logs.filter((l) => l.status === 'Failed').length,
    pending: logs.filter((l) => l.status === 'Pending').length,
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Server size={28} className="text-indigo-600" />
            Interface Monitor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time machine integration monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <RefreshCw
              size={16}
              className={`text-slate-600 ${
                autoRefresh ? 'animate-spin' : ''
              }`}
            />
            <span className="text-sm font-bold text-slate-700">
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="ml-2 text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              Toggle
            </button>
          </div>
          <button
            onClick={refreshLogs}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors"
          >
            <RefreshCw size={18} />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Total Logs
            </span>
            <Activity size={20} className="text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900">
            {stats.total}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Success
            </span>
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {stats.success}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Failed
            </span>
            <XCircle size={20} className="text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600">
            {stats.failed}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">
              Pending
            </span>
            <Clock size={20} className="text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {stats.pending}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <Search size={14} className="inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Machine, Sample ID, Test..."
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Machine
            </label>
            <select
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Machines</option>
              {uniqueMachines.map((machine) => (
                <option key={machine} value={machine}>
                  {machine}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              <Calendar size={14} className="inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity size={20} className="text-indigo-600" />
              Integration Logs
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Showing {filteredLogs.length} of {logs.length} logs
            </p>
          </div>
          <div className="text-sm text-slate-500">
            Last refreshed:{' '}
            <span className="font-bold">
              {lastRefreshed.toLocaleTimeString('en-IN')}
            </span>
          </div>
        </div>
        <Table columns={columns} data={filteredLogs} />
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">
                Log Details
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <MoreHorizontal size={20} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Machine
                  </label>
                  <div className="font-bold text-slate-900">
                    {selectedLog.machineName}
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedLog.machineType}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                        selectedLog.status
                      )}`}
                    >
                      {getStatusIcon(selectedLog.status)}
                      {selectedLog.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Sample ID
                    </label>
                    <div className="font-bold text-slate-900">
                      {selectedLog.sampleId}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Patient
                    </label>
                    <div className="font-bold text-slate-900">
                      {selectedLog.patientName || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Test Name
                    </label>
                    <div className="font-bold text-slate-900">
                      {selectedLog.testName}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Parameter
                    </label>
                    <div className="font-bold text-slate-900">
                      {selectedLog.parameter || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Direction
                    </label>
                    <div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getDirectionBadgeClass(
                          selectedLog.direction
                        )}`}
                      >
                        {selectedLog.direction}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Value
                    </label>
                    <div className="font-bold text-slate-900">
                      {selectedLog.machineValue
                        ? `${selectedLog.machineValue} ${selectedLog.unit || ''}`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        size={18}
                        className="text-rose-600 mt-0.5"
                      />
                      <div>
                        <label className="text-xs font-bold text-rose-600 uppercase">
                          Error Message
                        </label>
                        <div className="text-sm text-rose-700 font-bold mt-1">
                          {selectedLog.errorMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Received At
                    </label>
                    <div className="font-bold text-slate-900 text-sm">
                      {new Date(selectedLog.receivedAt).toLocaleString(
                        'en-IN',
                        {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        }
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Processed At
                    </label>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedLog.processedAt
                        ? new Date(selectedLog.processedAt).toLocaleString(
                            'en-IN',
                            {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }
                          )
                        : 'Not processed'}
                    </div>
                  </div>
                </div>
              </div>

              {selectedLog.rawPayload && (
                <div className="border-t border-slate-200 pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Raw Payload
                  </label>
                  <div className="mt-1 bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <code className="text-xs text-slate-700 font-mono block whitespace-pre-wrap">
                      {selectedLog.rawPayload}
                    </code>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
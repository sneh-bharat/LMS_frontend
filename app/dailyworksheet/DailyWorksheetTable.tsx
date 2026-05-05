'use client';

import { Table, Badge } from '@/components/ui';
import { DailyWorksheetEntry } from './types';

interface DailyWorksheetTableProps {
  entries: DailyWorksheetEntry[];
}

export default function DailyWorksheetTable({ entries }: DailyWorksheetTableProps) {
  const formatTime = (dateTime: string) => {
    if (!dateTime) return <span className="text-slate-300">—</span>;
    const time = dateTime.split(' ')[1] || dateTime;
    return <span className="text-xs font-semibold">{time}</span>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Completed':
        return 'info';
      case 'In Progress':
        return 'warning';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'STAT':
        return 'destructive';
      case 'Urgent':
        return 'warning';
      case 'Routine':
        return 'info';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      key: 'sampleId',
      label: 'Sample ID',
      render: (_: string, row: DailyWorksheetEntry) => (
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900">{row.sampleId}</p>
          <p className="text-xs text-slate-500">{row.patientName}</p>
        </div>
      )
    },
    {
      key: 'testName',
      label: 'Test Details',
      render: (_: string, row: DailyWorksheetEntry) => (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{row.testName}</p>
          <div className="flex items-center gap-2">
            <Badge variant={getPriorityColor(row.priority)} className="text-[10px] px-2 py-0.5">
              {row.priority}
            </Badge>
            <span className="text-xs text-slate-500">{row.department}</span>
          </div>
        </div>
      )
    },
    {
      key: 'departureTime',
      label: 'Departure',
      render: (v: string, row: DailyWorksheetEntry) => formatTime(v)
    },
    {
      key: 'arrivalTime',
      label: 'Arrival',
      render: (v: string, row: DailyWorksheetEntry) => formatTime(v)
    },
    {
      key: 'deptReceivedTime',
      label: 'Dept. Rec',
      render: (v: string, row: DailyWorksheetEntry) => formatTime(v)
    },
    {
      key: 'analysisTime',
      label: 'Analysis',
      render: (v: string, row: DailyWorksheetEntry) => formatTime(v)
    },
    {
      key: 'resultEntryTime',
      label: 'Result Entry',
      render: (v: string, row: DailyWorksheetEntry) => formatTime(v)
    },
    {
      key: 'approvalTime',
      label: 'Approval',
      render: (v: string, row: DailyWorksheetEntry) => formatTime(v)
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string, row: DailyWorksheetEntry) => (
        <Badge variant={getStatusColor(row.status)} className="gap-2">
          <span className={`w-2 h-2 rounded-full ${
            row.status === 'Approved' ? 'bg-emerald-500' :
            row.status === 'Completed' ? 'bg-blue-500' :
            row.status === 'In Progress' ? 'bg-amber-500' :
            'bg-slate-400'
          }`}></span>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table columns={columns} data={entries} />
      </div>
    </div>
  );
}

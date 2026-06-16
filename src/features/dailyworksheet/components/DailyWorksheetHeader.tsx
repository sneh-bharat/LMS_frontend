'use client';

import { FlaskConical, Calendar } from 'lucide-react';
import { Button } from '@/components/ui';
import { TimeRange } from './types';

interface DailyWorksheetHeaderProps {
  timeRange: TimeRange;
}

export default function DailyWorksheetHeader({ timeRange }: DailyWorksheetHeaderProps) {
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'N/A';
    return dateTime.replace('T', ' ');
  };

  return (
    <div className="mb-8">
      {/* Main Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Daily Worksheet
              </h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">
                Track sample workflow and processing timeline
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Calendar size={16} />
            Export Report
          </Button>
          <Button variant="gradient" className="gap-2 rounded-xl">
            <Calendar size={16} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Time Range Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Worksheet For Date & Time
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatDateTime(timeRange.from)} ~ {formatDateTime(timeRange.to)}
            </p>
          </div>
        </div>
      </div>

      
    </div>
  );
}

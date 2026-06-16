'use client';

import { useState } from 'react';
import { Calendar, Filter, FileText } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorksheetFilter } from './types';
import { DEPARTMENTS, FRANCHISES } from './constants';

interface WorksheetFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: WorksheetFilter) => void;
}

export default function WorksheetFilterModal({ isOpen, onClose, onApply }: WorksheetFilterModalProps) {
  const [filter, setFilter] = useState<WorksheetFilter>({
    dateFrom: '2026-05-05T15:00:00',
    dateTo: '2026-05-05T15:59:00',
    invoiceFrom: '',
    invoiceTo: '',
    department: '',
    franchise: '',
    invoiceWise: false
  });

  const handleApply = () => {
    onApply(filter);
    onClose();
  };

  const handleReset = () => {
    setFilter({
      dateFrom: '2026-05-05T15:00:00',
      dateTo: '2026-05-05T15:59:00',
      invoiceFrom: '',
      invoiceTo: '',
      department: '',
      franchise: '',
      invoiceWise: false
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900">Worksheet Filter</h2>
              <p className="text-xs text-slate-500 mt-1">Configure filters to generate the daily worksheet</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="text-2xl text-slate-400 hover:text-slate-600">×</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Last Generated Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Worksheet Generated On</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">05th May 2026 03:53 PM</p>
                </div>
              </div>
            </div>

            {/* Date & Time Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</label>
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                <p className="text-base font-black text-slate-900">
                  2026-05-05 15:00:00 ~ 2026-05-05 15:54:00
                </p>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range From</Label>
                <Input
                  id="dateFrom"
                  type="datetime-local"
                  value={filter.dateFrom}
                  onChange={(e) => setFilter({ ...filter, dateFrom: e.target.value })}
                  className="rounded-xl h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Range To</Label>
                <Input
                  id="dateTo"
                  type="datetime-local"
                  value={filter.dateTo}
                  onChange={(e) => setFilter({ ...filter, dateTo: e.target.value })}
                  className="rounded-xl h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
            </div>

            {/* Invoice Number Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceFrom" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Number From</Label>
                <Input
                  id="invoiceFrom"
                  value={filter.invoiceFrom}
                  onChange={(e) => setFilter({ ...filter, invoiceFrom: e.target.value })}
                  placeholder="e.g. INV-2026-001"
                  className="rounded-xl h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceTo" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Number To</Label>
                <Input
                  id="invoiceTo"
                  value={filter.invoiceTo}
                  onChange={(e) => setFilter({ ...filter, invoiceTo: e.target.value })}
                  placeholder="e.g. INV-2026-100"
                  className="rounded-xl h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Department & Franchise */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</Label>
                <Select value={filter.department} onValueChange={(value) => setFilter({ ...filter, department: value || '' })}>
                  <SelectTrigger className="rounded-xl h-11 font-bold border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="">All Departments</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Franchise</Label>
                <Select value={filter.franchise} onValueChange={(value) => setFilter({ ...filter, franchise: value || '' })}>
                  <SelectTrigger className="rounded-xl h-11 font-bold border-slate-300 focus:border-blue-500">
                    <SelectValue placeholder="All Franchise" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="">All Franchise</SelectItem>
                    {FRANCHISES.map((franchise: string) => (
                      <SelectItem key={franchise} value={franchise}>
                        {franchise}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invoice Wise Toggle */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                id="invoiceWise"
                checked={filter.invoiceWise}
                onChange={(e) => setFilter({ ...filter, invoiceWise: e.target.checked })}
                className="w-5 h-5 accent-blue-600 rounded-md cursor-pointer"
              />
              <Label htmlFor="invoiceWise" className="font-bold text-slate-900 cursor-pointer text-sm">
                Invoice Wise
              </Label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 rounded-b-2xl flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button variant="gradient" className="flex-1 rounded-xl gap-2 font-bold shadow-lg" onClick={handleApply}>
              <Filter size={16} />
              Generate Worksheet
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

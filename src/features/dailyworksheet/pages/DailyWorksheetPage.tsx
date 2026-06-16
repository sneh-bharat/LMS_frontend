'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';
import DailyWorksheetHeader from '../components/DailyWorksheetHeader';
import SearchFilter from '../components/SearchFilter';
import DailyWorksheetTable from '../components/DailyWorksheetTable';
import WorksheetFilterModal from '../components/WorksheetFilterModal';
import { SAMPLE_DATA, DEPARTMENTS } from '../components/constants';
import { DailyWorksheetEntry, TimeRange, WorksheetFilter } from '../components/types';

export default function DailyWorksheetPage() {
  const [showFilterModal, setShowFilterModal] = useState(true);
  const [entries, setEntries] = useState<DailyWorksheetEntry[]>([]);
  const [allEntries, setAllEntries] = useState<DailyWorksheetEntry[]>(SAMPLE_DATA);
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [appliedFilter, setAppliedFilter] = useState<WorksheetFilter | null>(null);

  // Current time range (example: today's worksheet)
  const [timeRange, setTimeRange] = useState<TimeRange>({
    from: '',
    to: ''
  });

  // Show filter modal on initial load
  useEffect(() => {
    setShowFilterModal(true);
  }, []);

  // Filter entries
  const filtered = entries.filter(entry => {
    const matchesSearch = search === '' ||
      entry.patientName.toLowerCase().includes(search.toLowerCase()) ||
      entry.sampleId.toLowerCase().includes(search.toLowerCase()) ||
      entry.patientId.toLowerCase().includes(search.toLowerCase()) ||
      entry.testName.toLowerCase().includes(search.toLowerCase());

    const matchesDepartment = selectedDepartment === 'all' || entry.department === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || entry.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || entry.priority === selectedPriority;

    return matchesSearch && matchesDepartment && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'Pending').length,
    inProgress: entries.filter(e => e.status === 'In Progress').length,
    completed: entries.filter(e => e.status === 'Completed').length,
    approved: entries.filter(e => e.status === 'Approved').length,
  };

  const handleApplyFilter = (filter: WorksheetFilter) => {
    setAppliedFilter(filter);
    setTimeRange({
      from: filter.dateFrom.replace('T', ' '),
      to: filter.dateTo.replace('T', ' ')
    });

    // Filter data based on applied filters
    let filteredData = [...allEntries];

    // Apply date range filter
    const fromDate = new Date(filter.dateFrom);
    const toDate = new Date(filter.dateTo);
    filteredData = filteredData.filter(entry => {
      const entryDate = new Date(entry.departureTime || entry.arrivalTime);
      return entryDate >= fromDate && entryDate <= toDate;
    });

    // Apply invoice range filter
    if (filter.invoiceFrom || filter.invoiceTo) {
      filteredData = filteredData.filter(entry => {
        if (!entry.invoiceNumber) return false;
        if (filter.invoiceFrom && entry.invoiceNumber < filter.invoiceFrom) return false;
        if (filter.invoiceTo && entry.invoiceNumber > filter.invoiceTo) return false;
        return true;
      });
    }

    // Apply department filter
    if (filter.department) {
      filteredData = filteredData.filter(entry => entry.department === filter.department);
    }

    // Apply franchise filter
    if (filter.franchise) {
      filteredData = filteredData.filter(entry => entry.franchise === filter.franchise);
    }

    setEntries(filteredData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 w-full">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-100/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Worksheet Filter Modal */}
      <WorksheetFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilter}
      />

      {/* Main Content - Only show if filters are applied */}
      {appliedFilter && (
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12">
          {/* Header Section */}
          <DailyWorksheetHeader timeRange={timeRange} />

          {/* Search & Filter Section */}
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedPriority={selectedPriority}
            onPriorityChange={setSelectedPriority}
            departments={DEPARTMENTS}
          />

          {/* Daily Worksheet Table */}
          <DailyWorksheetTable entries={filtered} />

          {/* Footer Info */}
          <div className="mt-6 flex items-center justify-between text-sm">
            <p className="text-slate-600">
              Showing <span className="font-bold text-slate-900">{filtered.length}</span> of <span className="font-bold text-slate-900">{entries.length}</span> samples
            </p>
            <Badge variant="success" className="gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All systems operational
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

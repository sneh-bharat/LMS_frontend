'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedPriority: string;
  onPriorityChange: (value: string) => void;
  departments: string[];
}

export default function SearchFilter({
  search,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  departments
}: SearchFilterProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patient, sample ID..."
              className="pl-10 rounded-xl h-11"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
          <Select value={selectedDepartment} onValueChange={(value) => value && onDepartmentChange(value)}>
            <SelectTrigger className="rounded-xl h-11 font-bold">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
          <Select value={selectedStatus} onValueChange={(value) => value && onStatusChange(value)}>
            <SelectTrigger className="rounded-xl h-11 font-bold">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
          <Select value={selectedPriority} onValueChange={(value) => value && onPriorityChange(value)}>
            <SelectTrigger className="rounded-xl h-11 font-bold">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Routine">Routine</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
              <SelectItem value="STAT">STAT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

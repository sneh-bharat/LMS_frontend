'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Button from '@/components/ui/button';
import Table from '@/components/ui/table';
import type { Estimation } from './types/estimation.types';
import { INITIAL_ESTIMATIONS } from './constants/estimation';

export default function EstimationsPage() {
  const [estimations] = useState<Estimation[]>(INITIAL_ESTIMATIONS);
  const [patientName, setPatientName] = useState('');
  const [dateRange] = useState('12/01/2025 - 01/31/2026');

  const columns = [
    { key: 'id', label: '#', render: (_: any, __: any, index: number) => index + 1 },
    { key: 'estimationInfo', label: 'Estimation info' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount', render: (amount: number) => `₹ ${amount}` },
    { key: 'action', label: 'Action', render: () => <span className="text-right text-blue-600 cursor-pointer">View</span> },
  ];

  return (
    <div className="p-4">
      <Card>
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">
              📋
            </span>
            Estimation List
          </h2>

          <Button className="flex items-center gap-2 text-sm px-3 py-1.5">
            <Download size={16} />
            Download Excel
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              Patient Name
            </label>
            <Input
              value={patientName}
              onChange={(e: any) => setPatientName(e.target.value)}
              placeholder="Patient Name"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              Date Range
            </label>
            <Input value={dateRange} readOnly />
          </div>
        </div>

        {/* Table */}
        {estimations.length === 0 ? (
          <div className="text-center py-6 text-gray-500 border rounded-md">
            No record found. Please try with different search criteria.
          </div>
        ) : (
          <Table columns={columns} data={estimations} />
        )}
      </Card>
    </div>
  );
}
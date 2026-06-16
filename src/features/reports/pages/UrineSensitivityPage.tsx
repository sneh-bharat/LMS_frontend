'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Plus,
  Activity,
  TrendingUp,
  AlertCircle,
  TestTube,
  Microscope,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Table from '@/components/ui/table';
import AddNewUrineSensitivity from '../components/urineSensitivity/AddNew';

// ─── Data Types ──────────────────────────────────────────────────────────────

export interface UrineSensitivityItem {
  id: number;
  name: string;
  // Resistance ranges (in mm - millimeters for inhibition zone)
  resistantMin: number;
  resistantMax: number;
  intermediateMin: number;
  intermediateMax: number;
  susceptibleMin: number;
  susceptibleMax: number;
  // Audit
  createdAt: string;
  updatedAt?: string;
}

export const SAMPLE_URINE_SENSITIVITY: UrineSensitivityItem[] = [
  {
    id: 1,
    name: 'Amikacin',
    resistantMin: 0,
    resistantMax: 14,
    intermediateMin: 15,
    intermediateMax: 16,
    susceptibleMin: 17,
    susceptibleMax: 20,
    createdAt: '2026-03-20T10:00:00Z',
  },
  {
    id: 2,
    name: 'Amoxycillin-clavulan',
    resistantMin: 0,
    resistantMax: 19,
    intermediateMin: 0,
    intermediateMax: 0,
    susceptibleMin: 20,
    susceptibleMax: 25,
    createdAt: '2026-03-20T10:05:00Z',
  },
  {
    id: 3,
    name: 'Amoxyclav',
    resistantMin: 0,
    resistantMax: 13,
    intermediateMin: 14,
    intermediateMax: 17,
    susceptibleMin: 18,
    susceptibleMax: 20,
    createdAt: '2026-03-20T10:10:00Z',
  },
  {
    id: 4,
    name: 'Ampicillin',
    resistantMin: 0,
    resistantMax: 13,
    intermediateMin: 14,
    intermediateMax: 16,
    susceptibleMin: 17,
    susceptibleMax: 20,
    createdAt: '2026-03-20T10:15:00Z',
  },
  {
    id: 5,
    name: 'Azithromycin',
    resistantMin: 0,
    resistantMax: 13,
    intermediateMin: 14,
    intermediateMax: 17,
    susceptibleMin: 18,
    susceptibleMax: 25,
    createdAt: '2026-03-20T10:20:00Z',
  },
  {
    id: 6,
    name: 'Aztreonam',
    resistantMin: 0,
    resistantMax: 15,
    intermediateMin: 16,
    intermediateMax: 21,
    susceptibleMin: 22,
    susceptibleMax: 30,
    createdAt: '2026-03-20T10:25:00Z',
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatRange(min: number, max: number): string {
  if (min === 0 && max === 0) {
    return '0 - 0';
  }
  return `${min} - ${max}`;
}

function getRangeStatusColor(value: number, resistant: [number, number], intermediate: [number, number], susceptible: [number, number]): string {
  if (value >= resistant[0] && value <= resistant[1]) {
    return 'text-rose-600'; // Resistant - red
  }
  if (intermediate[1] > 0 && value >= intermediate[0] && value <= intermediate[1]) {
    return 'text-amber-600'; // Intermediate - yellow
  }
  if (value >= susceptible[0] && value <= susceptible[1]) {
    return 'text-emerald-600'; // Susceptible - green
  }
  return 'text-slate-600';
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function UrineSensitivityPage() {
  const [items, setItems] = useState<UrineSensitivityItem[]>(SAMPLE_URINE_SENSITIVITY);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = (newItem: Omit<UrineSensitivityItem, 'id' | 'createdAt'>) => {
    const item: UrineSensitivityItem = {
      ...newItem,
      id: Math.max(...items.map(i => i.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    setItems([...items, item]);
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const columns = [
    {
      key: 'id',
      label: '#',
      width: '60px',
      render: (value: number) => (
        <div className="font-bold text-slate-900">{value}</div>
      ),
    },
    {
      key: 'name',
      label: 'Antibiotic / Test',
      render: (value: string, row: UrineSensitivityItem) => (
        <div className="font-bold text-slate-900">{value}</div>
      ),
    },
    {
      key: 'resistantMin',
      label: 'Resistant Range',
      align: 'center' as const,
      render: (value: number, row: UrineSensitivityItem) => (
        <div className="text-center font-semibold text-slate-900">
          {formatRange(row.resistantMin, row.resistantMax)}
        </div>
      ),
    },
    {
      key: 'intermediateMin',
      label: 'Intermediate Range',
      align: 'center' as const,
      render: (value: number, row: UrineSensitivityItem) => (
        <div className="text-center font-semibold text-slate-900">
          {formatRange(row.intermediateMin, row.intermediateMax)}
        </div>
      ),
    },
    {
      key: 'susceptibleMin',
      label: 'Susceptible Range',
      align: 'center' as const,
      render: (value: number, row: UrineSensitivityItem) => (
        <div className="text-center font-semibold text-slate-900">
          {formatRange(row.susceptibleMin, row.susceptibleMax)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Action',
      width: '100px',
      align: 'center' as const,
      render: (value: number, row: UrineSensitivityItem) => (
        <button
          onClick={() => handleDelete(value)}
          className="text-rose-600 hover:text-rose-700 font-bold transition-colors flex items-center gap-1"
        >
          <Trash2 size={14} />
          Delete
        </button>
      ),
    },
  ];

  const stats = {
    totalItems: items.length,
    resistantCount: items.length, // All items have resistant range
    intermediateCount: items.filter(i => i.intermediateMax > 0).length,
    susceptibleCount: items.length,
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <TestTube size={28} className="text-purple-600" />
            Urine Sensitivity
          </h1>
          <p className="text-sm text-slate-500">Manage antibiotic sensitivity ranges for urine culture tests</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
           
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-400/30 flex items-center justify-center">
              <Activity size={20} className="text-purple-600" />
            </div>
            <span className="text-purple-700 font-bold text-xs uppercase tracking-wider">Total Items</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalItems}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-400/30 flex items-center justify-center">
              <AlertCircle size={20} className="text-rose-600" />
            </div>
            <span className="text-rose-700 font-bold text-xs uppercase tracking-wider">Resistant</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.resistantCount}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Intermediate</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.intermediateCount}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Susceptible</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.susceptibleCount}</div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by antibiotic or test name..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <Table columns={columns} data={filteredItems} />
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredItems.length} of {items.length} Items
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            Last Updated: <span className='text-slate-900 font-black'>
              {new Date(items[0]?.updatedAt || items[0]?.createdAt).toLocaleDateString('en-IN')}
            </span>
          </span>
        </div>
      </div>

      {/* Add New Modal */}
      <AddNewUrineSensitivity
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddNew}
      />
    </div>
  );
}
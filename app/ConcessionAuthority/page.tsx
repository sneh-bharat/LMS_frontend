'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer'; 
interface ConcessionAuthority {
  id: number;
  name: string;
  allowedPercentage: number;
  createdAt: string;
  status: 'active' | 'inactive';
}

const SAMPLE_DATA: ConcessionAuthority[] = [
  {
    id: 1,
    name: 'Standard Concession',
    allowedPercentage: 5,
    createdAt: '2024-01-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Premium Concession',
    allowedPercentage: 10,
    createdAt: '2024-01-20',
    status: 'active',
  },
  {
    id: 3,
    name: 'Special Concession',
    allowedPercentage: 8,
    createdAt: '2024-02-01',
    status: 'active',
  },
];

const PERCENTAGE_OPTIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 1);

interface NewConcessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConcessionFormData) => void;
  editData?: ConcessionAuthority | null;
}

interface ConcessionFormData {
  name: string;
  allowedPercentage: number;
}

function NewConcessionModal({
  isOpen,
  onClose,
  onSubmit,
  editData,
}: NewConcessionModalProps) {
  const [formData, setFormData] = useState<ConcessionFormData>({
    name: editData?.name || '',
    allowedPercentage: editData?.allowedPercentage || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: '', allowedPercentage: 1 });
    onClose();
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Edit Concession Authority' : 'New Concession Authority'}
      description={editData ? 'Update concession details' : 'Add a new concession authority'}
      footer={
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="concession-form"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            Save
          </button>
        </div>
      }
      maxWidth="md"
    >
      <form id="concession-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Name
          </label>
          <input
            type="text"
            placeholder="Enter concession name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            required
          />
        </div>

        {/* Percentage Field */}
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Concession Allowed (%)
          </label>
          <div className="relative">
            <select
              value={formData.allowedPercentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  allowedPercentage: Number(e.target.value),
                })
              }
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
            >
              {PERCENTAGE_OPTIONS.map((percentage) => (
                <option key={percentage} value={percentage}>
                  {percentage}%
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}

function ActionMenu({ concession }: { concession: ConcessionAuthority }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-2">
          <button className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Edit2 size={14} /> Edit
          </button>
          <div className="h-[1px] bg-slate-100 my-1"></div>
          <button className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function ConcessionAuthorityPage() {
  const [concessions, setConcessions] = useState<ConcessionAuthority[]>(SAMPLE_DATA);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConcession, setEditingConcession] = useState<ConcessionAuthority | null>(null);

  const filteredConcessions = concessions.filter((concession) =>
    concession.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddConcession = (formData: ConcessionFormData) => {
    if (editingConcession) {
      setConcessions(
        concessions.map((c) =>
          c.id === editingConcession.id
            ? { ...c, name: formData.name, allowedPercentage: formData.allowedPercentage }
            : c
        )
      );
      setEditingConcession(null);
    } else {
      const newConcession: ConcessionAuthority = {
        id: Math.max(...concessions.map((c) => c.id), 0) + 1,
        name: formData.name,
        allowedPercentage: formData.allowedPercentage,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'active',
      };
      setConcessions([...concessions, newConcession]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (concession: ConcessionAuthority) => {
    setEditingConcession(concession);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConcession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                📋
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Concession Authority
              </h1>
            </div>
            <button
              onClick={() => {
                setEditingConcession(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold rounded-xl hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
              style={{ width: 'fit-content' }}  
            >
              <Plus size={18} /> Add New
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search concession authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Allowed (%)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConcessions.map((concession, index) => (
                  <tr
                    key={concession.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {concession.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        {concession.allowedPercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ActionMenu concession={concession} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredConcessions.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold">{filteredConcessions.length}</span> concession{' '}
                {filteredConcessions.length !== 1 ? 'authorities' : 'authority'}
              </p>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredConcessions.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              No concessions found
            </h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <NewConcessionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddConcession}
        editData={editingConcession}
      />
    </div>
  );
}
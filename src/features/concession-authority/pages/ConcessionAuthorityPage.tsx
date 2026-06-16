'use client';

import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { NewConcessionModal } from '../components/NewConcessionModal';
import { ConcessionActionMenu } from '../components/ConcessionActionMenu';
import { SAMPLE_CONCESSIONS } from '../constants/concession';
import type { ConcessionAuthority, ConcessionFormData } from '../types/concession.types';

export default function ConcessionAuthorityPage() {
  const [concessions, setConcessions] = useState<ConcessionAuthority[]>(SAMPLE_CONCESSIONS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConcessionAuthority | null>(null);

  const filtered = useMemo(
    () => concessions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [concessions, search],
  );

  const handleSave = (formData: ConcessionFormData) => {
    if (editing) {
      setConcessions((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...formData } : c)));
      setEditing(null);
    } else {
      setConcessions((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((c) => c.id)) + 1,
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          status: 'active',
        },
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 font-bold text-white">
                📋
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Concession Authority</h1>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setIsModalOpen(true);
              }}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:from-teal-600 hover:to-blue-600 hover:shadow-xl"
            >
              <Plus size={18} /> Add New
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search concession authority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">#</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Allowed (%)</th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((concession, index) => (
                  <tr key={concession.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-900">{index + 1}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-900">{concession.name}</span></td>
                    <td className="px-6 py-4"><span className="text-sm font-semibold text-slate-900">{concession.allowedPercentage}%</span></td>
                    <td className="px-6 py-4 text-center">
                      <ConcessionActionMenu
                        onEdit={() => {
                          setEditing(concession);
                          setIsModalOpen(true);
                        }}
                        onDelete={() => setConcessions((prev) => prev.filter((c) => c.id !== concession.id))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-sm font-medium text-slate-600">
                Showing <span className="font-bold">{filtered.length}</span> concession{' '}
                {filtered.length !== 1 ? 'authorities' : 'authority'}
              </p>
            </div>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-900">No concessions found</h3>
            <p className="text-slate-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      <NewConcessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        editData={editing}
      />
    </div>
  );
}

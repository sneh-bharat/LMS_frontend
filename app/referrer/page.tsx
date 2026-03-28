'use client';

import { useState } from 'react';
import {
  InlineButton as Button,
  InlineInput as Input,
} from '@/components/ui';

import {
  Search,
  MoreHorizontal,
  Calendar, // ✅ FIXED
} from 'lucide-react';

// ✅ keep Select imports
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

// ✅ ADD this separately
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import { RightDrawer } from '@/components/ui/right-drawer';
import AddReferrer from './AddReferrer';
import EditReferrer from './edit';
import CommissionConfig from './commission';
import { Referrer } from './types';

// ─── Sample Data ─────────────────────────────────────────────
const INITIAL_REFERRERS: Referrer[] = [
  {
    id: 1,
    name: 'A K DAS',
    mobile: '0000000000',
    address: '',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active',
    showOnPrint: 'Hide All',
  },
  {
    id: 2,
    name: 'DR RAMADAS LANKA',
    mobile: '9848834451',
    address: 'KPHB COLONY HYDERABAD 500072',
    centre: 'HO(IP)',
    marketingAssociate: '',
    status: 'Active',
    showOnPrint: 'Hide All',
  },
];

const SEARCH_OPTIONS = [
  'Booking ID',
  'Patient Name',
  'Phone Number',
  'UHID',
  'Sample ID',
] as const;

// ─── Main Page ───────────────────────────────────────────────
export default function ReferrerListPage() {
  const [referrers, setReferrers] = useState(INITIAL_REFERRERS);
  const [searchText, setSearchText] = useState('');
  const [searchBy, setSearchBy] = useState(''); // ✅ FIXED

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Referrer | null>(null);
  const [commTarget, setCommTarget] = useState<Referrer | null>(null);

  const filtered = referrers.filter((r) =>
    r.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <>
      {/* Drawers */}
      <RightDrawer
        isOpen={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        title="Add Referrer"
      >
        <AddReferrer
          onAdd={(r) => {
            setReferrers((prev) => [...prev, r]);
            setAddDrawerOpen(false);
          }}
          onClose={() => setAddDrawerOpen(false)}
        />
      </RightDrawer>

      <RightDrawer
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Referrer"
      >
        {editTarget && (
          <EditReferrer
            referrer={editTarget}
            onUpdate={(r) => {
              setReferrers((prev) =>
                prev.map((x) => (x.id === r.id ? r : x))
              );
              setEditTarget(null);
            }}
            onDelete={(id) => {
              setReferrers((prev) => prev.filter((x) => x.id !== id));
              setEditTarget(null);
            }}
            onClose={() => setEditTarget(null)}
          />
        )}
      </RightDrawer>

      <RightDrawer
        isOpen={!!commTarget}
        onClose={() => setCommTarget(null)}
        title="Commission Config"
      >
        {commTarget && (
          <CommissionConfig
            referrer={commTarget}
            referrers={referrers}
            onClose={() => setCommTarget(null)}
          />
        )}
      </RightDrawer>

      {/* PAGE */}
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* HEADER */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
            
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Calendar size={20} /> {/* ✅ FIXED */}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">
                  Referrer Management
                </h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                  Manage online appointment bookings
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3 flex-1 md:max-w-xl">
              <div className="w-48">
                <Select
                  value={searchBy}
                  onValueChange={(val) => setSearchBy(val || '')}
                >
                  <SelectTrigger className="h-10 bg-slate-50 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <SelectValue placeholder="Search by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEARCH_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt}
                        value={opt}
                        className="text-xs font-bold uppercase tracking-wider"
                      >
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                  size={16}
                />
                <Input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search booking record..."
                  className="pl-10 h-10 w-full"
                />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Code
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Referrer Details
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Centre
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-slate-400 font-semibold">
                      REF{i + 1}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {r.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.address || 'No address'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {r.mobile}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {r.centre}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-600">
                        {r.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right relative">
  <details className="inline-block">
    <summary className="list-none cursor-pointer p-2 rounded-lg hover:bg-slate-100">
      <MoreHorizontal size={16} />
    </summary>

    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50">
      <button
        onClick={() => setEditTarget(r)}
        className="block w-full text-left px-4 py-2 hover:bg-slate-50"
      >
        Edit
      </button>

      <button
        onClick={() => setCommTarget(r)}
        className="block w-full text-left px-4 py-2 hover:bg-slate-50"
      >
        Commission
      </button>

      <button
        onClick={() => {
          if (confirm('Delete this referrer?')) {
            setReferrers((prev) =>
              prev.filter((x) => x.id !== r.id)
            );
          }
        }}
        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  </details>
</td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      No referrers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="px-6 py-3 text-xs text-slate-500 border-t bg-slate-50">
              Showing {filtered.length} referrers
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
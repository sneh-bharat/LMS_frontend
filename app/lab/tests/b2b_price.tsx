'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Search, Filter, Save, X } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RightDrawer } from '@/components/ui/right-drawer';
import { toast } from 'sonner';

// ─── Type Definitions ────────────────────────────────────────────────────────
interface B2BPriceEntry {
  id?: number;
  branchName: string;
  branchB2B: string;
  revenue: number;
  mrp: number;
}

interface Branch {
  id: number;
  name: string;
  branchType: 'Branch' | 'B2B';
}

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_BRANCHES: Branch[] = [
  { id: 1, name: 'Main Branch', branchType: 'Branch' },
  { id: 2, name: 'City Lab', branchType: 'B2B' },
  { id: 3, name: 'Health Clinic', branchType: 'B2B' },
  { id: 4, name: 'Downtown Center', branchType: 'Branch' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
interface B2BPriceConfigurationProps {
  isOpen: boolean;
  onClose: () => void;
  testName?: string;
}

export default function B2BPriceConfiguration({ 
  isOpen, 
  onClose,
  testName = 'ASO TITRE (ASO)'
}: B2BPriceConfigurationProps) {
  const [entries, setEntries] = useState<B2BPriceEntry[]>([
    { id: 1, branchName: 'Main Branch', branchB2B: 'Branch', revenue: 500, mrp: 800 },
    { id: 2, branchName: 'City Lab', branchB2B: 'B2B', revenue: 450, mrp: 750 },
  ]);
  
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editData, setEditData] = useState<B2BPriceEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<B2BPriceEntry, 'id'>>({
    branchName: '',
    branchB2B: 'B2B',
    revenue: 0,
    mrp: 0,
  });

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAddEntry = () => {
    if (!newEntry.branchName) {
      toast.error('Please select a branch');
      return;
    }

    if (newEntry.revenue <= 0) {
      toast.error('Revenue must be greater than 0');
      return;
    }

    if (newEntry.mrp <= 0) {
      toast.error('MRP must be greater than 0');
      return;
    }

    const entry: B2BPriceEntry = {
      id: Date.now(),
      ...newEntry,
    };

    setEntries([...entries, entry]);
    setNewEntry({
      branchName: '',
      branchB2B: 'B2B',
      revenue: 0,
      mrp: 0,
    });
    setShowAddForm(false);
    toast.success('B2B price entry added successfully');
  };

  const handleEdit = (entry: B2BPriceEntry) => {
    setIsEditing(entry.id || null);
    setEditData({ ...entry });
  };

  const handleSaveEdit = () => {
    if (!editData) return;

    if (editData.revenue <= 0) {
      toast.error('Revenue must be greater than 0');
      return;
    }

    if (editData.mrp <= 0) {
      toast.error('MRP must be greater than 0');
      return;
    }

    setEntries(entries.map(e => (e.id === editData.id ? editData : e)));
    setIsEditing(null);
    setEditData(null);
    toast.success('Entry updated successfully');
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    setEditData(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(entries.filter(e => e.id !== id));
      toast.success('Entry deleted successfully');
    }
  };

  const handleSaveAll = () => {
    // TODO: Implement API call to save all entries
    toast.success('All B2B prices saved successfully');
  };

  // ─── Filtered Entries ────────────────────────────────────────────────────
  const filteredEntries = entries.filter(entry =>
    entry.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.branchB2B.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="B2B Price Configuration"
      description={`Configure pricing for ${testName}`}
      maxWidth="2xl"
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-slate-600">
            <span className="font-semibold">Total Entries:</span> {entries.length}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save size={16} className="mr-2" />
              Save All
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              type="text"
              placeholder="Search by branch name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 shrink-0"
          >
            <Plus size={16} />
            Add New
          </Button>
        </div>

        {/* Add New Entry Form */}
        {showAddForm && (
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Plus size={18} className="text-emerald-600" />
                Add New Entry
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-1"
              >
                <X size={14} />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Branch Name *</Label>
                <select
                  value={newEntry.branchName}
                  onChange={(e) => {
                    const selectedBranch = MOCK_BRANCHES.find(b => b.name === e.target.value);
                    setNewEntry({ 
                      ...newEntry, 
                      branchName: e.target.value,
                      branchB2B: selectedBranch?.branchType || 'B2B'
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Branch</option>
                  {MOCK_BRANCHES.map(branch => (
                    <option key={branch.id} value={branch.name}>
                      {branch.name} ({branch.branchType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Revenue * (₹)</Label>
                <Input
                  type="number"
                  value={newEntry.revenue || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, revenue: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter revenue"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider">MRP * (₹)</Label>
                <Input
                  type="number"
                  value={newEntry.mrp || ''}
                  onChange={(e) => setNewEntry({ ...newEntry, mrp: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter MRP"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleAddEntry}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus size={16} className="mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Branch Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Branch/B2B
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Revenue * (₹)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    MRP * (₹)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-3">
                        <Search size={48} className="text-slate-300" />
                        <p className="text-lg font-semibold">No entries found</p>
                        <p className="text-sm">Add a new entry or adjust your search</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      {isEditing === entry.id && editData ? (
                        <>
                          <td className="px-6 py-4">
                            <select
                              value={editData.branchName}
                              onChange={(e) => setEditData({ ...editData, branchName: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              {MOCK_BRANCHES.map(branch => (
                                <option key={branch.id} value={branch.name}>
                                  {branch.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={editData.branchB2B}
                              onChange={(e) => setEditData({ ...editData, branchB2B: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="Branch">Branch</option>
                              <option value="B2B">B2B</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              value={editData.revenue}
                              onChange={(e) => setEditData({ ...editData, revenue: parseFloat(e.target.value) || 0 })}
                              className="w-full"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <Input
                              type="number"
                              value={editData.mrp}
                              onChange={(e) => setEditData({ ...editData, mrp: parseFloat(e.target.value) || 0 })}
                              className="w-full"
                              min="0"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSaveEdit}
                                className="flex items-center gap-1 text-emerald-600 border-emerald-600"
                              >
                                <Save size={14} />
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="flex items-center gap-1 text-slate-600"
                              >
                                <X size={14} />
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {entry.branchName}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                entry.branchB2B === 'B2B'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-green-100 text-green-700'
                              }`}
                            >
                              {entry.branchB2B}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                            ₹{entry.revenue.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-slate-900">
                            ₹{entry.mrp.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(entry)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                              >
                                <Edit2 size={14} />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(entry.id || 0)}
                                className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                              >
                                <Trash2 size={14} />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}
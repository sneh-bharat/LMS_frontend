'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit2,
  Trash2,
  Settings,
  Package,
  Microscope,
  LayoutGrid,
  ChevronDown,
  FlaskConical,
  User,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import AddNewSample, { type TestSample } from './AddNewSample';
import SampleDetails from '../sample-receipt/Sample-details';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  deleteSample,
  mapSampleToListRow,
  type SampleListRow,
} from '@/app/Apis/booking/sample';
import { useSamplesList } from '@/app/Apis/booking/useSamples';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Complete', 'Failed'];
const SAMPLE_TYPES = ['All', 'Blood', 'Urine', 'Swab', 'Stool', 'Other'];

function listRowToTestSample(row: SampleListRow): TestSample {
  return {
    id: String(row.id),
    sampleCode: row.sampleCode,
    patientName: row.patientName,
    collectedBy: row.collectedBy,
    testName: row.testName,
    sampleType: row.sampleType,
    collectedAt: row.collectedAt,
    status: row.status,
    location:
      row.location === 'Laboratory' || row.location === 'Home'
        ? row.location
        : 'Clinic',
    createdAt: row.createdAt,
  };
}

// ─── Actions menu (same pattern as categories page) ─────────────────────────
function SampleActions({
  sample,
  onEdit,
  onDelete,
}: {
  sample: SampleListRow;
  onEdit: (sample: SampleListRow) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 224 + window.scrollX,
      });
    }
  }, [open]);

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-emerald-50 rounded-lg transition-all text-slate-400 hover:text-emerald-600 hover:shadow-sm"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="fixed w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-1 animate-in fade-in zoom-in-95 duration-150"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              type="button"
              onClick={() => {
                onEdit(sample);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
            >
              <Edit2 size={16} strokeWidth={2} />
              <span>Edit Sample</span>
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <button
              type="button"
              onClick={() => {
                onDelete(sample.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
            >
              <Trash2 size={16} strokeWidth={2} />
              <span>Delete Sample</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function TestPackagePage() {
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TestSample | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSampleId, setDeletingSampleId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: samplesRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSamplesList({
    pageNo,
    pageSize: PAGE_SIZE,
    sortBy: 'createdAt',
  });

  const samples = useMemo(
    () => (samplesRes?.data?.content ?? []).map(mapSampleToListRow),
    [samplesRes?.data?.content]
  );

  const totalElements = samplesRes?.data?.totalElements ?? 0;
  const totalPages = samplesRes?.data?.totalPages ?? 0;
  const canPrev = pageNo > 0;
  const canNext =
    samplesRes?.data?.last != null ? !samplesRes.data.last : pageNo + 1 < totalPages;

  const filteredPackages = samples.filter((pkg) => {
    const matchesSearch =
      !search.trim() ||
      pkg.testName.toLowerCase().includes(search.toLowerCase()) ||
      pkg.sampleCode.toLowerCase().includes(search.toLowerCase()) ||
      pkg.patientName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || pkg.sampleType === categoryFilter;

    const matchesStatus = statusFilter === 'All' || pkg.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const deletingSample = deletingSampleId
    ? samples.find((s) => s.id === deletingSampleId)
    : null;

  const handleNewTestSubmit = (_data: TestSample) => {
    void refetch();
    setEditingPackage(null);
  };

  const handleEdit = (sample: SampleListRow) => {
    setEditingPackage(listRowToTestSample(sample));
    setIsModalOpen(true);
  };

  const handleAddSample = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleViewDetails = (sample: SampleListRow) => {
    setSelectedSampleId(sample.id);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedSampleId(null);
  };

  const handleDelete = (id: number) => {
    setDeletingSampleId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSampleId) return;

    setIsDeleting(true);
    try {
      await deleteSample(deletingSampleId);
      await refetch();
      setDeleteDialogOpen(false);
      if (selectedSampleId === deletingSampleId) {
        handleCloseDetails();
      }
    } catch (err) {
      console.error('Failed to delete sample:', err);
    } finally {
      setIsDeleting(false);
      setDeletingSampleId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Microscope size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Test <span className="text-[#FF671F]">Samples Collection</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              Manage diagnostic sample collection and tracking.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 px-6">
            <LayoutGrid size={16} /> Package View
          </Button>
          <Button
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={handleAddSample}
          >
            <Plus size={16} /> Create Sample
          </Button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Sample Code or Name..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {SAMPLE_TYPES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-medium">
            {error instanceof Error ? error.message : 'Failed to load samples.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Sample Code
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Patient Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Test Name
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Sample Type
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Collected At
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={20} className="animate-spin text-emerald-600" />
                      <span className="text-sm font-semibold">Loading samples…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <p className="text-sm font-semibold">No samples found</p>
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        {pkg.sampleCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <User size={20} />
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-1">{pkg.patientName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <Package size={20} />
                        </div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                          {pkg.testName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                        {pkg.sampleType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-slate-700">{pkg.collectedAt}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewDetails(pkg)}
                          className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all"
                          title="View sample details"
                        >
                          <Eye size={18} />
                        </button>
                        <SampleActions
                          sample={pkg}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>
              Showing {filteredPackages.length} of {totalElements} samples
            </span>
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="text-[#FF671F]">Samples v1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px] font-bold"
              disabled={!canPrev || isFetching}
              onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={14} className="inline mr-1" />
              Prev
            </Button>
            <span className="px-4 py-1 text-xs font-bold text-slate-600">
              Page {pageNo + 1} of {Math.max(totalPages, 1)}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="px-4 py-1 text-[10px] font-bold"
              disabled={!canNext || isFetching}
              onClick={() => setPageNo((p) => p + 1)}
            >
              Next
              <ChevronRight size={14} className="inline ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <AddNewSample
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleNewTestSubmit}
        editData={editingPackage}
        isEditMode={!!editingPackage}
      />

      <SampleDetails
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        sampleId={selectedSampleId}
        onEdit={() => {
          handleCloseDetails();
          const sample = samples.find((s) => s.id === selectedSampleId);
          if (sample) handleEdit(sample);
        }}
      />

      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          if (isDeleting) return;
          setDeleteDialogOpen(false);
          setDeletingSampleId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Sample"
        description={
          deletingSample
            ? `Are you sure you want to permanently delete sample "${deletingSample.sampleCode}"? This action cannot be undone.`
            : 'Are you sure you want to permanently delete this sample? This action cannot be undone.'
        }
        isLoading={isDeleting}
      />
    </div>
  );
}

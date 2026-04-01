'use client';
import { useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Microscope,
  Clock,
  User,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  ChevronDown
} from 'lucide-react';
import AddNewReceipt, {
  ReceiptFormData,
  ReceiptInitialData,
  DEPARTMENTS,
} from './AddNewReceipt';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

// ─── Types ──────────────────────────────────────────────────────────────
type Receipt = {
  sampleId: string;
  patient: string;
  tests: string[];
  sampleType: "Blood" | "Urine" | "Swab" | "Stool" | "Other";
  collectedAt: string;
  status: "pending" | "accepted" | "rejected";
  condition?: "good" | "haemolysed" | "clotted" | "insufficient" | "leaked";
  receivedDate?: string;
  receivedTime?: string;
  receivedBy?: string;
  temperatureOnArrival?: string;
  acceptanceDecision?: string;
  rejectionReason?: string;
  departmentRouting?: string;
  storageLocation?: string;
  aliquotingRequired?: boolean;
  numberOfAliquots?: number;
  remarks?: string;
};

const SAMPLE_RECEIPTS: Receipt[] = [
  {
    sampleId: "LAB-20260401-00001",
    patient: "John Doe",
    tests: ["CBC", "LFT"],
    sampleType: "Blood",
    collectedAt: "2026-04-01 09:30 AM",
    status: "pending",
    condition: undefined,
  },
  {
    sampleId: "LAB-20260401-00002",
    patient: "Sara Smith",
    tests: ["Urine Test"],
    sampleType: "Urine",
    collectedAt: "2026-04-01 10:00 AM",
    status: "accepted",
    condition: "good",
  },
  {
    sampleId: "LAB-20260401-00003",
    patient: "Mike Johnson",
    tests: ["COVID-19 RT-PCR"],
    sampleType: "Swab",
    collectedAt: "2026-04-01 08:45 AM",
    status: "rejected",
    condition: "haemolysed",
  },
];

const STATUS_OPTIONS = ['All', 'Pending', 'Accepted', 'Rejected'];
const SAMPLE_TYPES = ['All', 'Blood', 'Urine', 'Swab', 'Stool', 'Other'];

// ─── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Receipt['status'] }) {
  const config = {
    pending: { color: 'warning' as const, icon: <Clock size={10} /> },
    accepted: { color: 'success' as const, icon: <CheckCircle size={10} /> },
    rejected: { color: 'danger' as const, icon: <XCircle size={10} /> },
  };

  return (
    <Badge variant={config[status].color} className="gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase">
      {config[status].icon}
      {status}
    </Badge>
  );
}

// ─── Condition Badge ───────────────────────────────────────────────────────────────
function ConditionBadge({ condition }: { condition?: Receipt['condition'] }) {
  if (!condition) return null;

  const config = {
    good: { color: 'success' as const, label: 'Good' },
    haemolysed: { color: 'danger' as const, label: 'Haemolysed' },
    clotted: { color: 'warning' as const, label: 'Clotted' },
    insufficient: { color: 'warning' as const, label: 'Insufficient' },
    leaked: { color: 'danger' as const, label: 'Leaked' },
  };

  return (
    <Badge variant={config[condition].color} className="px-2.5 py-1 text-[10px] font-bold uppercase">
      {config[condition].label}
    </Badge>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SampleReceiptPage() {
  const [receipts, setReceipts] = useState<Receipt[]>(SAMPLE_RECEIPTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Receipt | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = receipts.filter(r =>
    (deptFilter === 'All' || r.sampleType === deptFilter) &&
    (statusFilter === 'All' || r.status === statusFilter.toLowerCase()) &&
    (r.patient.toLowerCase().includes(search.toLowerCase()) ||
     r.sampleId.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (formData: ReceiptFormData) => {
    if (editTarget) {
      // Edit mode: update existing receipt
      setReceipts(prev =>
        prev.map(r =>
          r.sampleId === editTarget.sampleId
            ? {
                ...r,
                patient: formData.patientName,
                tests: formData.tests,
                sampleType: formData.sampleType as Receipt['sampleType'],
                collectedAt: formData.collectedAt,
                receivedDate: formData.receivedDate,
                receivedTime: formData.receivedTime,
                receivedBy: formData.receivedBy,
                temperatureOnArrival: formData.temperatureOnArrival,
                acceptanceDecision: formData.acceptanceDecision,
                rejectionReason: formData.rejectionReason,
                departmentRouting: formData.departmentRouting,
                storageLocation: formData.storageLocation,
                aliquotingRequired: formData.aliquotingRequired,
                numberOfAliquots: formData.numberOfAliquots,
                remarks: formData.remarks,
                status: formData.acceptanceDecision === 'Accepted' ? 'accepted' : 
                        formData.acceptanceDecision === 'Rejected' ? 'rejected' : 'pending',
                condition: formData.acceptanceDecision === 'Accepted' ? 'good' : 
                          formData.acceptanceDecision === 'Rejected' ? (formData.rejectionReason as any) : undefined,
              }
            : r
        )
      );
    } else {
      // Add mode: create new receipt
      const newReceipt: Receipt = {
        sampleId: formData.sampleId || `LAB-${Date.now()}`,
        patient: formData.patientName,
        tests: formData.tests,
        sampleType: formData.sampleType as Receipt['sampleType'],
        collectedAt: formData.collectedAt,
        receivedDate: formData.receivedDate,
        receivedTime: formData.receivedTime,
        receivedBy: formData.receivedBy,
        temperatureOnArrival: formData.temperatureOnArrival,
        acceptanceDecision: formData.acceptanceDecision,
        rejectionReason: formData.rejectionReason,
        departmentRouting: formData.departmentRouting,
        storageLocation: formData.storageLocation,
        aliquotingRequired: formData.aliquotingRequired,
        numberOfAliquots: formData.numberOfAliquots,
        remarks: formData.remarks,
        status: formData.acceptanceDecision === 'Accepted' ? 'accepted' : 
                formData.acceptanceDecision === 'Rejected' ? 'rejected' : 'pending',
        condition: formData.acceptanceDecision === 'Accepted' ? 'good' : 
                  formData.acceptanceDecision === 'Rejected' ? (formData.rejectionReason as any) : undefined,
      };

      setReceipts(prev => [...prev, newReceipt]);
    }

    setModalOpen(false);
    setEditTarget(null);
  };

  const handleEdit = (receipt: Receipt) => {
    setEditTarget(receipt);
    setModalOpen(true);
  };

  const handleAccept = (receiptId: string) => {
    setReceipts(prev =>
      prev.map(r =>
        r.sampleId === receiptId
          ? { ...r, status: 'accepted' as const, condition: 'good' as const }
          : r
      )
    );
  };

  const handleReject = (receiptId: string, condition: Receipt['condition']) => {
    setReceipts(prev =>
      prev.map(r =>
        r.sampleId === receiptId
          ? { ...r, status: 'rejected' as const, condition }
          : r
      )
    );
  };

  const handleDelete = (receiptId: string) => {
    setReceipts(prev => prev.filter(r => r.sampleId !== receiptId));
  };

  const handleOpenModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  // Convert Receipt to ReceiptInitialData for the form
  const getInitialData = (): ReceiptInitialData | null => {
    if (!editTarget) return null;
    return {
      sampleId: editTarget.sampleId,
      patientName: editTarget.patient,
      tests: editTarget.tests,
      sampleType: editTarget.sampleType,
      collectedAt: editTarget.collectedAt,
      department: editTarget.departmentRouting,
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Modals ── */}
      <AddNewReceipt
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initial={getInitialData()}
      />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Microscope size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Sample <span className="text-emerald-600">Collection & Acceptance</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              Manage and track diagnostic sample collections.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-1.5">
            {receipts.length} Samples
          </Badge>
          <Button
            size="sm"
            onClick={handleOpenModal}
            variant="gradient"
            className="gap-2 shadow-sm"
          >
            <Plus size={16} />
            Add Sample
          </Button>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Sample ID or Patient..."
            className="input-refined w-full py-2.5 pl-10 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="input-refined py-2 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none w-full"
            >
              {SAMPLE_TYPES.map(type => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="relative flex-1 lg:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-refined py-2 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none w-full"
            >
              {STATUS_OPTIONS.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Receipts Table ── */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tests</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collected At</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Condition</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                      <Package size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">No samples found</p>
                      <p className="text-xs font-medium text-slate-400">Try adjusting your filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map((receipt, idx) => (
              <tr key={receipt.sampleId} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {receipt.sampleId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <User size={20} />
                    </div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                      {receipt.patient}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {receipt.tests.map((test, i) => (
                      <Badge key={i} variant="primary" className="text-[9px] px-2 py-0.5">
                        {test}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className="px-2.5 py-1 text-[10px] font-bold uppercase">
                    {receipt.sampleType}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold">{receipt.collectedAt}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={receipt.status} />
                </td>
                <td className="px-6 py-4">
                  <ConditionBadge condition={receipt.condition} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {receipt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(receipt.sampleId)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                          title="Accept Sample"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(receipt.sampleId, 'haemolysed')}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                          title="Reject Sample"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleEdit(receipt)}
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                      title="Edit Sample"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(receipt.sampleId)}
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                      title="Delete Sample"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button className="p-1.5 text-slate-300 hover:text-slate-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer Stats ── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{receipts.length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Samples</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{receipts.filter(r => r.status === 'accepted').length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{receipts.filter(r => r.status === 'pending').length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">{receipts.filter(r => r.status === 'rejected').length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
}
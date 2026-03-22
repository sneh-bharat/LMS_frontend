'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Scan,
  Package,
  Truck,
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Calendar,
  ChevronRight,
  SearchX,
  ClipboardList,
  MoreVertical,
  ArrowRightCircle,
  Activity,
  User,
  Building,
  FileText,
  Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SampleRow {
  barcode: string;
  patientName: string;
  investigation: string;
  collectedAt: string;
  collectedBy: string;
  status: 'Collected' | 'Pending' | 'Processing' | 'Dispatched' | 'Received';
  department: string;
}

const STATUS_ICONS: Record<string, { icon: any; color: string }> = {
  Collected: { icon: <CheckCircle2 size={12} />, color: 'emerald' },
  Pending: { icon: <Clock size={12} />, color: 'amber' },
  Processing: { icon: <Activity size={12} />, color: 'blue' },
  Dispatched: { icon: <Truck size={12} />, color: 'purple' },
  Received: { icon: <Package size={12} />, color: 'cyan' },
};

// ─── Bulk Collection Modal ────────────────────────────────────────────────────
function BulkCollectionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [barcodes, setBarcodes] = useState('');
  const [status, setStatus] = useState('Collected');

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 px-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bulk Collection</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <SearchX size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="label-refined">Scan or Paste Barcodes</label>
            <textarea
              value={barcodes}
              onChange={e => setBarcodes(e.target.value)}
              placeholder="Enter barcodes, one per line..."
              rows={5}
              className="input-refined w-full p-4 font-bold text-slate-700 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="label-refined">Target Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="input-refined w-full px-10 appearance-none font-bold"
              >
                {Object.keys(STATUS_ICONS).map(s => <option key={s}>{s}</option>)}
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {STATUS_ICONS[status].icon}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-8">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider">Cancel</Button>
          <Button variant="gradient" className="flex-1 rounded-lg py-2.5 font-bold uppercase text-xs tracking-wider shadow-sm">Update Batch</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SampleTrackingPage() {
  const [barcode, setBarcode] = useState('');
  const [statusFilter, setStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('2026-03-02');
  const [deptFilter, setDeptFilter] = useState('All');
  const [results, setResults] = useState<SampleRow[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleBarcodSearch = () => {
    if (!barcode.trim()) return;
    setSearched(true);
    // Demo data for visual feedback
    setResults([
      { barcode, patientName: 'John Doe', investigation: 'HBA1C (Diabetes Check)', collectedAt: '2026-03-22 10:30 AM', collectedBy: 'Technician A', status: 'Processing', department: 'Biochemistry' },
      { barcode: 'INV-982347', patientName: 'John Doe', investigation: 'Complete Blood Count', collectedAt: '2026-03-22 10:32 AM', collectedBy: 'Technician A', status: 'Processing', department: 'Haematology' }
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleBarcodSearch();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <BulkCollectionModal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} />

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Sample <span className="text-emerald-600">Tracking</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Real-time monitoring of diagnostic specimens.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)} className="gap-2">
            <Package size={16} /> Bulk Collection
          </Button>
          <Button variant="gradient" size="sm" className="gap-2 shadow-sm">
            <Scan size={16} /> New Scan
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1">
          <Scan className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            ref={inputRef}
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scan Invoice Barcode..."
            className="input-refined w-full py-2.5 pl-10 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="input-refined py-1.5 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Statuses</option>
              {Object.keys(STATUS_ICONS).map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 transition-transform rotate-90 text-slate-300 pointer-events-none" size={10} />
          </div>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="input-refined py-1.5 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Depts</option>
              <option>Pathology</option>
              <option>Biochemistry</option>
              <option>Hematology</option>
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 transition-transform rotate-90 text-slate-300 pointer-events-none" size={10} />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input-refined py-1.5 px-3 text-[10px] font-bold"
          />
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="min-h-[400px] flex flex-col">
        {!searched ? (
          <div className="bg-white rounded-xl p-16 border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100">
              <Scan size={48} className="animate-pulse" />
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Awaiting Specimen Scan</h2>
              <p className="text-slate-500 text-sm font-medium">
                Scan barcode or enter manually to track lifecycle status.
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500" /> Integrity Active
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-200"></span>
              <span className="flex items-center gap-1.5">
                <Activity size={12} className="text-blue-500" /> Cloud Sync
              </span>
            </div>
          </div>
        ) : results && results.length === 0 ? (
          <div className="bg-white rounded-xl p-16 border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-24 h-24 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-200 border border-rose-100">
              <SearchX size={48} />
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">No Records Found</h2>
              <p className="text-slate-500 text-sm font-medium">
                Barcode <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">{barcode}</code> not recognized.
              </p>
            </div>
            <Button
              onClick={() => { setSearched(false); setBarcode(''); }}
              variant="outline"
              size="sm"
              className="px-8 rounded-lg"
            >
              Search Again
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 uppercase tracking-tight">Search Results</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{results?.length} records found for "{barcode}"</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2 rounded-lg text-[10px] font-bold uppercase tracking-widest py-1.5">
                <Download size={14} /> Export CSV
              </Button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Specimen</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Investigation</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Log</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(results ?? []).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all border border-slate-100">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{row.patientName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.barcode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FlaskConical size={12} className="text-slate-300" />
                          {row.investigation}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4.5">{row.department}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Calendar size={10} className="text-slate-300" />
                          {row.collectedAt}
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 italic pl-4">by {row.collectedBy}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          row.status === 'Collected' ? 'success' :
                            row.status === 'Processing' ? 'primary' :
                              row.status === 'Pending' ? 'warning' :
                                row.status === 'Received' ? 'info' : 'secondary'
                        }
                        className="gap-1.5"
                      >
                        {STATUS_ICONS[row.status].icon}
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-1.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
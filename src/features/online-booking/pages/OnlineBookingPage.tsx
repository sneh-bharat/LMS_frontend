'use client';

import { useState } from 'react';
import { 
  Search, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Mail,
  Package,
  MapPin
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import Input from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import ViewDetails from '../components/ViewDetails';

export interface OnlineBooking {
  id: number;

  // Booking Info
  bookingId: string; // e.g. BOK-20240327-0001
  bookingDate: string; // ISO Date

  // Patient Info
  patientName: string;
  phoneNumber: string;
  email: string;

  // Test Info
  testPackage: string;
  collectionCenter: string;

  // Schedule
  scheduledDateTime: string; // ISO DateTime

  // Payment Info
  amountPaid: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';

  // Booking Status
  bookingStatus:
    | 'Pending'
    | 'Confirmed'
    | 'Completed'
    | 'Cancelled'
    | 'No Show';

  // IDs
  uhid: string;
  sampleId: string;

  // Audit
  lastModified: string; // ISO DateTime
}

export const SAMPLE_ONLINE_BOOKINGS: OnlineBooking[] = [
  {
    id: 1,
    bookingId: 'BOK-20240327-0001',
    bookingDate: '2024-03-27',

    patientName: 'Rajesh Kumar',
    phoneNumber: '9876543210',
    email: 'rajesh.kumar@gmail.com',

    testPackage: 'Basic Health Checkup',
    collectionCenter: 'Main Collection Center',

    scheduledDateTime: '2024-03-28T09:00:00',

    amountPaid: 2950,
    paymentStatus: 'Paid',

    bookingStatus: 'Pending',

    uhid: 'UH-20240327-001',
    sampleId: 'SAM-BOK-20240327-0001',

    lastModified: '2024-03-27T14:35:20',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_OPTIONS = [
  'Booking ID',
  'Patient Name',
  'Phone Number',
  'UHID',
  'Sample ID',
] as const;

const STATUS_FILTER_OPTIONS = [
  'All',
  'Pending',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No Show',
] as const;

const PAYMENT_STATUS_OPTIONS = [
  'All',
  'Paid',
  'Pending',
  'Failed',
] as const;

export default function OnlineBookingPage() {
  const [searchBy, setSearchBy] = useState<string>('Booking ID');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentStatus, setPaymentStatus] = useState<string>('All');
  const [selectedBooking, setSelectedBooking] = useState<OnlineBooking | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  // Today's date range
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  const dateRange = `${fmt(today)} - ${fmt(today)}`;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'No Show':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleViewDetails = (booking: OnlineBooking) => {
    setSelectedBooking(booking);
    setIsViewDetailsOpen(true);
  };

  const handleCloseViewDetails = () => {
    setIsViewDetailsOpen(false);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ════════════════════════════════════════════════════════
          ROW 1 — Header & Search
      ════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CalendarIcon size={20} />
              
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Online Bookings</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Manage online appointment bookings</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-1 md:max-w-xl">
            <div className="w-48">
              <Select value={searchBy} onValueChange={(val) => setSearchBy(val || '')}>
                <SelectTrigger className="h-10 bg-slate-50 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-700">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_OPTIONS.map(opt => (
                    <SelectItem key={opt} value={opt} className="text-xs font-bold uppercase tracking-wider">{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search booking record..."
                className="pl-10 h-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            ROW 2 — Filters
        ════════════════════════════════════════════════════════ */}
        <div className="bg-slate-50/50 p-3 flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-2 h-9 px-3 border border-slate-200 rounded-xl bg-white text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <CalendarIcon size={14} className="text-slate-400" />
            <span>{dateRange}</span>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || '')}>
              <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Booking Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-slate-400" />
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v || '')}>
              <SelectTrigger className="h-9 w-[160px] bg-white border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            TABLE
        ════════════════════════════════════════════════════════ */}
        <div className="overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-16">#</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Booking & Patient Info</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Test Package</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collection Center</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scheduled Date</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ONLINE_BOOKINGS.map((booking, index) => (
                <tr key={booking.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{booking.bookingId}</span>
                        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border-slate-200">
                          {booking.uhid}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <User size={10} />
                          <span>{booking.patientName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone size={10} />
                          <span>{booking.phoneNumber}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Mail size={10} />
                        <span>{booking.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package size={12} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700">{booking.testPackage}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={12} className="text-slate-400" />
                      <span className="text-xs text-slate-600">{booking.collectionCenter}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-700">
                          {new Date(booking.scheduledDateTime).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-slate-500">
                          {new Date(booking.scheduledDateTime).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-xs font-bold text-slate-900">₹{booking.amountPaid.toLocaleString('en-IN')}</div>
                    <Badge className={cn("mt-1 text-[9px] font-bold uppercase tracking-wider border", getPaymentStatusBadgeColor(booking.paymentStatus))}>
                      {booking.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className={cn("text-[9px] font-bold uppercase tracking-wider border", getStatusBadgeColor(booking.bookingStatus))}>
                      {booking.bookingStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleViewDetails(booking)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all text-xs font-bold uppercase tracking-wider"
                    >
                      View Details
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBooking && (
        <ViewDetails
          booking={selectedBooking}
          isOpen={isViewDetailsOpen}
          onClose={handleCloseViewDetails}
        />
      )}
    </div>
  );
}
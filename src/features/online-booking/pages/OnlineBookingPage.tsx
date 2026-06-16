'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Filter, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Input from '@/components/ui/input';
import ViewDetails from '../components/ViewDetails';
import { OnlineBookingTable } from '../components/OnlineBookingTable';
import {
  PAYMENT_STATUS_OPTIONS,
  SAMPLE_ONLINE_BOOKINGS,
  SEARCH_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../constants/online-booking';
import type { OnlineBooking } from '../types/online-booking.types';

export default function OnlineBookingPage() {
  const [searchBy, setSearchBy] = useState('Booking ID');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatus, setPaymentStatus] = useState('All');
  const [selectedBooking, setSelectedBooking] = useState<OnlineBooking | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  const dateRange = `${fmt(today)} - ${fmt(today)}`;

  const handleViewDetails = (booking: OnlineBooking) => {
    setSelectedBooking(booking);
    setIsViewDetailsOpen(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-700">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h1 className="mb-1 text-xl font-bold leading-none tracking-tight text-slate-900">Online Bookings</h1>
              <p className="text-[10px] font-bold uppercase leading-none tracking-widest text-slate-500">
                Manage online appointment bookings
              </p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 md:max-w-xl">
            <div className="w-48">
              <Select value={searchBy} onValueChange={(val) => setSearchBy(val || '')}>
                <SelectTrigger className="h-10 border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  {SEARCH_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-xs font-bold uppercase tracking-wider">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="group relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-500" size={16} />
              <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search booking record..." className="h-10 w-full pl-10" />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 bg-slate-50/50 p-3">
          <div className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-700">
            <CalendarIcon size={14} className="text-slate-400" />
            <span>{dateRange}</span>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || '')}>
              <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Booking Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-slate-400" />
            <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v || '')}>
              <SelectTrigger className="h-9 w-[160px] border-slate-200 bg-white text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} className="text-[11px] font-bold uppercase tracking-wider">
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <OnlineBookingTable bookings={SAMPLE_ONLINE_BOOKINGS} onViewDetails={handleViewDetails} />
      </div>

      {selectedBooking && (
        <ViewDetails
          booking={selectedBooking}
          isOpen={isViewDetailsOpen}
          onClose={() => {
            setIsViewDetailsOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

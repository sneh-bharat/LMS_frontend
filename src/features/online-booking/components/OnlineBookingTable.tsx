'use client';

import { ChevronRight, Clock, Mail, MapPin, Package, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OnlineBooking } from '../types/online-booking.types';
import { BOOKING_STATUS_COLORS, PAYMENT_STATUS_COLORS, fallbackBadge } from '../constants/online-booking';

export interface OnlineBookingTableProps {
  bookings: OnlineBooking[];
  onViewDetails: (booking: OnlineBooking) => void;
}

export function OnlineBookingTable({ bookings, onViewDetails }: OnlineBookingTableProps) {
  return (
    <div className="overflow-hidden">
      <table className="w-full text-left">
        <thead className="border-y border-slate-200 bg-slate-50">
          <tr>
            <th className="w-16 px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">#</th>
            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Booking &amp; Patient Info</th>
            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Test Package</th>
            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Collection Center</th>
            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Scheduled Date</th>
            <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
            <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
            <th className="px-6 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking, index) => (
            <tr key={booking.id} className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
              <td className="px-6 py-4 text-center"><span className="text-xs font-bold text-slate-600">{index + 1}</span></td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{booking.bookingId}</span>
                    <Badge variant="outline" className="border-slate-200 bg-slate-100 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      {booking.uhid}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1"><User size={10} /><span>{booking.patientName}</span></div>
                    <div className="flex items-center gap-1"><Phone size={10} /><span>{booking.phoneNumber}</span></div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500"><Mail size={10} /><span>{booking.email}</span></div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2"><Package size={12} className="text-slate-400" /><span className="text-xs font-semibold text-slate-700">{booking.testPackage}</span></div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" /><span className="text-xs text-slate-600">{booking.collectionCenter}</span></div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Clock size={12} className="text-slate-400" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-700">
                      {new Date(booking.scheduledDateTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-slate-500">
                      {new Date(booking.scheduledDateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="text-xs font-bold text-slate-900">₹{booking.amountPaid.toLocaleString('en-IN')}</div>
                <Badge className={cn('mt-1 border text-[9px] font-bold uppercase tracking-wider', PAYMENT_STATUS_COLORS[booking.paymentStatus] ?? fallbackBadge)}>
                  {booking.paymentStatus}
                </Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <Badge className={cn('border text-[9px] font-bold uppercase tracking-wider', BOOKING_STATUS_COLORS[booking.bookingStatus] ?? fallbackBadge)}>
                  {booking.bookingStatus}
                </Badge>
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => onViewDetails(booking)}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 transition-all hover:bg-emerald-100"
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
  );
}

export default OnlineBookingTable;

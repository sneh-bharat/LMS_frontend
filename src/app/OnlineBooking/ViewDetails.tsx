'use client';

import { useState } from 'react';
import {
  Download,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Package,
  MapPin,
  DollarSign,
  CheckCircle2,
  FileText,
  Printer,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import RightDrawer from '@/components/ui/right-drawer';
import { Button } from '@/components/ui/button';
import { OnlineBooking } from './page';

interface ViewDetailsProps {
  booking: OnlineBooking;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
}

export default function ViewDetails({
  booking,
  isOpen,
  onClose,
  onEdit,
  onCancel,
}: ViewDetailsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'documents'>('details');

  const getStatusColor = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const timelineEvents = [
    {
      status: 'Booking Created',
      timestamp: booking.bookingDate,
      description: 'Online booking request submitted',
      icon: <Calendar size={16} />,
      color: 'emerald',
    },
    {
      status: 'Payment Received',
      timestamp: booking.bookingDate,
      description: `₹${booking.amountPaid.toLocaleString('en-IN')} received via online payment`,
      icon: <DollarSign size={16} />,
      color: booking.paymentStatus === 'Paid' ? 'emerald' : 'slate',
    },
    {
      status: 'Booking Confirmed',
      timestamp: booking.bookingDate,
      description: 'Sample collection scheduled',
      icon: <CheckCircle2 size={16} />,
      color: booking.bookingStatus === 'Confirmed' ? 'emerald' : 'slate',
    },
  ];

  const documents = [
    {
      name: 'Booking Confirmation',
      type: 'PDF',
      size: '245 KB',
      date: booking.bookingDate,
    },
    {
      name: 'Test Package Details',
      type: 'PDF',
      size: '128 KB',
      date: booking.bookingDate,
    },
    {
      name: 'Payment Receipt',
      type: 'PDF',
      size: '89 KB',
      date: booking.bookingDate,
    },
  ];

  const footerContent = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
        Last Modified: {formatDateTime(booking.lastModified)}
      </p>

      <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
        <Button variant="outline" size="sm" className="gap-2">
          <Printer size={14} />
          Print
        </Button>

        <Button variant="outline" size="sm" className="gap-2">
          <Send size={14} />
          SMS
        </Button>

        {booking.bookingStatus === 'Pending' && (
          <>
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
            >
              Edit
            </Button>

            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50"
            >
              Cancel
            </Button>
          </>
        )}

        <Button onClick={onClose} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          Close
        </Button>
      </div>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Booking Details"
      description={`${booking.bookingId} • ${formatDate(booking.bookingDate)}`}
      footer={footerContent}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* ════════════════════════════════════════════════════════
            STATUS BADGES
        ════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Booking Status:
            </span>
            <Badge
              className={cn(
                'text-xs font-bold uppercase tracking-wider border',
                getStatusColor(booking.bookingStatus)
              )}
            >
              {booking.bookingStatus}
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Payment Status:
            </span>
            <Badge
              className={cn(
                'text-xs font-bold uppercase tracking-wider border',
                getPaymentStatusColor(booking.paymentStatus)
              )}
            >
              {booking.paymentStatus}
            </Badge>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            TABS
        ════════════════════════════════════════════════════════ */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <FileText size={16} />
              <span className="hidden sm:inline">Booking Details</span>
              <span className="sm:hidden">Details</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock size={16} />
              <span className="hidden sm:inline">Timeline</span>
              <span className="sm:hidden">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Download size={16} />
              <span className="hidden sm:inline">Documents</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* ════════════════════════════════════════════════════════
              DETAILS TAB
          ════════════════════════════════════════════════════════ */}
          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar size={20} className="text-[#FF671F]" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Booking ID
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.bookingId}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Booking Date
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(booking.bookingDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      UHID
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.uhid}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Sample ID
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.sampleId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User size={20} className="text-[#FF671F]" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Patient Name
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.patientName}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Phone Number
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.phoneNumber}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Email Address
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test & Collection Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package size={20} className="text-[#FF671F]" />
                  Test & Collection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Test Package
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.testPackage}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Collection Center
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {booking.collectionCenter}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Scheduled Date & Time
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(booking.scheduledDateTime)} at{' '}
                      {formatTime(booking.scheduledDateTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
                  <DollarSign size={20} className="text-[#FF671F]" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      Amount Paid
                    </p>
                    <p className="text-3xl font-black text-emerald-700">
                      ₹{booking.amountPaid.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      'text-sm font-bold uppercase tracking-wider border',
                      getPaymentStatusColor(booking.paymentStatus)
                    )}
                  >
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════
              TIMELINE TAB
          ════════════════════════════════════════════════════════ */}
          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0',
                            event.color === 'emerald'
                              ? 'bg-emerald-600'
                              : 'bg-slate-300'
                          )}
                        >
                          {event.icon}
                        </div>
                        {index < timelineEvents.length - 1 && (
                          <div className="w-1 h-12 bg-gradient-to-b from-slate-300 to-slate-200" />
                        )}
                      </div>

                      <div className="flex-1 pt-2 pb-4">
                        <h4 className="text-sm font-bold text-slate-900 mb-1">
                          {event.status}
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">
                          {formatDateTime(event.timestamp)}
                        </p>
                        <p className="text-sm text-slate-700">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════
              DOCUMENTS TAB
          ════════════════════════════════════════════════════════ */}
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <FileText size={20} className="text-[#FF671F]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {doc.type} • {doc.size} • {formatDate(doc.date)}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RightDrawer>
  );
}
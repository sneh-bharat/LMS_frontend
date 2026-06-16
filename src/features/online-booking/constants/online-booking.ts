import type { OnlineBooking } from '../types/online-booking.types';

export const SEARCH_OPTIONS = ['Booking ID', 'Patient Name', 'Phone Number', 'UHID', 'Sample ID'] as const;
export const STATUS_FILTER_OPTIONS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled', 'No Show'] as const;
export const PAYMENT_STATUS_OPTIONS = ['All', 'Paid', 'Pending', 'Failed'] as const;

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-red-100 text-red-700 border-red-200',
  'No Show': 'bg-slate-100 text-slate-700 border-slate-200',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Failed: 'bg-red-100 text-red-700 border-red-200',
};

export const fallbackBadge = 'bg-slate-100 text-slate-700 border-slate-200';

/** TODO: replace with API — fixture preserved from the original page. */
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

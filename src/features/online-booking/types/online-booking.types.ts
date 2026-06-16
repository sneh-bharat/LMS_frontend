export type PaymentStatus = 'Paid' | 'Pending' | 'Failed';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface OnlineBooking {
  id: number;
  bookingId: string;
  bookingDate: string;
  patientName: string;
  phoneNumber: string;
  email: string;
  testPackage: string;
  collectionCenter: string;
  scheduledDateTime: string;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  uhid: string;
  sampleId: string;
  lastModified: string;
}

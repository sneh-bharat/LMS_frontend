import { DEFAULT_ORDER_PRIORITY } from '@/app/Apis/booking/orderPriority';
import {
  DEFAULT_COLLECTION_TIME,
  isoDateOffset,
} from './booking/bookingFormDefaults';

export interface DiagnosticBookingFormState {
  country: string;
  mobile: string;
  title: string;
  patientName: string;
  age: string;
  month: string;
  day: string;
  gender: string;
  address: string;
  email: string;
  diagnosis: string;
  nationality: string;
  drugAllergy: string;
  diseases: string[];
  referredDoctor: string;
  referringDoctorId?: number | null;
  referringHospitalId?: number | null;
  referrer: string;
  processing: string;
  emergencyCharge: string;
  phlebotomist: string;
  contrast: string;
  discount: string;
  discountType: string;
  discountBy: string;
  concessionAmount: string;
  concessionBy: string;
  collectionDate: string;
  collectionTime: string;
  expectedReportDate: string;
  payment: string;
  paymentMode: string;
  paymentReference: string;
  createdByName: string;
  srfId: string;
  lmpDate: string;
  patientId?: number;
}

export interface EstimationMetaState {
  estimationDate: string;
  validUntil: string;
  remarks: string;
  estimatedTaxAmount: string;
}

export const TITLES = ['Mr.', 'Ms.', 'Mrs.', 'Dr.', 'Smt.', 'Baby', 'M/s'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const PAY_MODES = ['Cash', 'Card', 'UPI', 'Online', 'Credit'];
export const DISC_TYPES = ['%', 'Flat'];

export const BLANK_BOOKING_FORM: DiagnosticBookingFormState = {
  country: 'IND +91',
  mobile: '',
  title: 'Mr.',
  patientName: '',
  age: '',
  month: '0',
  day: '0',
  gender: 'Male',
  address: '',
  email: '',
  diagnosis: '',
  nationality: 'IND-India',
  drugAllergy: '',
  diseases: [],
  referredDoctor: '',
  referringDoctorId: null,
  referringHospitalId: null,
  referrer: '',
  processing: DEFAULT_ORDER_PRIORITY,
  emergencyCharge: '',
  phlebotomist: '',
  contrast: '',
  discount: '0',
  discountType: '%',
  discountBy: 'N/A',
  concessionAmount: '0',
  concessionBy: '',
  collectionDate: isoDateOffset(1),
  collectionTime: DEFAULT_COLLECTION_TIME,
  expectedReportDate: isoDateOffset(2),
  payment: '',
  paymentMode: 'Cash',
  paymentReference: '',
  createdByName: '',
  srfId: '',
  lmpDate: '',
};

export function createEstimationMetaDefaults(): EstimationMetaState {
  const today = isoDateOffset(0);
  return {
    estimationDate: today,
    validUntil: isoDateOffset(30),
    remarks: '',
    estimatedTaxAmount: '',
  };
}

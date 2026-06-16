import type { Appointment, FormState, TestInfo } from '../types/appointment.types';

export const TESTS: Record<string, TestInfo[]> = {
  'Blood Test': [
    { name: 'Complete Blood Count (CBC)', fee: 400 },
    { name: 'Blood Sugar (Fasting)', fee: 200 },
  ],
  'Urine Test': [{ name: 'Routine Urine Test', fee: 150 }],
  Imaging: [
    { name: 'X-Ray Chest', fee: 800 },
    { name: 'Ultrasound Abdomen', fee: 1200 },
  ],
};

export const DEPARTMENTS = ['Blood Test', 'Urine Test', 'Imaging'];

export const ALL_SLOTS = [
  { time: '09:00 AM - 09:30 AM', booked: false },
  { time: '10:00 AM - 10:30 AM', booked: false, next: true },
  { time: '11:00 AM - 11:30 AM', booked: true },
  { time: '12:00 PM - 12:30 PM', booked: true },
  { time: '02:00 PM - 02:30 PM', booked: false },
  { time: '03:00 PM - 03:30 PM', booked: true },
  { time: '04:00 PM - 04:30 PM', booked: false },
  { time: '05:00 PM - 05:30 PM', booked: false },
];

export const CONSULTING_TYPE_VALUES = ['Clinic Collection', 'Home Collection', 'Video Consultation'];

export const BLANK_FORM: FormState = {
  consultingType: 'Clinic Visit',
  department: '',
  doctor: '',
  slot: '',
  date: '',
  patientName: '',
  age: '',
  gender: 'Male',
  phone: '',
  permanentAddress: '',
  localAddress: '',
  pincode: '',
  city: '',
  country: 'India',
  email: '',
  whatsapp: '',
  contactNumber: '',
  selectedTest: '',
};

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    patientName: 'Rahul Sen',
    age: 32,
    gender: 'Male',
    phone: '9876543210',
    consultingType: 'Home Collection',
    department: 'Blood Test',
    selectedTest: 'Complete Blood Count (CBC)',
    slot: '10:00 AM - 10:30 AM',
    date: '2026-03-28',
    email: 'rahul@example.com',
    whatsapp: '9876543210',
    permanentAddress: 'Kolkata',
    localAddress: '',
    pincode: '700001',
    city: 'Kolkata',
    country: 'India',
    contactNumber: '9876543210',
    doctor: '',
  },
];

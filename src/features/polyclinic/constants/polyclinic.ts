import type { VisitType } from '../components/types';
import type { Day, OpdScheduleFormData } from '../types/opd-schedule.types';

export const DEPARTMENTS = [
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'General Medicine',
  'Dermatology',
  'ENT',
  'Gynecology',
];

export const VISIT_TYPES: VisitType[] = ['OPD', 'Diagnostic', 'Follow-up', 'Emergency'];

export const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Arjun Mehta', department: 'Cardiology' },
  { id: 2, name: 'Dr. Priya Sharma', department: 'Neurology' },
  { id: 3, name: 'Dr. Rahul Verma', department: 'Orthopedics' },
  { id: 4, name: 'Dr. Sunita Patel', department: 'Dermatology' },
  { id: 5, name: 'Dr. Vikram Singh', department: 'Pediatrics' },
  { id: 6, name: 'Dr. Neha Kapoor', department: 'Gynecology' },
  { id: 7, name: 'Dr. Anil Kumar', department: 'ENT' },
  { id: 8, name: 'Dr. Meera Joshi', department: 'Ophthalmology' },
  { id: 9, name: 'Dr. Sanjay Gupta', department: 'Cardiology' },
  { id: 10, name: 'Dr. Ritu Agarwal', department: 'Psychiatry' },
  { id: 11, name: 'Dr. Karan Malhotra', department: 'Urology' },
  { id: 12, name: 'Dr. Pooja Reddy', department: 'Endocrinology' },
];

export const MOCK_CENTERS = ['Main Hospital', 'City Clinic', 'North Branch', 'South Campus', 'East Wing'];
export const ALL_DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const SLOT_DURATIONS = [5, 10, 15, 20, 30, 45, 60];

export const EMPTY_OPD_FORM: OpdScheduleFormData = {
  doctorId: 0,
  doctorName: '',
  department: '',
  center: '',
  days: [],
  startTime: '',
  endTime: '',
  slotDuration: 15,
  maxPatients: 4,
  status: 'Active',
};

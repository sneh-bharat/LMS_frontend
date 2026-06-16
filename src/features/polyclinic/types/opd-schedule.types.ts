export type ScheduleStatus = 'Active' | 'Inactive';
export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export interface OpdSchedule {
  id: number;
  doctorName: string;
  department: string;
  center: string;
  days: Day[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  status: ScheduleStatus;
}

export interface OpdScheduleFormData {
  doctorId: number;
  doctorName: string;
  department: string;
  center: string;
  days: Day[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  maxPatients: number;
  status: ScheduleStatus;
}

export type QueueStatus = 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled';
export type VisitType = 'OPD' | 'Diagnostic' | 'Follow-up' | 'Emergency';

export interface QueueFormData {
  patientName: string;
  mobile: string;
  department: string;
  visitType: VisitType;
  doctorId: number;
}

export interface QueuePatient {
  id: number;
  tokenNumber: string;
  patientName: string;
  mobile: string;
  department: string;
  doctorId: number;
  doctorName: string;
  visitType: string;
  status: QueueStatus;
  checkInTime: string;
  consultationStartTime?: string;
  consultationEndTime?: string;
  createdAt: string;
}

export interface QueueStats {
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  currentToken: string;
  nextToken: string;
}

export interface DoctorInfo {
  id: number;
  name: string;
  department: string;
  specialization: string;
}

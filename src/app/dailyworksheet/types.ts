export interface DailyWorksheetEntry {
  id: number;
  sampleId: string;
  patientName: string;
  patientId: string;
  testName: string;
  testCode: string;
  department: string;
  franchise?: string;
  invoiceNumber?: string;
  departureTime: string;
  arrivalTime: string;
  deptReceivedTime: string;
  analysisTime: string;
  resultEntryTime: string;
  approvalTime: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Approved';
  priority: 'Routine' | 'Urgent' | 'STAT';
  technician?: string;
}

export interface TimeRange {
  from: string;
  to: string;
}

export interface WorksheetFilter {
  dateFrom: string;
  dateTo: string;
  invoiceFrom?: string;
  invoiceTo?: string;
  department?: string;
  franchise?: string;
  invoiceWise: boolean;
}

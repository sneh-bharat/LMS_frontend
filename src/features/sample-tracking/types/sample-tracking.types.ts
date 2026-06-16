export type SampleStatus = 'Collected' | 'Pending' | 'Processing' | 'Dispatched' | 'Received';

export interface SampleRow {
  barcode: string;
  patientName: string;
  investigation: string;
  collectedAt: string;
  collectedBy: string;
  status: SampleStatus;
  department: string;
}

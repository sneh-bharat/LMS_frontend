import { reportClient } from '@/lib/api/client';

export interface ReportEntry {
  id: number;
  testOrderItemId: number;
  resultValue?: string;
  resultStatus: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface ReportEntryPayload {
  testOrderItemId: number;
  resultValue: string;
  remarks?: string;
}

export interface BulkReportParams {
  fromDate?: string;
  toDate?: string;
  patientId?: number;
  branchId?: number;
}

export const reportService = {
  getEntry: (testOrderItemId: number): Promise<{ data: ReportEntry }> =>
    reportClient.get(`/api/v1/report-entries/${testOrderItemId}`),

  saveEntry: (payload: ReportEntryPayload): Promise<{ data: ReportEntry }> =>
    reportClient.post('/api/v1/report-entries', payload),

  verifyEntry: (id: number) =>
    reportClient.put(`/api/v1/report-entries/${id}/verify`),

  bulkDownload: (params: BulkReportParams) =>
    reportClient.get('/api/v1/reports/bulk', { params, responseType: 'blob' }),

  getMisReport: (params: BulkReportParams) =>
    reportClient.get('/api/v1/reports/mis', { params }),
};

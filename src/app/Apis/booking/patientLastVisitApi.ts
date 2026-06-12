import bookingAxios from './axios';

export interface PatientLastVisitData {
  age: number;
  bookingId: number;
  branchId: number;
  branchName: string;
  dueAmount: number;
  gender: string;
  hasAbha: boolean;
  hasPendingPayment: boolean;
  lastBookedTests: string[];
  lastVisitDateTime: string;
  patientId: number;
  patientName: string;
  uhid: string;
  visitType: string;
}

export interface PatientLastVisitApiResponse {
  data: PatientLastVisitData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/test-orders/patient/{patientId}/last-visit`
 * Booking service (`NEXT_PUBLIC_API_Booking` / lims-booking) — same host as other test-order APIs.
 */
export async function fetchPatientLastVisit(
  patientId: number
): Promise<PatientLastVisitApiResponse> {
  if (!patientId || patientId < 1) {
    throw new Error('A valid patient ID is required to load last visit.');
  }

  return bookingAxios.get(
    `/test-orders/patient/${patientId}/last-visit`
  ) as Promise<PatientLastVisitApiResponse>;
}

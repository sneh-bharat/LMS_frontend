import bookingAxios from '@/app/Apis/booking/axios';

/**
 * GET /api/v1/test-orders/result-list
 * Paginated result-entry list from the booking-service.
 */

export interface ResultListParams {
  branchId?: number;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface ResultListPage {
  content: any[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ResultListApiResponse {
  data: ResultListPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export async function fetchReportList(params: ResultListParams = {}): Promise<ResultListApiResponse> {
  const search = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
    sortBy: params.sortBy ?? 'createdAt',
  });
  if (params.branchId != null && params.branchId > 0) {
    search.set('branchId', String(params.branchId));
  }
  // bookingAxios interceptor unwraps response.data at runtime
  const res = await bookingAxios.get(`/test-orders/result-list?${search.toString()}`) as unknown as ResultListApiResponse;
  return res;
}

// ─── Enter Bulk Results ───────────────────────────────────────────────────────

/**
 * POST /api/v1/results/enter-bulk
 * Submit parameter-level results for a test order in bulk.
 */

export interface ParameterResultEntry {
  parameterId: number;
  parameterName: string;
  resultValue: string;
  numericValue?: number | null;
  resultType: 'NUMERIC' | 'TEXT' | 'SELECT';
  unit: string;
  referenceLow?: number | null;
  referenceHigh?: number | null;
}

export interface EnterBulkResultsPayload {
  orderId: number;
  orderItemId: number;
  testId: number;
  requestAutoVerification: boolean;
  submitForVerification: boolean;
  parameterResults: ParameterResultEntry[];
}

export interface EnterBulkResultsApiResponse {
  data: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export async function enterBulkResults(
  payload: EnterBulkResultsPayload,
): Promise<EnterBulkResultsApiResponse> {
  const res = await bookingAxios.post('/results/enter-bulk', payload) as unknown as EnterBulkResultsApiResponse;
  return res;
}

import reportBookingAxios, { reportLabAxios } from './axios';

// ─── Shared envelope ──────────────────────────────────────────────────────────

export interface ReportApiResponse<T> {
  data: T;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

// ─── Result list ──────────────────────────────────────────────────────────────

export interface ResultListParams {
  branchId?: number;
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface ResultListPage {
  content: Record<string, unknown>[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type ResultListApiResponse = ReportApiResponse<ResultListPage>;

// ─── Parameters with reference ────────────────────────────────────────────────

export interface ParameterWithReference {
  criticalHigh: number | null;
  criticalLow: number | null;
  gender: string;
  parameterId: number;
  parameterName: string;
  patientAge: number | null;
  patientGender: string | null;
  referenceMax: number | null;
  referenceMin: number | null;
  referenceRange: string | null;
  resultType: 'NUMERIC' | 'TEXT' | 'SELECT';
  unit: string;
}

export type ParameterWithReferenceApiResponse = ReportApiResponse<ParameterWithReference[]>;

// ─── Enter results ────────────────────────────────────────────────────────────

export interface ParameterResultEntry {
  parameterId: number;
  parameterName: string;
  resultValue: string;
  numericValue?: number | null;
  resultType: 'NUMERIC' | 'TEXT' | 'SELECT';
  unit: string;
  referenceLow?: number | null;
  referenceHigh?: number | null;
  referenceRange?: string | null;
  criticalLow?: number | null;
  criticalHigh?: number | null;
}

export interface EnterBulkResultsPayload {
  orderId: number;
  orderItemId: number;
  testId: number;
  requestAutoVerification: boolean;
  submitForVerification: boolean;
  parameterResults: ParameterResultEntry[];
}

export interface EnterBulkResultsData {
  flaggedCount: number;
  totalParameters: number;
  autoVerifiedCount: number;
  orderItemId: number;
  criticalCount: number;
  skippedParameters: string[];
}

export type EnterBulkResultsApiResponse = ReportApiResponse<EnterBulkResultsData>;

export interface EnterSingleResultPayload {
  orderId: number;
  orderItemId: number;
  testId: number;
  parameterId: number;
  parameterName: string;
  resultValue: string;
  numericValue?: number | null;
  resultType: 'NUMERIC' | 'TEXT' | 'SELECT';
  unit: string;
  referenceLow?: number | null;
  referenceHigh?: number | null;
  clinicalInterpretation?: string | null;
  comments?: string | null;
  instrumentId?: string | null;
  enteredBy?: string | null;
  requestAutoVerification?: boolean;
  submitForVerification?: boolean;
}

export interface EnterSingleResultData {
  orderItemId: number;
  parameterId: number;
  abnormalFlag?: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL' | null;
  isCritical?: boolean;
  autoVerified?: boolean;
  resultStatus?: string;
}

export type EnterSingleResultApiResponse = ReportApiResponse<EnterSingleResultData>;

export interface EnterSingleResultsBatchOptions {
  orderId: number;
  orderItemId: number;
  testId: number;
  requestAutoVerification: boolean;
  submitForVerification: boolean;
  enteredBy?: string;
  comments?: string;
  instrumentId?: string;
}

export interface EnterSingleResultsBatchResult {
  responses: EnterSingleResultApiResponse[];
  criticalCount: number;
  flaggedCount: number;
  totalParameters: number;
  lastMessage: string;
}

// ─── Result detail ────────────────────────────────────────────────────────────

export interface ResultParameterRecord {
  resultId: number;
  orderItemId: number;
  parameterId: number;
  parameterName: string;
  resultValue: string;
  numericValue: number | null;
  resultType: string;
  unit: string;
  referenceLow: number | null;
  referenceHigh: number | null;
  criticalLow: number | null;
  criticalHigh: number | null;
  abnormalFlag: string | null;
  isCritical: boolean;
  isVerified: boolean;
  isCorrected: boolean;
  autoVerified: boolean;
  resultStatus: string;
  clinicalInterpretation: string | null;
  comments: string | null;
  correctedValue: string | null;
  correctionReason: string | null;
  instrumentName: string | null;
  enteredAt: string | null;
  verifiedAt: string | null;
}

export interface ResultAmendmentRecord {
  id?: number;
  amendedAt?: string;
  amendedBy?: string;
  reason?: string;
  previousValue?: string;
  newValue?: string;
  [key: string]: unknown;
}

export interface ResultApprovalRecord {
  id?: number;
  approvedAt?: string;
  approvedBy?: string;
  status?: string;
  comments?: string;
  [key: string]: unknown;
}

export interface ResultDetailData {
  result: ResultParameterRecord;
  amendmentHistory: ResultAmendmentRecord[];
  approvalHistory: ResultApprovalRecord[];
}

/** @deprecated Use ResultDetailData */
export type ResultDetailRecord = ResultDetailData;

export type GetResultByIdApiResponse = ReportApiResponse<ResultDetailData>;
export type ReportDetailsApiResponse = GetResultByIdApiResponse;
export type ReportStatusFilterChangeApiResponse = GetResultByIdApiResponse;

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET `/api/v1/test-orders/result-list`
 */
export async function fetchReportList(
  params: ResultListParams = {},
): Promise<ResultListApiResponse> {
  return reportBookingAxios.get('/test-orders/result-list', {
    params: {
      pageNo: params.pageNo ?? 0,
      pageSize: params.pageSize ?? 10,
      sortBy: params.sortBy ?? 'createdAt',
      ...(params.branchId != null && params.branchId > 0
        ? { branchId: params.branchId }
        : {}),
    },
  }) as Promise<ResultListApiResponse>;
}

/**
 * GET `/api/v1/tests/report/{testId}?gender=&age=`
 */
export async function fetchParametersWithReference(
  testId: number,
  gender: string,
  age: number,
): Promise<ParameterWithReferenceApiResponse> {
  return reportLabAxios.get(`/tests/report/${testId}`, {
    params: { gender, age },
  }) as Promise<ParameterWithReferenceApiResponse>;
}

/**
 * POST `/api/v1/results/enter-bulk`
 */
export async function enterBulkResults(
  payload: EnterBulkResultsPayload,
): Promise<EnterBulkResultsApiResponse> {
  return reportBookingAxios.post(
    '/results/enter-bulk',
    payload,
  ) as Promise<EnterBulkResultsApiResponse>;
}

/**
 * POST `/api/v1/results/enter`
 */
export async function enterSingleResult(
  payload: EnterSingleResultPayload,
): Promise<EnterSingleResultApiResponse> {
  return reportBookingAxios.post(
    '/results/enter',
    payload,
  ) as Promise<EnterSingleResultApiResponse>;
}

/**
 * POST `/api/v1/results/enter` — one call per parameter (same orderItemId).
 */
export async function enterSingleResultsBatch(
  options: EnterSingleResultsBatchOptions,
  parameters: ParameterResultEntry[],
  getClinicalInterpretation?: (param: ParameterResultEntry) => string | undefined,
): Promise<EnterSingleResultsBatchResult> {
  const responses: EnterSingleResultApiResponse[] = [];
  let criticalCount = 0;
  let flaggedCount = 0;
  let lastMessage = '';

  for (let i = 0; i < parameters.length; i++) {
    const param = parameters[i];
    const isLast = i === parameters.length - 1;
    const interpretation = getClinicalInterpretation?.(param);

    const payload: EnterSingleResultPayload = {
      orderId: options.orderId,
      orderItemId: options.orderItemId,
      testId: options.testId,
      parameterId: param.parameterId,
      parameterName: param.parameterName,
      resultValue: param.resultValue,
      numericValue: param.numericValue,
      resultType: param.resultType,
      unit: param.unit,
      referenceLow: param.referenceLow,
      referenceHigh: param.referenceHigh,
      ...(interpretation ? { clinicalInterpretation: interpretation } : {}),
      ...(options.comments ? { comments: options.comments } : {}),
      ...(options.instrumentId ? { instrumentId: options.instrumentId } : {}),
      ...(options.enteredBy ? { enteredBy: options.enteredBy } : {}),
      requestAutoVerification: isLast ? options.requestAutoVerification : false,
      ...(isLast && options.submitForVerification
        ? { submitForVerification: true }
        : {}),
    };

    const res = await enterSingleResult(payload);

    if (res?.response === false) {
      throw new Error(
        res.message ||
          `Failed to save result for ${param.parameterName || "parameter"}.`,
      );
    }

    responses.push(res);
    lastMessage = res.message || lastMessage;

    const flag = res.data?.abnormalFlag;
    if (res.data?.isCritical || flag === 'CRITICAL') criticalCount += 1;
    if (flag && flag !== 'NORMAL') flaggedCount += 1;
  }

  return {
    responses,
    criticalCount,
    flaggedCount,
    totalParameters: parameters.length,
    lastMessage,
  };
}

/**
 * GET `/api/v1/results/{resultId}`
 */
export async function getResultById(
  resultId: number,
): Promise<GetResultByIdApiResponse> {
  return reportBookingAxios.get(
    `/results/${resultId}`,
  ) as Promise<GetResultByIdApiResponse>;
}

/** @deprecated Use getResultById */
export const getReportDetails = getResultById;

/** @deprecated Use getResultById */
export const getReportStatusFilterChange = getResultById;

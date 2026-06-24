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

// ─── Order results ────────────────────────────────────────────────────────────

export interface OrderResultTestGroup {
  orderItemId: number;
  testId: number;
  testName: string;
  testCode: string;
  resultStatus: string;
  parameters: ResultParameterRecord[];
}

export interface OrderResultData {
  orderId: number;
  orderNumber: string;
  patientName: string;
  content: ResultParameterRecord[];
  tests: OrderResultTestGroup[];
  flaggedCount: number;
  criticalCount: number;
  totalElements: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type OrderResultApiResponse = ReportApiResponse<OrderResultData>;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function asResultParameterRecord(value: unknown): ResultParameterRecord | null {
  const row = asRecord(value);
  if (!row || row.resultId == null) return null;

  return {
    resultId: Number(row.resultId) || 0,
    orderItemId: Number(row.orderItemId) || 0,
    parameterId: Number(row.parameterId) || 0,
    parameterName: String(row.parameterName ?? ''),
    resultValue: String(row.resultValue ?? ''),
    numericValue:
      row.numericValue == null ? null : Number(row.numericValue),
    resultType: String(row.resultType ?? ''),
    unit: String(row.unit ?? ''),
    referenceLow: row.referenceLow == null ? null : Number(row.referenceLow),
    referenceHigh: row.referenceHigh == null ? null : Number(row.referenceHigh),
    criticalLow: row.criticalLow == null ? null : Number(row.criticalLow),
    criticalHigh: row.criticalHigh == null ? null : Number(row.criticalHigh),
    abnormalFlag: row.abnormalFlag == null ? null : String(row.abnormalFlag),
    isCritical: Boolean(row.isCritical),
    isVerified: Boolean(row.isVerified),
    isCorrected: Boolean(row.isCorrected),
    autoVerified: Boolean(row.autoVerified),
    resultStatus: String(row.resultStatus ?? 'PENDING'),
    clinicalInterpretation:
      row.clinicalInterpretation == null
        ? null
        : String(row.clinicalInterpretation),
    comments: row.comments == null ? null : String(row.comments),
    correctedValue:
      row.correctedValue == null ? null : String(row.correctedValue),
    correctionReason:
      row.correctionReason == null ? null : String(row.correctionReason),
    instrumentName:
      row.instrumentName == null ? null : String(row.instrumentName),
    enteredAt: row.enteredAt == null ? null : String(row.enteredAt),
    verifiedAt: row.verifiedAt == null ? null : String(row.verifiedAt),
  };
}

function collectParameterRecords(value: unknown): ResultParameterRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((row) => asResultParameterRecord(row))
    .filter((row): row is ResultParameterRecord => row != null);
}

function groupResultsByOrderItem(
  parameters: ResultParameterRecord[],
): OrderResultTestGroup[] {
  const byOrderItem = new Map<number, ResultParameterRecord[]>();

  for (const param of parameters) {
    const key = param.orderItemId || 0;
    const list = byOrderItem.get(key) ?? [];
    list.push(param);
    byOrderItem.set(key, list);
  }

  return Array.from(byOrderItem.entries()).map(([orderItemId, items]) => ({
    orderItemId,
    testId: 0,
    testName: `Order Item #${orderItemId}`,
    testCode: '',
    resultStatus: items[0]?.resultStatus ?? 'PENDING',
    parameters: items,
  }));
}

function normalizeOrderResultData(
  orderId: number,
  raw: unknown,
): OrderResultData {
  const root = asRecord(raw) ?? {};

  const content = collectParameterRecords(
    root.content ??
      root.results ??
      root.parameters ??
      root.parameterResults,
  );

  const tests: OrderResultTestGroup[] = [];
  const groupedSources = [
    root.tests,
    root.orderItems,
    root.items,
    root.testResults,
  ];

  for (const source of groupedSources) {
    if (!Array.isArray(source)) continue;

    for (const item of source) {
      const row = asRecord(item);
      if (!row) continue;

      const orderItemId = Number(row.orderItemId ?? row.id) || 0;
      const parameters = collectParameterRecords(
        row.parameters ??
          row.parameterResults ??
          row.results ??
          row.resultParameters,
      );

      if (orderItemId <= 0 && parameters.length === 0) continue;

      tests.push({
        orderItemId: orderItemId || parameters[0]?.orderItemId || 0,
        testId: Number(row.testId) || 0,
        testName: String(row.testName ?? row.name ?? `Order Item #${orderItemId}`),
        testCode: String(row.testCode ?? row.code ?? ''),
        resultStatus: String(row.resultStatus ?? parameters[0]?.resultStatus ?? 'PENDING'),
        parameters,
      });
    }
  }

  const resolvedTests =
    tests.length > 0 ? tests : groupResultsByOrderItem(content);

  return {
    orderId: Number(root.orderId) || orderId,
    orderNumber: String(root.orderNumber ?? ''),
    patientName: String(root.patientName ?? ''),
    content,
    tests: resolvedTests,
    flaggedCount: Number(root.flaggedCount) || 0,
    criticalCount: Number(root.criticalCount) || 0,
    totalElements: Number(root.totalElements) || content.length,
    pageNo: Number(root.pageNo) || 0,
    pageSize: Number(root.pageSize) || content.length,
    totalPages: Number(root.totalPages) || 1,
    first: Boolean(root.first ?? true),
    last: Boolean(root.last ?? true),
  };
}

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

/**
 * GET `/api/v1/results/order/{orderId}` — all results for an order.
 */
export async function fetchOrderResult(
  orderId: number,
): Promise<OrderResultApiResponse> {
  const response = (await reportBookingAxios.get(
    `/results/order/${orderId}`,
  )) as OrderResultApiResponse;

  return {
    ...response,
    data: normalizeOrderResultData(orderId, response?.data),
  };
}

/** @deprecated Use getResultById */
export const getReportDetails = getResultById;

/** @deprecated Use getResultById */
export const getReportStatusFilterChange = getResultById;

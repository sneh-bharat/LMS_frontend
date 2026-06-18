import testRequestClient from './axios';
import { BOOKING_DISEASES } from '@/app/diagnosis/diagnostic-booking/patientFormUtils';
import { isEmergencyPriority } from '@/app/Apis/booking/orderPriority';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TestRequisition {
  id?: number;
  requestId?: string;
  requisitionNumber?: string;
  requisitionDate?: string;
  patientId?: number;
  patientName?: string;
  patientCode?: string;
  gender?: string;
  age?: number;
  priority?: string;
  requisitionStatus?: string;
  paymentStatus?: string;
  referringDoctor?: number;
  referringDoctorName?: string | null;
  referringHospital?: number;
  referringHospitalName?: string | null;
  referrerName?: string;
  doctorName?: string;
  referredDoctor?: string;
  amountPaid?: number | null;
  paidAmount?: number | null;
  totalAmount?: number | null;
  branchId?: number | null;
  tenantId?: number;
  createdAt?: string | null;
  collectionDate?: string;
  collectionTime?: string;
  clinicalNotes?: string;
  clinicalDiagnosis?: string;
  drugAllergy?: string;
}

/** Raw paginated shape from GET /test-requisitions */
export interface TestRequisitionsApiPage {
  requisitions?: TestRequisition[];
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
  content?: TestRequisition[];
  totalElements?: number;
  pageNo?: number;
  pageSize?: number;
  first?: boolean;
  last?: boolean;
}

export interface TestRequisitionsPage {
  content: TestRequisition[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface FetchTestRequisitionsParams {
  pageNo: number;
  pageSize: number;
}

export interface SearchTestRequisitionsParams extends FetchTestRequisitionsParams {
  searchTerm: string;
}

export interface TestRequisitionItem {
  testId: number;
  quantity: number;
  testName?: string;
  testCode?: string;
  categoryId?: number;
  departmentId?: number;
  testPrice?: number;
  discountPercentage?: number;
  netPrice?: number;
  vialType?: string | null;
  sampleType?: string | null;
  priorityOverride?: string | null;
  specialInstructions?: string | null;
}

export interface CreateTestRequisitionPayload {
  patientId: number;
  referringDoctor: number;
  referringHospital: number;
  referrerName: string;
  requisitionDate: string;
  priority: string;
  collectionDate: string;
  collectionTime: string;
  requisitionItems: TestRequisitionItem[];
  branchId?: number;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  srfId?: string;
  clinicalNotes?: string;
  clinicalDiagnosis?: string;
  drugAllergy?: string;
  lmpDate?: string | null;
  hasDiabetes?: boolean;
  hasHypertension?: boolean;
  hasAnaemia?: boolean;
  hasThyroid?: boolean;
  hasArthritis?: boolean;
  hasAsthma?: boolean;
  otherPreExistingDisease?: string | null;
  isEmergency?: boolean;
  expectedReportDate?: string;
  totalAmount?: number;
  discountAmount?: number;
  concessionAmount?: number;
  concessionBy?: string | null;
  emergencyCharge?: number;
  netAmount?: number;
  
}

export interface TestRequisitionListResponse {
  data: TestRequisitionsApiPage | TestRequisition[] | TestRequisition;
  message: string;
  response: boolean;
  status: string;
}

export interface TestRequisitionDetailItem {
  id: number;
  testId: number;
  testName?: string | null;
  testCode?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  departmentId?: number | null;
  departmentName?: string | null;
  testPrice?: number | null;
  discountPercentage?: number | null;
  netPrice?: number | null;
  vialType?: string | null;
  sampleType?: string | null;
  quantity?: number | null;
  priorityOverride?: string | null;
  specialInstructions?: string | null;
  isActive?: boolean | null;
}

/** Full record from GET /test-requisitions/{id} */
export interface TestRequisitionDetail {
  id: number;
  requestId?: string | null;
  requisitionNumber?: string | null;
  patientId: number;
  patientName?: string | null;
  patientCode?: string | null;
  gender?: string | null;
  age?: number | null;
  referringDoctor?: number | null;
  referringDoctorName?: string | null;
  referringHospital?: number | null;
  referringHospitalName?: string | null;
  referrerName?: string | null;
  srfId?: string | null;
  requisitionDate?: string | null;
  requisitionStatus?: string | null;
  priority?: string | null;
  clinicalNotes?: string | null;
  clinicalDiagnosis?: string | null;
  drugAllergy?: string | null;
  lmpDate?: string | null;
  hasDiabetes?: boolean | null;
  hasHypertension?: boolean | null;
  hasAnaemia?: boolean | null;
  hasThyroid?: boolean | null;
  hasArthritis?: boolean | null;
  hasAsthma?: boolean | null;
  otherPreExistingDisease?: string | null;
  isEmergency?: boolean | null;
  collectionDate?: string | null;
  collectionTime?: string | null;
  expectedReportDate?: string | null;
  actualReportDate?: string | null;
  turnaroundTimeHours?: number | null;
  totalAmount?: number | null;
  concessionAmount?: number | null;
  emergencyCharge?: number | null;
  netAmount?: number | null;
  paidAmount?: number | null;
  pendingAmount?: number | null;
  concessionBy?: string | null;
  paymentStatus?: string | null;
  approvedBy?: string | null;
  approvedByName?: string | null;
  approvedDateTime?: string | null;
  approvalNotes?: string | null;
  rejectedBy?: string | null;
  rejectedDateTime?: string | null;
  rejectionReason?: string | null;
  convertedToOrderId?: number | null;
  convertedDateTime?: string | null;
  requisitionItems?: TestRequisitionDetailItem[] | null;
  tenantId?: number | null;
  branchId?: number | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface TestRequisitionDetailApiResponse {
  data: TestRequisitionDetail;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

function emptyTestRequisitionsPage(params: FetchTestRequisitionsParams): TestRequisitionsPage {
  const { pageNo, pageSize } = params;

  return {
    content: [],
    pageNo,
    pageSize,
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
  };
}

function isTestRequisitionRecord(value: unknown): value is TestRequisition {
  if (!value || typeof value !== 'object') return false;
  const row = value as TestRequisition;
  return (
    typeof row.id === 'number' ||
    Boolean(row.requisitionNumber?.trim()) ||
    Boolean(row.requisitionStatus?.trim())
  );
}

/** Normalize list API shapes into a consistent paginated page for the UI. */
export function normalizeTestRequisitionListResponse(
  res: TestRequisitionListResponse,
  params: FetchTestRequisitionsParams
): { data: TestRequisitionsPage; message: string; response: boolean; status: string } {
  const { pageNo, pageSize } = params;
  const raw = res?.data;

  if (Array.isArray(raw)) {
    const content = raw;
    const totalElements = content.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    return {
      ...res,
      data: {
        content,
        pageNo,
        pageSize,
        totalElements,
        totalPages,
        first: pageNo === 0,
        last: pageNo + 1 >= totalPages,
      },
    };
  }

  if (raw && typeof raw === 'object') {
    const page = raw as TestRequisitionsApiPage & TestRequisition;

    const content = Array.isArray(page.requisitions)
      ? page.requisitions
      : Array.isArray(page.content)
        ? page.content
        : isTestRequisitionRecord(page)
          ? [page]
          : [];

    const no = page.currentPage ?? page.pageNo ?? pageNo;
    const size = page.pageSize ?? pageSize;
    const totalElements = page.totalItems ?? page.totalElements ?? content.length;
    const totalPages = page.totalPages ?? Math.max(1, Math.ceil(totalElements / size));

    return {
      ...res,
      data: {
        content,
        pageNo: no,
        pageSize: size,
        totalElements,
        totalPages,
        first: page.first ?? no === 0,
        last: page.last ?? no + 1 >= totalPages,
      },
    };
  }

  return {
    ...res,
    data: emptyTestRequisitionsPage(params),
  };
}

export interface TestRequisitionCreateResponse {
  data: TestRequisition;
  message: string;
  response: boolean;
  status: string;
}


export interface RequisitionApiResponse {
  data?: TestRequisition;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}
export interface RejectTestRequisitionPayload {
  rejectionReason?: string;
  branchId?: number;
}

export interface RejectTestRequisitionApiResponse {
  data?: TestRequisition;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface ApproveTestRequisitionPayload {
  approvalNotes?: string;
  branchId?: number;
}

export function diseaseFlagsFromSelection(diseases: string[]) {
  const normalized = new Set(diseases.map((d) => d.trim().toLowerCase()));
  const has = (name: string) => normalized.has(name.toLowerCase());
  const known = new Set(BOOKING_DISEASES.map((d) => d.toLowerCase()));
  const other = diseases
    .map((d) => d.trim())
    .filter((d) => d && !known.has(d.toLowerCase()));

  return {
    hasDiabetes: has('Diabetes'),
    hasHypertension: has('Hypertension'),
    hasAnaemia: has('Anaemia'),
    hasThyroid: has('Thyroid'),
    hasArthritis: has('Arthritis'),
    hasAsthma: has('Asthma'),
    otherPreExistingDisease: other.length > 0 ? other.join(', ') : null,
  };
}

export interface RequisitionInvestigationInput {
  id: number;
  name: string;
  mrp: number;
  testCode?: string;
  categoryId?: number;
  departmentId?: number;
  sampleType?: string;
  vialType?: string;
}

export function mapInvestigationsToRequisitionItems(
  investigations: RequisitionInvestigationInput[]
): TestRequisitionItem[] {
  return investigations.map((inv) => ({
    testId: inv.id,
    testName: inv.name,
    testCode: inv.testCode,
    categoryId: inv.categoryId,
    departmentId: inv.departmentId,
    testPrice: inv.mrp,
    discountPercentage: 0,
    netPrice: inv.mrp,
    vialType: inv.vialType ?? null,
    sampleType: inv.sampleType ?? null,
    quantity: 1,
    priorityOverride: null,
    specialInstructions: null,
  }));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface BuildRequisitionPayloadInput {
  patientId: number;
  referringDoctor: number;
  referringHospital: number;
  referrerName: string;
  requisitionDate: string;
  priority: string;
  collectionDate: string;
  collectionTime: string;
  investigations: RequisitionInvestigationInput[];
  branchId?: number;
  createdBy?: string;
  createdByName?: string;
  createdAt?: string;
  srfId?: string;
  clinicalNotes?: string;
  clinicalDiagnosis?: string;
  drugAllergy?: string;
  lmpDate?: string;
  expectedReportDate?: string;
  diseases?: string[];
  concessionAmount?: number;
  concessionBy?: string;
  emergencyCharge?: number;
}

export function buildCreateTestRequisitionPayload(
  input: BuildRequisitionPayloadInput
): CreateTestRequisitionPayload {
  const requisitionItems = mapInvestigationsToRequisitionItems(input.investigations);
  const totalAmount = roundMoney(
    requisitionItems.reduce((sum, item) => sum + (item.testPrice ?? 0), 0)
  );
  const discountAmount = 0;
  const concessionAmount = roundMoney(input.concessionAmount ?? 0);
  const emergencyCharge = roundMoney(input.emergencyCharge ?? 0);
  const netAmount = roundMoney(totalAmount - discountAmount);

  const payload: CreateTestRequisitionPayload = {
    patientId: input.patientId,
    referringDoctor: input.referringDoctor,
    referringHospital: input.referringHospital,
    referrerName: input.referrerName,
    requisitionDate: input.requisitionDate,
    priority: input.priority,
    collectionDate: input.collectionDate,
    collectionTime: input.collectionTime,
    requisitionItems,
    totalAmount,
    discountAmount,
    concessionAmount,
    emergencyCharge,
    netAmount,
    isEmergency: isEmergencyPriority(input.priority),
    ...diseaseFlagsFromSelection(input.diseases ?? []),
  };

  const concessionBy = input.concessionBy?.trim();
  if (concessionBy) {
    payload.concessionBy = concessionBy;
  }

  if (input.branchId && input.branchId > 0) payload.branchId = input.branchId;

  const createdByName = input.createdByName?.trim() || input.createdBy?.trim() || '';
  payload.createdByName = createdByName;
  payload.createdBy = createdByName;

  payload.createdAt = input.createdAt?.trim() || new Date().toISOString();

  if (input.srfId?.trim()) payload.srfId = input.srfId.trim();
  if (input.clinicalNotes?.trim()) payload.clinicalNotes = input.clinicalNotes.trim();
  if (input.clinicalDiagnosis?.trim()) payload.clinicalDiagnosis = input.clinicalDiagnosis.trim();
  if (input.drugAllergy?.trim()) payload.drugAllergy = input.drugAllergy.trim();
  if (input.lmpDate?.trim()) payload.lmpDate = input.lmpDate.trim();
  else payload.lmpDate = null;
  if (input.expectedReportDate?.trim()) payload.expectedReportDate = input.expectedReportDate.trim();

  return payload;
}

// ─── API calls ───────────────────────────────────────────────────────────────

/** GET /api/v1/test-requisitions?pageNo=0&pageSize=10 */
export async function getTestRequisitions(params: FetchTestRequisitionsParams) {
  const { pageNo, pageSize } = params;

  const res = (await testRequestClient.get('/test-requisitions', {
    params: { pageNo, pageSize },
  })) as TestRequisitionListResponse;

  if (res?.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load test requisitions.');
  }

  return normalizeTestRequisitionListResponse(res, params);
}

/** GET /api/v1/test-requisitions/search?searchTerm=&pageNo=&pageSize= */
export async function searchTestRequisitions(params: SearchTestRequisitionsParams) {
  const { searchTerm, pageNo, pageSize } = params;

  const res = (await testRequestClient.get('/test-requisitions/search', {
    params: { searchTerm: searchTerm.trim(), pageNo, pageSize },
  })) as TestRequisitionListResponse;

  if (res?.response === false) {
    throw new Error(res.message?.trim() || 'Failed to search test requisitions.');
  }

  return normalizeTestRequisitionListResponse(res, { pageNo, pageSize });
}

/** POST /api/v1/test-requisitions — backend sets status to SUBMITTED */
export function createTestRequisition(
  payload: CreateTestRequisitionPayload)
  : Promise<RequisitionApiResponse> {
  return testRequestClient.post('/test-requisitions', payload) as Promise<RequisitionApiResponse>;
}

// ─── UI helpers (for listing page) ───────────────────────────────────────────

export function getTestRequisitionNumber(row: TestRequisition): string {
  return row.requisitionNumber?.trim() || '—';
}

export function getTestRequisitionPatientName(row: TestRequisition): string {
  if (row.patientName?.trim()) return row.patientName.trim();
  if (row.patientId != null && row.patientId > 0) return `Patient #${row.patientId}`;
  return '—';
}

export function formatRequisitionDate(value?: string | null): string {
  if (!value?.trim()) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTestRequisitionDoctorName(row: TestRequisition): string {
  return (
    row.referringDoctorName?.trim() ||
    row.doctorName?.trim() ||
    row.referredDoctor?.trim() ||
    '—'
  );
}

export function getTestRequisitionStatus(row: TestRequisition): string {
  return row.requisitionStatus?.trim() || row.paymentStatus?.trim() || '—';
}

export function formatAmountPaid(row: TestRequisition): string {
  const amount = row.totalAmount;
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function requisitionDetailToDiseases(detail: TestRequisitionDetail): string[] {
  const diseases: string[] = [];
  if (detail.hasDiabetes) diseases.push('Diabetes');
  if (detail.hasHypertension) diseases.push('Hypertension');
  if (detail.hasAnaemia) diseases.push('Anaemia');
  if (detail.hasThyroid) diseases.push('Thyroid');
  if (detail.hasArthritis) diseases.push('Arthritis');
  if (detail.hasAsthma) diseases.push('Asthma');
  if (detail.otherPreExistingDisease?.trim()) {
    for (const part of detail.otherPreExistingDisease.split(',')) {
      const trimmed = part.trim();
      if (trimmed) diseases.push(trimmed);
    }
  }
  return diseases;
}

export function formatRequisitionCurrency(value?: number | null): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export function isTestRequisitionConverted(
  row: Pick<TestRequisition, 'requisitionStatus'> & { convertedToOrderId?: number | null }
): boolean {
  const status = row.requisitionStatus?.trim().toUpperCase() ?? '';
  if (status === 'CONVERTED') return true;
  return row.convertedToOrderId != null && row.convertedToOrderId > 0;
}

/** Soft-delete allowed unless already cancelled or converted to an order. */
export function canSoftDeleteTestRequisition(row: TestRequisition): boolean {
  if (isTestRequisitionConverted(row)) return false;
  const status = row.requisitionStatus?.trim().toUpperCase() ?? '';
  return status !== 'CANCELLED';
}

/** Approve allowed unless already approved, rejected, cancelled, or converted. */
export function canApproveTestRequisition(row: TestRequisition): boolean {
  if (isTestRequisitionConverted(row)) return false;
  const status = row.requisitionStatus?.trim().toUpperCase() ?? '';
  return status !== 'APPROVED' && status !== 'REJECTED' && status !== 'CANCELLED';
}

/** GET /api/v1/test-requisitions/{requisitionId} */
export async function fetchTestRequisitionById(
  requisitionId: number
): Promise<TestRequisitionDetailApiResponse> {
  if (!Number.isFinite(requisitionId) || requisitionId <= 0) {
    throw new Error('A valid requisition id is required.');
  }

  const res = (await testRequestClient.get(
    `/test-requisitions/${requisitionId}`
  )) as TestRequisitionDetailApiResponse;

  if (res?.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load test requisition.');
  }

  return res;
}

/** @deprecated Use `fetchTestRequisitionById` */
export const fetchRequisitionsById = fetchTestRequisitionById;


/** Soft-delete — sets requisition status to CANCELLED. CONVERTED requisitions cannot be deleted. */
export async function deleteTestRequisitionById(
  requisitionId: number
): Promise<RequisitionApiResponse> {
  if (!Number.isFinite(requisitionId) || requisitionId <= 0) {
    throw new Error('A valid requisition id is required.');
  }

  const res = (await testRequestClient.delete(
    `/test-requisitions/${requisitionId}`
  )) as RequisitionApiResponse;

  if (res?.response === false) {
    throw new Error(res.message?.trim() || 'Failed to delete test requisition.');
  }

  return res;
}

/** POST /api/v1/test-requisitions/{requisitionId}/reject */
export async function rejectTestRequisitionById(
  requisitionId: number,
  payload: RejectTestRequisitionPayload = {}
): Promise<RejectTestRequisitionApiResponse> {
  if (!Number.isFinite(requisitionId) || requisitionId <= 0) {
    throw new Error('A valid requisition id is required.');
  }

  const body: RejectTestRequisitionPayload = {};
  const rejectionReason = payload.rejectionReason?.trim();
  if (rejectionReason) body.rejectionReason = rejectionReason;
  if (payload.branchId && payload.branchId > 0) body.branchId = payload.branchId;

  const res = (await testRequestClient.post(
    `/test-requisitions/${requisitionId}/reject`,
    body
  )) as RejectTestRequisitionApiResponse;

  if (res?.response === false) {
    throw new Error(res.message?.trim() || 'Failed to reject test requisition.');
  }

  return res;
}



/** POST /api/v1/test-requisitions/{requisitionId}/approve */
export async function approveTestRequisitionById(
  requisitionId: number,
  payload: ApproveTestRequisitionPayload = {}
): Promise<RequisitionApiResponse> {
  if (!Number.isFinite(requisitionId) || requisitionId <= 0) {
    throw new Error('A valid requisition id is required.');
  }

  const body: ApproveTestRequisitionPayload = {};
  const approvalNotes = payload.approvalNotes?.trim();
  if (approvalNotes) body.approvalNotes = approvalNotes;
  if (payload.branchId && payload.branchId > 0) body.branchId = payload.branchId;

  const res = (await testRequestClient.post(
    `/test-requisitions/${requisitionId}/approve`,
    body
  )) as RequisitionApiResponse;

  if (res?.response === false) {
    throw new Error(res.message?.trim() || 'Failed to approve test requisition.');
  }

  return res;
}

/** @deprecated Use `approveTestRequisitionById` */
export const approveRequisitions = approveTestRequisitionById;

import bookingAxios from './axios';
import { patientServiceAxios } from '../Patients/axios';

export interface Sample {
  id: number;
  sampleCode?: string | null;
  sampleNumber?: string | null;
  sampleId?: string | null;
  patientId?: number | null;
  patientName?: string | null;
  patientCode?: string | null;
  orderId?: number | null;
  orderNumber?: string | null;
  testNames?: string[] | null;
  tests?: string[] | null;
  testName?: string | null;
  sampleType?: string | null;
  collectionDate?: string | null;
  collectionTime?: string | null;
  collectionDateTime?: string | null;
  collectedAt?: string | null;
  createdAt?: string | null;
  status?: string | null;
  sampleStatus?: string | null;
  acceptanceStatus?: string | null;
  condition?: string | null;
  sampleCondition?: string | null;
  receivedDate?: string | null;
  receivedTime?: string | null;
  receivedDateTime?: string | null;
  receivedBy?: string | null;
  rejectedBy?: string | null;
  rejectedDateTime?: string | null;
  disposalDateTime?: string | null;
  disposalMethod?: string | null;
  sampleBarcode?: string | null;
  isDeleted?: boolean;
  temperatureOnArrival?: string | null;
  acceptanceDecision?: string | null;
  rejectionReason?: string | null;
  departmentRouting?: string | null;
  storageLocation?: string | null;
  aliquotingRequired?: boolean | null;
  numberOfAliquots?: number | null;
  remarks?: string | null;
  isActive?: boolean;
  sampleLabel?: string | null;
  collectedBy?: string | null;
  collectionMethod?: string | null;
  collectionSite?: string | null;
  sampleVolume?: string | null;
  storageTemperature?: string | null;
  expiryDateTime?: string | null;
  chainOfCustodyNotes?: string | null;
  temperature?: string | null;
  updatedAt?: string | null;
  /** Latest sample-processing record id when returned by list/detail APIs. */
  processingId?: number | null;
  latestProcessingId?: number | null;
  sampleProcessingId?: number | null;
}

export interface SampleByIdApiResponse {
  data: Sample;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface SamplesPage {
  content: Sample[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface SamplesListApiResponse {
  data: SamplesPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** Known sample lifecycle statuses (list filter, PUT status, etc.). */
export const SAMPLE_API_STATUSES = [
  'REGISTERED',
  'COLLECTED',
  'RECEIVED',
  'PROCESSING',
  'PROCESSED',
  'ALLOCATED',
  'IN_ANALYSIS',
  'ANALYSIS_COMPLETE',
  'STORED',
  'DISPOSED',
  'REJECTED',
] as const;

export type SampleApiStatus = (typeof SAMPLE_API_STATUSES)[number];

export interface FetchSamplesParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  /** When set, uses GET `/api/v1/samples/status/{status}`. */
  status?: SampleApiStatus;
}

function buildSamplesListQuery(params: FetchSamplesParams): URLSearchParams {
  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });
  if (params.sortBy?.trim()) {
    query.set('sortBy', params.sortBy.trim());
  }
  return query;
}

/**
 * GET `/api/v1/samples/status/{status}?pageNo=0&pageSize=10`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSamplesByStatus(
  status: SampleApiStatus,
  params: Omit<FetchSamplesParams, 'status'> = {}
): Promise<SamplesListApiResponse> {
  const normalized = status.trim().toUpperCase() as SampleApiStatus;
  if (!SAMPLE_API_STATUSES.includes(normalized)) {
    throw new Error(`Invalid sample status: ${status}`);
  }

  const query = buildSamplesListQuery(params);
  return bookingAxios.get(
    `/samples/status/${normalized}?${query.toString()}`
  ) as Promise<SamplesListApiResponse>;
}

/**
 * GET `/api/v1/samples?pageNo=0&pageSize=10&sortBy=createdAt`
 * or GET `/api/v1/samples/status/{status}` when `params.status` is set.
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSamples(
  params: FetchSamplesParams = {}
): Promise<SamplesListApiResponse> {
  const { status, ...rest } = params;
  if (status) {
    return fetchSamplesByStatus(status, rest);
  }

  const query = buildSamplesListQuery({
    ...rest,
    sortBy: rest.sortBy ?? 'createdAt',
  });

  return bookingAxios.get(`/samples?${query.toString()}`) as Promise<SamplesListApiResponse>;
}

/**
 * GET `/api/v1/samples/{id}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSampleById(id: number): Promise<SampleByIdApiResponse> {
  if (!Number.isFinite(id) || id <= 0) {
    throw new Error('A valid sample id is required.');
  }

  return bookingAxios.get(`/samples/${id}`) as Promise<SampleByIdApiResponse>;
}

/** Counts from GET `/api/v1/samples/statistics` (keys match API response). */
export interface SampleStatisticsData {
  registeredCount: number;
  collectedCount: number;
  receivedCount: number;
  rejectedCount: number;
  processingCount: number;
  processedCount: number;
  storedCount: number;
  allocatedCount: number;
  in_analysisCount: number;
  analysis_completeCount: number;
  disposedCount: number;
}

export interface SampleStatisticsApiResponse {
  data: SampleStatisticsData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

function toStatCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Normalizes API payload (handles `in_analysisCount`, `analysis_completeCount`, etc.). */
export function normalizeSampleStatistics(
  raw: Record<string, unknown>
): SampleStatisticsData {
  return {
    registeredCount: toStatCount(raw.registeredCount),
    collectedCount: toStatCount(raw.collectedCount),
    receivedCount: toStatCount(raw.receivedCount),
    rejectedCount: toStatCount(raw.rejectedCount),
    processingCount: toStatCount(raw.processingCount),
    processedCount: toStatCount(raw.processedCount),
    storedCount: toStatCount(raw.storedCount),
    allocatedCount: toStatCount(raw.allocatedCount),
    in_analysisCount: toStatCount(raw.in_analysisCount ?? raw.inAnalysisCount),
    analysis_completeCount: toStatCount(
      raw.analysis_completeCount ?? raw.analysisCompleteCount
    ),
    disposedCount: toStatCount(raw.disposedCount),
  };
}

/**
 * GET `/api/v1/samples/statistics`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSampleStatistics(): Promise<SampleStatisticsApiResponse> {
  const res = (await bookingAxios.get('/samples/statistics')) as SampleStatisticsApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to load sample statistics.');
  }

  const raw = res.data as unknown;
  if (raw && typeof raw === 'object') {
    return {
      ...res,
      data: normalizeSampleStatistics(raw as Record<string, unknown>),
    };
  }

  return res;
}

export interface UpdateSampleStatusData {
  status: string;
  sampleId: number;
}

export interface UpdateSampleStatusApiResponse {
  data: UpdateSampleStatusData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface UpdateSampleStatusParams {
  sampleId: number;
  status: string;
}

/**
 * PUT `/api/v1/samples/{id}/status?status=RECEIVED`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function updateSampleStatus(
  params: UpdateSampleStatusParams
): Promise<UpdateSampleStatusApiResponse> {
  const { sampleId, status } = params;
  if (!Number.isFinite(sampleId) || sampleId <= 0) {
    throw new Error('A valid sample id is required.');
  }

  const trimmed = status?.trim().toUpperCase();
  if (!trimmed) {
    throw new Error('Status is required.');
  }

  const query = new URLSearchParams({ status: trimmed });

  return bookingAxios.put(
    `/samples/${sampleId}/status?${query.toString()}`,
    {}
  ) as Promise<UpdateSampleStatusApiResponse>;
}

export interface DeleteSampleApiResponse {
  data?: { sampleId?: number; id?: number };
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * DELETE `/api/v1/samples/{id}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios` (lims-booking).
 */
export async function deleteSample(sampleId: number): Promise<DeleteSampleApiResponse> {
  if (!Number.isFinite(sampleId) || sampleId <= 0) {
    throw new Error('A valid sample id is required.');
  }

  const res = (await bookingAxios.delete(
    `/samples/${sampleId}`
  )) as DeleteSampleApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to delete sample.');
  }

  return res;
}

/** DELETE `/api/v1/samples/bulk` request body (lims-patient). */
export interface BulkDeleteSamplesPayload {
  sampleIds: number[];
}

export interface BulkDeleteSamplesApiResponse {
  data?: { deletedCount?: number; sampleIds?: number[] };
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * DELETE `/api/v1/samples/bulk`
 * Auth: Bearer token via `patientServiceAxios` (`NEXT_PUBLIC_API_URL1` / lims-patient).
 */
export async function bulkDeleteSamples(
  payload: BulkDeleteSamplesPayload
): Promise<BulkDeleteSamplesApiResponse> {
  const sampleIds = (payload.sampleIds ?? []).filter(
    (id) => Number.isFinite(id) && id > 0
  );
  if (sampleIds.length === 0) {
    throw new Error('At least one sample id is required.');
  }

  const res = (await patientServiceAxios.delete('/samples/bulk', {
    data: { sampleIds },
  })) as BulkDeleteSamplesApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to delete samples.');
  }

  return res;
}

const SAMPLE_TYPES = ['Blood', 'Urine', 'Swab', 'Stool', 'Other'] as const;
export type SampleTypeLabel = (typeof SAMPLE_TYPES)[number];

function normalizeSampleType(value?: string | null): SampleTypeLabel {
  const t = value?.trim() ?? '';
  const match = SAMPLE_TYPES.find((s) => s.toLowerCase() === t.toLowerCase());
  return match ?? 'Other';
}

function normalizeSampleStatus(status?: string | null): 'pending' | 'accepted' | 'rejected' {
  const s = status?.toLowerCase() ?? '';
  if (s.includes('accept') && !s.includes('reject')) return 'accepted';
  if (s.includes('reject')) return 'rejected';
  if (s === 'completed' || s === 'received') return 'accepted';
  if (s === 'registered' || s === 'collected' || s === 'pending') return 'pending';
  return 'pending';
}

/** Human-readable API status (e.g. REGISTERED → Registered). */
export function formatSampleStatusLabel(status?: string | null): string {
  const s = status?.trim();
  if (!s) return '—';
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function normalizeSampleCondition(
  condition?: string | null
): 'good' | 'haemolysed' | 'clotted' | 'insufficient' | 'leaked' | undefined {
  if (!condition?.trim()) return undefined;
  const c = condition.toLowerCase();
  if (c.includes('good') || c.includes('normal')) return 'good';
  if (c.includes('haemol') || c.includes('hemol')) return 'haemolysed';
  if (c.includes('clot')) return 'clotted';
  if (c.includes('insufficient') || c.includes('volume')) return 'insufficient';
  if (c.includes('leak')) return 'leaked';
  return undefined;
}

/** Resolves primary display identifier (barcode / code / label). */
export function getSampleDisplayCode(sample: Sample): string {
  return (
    sample.sampleBarcode?.trim() ||
    sample.sampleCode?.trim() ||
    sample.sampleNumber?.trim() ||
    sample.sampleId?.trim() ||
    sample.sampleLabel?.trim() ||
    `SMP-${sample.id}`
  );
}

/** Collection timestamp from GET-by-id or list payloads. */
export function getSampleCollectionDateTime(sample: Sample): string | null {
  if (sample.collectionDateTime?.trim()) return sample.collectionDateTime;
  if (sample.collectedAt?.trim()) return sample.collectedAt;
  const date = sample.collectionDate?.trim();
  const time = sample.collectionTime?.trim();
  if (date && time) return `${date}T${time}`;
  if (date) return date;
  return null;
}

/** Formats ISO or API datetime strings for detail views. */
export function formatSampleDateTime(value?: string | null): string {
  if (!value?.trim()) return '—';
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return value;
}

export function formatSampleTypeLabel(value?: string | null): string {
  const t = value?.trim();
  if (!t) return '—';
  return t
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function resolveSampleTestNames(sample: Sample): string[] {
  return resolveTestNames(sample);
}

export function getSampleStatusLabel(
  sample: Sample
): 'pending' | 'accepted' | 'rejected' {
  return normalizeSampleStatus(
    sample.status ?? sample.sampleStatus ?? sample.acceptanceStatus
  );
}

export function getSampleConditionLabel(
  sample: Sample
): 'good' | 'haemolysed' | 'clotted' | 'insufficient' | 'leaked' | undefined {
  return normalizeSampleCondition(sample.condition ?? sample.sampleCondition);
}

function formatCollectedAt(sample: Sample): string {
  const raw = getSampleCollectionDateTime(sample);
  if (raw) return formatSampleDateTime(raw);
  if (sample.createdAt?.trim()) return formatSampleDateTime(sample.createdAt);
  return '—';
}

function splitDateTime(value?: string | null): { date?: string; time?: string } {
  if (!value?.trim()) return {};
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) {
    return {
      date: d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
  }
  const [date, time] = value.split('T');
  return { date: date || value, time: time?.slice(0, 5) };
}

function resolveTestNames(sample: Sample): string[] {
  if (sample.testNames?.length) return sample.testNames.filter(Boolean);
  if (sample.tests?.length) return sample.tests.filter(Boolean);
  if (sample.testName?.trim()) return [sample.testName.trim()];
  if (sample.orderNumber?.trim()) return [sample.orderNumber.trim()];
  return [];
}

/** UI row shape for sample receipt listing. */
export interface SampleReceiptRow {
  id: number;
  sampleId: string;
  patient: string;
  collectedBy?: string;
  orderNumber?: string;
  tests: string[];
  /** Display label from API (e.g. Serum, Blood). */
  sampleType: string;
  collectedAt: string;
  /** Workflow bucket for accept/reject actions and filters. */
  status: 'pending' | 'accepted' | 'rejected';
  /** Raw API status label for display (e.g. Registered). */
  statusLabel: string;
  apiStatus?: string;
  /** Raw condition text from API (e.g. Normal, Good). */
  conditionLabel: string;
  condition?: 'good' | 'haemolysed' | 'clotted' | 'insufficient' | 'leaked';
  receivedDate?: string;
  receivedTime?: string;
  receivedBy?: string;
  temperatureOnArrival?: string;
  acceptanceDecision?: string;
  rejectionReason?: string;
  departmentRouting?: string;
  storageLocation?: string;
  aliquotingRequired?: boolean;
  numberOfAliquots?: number;
  remarks?: string;
  /** Latest processing record id — used for PUT `/sample-processing/{id}`. */
  processingId?: number | null;
}

export function resolveSampleProcessingId(sample: Sample): number | null {
  const extended = sample as Sample & {
    sampleProcessing?: { id?: number | null } | null;
    latestProcessing?: { id?: number | null } | null;
  };

  for (const value of [
    sample.processingId,
    sample.latestProcessingId,
    sample.sampleProcessingId,
    extended.sampleProcessing?.id,
    extended.latestProcessing?.id,
  ]) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** POST `/api/v1/samples/register` request body. */
export interface RegisterSamplePayload {
  orderId: number;
  sampleType: string;
  sampleLabel: string;
  collectionDateTime: string;
  collectedBy: string;
  collectionMethod: string;
  collectionSite: string;
  sampleVolume: string;
  sampleCondition: string;
  temperature: string;
  storageLocation: string;
  storageTemperature: string;
  expiryDateTime: string;
  chainOfCustodyNotes?: string;
}

export interface RegisterSampleApiResponse {
  data?: Sample;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export const API_SAMPLE_TYPES = [
  'BLOOD',
  'SERUM',
  'PLASMA',
  'URINE',
  'SWAB',
  'STOOL',
  'OTHER',
] as const;

export type ApiSampleType = (typeof API_SAMPLE_TYPES)[number];

/** Form → API sample type (e.g. Blood → BLOOD). */
export function toApiSampleType(value: string): ApiSampleType {
  const normalized = value.trim().toUpperCase();
  const match = API_SAMPLE_TYPES.find((t) => t === normalized);
  if (match) return match;
  if (normalized.includes('BLOOD')) return 'BLOOD';
  if (normalized.includes('SERUM')) return 'SERUM';
  if (normalized.includes('PLASMA')) return 'PLASMA';
  if (normalized.includes('URINE')) return 'URINE';
  if (normalized.includes('SWAB')) return 'SWAB';
  if (normalized.includes('STOOL')) return 'STOOL';
  return 'OTHER';
}

/** `datetime-local` value → ISO local datetime for API. */
export function toApiDateTime(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return `${trimmed}:00`;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return trimmed;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * POST `/api/v1/samples/register`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function registerSample(
  payload: RegisterSamplePayload
): Promise<RegisterSampleApiResponse> {
  return bookingAxios.post('/samples/register', payload) as Promise<RegisterSampleApiResponse>;
}

/** PUT `/api/v1/samples/{id}` request body (same fields as register). */
export type UpdateSamplePayload = RegisterSamplePayload;

export interface UpdateSampleApiResponse {
  data?: Sample;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * PUT `/api/v1/samples/{id}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function updateSample(
  sampleId: number,
  payload: UpdateSamplePayload
): Promise<UpdateSampleApiResponse> {
  if (!Number.isFinite(sampleId) || sampleId <= 0) {
    throw new Error('A valid sample id is required.');
  }

  const res = (await bookingAxios.put(
    `/samples/${sampleId}`,
    payload
  )) as UpdateSampleApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to update sample.');
  }

  return res;
}

/** Converts API datetime to `datetime-local` input value. */
export function toDatetimeLocalInput(value?: string | null): string {
  if (!value?.trim()) return '';
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 16);
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Form fields for PUT `/api/v1/samples/{id}`. */
export interface UpdateSampleFormData {
  orderId: string;
  sampleType: ApiSampleType;
  sampleLabel: string;
  collectionDateTime: string;
  collectedBy: string;
  collectionMethod: string;
  collectionSite: string;
  sampleVolume: string;
  sampleCondition: string;
  temperature: string;
  storageLocation: string;
  storageTemperature: string;
  expiryDateTime: string;
  chainOfCustodyNotes: string;
}

/** Maps GET sample detail into editable form fields. */
export function sampleToUpdateFormFields(sample: Sample): UpdateSampleFormData {
  const rawType = sample.sampleType?.trim().toUpperCase() ?? 'OTHER';
  const sampleType = API_SAMPLE_TYPES.includes(rawType as ApiSampleType)
    ? (rawType as ApiSampleType)
    : toApiSampleType(rawType);

  return {
    orderId: sample.orderId != null ? String(sample.orderId) : '',
    sampleType,
    sampleLabel: sample.sampleLabel?.trim() ?? '',
    collectionDateTime: toDatetimeLocalInput(
      sample.collectionDateTime ?? sample.collectedAt ?? sample.createdAt
    ),
    collectedBy: sample.collectedBy?.trim() ?? '',
    collectionMethod: sample.collectionMethod?.trim() ?? '',
    collectionSite: sample.collectionSite?.trim() ?? '',
    sampleVolume: sample.sampleVolume?.trim() ?? '',
    sampleCondition: sample.sampleCondition?.trim() ?? sample.condition?.trim() ?? 'Good',
    temperature: sample.temperature?.trim() ?? '',
    storageLocation: sample.storageLocation?.trim() ?? '',
    storageTemperature: sample.storageTemperature?.trim() ?? '',
    expiryDateTime: toDatetimeLocalInput(sample.expiryDateTime),
    chainOfCustodyNotes: sample.chainOfCustodyNotes?.trim() ?? '',
  };
}

/** Lab processing types for POST `/api/v1/sample-processing`. */
export const SAMPLE_PROCESSING_TYPES = [
  'CENTRIFUGATION',
  'STAINING',
  'FILTRATION',
  'ALIQUOTING',
  'OTHER',
] as const;

export type SampleProcessingType = (typeof SAMPLE_PROCESSING_TYPES)[number];

export const SAMPLE_QUALITY_CHECK_TYPES = [
  'VISUAL_INSPECTION',
  'HEMOLYSIS_CHECK',
  'CONTAMINATION_CHECK',
] as const;

export type SampleQualityCheckType = (typeof SAMPLE_QUALITY_CHECK_TYPES)[number];

/** POST/PUT `/api/v1/sample-processing` request body. */
export interface SampleProcessingPayload {
  sampleId: number;
  processingType: string;
  processingMethod: string;
  processingDateTime: string;
  processedBy: string;
  equipmentUsed: string;
  reagentUsed: string;
  lotNumber: string;
  processingParameters: string;
  rpm?: number | null;
  durationMinutes?: number | null;
  temperatureCelsius?: number | null;
  aliquotCount?: number | null;
  aliquotVolume: string;
  qualityCheck: string;
  processingNotes: string;
}

/** @deprecated Use `SampleProcessingPayload` */
export type CreateSampleProcessingPayload = SampleProcessingPayload;

/** PUT `/api/v1/sample-processing/{processId}` request body. */
export type UpdateSampleProcessingPayload = SampleProcessingPayload;

export interface SampleProcessingRecord {
  id: number;
  sampleId: number;
  processingType: string;
  processingMethod?: string | null;
  processingDateTime: string;
  processedBy: string;
  equipmentUsed?: string | null;
  reagentUsed?: string | null;
  lotNumber?: string | null;
  processingParameters?: string | null;
  rpm?: number | null;
  durationMinutes?: number | null;
  temperatureCelsius?: number | null;
  aliquotCount?: number | null;
  aliquotVolume?: string | null;
  qualityCheck?: string | null;
  processingNotes?: string | null;
  sampleBarcode?: string | null;
  isActive?: boolean;
}

export interface CreateSampleProcessingApiResponse {
  data?: SampleProcessingRecord;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface UpdateSampleProcessingApiResponse {
  data?: SampleProcessingRecord;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface DeleteSampleProcessingApiResponse {
  data?: { id?: number; sampleId?: number };
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface SampleProcessingByIdApiResponse {
  data: SampleProcessingRecord;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** GET `/api/v1/sample-processing/sample/{sampleId}` — `data` is a list of records. */
export interface SampleProcessingBySampleApiResponse {
  data: SampleProcessingRecord[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** Normalizes API `data` when it is a single object or an array. */
export function normalizeSampleProcessingList(
  data: SampleProcessingRecord | SampleProcessingRecord[] | null | undefined
): SampleProcessingRecord[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter((r) => r && typeof r.id === 'number');
  if (typeof data === 'object' && 'id' in data) return [data];
  return [];
}

/** Newest processing record first. */
export function sortSampleProcessingRecords(
  records: SampleProcessingRecord[]
): SampleProcessingRecord[] {
  return [...records].sort((a, b) => {
    const ta = new Date(a.processingDateTime).getTime();
    const tb = new Date(b.processingDateTime).getTime();
    if (!Number.isNaN(ta) && !Number.isNaN(tb) && ta !== tb) return tb - ta;
    return b.id - a.id;
  });
}

/** Human-readable processing / quality-check enum (e.g. CENTRIFUGATION → Centrifugation). */
export function formatSampleProcessingLabel(value?: string | null): string {
  const s = value?.trim();
  if (!s) return '—';
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Form fields for sample processing drawer. */
export interface SampleProcessingFormData {
  processingType: SampleProcessingType;
  processingMethod: string;
  processingDateTime: string;
  processedBy: string;
  equipmentUsed: string;
  reagentUsed: string;
  lotNumber: string;
  processingParameters: string;
  rpm: string;
  durationMinutes: string;
  temperatureCelsius: string;
  aliquotCount: string;
  aliquotVolume: string;
  qualityCheck: SampleQualityCheckType;
  processingNotes: string;
}

function parseOptionalPositiveNumber(
  value: string,
  fieldLabel: string
): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }
  return n;
}

function parseOptionalNumberOrNull(
  value: string,
  fieldLabel: string
): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }
  return n;
}

function numberToFormField(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) return '';
  return String(value);
}

/** Maps API processing record into form fields for edit. */
export function sampleProcessingToFormFields(
  record: SampleProcessingRecord
): SampleProcessingFormData {
  const rawType = record.processingType?.trim().toUpperCase() ?? 'OTHER';
  const processingType = SAMPLE_PROCESSING_TYPES.includes(rawType as SampleProcessingType)
    ? (rawType as SampleProcessingType)
    : 'OTHER';

  const rawQuality = record.qualityCheck?.trim().toUpperCase() ?? 'VISUAL_INSPECTION';
  const qualityCheck = SAMPLE_QUALITY_CHECK_TYPES.includes(
    rawQuality as SampleQualityCheckType
  )
    ? (rawQuality as SampleQualityCheckType)
    : 'VISUAL_INSPECTION';

  return {
    processingType,
    processingMethod: record.processingMethod?.trim() ?? '',
    processingDateTime: toDatetimeLocalInput(record.processingDateTime),
    processedBy: record.processedBy?.trim() ?? '',
    equipmentUsed: record.equipmentUsed?.trim() ?? '',
    reagentUsed: record.reagentUsed?.trim() ?? 'None',
    lotNumber: record.lotNumber?.trim() ?? '',
    processingParameters: record.processingParameters?.trim() ?? '',
    rpm: numberToFormField(record.rpm),
    durationMinutes: numberToFormField(record.durationMinutes),
    temperatureCelsius: numberToFormField(record.temperatureCelsius),
    aliquotCount: numberToFormField(record.aliquotCount),
    aliquotVolume: record.aliquotVolume?.trim() ?? '',
    qualityCheck,
    processingNotes: record.processingNotes?.trim() ?? '',
  };
}

export function buildCreateSampleProcessingPayload(
  sampleId: number,
  form: SampleProcessingFormData
): SampleProcessingPayload {
  if (!Number.isFinite(sampleId) || sampleId <= 0) {
    throw new Error('A valid sample id is required.');
  }

  const processingDateTime = toApiDateTime(form.processingDateTime);
  if (!processingDateTime) {
    throw new Error('Processing date & time is required.');
  }

  const processingType = form.processingType.trim().toUpperCase();
  if (!processingType) {
    throw new Error('Processing type is required.');
  }

  const processedBy = form.processedBy.trim();
  if (!processedBy) {
    throw new Error('Processed by is required.');
  }

  return {
    sampleId,
    processingType,
    processingMethod: form.processingMethod.trim(),
    processingDateTime,
    processedBy,
    equipmentUsed: form.equipmentUsed.trim(),
    reagentUsed: form.reagentUsed.trim(),
    lotNumber: form.lotNumber.trim(),
    processingParameters: form.processingParameters.trim(),
    rpm: parseOptionalPositiveNumber(form.rpm, 'RPM'),
    durationMinutes: parseOptionalPositiveNumber(form.durationMinutes, 'Duration'),
    temperatureCelsius: parseOptionalPositiveNumber(
      form.temperatureCelsius,
      'Temperature'
    ),
    aliquotCount: parseOptionalPositiveNumber(form.aliquotCount, 'Aliquot count'),
    aliquotVolume: form.aliquotVolume.trim(),
    qualityCheck: form.qualityCheck.trim().toUpperCase(),
    processingNotes: form.processingNotes.trim(),
  };
}

/** PUT body — empty numeric fields are sent as `null`. */
export function buildUpdateSampleProcessingPayload(
  sampleId: number,
  form: SampleProcessingFormData
): UpdateSampleProcessingPayload {
  const base = buildCreateSampleProcessingPayload(sampleId, form);
  return {
    ...base,
    rpm: parseOptionalNumberOrNull(form.rpm, 'RPM'),
    durationMinutes: parseOptionalNumberOrNull(form.durationMinutes, 'Duration'),
    temperatureCelsius: parseOptionalNumberOrNull(
      form.temperatureCelsius,
      'Temperature'
    ),
    aliquotCount: parseOptionalNumberOrNull(form.aliquotCount, 'Aliquot count'),
  };
}

/**
 * POST `/api/v1/sample-processing`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function createSampleProcessing(
  payload: CreateSampleProcessingPayload
): Promise<CreateSampleProcessingApiResponse> {
  const res = (await bookingAxios.post(
    '/sample-processing',
    payload
  )) as CreateSampleProcessingApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to create sample processing.');
  }

  return res;
}

/**
 * PUT `/api/v1/sample-processing/{processId}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function updateSampleProcessing(
  processId: number,
  payload: UpdateSampleProcessingPayload
): Promise<UpdateSampleProcessingApiResponse> {
  if (!Number.isFinite(processId) || processId <= 0) {
    throw new Error('A valid processing id is required.');
  }

  const res = (await bookingAxios.put(
    `/sample-processing/${processId}`,
    payload
  )) as UpdateSampleProcessingApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to update sample processing.');
  }

  return res;
}

/**
 * DELETE `/api/v1/sample-processing/{processId}`
 * Removes a processing record so the sample can be processed again.
 */
export async function deleteSampleProcessing(
  processId: number,
): Promise<DeleteSampleProcessingApiResponse> {
  if (!Number.isFinite(processId) || processId <= 0) {
    throw new Error('A valid processing id is required.');
  }

  const res = (await bookingAxios.delete(
    `/sample-processing/${processId}`,
  )) as DeleteSampleProcessingApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to delete sample processing.');
  }

  return res;
}

/**
 * GET `/api/v1/sample-processing/{processId}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSampleProcessingById(
  processId: number
): Promise<SampleProcessingByIdApiResponse> {
  if (!Number.isFinite(processId) || processId <= 0) {
    throw new Error('A valid processing id is required.');
  }

  const res = (await bookingAxios.get(
    `/sample-processing/${processId}`
  )) as SampleProcessingByIdApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to load sample processing.');
  }

  return res;
}

/**
 * GET `/api/v1/sample-processing/sample/{sampleId}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSampleProcessingBySampleId(
  sampleId: number
): Promise<SampleProcessingBySampleApiResponse> {
  if (!Number.isFinite(sampleId) || sampleId <= 0) {
    throw new Error('A valid sample id is required.');
  }

  const res = (await bookingAxios.get(
    `/sample-processing/sample/${sampleId}`
  )) as SampleProcessingBySampleApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to load sample processing for this sample.');
  }

  return {
    ...res,
    data: sortSampleProcessingRecords(normalizeSampleProcessingList(res.data)),
  };
}

/** Latest processing record id for a sample, if any. */
export async function resolveLatestProcessingIdForSample(
  sampleId: number,
): Promise<number | null> {
  const res = await fetchSampleProcessingBySampleId(sampleId);
  const latestId = res.data?.[0]?.id;
  return latestId != null && latestId > 0 ? latestId : null;
}

export function buildUpdateSamplePayload(form: UpdateSampleFormData): UpdateSamplePayload {
  const orderId = Number.parseInt(String(form.orderId).trim(), 10);
  if (!Number.isFinite(orderId) || orderId < 1) {
    throw new Error('A valid order ID is required.');
  }

  const collectionDateTime = toApiDateTime(form.collectionDateTime);
  const expiryDateTime = toApiDateTime(form.expiryDateTime);
  if (!collectionDateTime) throw new Error('Collection date & time is required.');
  if (!expiryDateTime) throw new Error('Expiry date & time is required.');

  return {
    orderId,
    sampleType: form.sampleType,
    sampleLabel: form.sampleLabel.trim(),
    collectionDateTime,
    collectedBy: form.collectedBy.trim(),
    collectionMethod: form.collectionMethod.trim(),
    collectionSite: form.collectionSite.trim(),
    sampleVolume: form.sampleVolume.trim(),
    sampleCondition: form.sampleCondition.trim(),
    temperature: form.temperature.trim(),
    storageLocation: form.storageLocation.trim(),
    storageTemperature: form.storageTemperature.trim(),
    expiryDateTime,
    chainOfCustodyNotes: form.chainOfCustodyNotes.trim() || undefined,
  };
}

/** Table row for sample collection listing page. */
export interface SampleListRow {
  id: number;
  sampleCode: string;
  patientName: string;
  collectedBy: string;
  testName: string;
  sampleType: string;
  collectedAt: string;
  status: 'Pending' | 'Processing' | 'Complete' | 'Failed';
  location: string;
  createdAt?: string;
}

function mapApiStatusToListStatus(
  sample: Sample
): SampleListRow['status'] {
  const s = (sample.sampleStatus ?? sample.status ?? '').toUpperCase();
  if (s.includes('PROCESS')) return 'Processing';
  if (s.includes('REJECT') || s.includes('FAIL')) return 'Failed';
  if (
    s.includes('COMPLETE') ||
    s.includes('RECEIVED') ||
    s.includes('ACCEPT') ||
    s === 'SUCCESS'
  ) {
    return 'Complete';
  }
  return 'Pending';
}

export function mapSampleToListRow(sample: Sample): SampleListRow {
  const tests = resolveTestNames(sample);
  return {
    id: sample.id,
    sampleCode: getSampleDisplayCode(sample),
    patientName: sample.patientName?.trim() || sample.patientCode?.trim() || '—',
    collectedBy: sample.collectedBy?.trim() || '',
    testName: tests.length > 0 ? tests.join(', ') : '—',
    sampleType: formatSampleTypeLabel(sample.sampleType),
    collectedAt: formatCollectedAt(sample),
    status: mapApiStatusToListStatus(sample),
    location: sample.storageLocation?.trim() || '—',
    createdAt: sample.createdAt ?? undefined,
  };
}

export function mapSampleToReceipt(sample: Sample): SampleReceiptRow {
  const apiStatus = sample.sampleStatus ?? sample.status ?? undefined;
  const status = normalizeSampleStatus(apiStatus);
  const conditionRaw =
    sample.sampleCondition?.trim() || sample.condition?.trim() || '';

  return {
    id: sample.id,
    sampleId: getSampleDisplayCode(sample),
    patient:
      sample.patientName?.trim() ||
      sample.patientCode?.trim() ||
      sample.collectedBy?.trim() ||
      '—',
    collectedBy: sample.collectedBy?.trim() || undefined,
    orderNumber: sample.orderNumber?.trim() || undefined,
    tests: resolveTestNames(sample),
    sampleType: formatSampleTypeLabel(sample.sampleType),
    collectedAt: formatCollectedAt(sample),
    status,
    statusLabel: formatSampleStatusLabel(apiStatus),
    apiStatus,
    conditionLabel: conditionRaw || '—',
    condition: normalizeSampleCondition(conditionRaw),
    receivedDate:
      sample.receivedDate ??
      splitDateTime(sample.receivedDateTime).date ??
      undefined,
    receivedTime:
      sample.receivedTime ??
      splitDateTime(sample.receivedDateTime).time ??
      undefined,
    receivedBy: sample.receivedBy ?? undefined,
    temperatureOnArrival: sample.temperatureOnArrival ?? undefined,
    acceptanceDecision: sample.acceptanceDecision ?? undefined,
    rejectionReason: sample.rejectionReason ?? undefined,
    departmentRouting: sample.departmentRouting ?? undefined,
    storageLocation: sample.storageLocation ?? undefined,
    aliquotingRequired: sample.aliquotingRequired ?? undefined,
    numberOfAliquots: sample.numberOfAliquots ?? undefined,
    remarks: sample.remarks ?? undefined,
    processingId: resolveSampleProcessingId(sample),
  };
}

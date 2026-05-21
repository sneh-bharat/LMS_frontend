import bookingAxios from './axios';

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
  collectedAt?: string | null;
  createdAt?: string | null;
  status?: string | null;
  sampleStatus?: string | null;
  acceptanceStatus?: string | null;
  condition?: string | null;
  sampleCondition?: string | null;
  receivedDate?: string | null;
  receivedTime?: string | null;
  receivedBy?: string | null;
  temperatureOnArrival?: string | null;
  acceptanceDecision?: string | null;
  rejectionReason?: string | null;
  departmentRouting?: string | null;
  storageLocation?: string | null;
  aliquotingRequired?: boolean | null;
  numberOfAliquots?: number | null;
  remarks?: string | null;
  isActive?: boolean;
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

export interface FetchSamplesParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

/**
 * GET `/api/v1/samples?pageNo=0&pageSize=10&sortBy=createdAt`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchSamples(
  params: FetchSamplesParams = {}
): Promise<SamplesListApiResponse> {
  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
    sortBy: params.sortBy ?? 'createdAt',
  });

  return bookingAxios.get(`/samples?${query.toString()}`) as Promise<SamplesListApiResponse>;
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
  if (s === 'completed') return 'accepted';
  return 'pending';
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

function formatCollectedAt(sample: Sample): string {
  if (sample.collectedAt?.trim()) {
    const d = new Date(sample.collectedAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return sample.collectedAt;
  }

  const date = sample.collectionDate?.trim();
  const time = sample.collectionTime?.trim();
  if (date && time) return `${date} ${time}`;
  if (date) return date;

  if (sample.createdAt?.trim()) {
    const d = new Date(sample.createdAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  return '—';
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
  tests: string[];
  sampleType: SampleTypeLabel;
  collectedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
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

export function mapSampleToReceipt(sample: Sample): SampleReceiptRow {
  const status = normalizeSampleStatus(
    sample.status ?? sample.sampleStatus ?? sample.acceptanceStatus
  );

  return {
    id: sample.id,
    sampleId:
      sample.sampleCode?.trim() ||
      sample.sampleNumber?.trim() ||
      sample.sampleId?.trim() ||
      `SMP-${sample.id}`,
    patient: sample.patientName?.trim() || sample.patientCode?.trim() || '—',
    tests: resolveTestNames(sample),
    sampleType: normalizeSampleType(sample.sampleType),
    collectedAt: formatCollectedAt(sample),
    status,
    condition: normalizeSampleCondition(sample.condition ?? sample.sampleCondition),
    receivedDate: sample.receivedDate ?? undefined,
    receivedTime: sample.receivedTime ?? undefined,
    receivedBy: sample.receivedBy ?? undefined,
    temperatureOnArrival: sample.temperatureOnArrival ?? undefined,
    acceptanceDecision: sample.acceptanceDecision ?? undefined,
    rejectionReason: sample.rejectionReason ?? undefined,
    departmentRouting: sample.departmentRouting ?? undefined,
    storageLocation: sample.storageLocation ?? undefined,
    aliquotingRequired: sample.aliquotingRequired ?? undefined,
    numberOfAliquots: sample.numberOfAliquots ?? undefined,
    remarks: sample.remarks ?? undefined,
  };
}

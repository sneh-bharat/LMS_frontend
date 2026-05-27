import membershipClient from './axios';

/** Row from GET `/member-cards/all` (lims-booking). */
export interface MemberCard {
  id: number;
  cardNumber?: string;
  cardNo?: string;
  memberCardNumber?: string;
  cardholderName?: string;
  holderName?: string;
  memberName?: string;
  patientName?: string;
  organizationName?: string;
  orgName?: string;
  organization?: string | { orgName?: string; name?: string };
  cardType?: string;
  status?: string;
  cardStatus?: string;
  limitAmount?: number;
  creditLimit?: number;
  totalLimit?: number;
  usedAmount?: number;
  usedBalance?: number;
  amountUsed?: number;
  availableBalance?: number;
  availableAmount?: number;
  balanceAvailable?: number;
  expiryDate?: string;
  validTill?: string;
  validTo?: string;
  branchId?: number;
  organizationId?: number;
  email?: string;
  phone?: string;
  mobile?: string;
  patientId?: number;
  memberId?: number;
  issueDate?: string;
  issuedDate?: string;
  activatedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdDate?: string;
  remarks?: string;
  notes?: string;
  cashbackPercentage?: number;
  discountPercentage?: number;
  isActive?: boolean;
  autoRenewal?: boolean;
}

export interface MemberCardDetailApiResponse {
  data: MemberCard;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface MemberCardBalanceData {
  cardType?: string;
  limitAmount?: number;
  expiryDate?: string;
  lastTransactionDate?: string;
  isUsable?: boolean;
  orgCode?: string;
  cardId?: number;
  cardholderName?: string;
  usagePercentage?: number;
  currency?: string;
  transactionCount?: number;
  isExpired?: boolean;
  cardNumber?: string;
  cardStatus?: string;
}

export interface MemberCardBalanceApiResponse {
  data: MemberCardBalanceData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface MemberCardsPage {
  content: MemberCard[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface MemberCardsListApiResponse {
  data: MemberCardsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchMemberCardsParams {
  pageNo?: number;
  pageSize?: number;
  branchId?: number;
  /** When set, uses GET `/member-cards/search` (e.g. cardholder name). */
  searchTerm?: string;
}

export interface MemberCardStatisticsData {
  totalCards?: number;
  totalCardsCount?: number;
  totalLimit?: number;
  totalLimitAmount?: number;
  totalUsed?: number;
  totalUsedAmount?: number;
  availableBalance?: number;
  totalAvailableBalance?: number;
  averageUsage?: number;
  averageUsagePercent?: number;
  averageUsagePercentage?: number;
}

export interface MemberCardStatisticsApiResponse {
  data: NormalizedMemberCardStatistics;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchMemberCardStatisticsParams {
  branchId?: number;
}

export interface NormalizedMemberCardStatistics {
  totalCards: number;
  totalLimit: number;
  totalUsed: number;
  availableBalance: number;
  averageUsage: number;
}

function pickStatNumber(...values: (number | undefined)[]): number {
  for (const v of values) {
    if (v != null && Number.isFinite(v)) return v;
  }
  return 0;
}

export function normalizeMemberCardStatistics(
  data: MemberCardStatisticsData
): NormalizedMemberCardStatistics {
  return {
    totalCards: pickStatNumber(data.totalCards, data.totalCardsCount),
    totalLimit: pickStatNumber(data.totalLimit, data.totalLimitAmount),
    totalUsed: pickStatNumber(data.totalUsed, data.totalUsedAmount),
    availableBalance: pickStatNumber(data.availableBalance, data.totalAvailableBalance),
    averageUsage: pickStatNumber(
      data.averageUsage,
      data.averageUsagePercent,
      data.averageUsagePercentage
    ),
  };
}

function normalizeMemberCardsPage(
  page: MemberCardsPage,
  pageNo: number,
  pageSize: number
): MemberCardsPage {
  const content = page.content ?? [];
  const totalElements = page.totalElements ?? content.length;
  const size = page.pageSize ?? pageSize;
  const no = page.pageNo ?? pageNo;
  const totalPages =
    page.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)));

  return {
    ...page,
    content,
    pageNo: no,
    pageSize: size,
    totalElements,
    totalPages,
    first: page.first ?? no === 0,
    last: page.last ?? no + 1 >= totalPages,
  };
}

export function getMemberCardNumber(card: MemberCard): string {
  return (
    card.cardNumber?.trim() ||
    card.cardNo?.trim() ||
    card.memberCardNumber?.trim() ||
    '—'
  );
}

export function getMemberCardholderName(card: MemberCard): string {
  return (
    card.cardholderName?.trim() ||
    card.holderName?.trim() ||
    card.memberName?.trim() ||
    card.patientName?.trim() ||
    '—'
  );
}

export function getMemberCardOrganization(card: MemberCard): string {
  if (card.organizationName?.trim()) return card.organizationName.trim();
  if (card.orgName?.trim()) return card.orgName.trim();
  if (typeof card.organization === 'string' && card.organization.trim()) {
    return card.organization.trim();
  }
  if (card.organization && typeof card.organization === 'object') {
    const name =
      card.organization.orgName?.trim() || card.organization.name?.trim();
    if (name) return name;
  }
  return '—';
}

export function getMemberCardType(card: MemberCard): string {
  const t = card.cardType?.trim();
  return t ? t.replace(/_/g, ' ') : '—';
}

export function getMemberCardStatus(card: MemberCard): string {
  const s = (card.status ?? card.cardStatus)?.trim();
  return s ? s.toUpperCase() : '—';
}

function pickAmount(...values: (number | undefined)[]): number | null {
  for (const v of values) {
    if (v != null && Number.isFinite(v)) return v;
  }
  return null;
}

export function getMemberCardLimitAmount(card: MemberCard): number | null {
  return pickAmount(card.limitAmount, card.creditLimit, card.totalLimit);
}

export function getMemberCardUsedAmount(card: MemberCard): number | null {
  return pickAmount(card.usedAmount, card.usedBalance, card.amountUsed);
}

export function getMemberCardAvailableBalance(card: MemberCard): number | null {
  const explicit = pickAmount(
    card.availableBalance,
    card.availableAmount,
    card.balanceAvailable
  );
  if (explicit != null) return explicit;
  const limit = getMemberCardLimitAmount(card);
  const used = getMemberCardUsedAmount(card);
  if (limit != null && used != null) return limit - used;
  return null;
}

export function getMemberCardExpiryDate(card: MemberCard): string {
  return card.expiryDate?.trim() || card.validTill?.trim() || card.validTo?.trim() || '';
}

export function formatMemberCardLabel(value: string | null | undefined): string {
  const s = value?.trim();
  if (!s) return '—';
  return s.replace(/_/g, ' ');
}

export function formatMemberCardCurrency(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMemberCardPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `${value.toFixed(2)}%`;
}

export function formatMemberCardDate(isoString: string | null | undefined): string {
  if (!isoString?.trim()) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * GET `/api/v1/member-cards/all` or `/api/v1/member-cards/search?searchTerm=…`
 */
export async function fetchAllMemberCards(
  params: FetchMemberCardsParams = {}
): Promise<MemberCardsListApiResponse> {
  const searchTerm = params.searchTerm?.trim() ?? '';
  const isSearch = searchTerm.length > 0;
  const endpoint = isSearch ? '/member-cards/search' : '/member-cards/all';

  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });

  if (isSearch) {
    query.set('searchTerm', searchTerm);
  } else if (params.branchId != null && params.branchId > 0) {
    query.set('branchId', String(params.branchId));
  }

  const res = (await membershipClient.get(
    `${endpoint}?${query.toString()}`
  )) as MemberCardsListApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load member cards.');
  }

  if (res.data) {
    res.data = normalizeMemberCardsPage(
      res.data,
      params.pageNo ?? 0,
      params.pageSize ?? 10
    );
  }

  return res;
}

/**
 * GET `/api/v1/member-cards/statistics`
 */
export async function fetchMemberCardStatistics(
  params: FetchMemberCardStatisticsParams = {}
): Promise<MemberCardStatisticsApiResponse> {
  const query = new URLSearchParams();

  if (params.branchId != null && params.branchId > 0) {
    query.set('branchId', String(params.branchId));
  }

  const qs = query.toString();
  const res = (await membershipClient.get(
    `/member-cards/statistics${qs ? `?${qs}` : ''}`
  )) as Omit<MemberCardStatisticsApiResponse, 'data'> & {
    data: MemberCardStatisticsData;
  };

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load member card statistics.');
  }

  return {
    ...res,
    data: normalizeMemberCardStatistics(res.data),
  };
}

/**
 * GET `/api/v1/member-cards/{cardId}`
 */
export async function fetchMemberCardById(
  cardId: number
): Promise<MemberCardDetailApiResponse> {
  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }

  const res = (await membershipClient.get(
    `/member-cards/${cardId}`
  )) as MemberCardDetailApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load member card details.');
  }

  return res;
}

/**
 * GET `/api/v1/member-cards/{cardId}/balance`
 */
export async function fetchMemberCardBalanceById(
  cardId: number
): Promise<MemberCardBalanceApiResponse> {
  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }

  const res = (await membershipClient.get(
    `/member-cards/${cardId}/balance`
  )) as MemberCardBalanceApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load member card balance.');
  }

  return res;
}

export const MEMBER_CARD_TYPES = [
  'CORPORATE',
  'INSTITUTIONAL',
  'INDIVIDUAL',
  'PREMIUM',
  'STANDARD',
  'TRIAL',
  'PARTNER',
] as const;

export type MemberCardType = (typeof MEMBER_CARD_TYPES)[number];

/** POST `/api/v1/member-cards/create` — required: organizationId, cardholderName, cardType, limitAmount */
export interface CreateMemberCardPayload {
  organizationId: number;
  cardholderName: string;
  cardType: MemberCardType;
  limitAmount: number;
  expiryDate?: string;
  remarks?: string;
  internalNotes?: string;
  billingAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  autoRenewal?: boolean;
  branchId?: number;
}

export interface CreateMemberCardApiResponse {
  data?: MemberCard;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export function buildCreateMemberCardPayload(
  input: CreateMemberCardPayload
): CreateMemberCardPayload {
  const organizationId = input.organizationId;
  const cardholderName = input.cardholderName?.trim();
  const cardType = input.cardType?.trim() as MemberCardType;
  const limitAmount = input.limitAmount;

  if (!organizationId || organizationId < 1) {
    throw new Error('Organization is required.');
  }
  if (!cardholderName) {
    throw new Error('Cardholder name is required.');
  }
  if (!cardType) {
    throw new Error('Card type is required.');
  }
  if (limitAmount == null || !Number.isFinite(limitAmount) || limitAmount < 0) {
    throw new Error('Limit amount must be a valid non-negative number.');
  }

  const payload: CreateMemberCardPayload = {
    organizationId,
    cardholderName,
    cardType,
    limitAmount: Number(limitAmount),
  };

  if (input.expiryDate?.trim()) payload.expiryDate = input.expiryDate.trim();
  if (input.remarks?.trim()) payload.remarks = input.remarks.trim();
  if (input.internalNotes?.trim()) payload.internalNotes = input.internalNotes.trim();
  if (input.billingAddress?.trim()) payload.billingAddress = input.billingAddress.trim();
  if (input.emergencyContactName?.trim()) {
    payload.emergencyContactName = input.emergencyContactName.trim();
  }
  if (input.emergencyContactPhone?.trim()) {
    payload.emergencyContactPhone = input.emergencyContactPhone.trim();
  }
  if (input.emergencyContactEmail?.trim()) {
    payload.emergencyContactEmail = input.emergencyContactEmail.trim();
  }
  if (input.autoRenewal != null) payload.autoRenewal = Boolean(input.autoRenewal);
  if (input.branchId != null && input.branchId > 0) payload.branchId = input.branchId;

  return payload;
}

/**
 * POST `/api/v1/member-cards/create`
 */
export async function createMemberCard(
  payload: CreateMemberCardPayload
): Promise<CreateMemberCardApiResponse> {
  const body = buildCreateMemberCardPayload(payload);
  const res = (await membershipClient.post(
    '/member-cards/create',
    body
  )) as CreateMemberCardApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to create member card.');
  }

  return res;
}

/** PUT `/api/v1/member-cards/{cardId}` — organizationId sent but not edited in UI */
export interface UpdateMemberCardPayload {
  organizationId: number;
  cardholderName: string;
  cardType: MemberCardType;
  expiryDate?: string;
  remarks?: string;
  autoRenewal?: boolean;
}

export interface UpdateMemberCardApiResponse {
  data?: MemberCard;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

function normalizeMemberCardType(value?: string | null): MemberCardType | '' {
  const s = value?.trim().toUpperCase().replace(/\s+/g, '_') ?? '';
  if (!s) return '';
  const match = MEMBER_CARD_TYPES.find((t) => t === s);
  return match ?? '';
}

export function buildUpdateMemberCardPayload(
  input: UpdateMemberCardPayload
): UpdateMemberCardPayload {
  const organizationId = input.organizationId;
  const cardholderName = input.cardholderName?.trim();
  const cardType = normalizeMemberCardType(input.cardType) as MemberCardType;

  if (!organizationId || organizationId < 1) {
    throw new Error('Organization is required for this card.');
  }
  if (!cardholderName) {
    throw new Error('Cardholder name is required.');
  }
  if (!cardType) {
    throw new Error('Card type is required.');
  }

  const payload: UpdateMemberCardPayload = {
    organizationId,
    cardholderName,
    cardType,
  };

  if (input.expiryDate?.trim()) payload.expiryDate = input.expiryDate.trim();
  if (input.remarks?.trim()) payload.remarks = input.remarks.trim();
  if (input.autoRenewal != null) payload.autoRenewal = Boolean(input.autoRenewal);

  return payload;
}

/**
 * PUT `/api/v1/member-cards/{cardId}`
 */
export async function updateMemberCard(
  cardId: number,
  payload: UpdateMemberCardPayload
): Promise<UpdateMemberCardApiResponse> {
  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }

  const body = buildUpdateMemberCardPayload(payload);
  const res = (await membershipClient.put(
    `/member-cards/${cardId}`,
    body
  )) as UpdateMemberCardApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to update member card.');
  }

  return res;
}

export interface DeleteMemberCardApiResponse {
  message: string;
  response: boolean;
  status: string;
}

/**
 * DELETE `/api/v1/member-cards/{cardId}`
 */
export async function deleteMemberCard(
  cardId: number
): Promise<DeleteMemberCardApiResponse> {
  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }

  const res = (await membershipClient.delete(
    `/member-cards/${cardId}`
  )) as DeleteMemberCardApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to delete member card.');
  }

  return res;
}

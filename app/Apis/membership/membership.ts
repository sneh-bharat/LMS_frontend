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
  orgCode?: string;
  organization?: string | { orgName?: string; name?: string };
  cardType?: string;
  status?: string;
  cardStatus?: string;
  /** Some APIs return `activationDate` instead of `activatedDate`. */
  activationDate?: string;
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
  lastTransactionDate?: string | null;
  currency?: string;
  transactionCount?: number;
  isExpired?: boolean;
  isUsable?: boolean;
  blockedDate?: string | null;
  blockedReason?: string | null;
  suspendedDate?: string | null;
  suspendedReason?: string | null;
  billingAddress?: string | null;
  createdByName?: string | null;
  updatedByName?: string | null;
  renewalCount?: number;
  employeeId?: string | number | null;
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

/** Payload from GET `/api/v1/member-cards/{cardId}/balance`. */
export interface MemberCardBalanceData {
  orgName?: string;
  organizationId?: number;
  orgCode?: string;
  cardId?: number;
  cardholderName?: string;
  cardNumber?: string;
  cardType?: string;
  cardStatus?: string;
  limitAmount?: number;
  usedAmount?: number;
  usedBalance?: number;
  amountUsed?: number;
  availableBalance?: number;
  availableAmount?: number;
  balanceAvailable?: number;
  expiryDate?: string;
  lastTransactionDate?: string;
  isUsable?: boolean;
  isExpired?: boolean;
  usagePercentage?: number;
  currency?: string;
  transactionCount?: number;
}

/** Maps balance API response into `MemberCard` for shared display helpers. */
export function memberCardFromBalanceData(
  balance: MemberCardBalanceData,
  fallback?: MemberCard | null
): MemberCard {
  const id = balance.cardId ?? fallback?.id ?? 0;

  return {
    ...(fallback ?? { id }),
    id,
    cardNumber: balance.cardNumber ?? fallback?.cardNumber,
    cardholderName: balance.cardholderName ?? fallback?.cardholderName,
    cardType: balance.cardType ?? fallback?.cardType,
    status: balance.cardStatus ?? fallback?.status,
    cardStatus: balance.cardStatus ?? fallback?.cardStatus,
    orgName: balance.orgName ?? fallback?.orgName,
    organizationName: balance.orgName ?? fallback?.organizationName,
    organizationId: balance.organizationId ?? fallback?.organizationId,
    limitAmount: balance.limitAmount ?? fallback?.limitAmount,
    usedAmount: balance.usedAmount ?? fallback?.usedAmount,
    availableBalance: balance.availableBalance ?? fallback?.availableBalance,
    expiryDate: balance.expiryDate ?? fallback?.expiryDate,
  };
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

/** Normalizes status for comparison (`PENDING ACTIVATION` → `PENDING_ACTIVATION`). */
export function normalizeMemberCardStatusKey(status: string): string {
  return status.trim().toUpperCase().replace(/\s+/g, '_');
}

/** True when card status is `PENDING ACTIVATION` (or `PENDING_ACTIVATION`). */
export function isMemberCardPendingActivation(card: MemberCard): boolean {
  const raw = (card.status ?? card.cardStatus)?.trim();
  if (!raw) return false;
  return normalizeMemberCardStatusKey(raw) === 'PENDING_ACTIVATION';
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

function normalizeMemberCardDetail(card: MemberCard): MemberCard {
  const organizationName =
    card.organizationName?.trim() || card.orgName?.trim() || '';

  return {
    ...card,
    // Make sure organization helper always works for detail payloads.
    ...(organizationName ? { organizationName, orgName: organizationName } : {}),
    // Align activation date naming
    activatedDate: card.activatedDate ?? card.activationDate,
  };
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

  if (res.data) {
    res.data = normalizeMemberCardDetail(res.data);
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

export interface ActivateMemberCardApiResponse {
  cardId: number;
  data?: MemberCard;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * PUT `/api/v1/member-cards/{cardId}/activate`
 */
export async function activateMemberCard(
  cardId: number
): Promise<ActivateMemberCardApiResponse> {
  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }

  const res = (await membershipClient.put(
    `/member-cards/${cardId}/activate`
  )) as ActivateMemberCardApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to activate member card.');
  }

  return {
    ...res,
    cardId: res.cardId ?? res.data?.id ?? cardId,
  };
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

/** POST `/api/v1/member-cards/allocate-limit` */
export interface AllocateMemberCardLimitPayload {
  cardId: number;
  allocationAmount: number;
  remarks?: string;
}

export interface AllocateMemberCardLimitApiResponse {
  data?: MemberCard;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export function buildAllocateMemberCardLimitPayload(
  input: AllocateMemberCardLimitPayload
): AllocateMemberCardLimitPayload {
  const cardId = input.cardId;
  const allocationAmount = input.allocationAmount;

  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }
  if (
    allocationAmount == null ||
    !Number.isFinite(allocationAmount) ||
    allocationAmount <= 0
  ) {
    throw new Error('Allocation amount must be a positive number.');
  }

  const payload: AllocateMemberCardLimitPayload = {
    cardId,
    allocationAmount,
  };

  if (input.remarks?.trim()) {
    payload.remarks = input.remarks.trim();
  }

  return payload;
}

/**
 * POST `/api/v1/member-cards/allocate-limit`
 */
export async function allocateMemberCardLimit(
  payload: AllocateMemberCardLimitPayload
): Promise<AllocateMemberCardLimitApiResponse> {
  const body = buildAllocateMemberCardLimitPayload(payload);

  const res = (await membershipClient.post(
    '/member-cards/allocate-limit',
    body
  )) as AllocateMemberCardLimitApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to allocate member card limit.');
  }

  return res;
}

/** Row from GET `/api/v1/member-cards/{cardId}/transactions`. */
export interface MemberCardTransaction {
  id: number;
  transactionId?: string;
  cardId?: number;
  transactionDate?: string;
  date?: string;
  createdAt?: string;
  createdDate?: string;
  amount?: number;
  transactionAmount?: number;
  allocationAmount?: number;
  transactionType?: string;
  type?: string;
  description?: string;
  remarks?: string;
  notes?: string;
  referenceNumber?: string;
  receiptNumber?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  openingBalance?: number;
  closingBalance?: number;
  status?: string;
  transactionStatus?: string;
  currency?: string;
  createdBy?: string;
  createdByName?: string;
  paymentMode?: string;
}

export interface MemberCardTransactionsPage {
  content: MemberCardTransaction[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface MemberCardTransactionsApiResponse {
  data: MemberCardTransaction[] | MemberCardTransactionsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchMemberCardTransactionsParams {
  pageNo?: number;
  pageSize?: number;
}

function normalizeMemberCardTransactionsPage(
  data: MemberCardTransaction[] | MemberCardTransactionsPage,
  pageNo: number,
  pageSize: number
): MemberCardTransactionsPage {
  if (Array.isArray(data)) {
    return {
      content: data,
      pageNo,
      pageSize,
      totalElements: data.length,
      totalPages: 1,
      first: pageNo === 0,
      last: true,
    };
  }

  const content = data.content ?? [];
  const totalElements = data.totalElements ?? content.length;
  const size = data.pageSize ?? pageSize;
  const no = data.pageNo ?? pageNo;
  const totalPages =
    data.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)));

  return {
    ...data,
    content,
    pageNo: no,
    pageSize: size,
    totalElements,
    totalPages,
    first: data.first ?? no === 0,
    last: data.last ?? no + 1 >= totalPages,
  };
}

export function getMemberCardTransactionDate(txn: MemberCardTransaction): string | null {
  return (
    txn.transactionDate?.trim() ||
    txn.date?.trim() ||
    txn.createdAt?.trim() ||
    txn.createdDate?.trim() ||
    null
  );
}

export function getMemberCardTransactionAmount(txn: MemberCardTransaction): number | null {
  const amount = txn.amount ?? txn.transactionAmount ?? txn.allocationAmount;
  return amount != null && Number.isFinite(amount) ? amount : null;
}

export function getMemberCardTransactionType(txn: MemberCardTransaction): string {
  return txn.transactionType?.trim() || txn.type?.trim() || '—';
}

export function getMemberCardTransactionStatus(txn: MemberCardTransaction): string {
  return txn.transactionStatus?.trim() || txn.status?.trim() || '—';
}

export function getMemberCardTransactionReference(txn: MemberCardTransaction): string {
  return (
    txn.referenceNumber?.trim() ||
    txn.receiptNumber?.trim() ||
    txn.transactionId?.trim() ||
    (txn.id > 0 ? `#${txn.id}` : '—')
  );
}

export function getMemberCardTransactionDescription(txn: MemberCardTransaction): string {
  return txn.description?.trim() || txn.remarks?.trim() || txn.notes?.trim() || '—';
}

/**
 * GET `/api/v1/member-cards/{cardId}/transactions?pageNo=0&pageSize=10`
 */
export async function fetchMemberCardTransactions(
  cardId: number,
  params: FetchMemberCardTransactionsParams = {}
): Promise<MemberCardTransactionsApiResponse & { data: MemberCardTransactionsPage }> {
  if (!cardId || cardId < 1) {
    throw new Error('A valid member card ID is required.');
  }

  const pageNo = params.pageNo ?? 0;
  const pageSize = params.pageSize ?? 10;
  const query = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });

  const res = (await membershipClient.get(
    `/member-cards/${cardId}/transactions?${query.toString()}`
  )) as MemberCardTransactionsApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load member card transactions.');
  }

  return {
    ...res,
    data: normalizeMemberCardTransactionsPage(res.data, pageNo, pageSize),
  };
}
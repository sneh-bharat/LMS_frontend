import organizationClient from './axios';

/** Row from GET `/organizations/all` (lims-booking). */
export interface Organization {
  id: number;
  orgName: string;
  orgCode: string;
  orgType: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  approvalStatus?: string;
  isActive?: boolean;
  branchId?: number;
  shortName?: string;
  addressLine1?: string;
  registrationNumber?: string;
  billingCycle?: string;
  paymentTermsDays?: number;
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  contactPersonDesignation?: string;
  website?: string;
  activeCards?: number;
  totalCards?: number;
  createdByName?: string;
  updatedByName?: string | null;
  approvalDate?: string | null;
  approvedBy?: string | null;
  specialNotes?: string;
  termsAndConditions?: string;
}

export interface OrganizationsPage {
  content: Organization[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface OrganizationsListApiResponse {
  data: OrganizationsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface OrganizationDetailApiResponse {
  data: Organization;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export const ORGANIZATION_TYPES = [
  'CORPORATE_CLIENT',
  'HEALTHCARE_INSTITUTION',
  'DIAGNOSTIC_CENTER',
  'INSURANCE_COMPANY',
  'GOVERNMENT_AGENCY',
  'RESEARCH_ORGANIZATION',
  'DISTRIBUTOR',
  'OTHER',
] as const;

export type OrganizationType = (typeof ORGANIZATION_TYPES)[number];

export const BILLING_CYCLES = ['MONTHLY', 'QUARTERLY', 'WEEKLY', 'ANNUALLY'] as const;

export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** POST `/api/v1/organizations/create` body. Required: orgName, orgType. */
export interface CreateOrganizationPayload {
  orgName: string;
  orgType: OrganizationType;
  shortName?: string;
  orgCode?: string;
  registrationNumber?: string;
  addressLine1?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  website?: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  paymentTermsDays?: number;
  billingCycle?: BillingCycle | string;
  specialNotes?: string;
  termsAndConditions?: string;
  targetBranchId?: number;
}

export interface CreateOrganizationApiResponse {
  data?: Organization;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** PUT `/api/v1/organizations/{organizationId}` body. */
export interface UpdateOrganizationPayload {
  orgName?: string;
  orgType?: OrganizationType | string;
  shortName?: string;
  orgCode?: string;
  registrationNumber?: string;
  addressLine1?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  website?: string;
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  paymentTermsDays?: number;
  billingCycle?: BillingCycle | string;
  specialNotes?: string;
  termsAndConditions?: string;
}

export interface UpdateOrganizationApiResponse {
  data?: Organization;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchOrganizationsParams {
  pageNo?: number;
  pageSize?: number;
  branchId?: number;
  searchTerm?: string;
}

function trimOptional(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

/** Strip empty optional fields before POST. */
export function buildCreateOrganizationPayload(
  input: CreateOrganizationPayload
): CreateOrganizationPayload {
  const orgName = input.orgName?.trim();
  const orgType = input.orgType?.trim() as OrganizationType;
  if (!orgName) {
    throw new Error('Organization name is required.');
  }
  if (!orgType) {
    throw new Error('Organization type is required.');
  }

  const payload: CreateOrganizationPayload = { orgName, orgType };

  const shortName = trimOptional(input.shortName);
  if (shortName) payload.shortName = shortName;
  const orgCode = trimOptional(input.orgCode);
  if (orgCode) payload.orgCode = orgCode;
  const registrationNumber = trimOptional(input.registrationNumber);
  if (registrationNumber) payload.registrationNumber = registrationNumber;
  const addressLine1 = trimOptional(input.addressLine1);
  if (addressLine1) payload.addressLine1 = addressLine1;
  const primaryPhone = trimOptional(input.primaryPhone);
  if (primaryPhone) payload.primaryPhone = primaryPhone;
  const secondaryPhone = trimOptional(input.secondaryPhone);
  if (secondaryPhone) payload.secondaryPhone = secondaryPhone;
  const email = trimOptional(input.email);
  if (email) payload.email = email;
  const website = trimOptional(input.website);
  if (website) payload.website = website;
  const contactPersonName = trimOptional(input.contactPersonName);
  if (contactPersonName) payload.contactPersonName = contactPersonName;
  const contactPersonDesignation = trimOptional(input.contactPersonDesignation);
  if (contactPersonDesignation) payload.contactPersonDesignation = contactPersonDesignation;
  const contactPersonPhone = trimOptional(input.contactPersonPhone);
  if (contactPersonPhone) payload.contactPersonPhone = contactPersonPhone;
  const contactPersonEmail = trimOptional(input.contactPersonEmail);
  if (contactPersonEmail) payload.contactPersonEmail = contactPersonEmail;
  const specialNotes = trimOptional(input.specialNotes);
  if (specialNotes) payload.specialNotes = specialNotes;
  const termsAndConditions = trimOptional(input.termsAndConditions);
  if (termsAndConditions) payload.termsAndConditions = termsAndConditions;

  const billingCycle = trimOptional(input.billingCycle as string | undefined);
  if (billingCycle) payload.billingCycle = billingCycle;

  if (input.paymentTermsDays != null && Number.isFinite(input.paymentTermsDays)) {
    const days = Math.round(input.paymentTermsDays);
    if (days >= 0) payload.paymentTermsDays = days;
  }

  if (input.targetBranchId != null && input.targetBranchId > 0) {
    payload.targetBranchId = input.targetBranchId;
  }

  return payload;
}

export function formatOrganizationLabel(value: string | null | undefined): string {
  const s = value?.trim();
  if (!s) return '—';
  return s.replace(/_/g, ' ');
}

function normalizeOrganizationsPage(
  page: OrganizationsPage,
  pageNo: number,
  pageSize: number
): OrganizationsPage {
  const content = page.content ?? [];
  const totalElements = page.totalElements ?? content.length;
  const size = page.pageSize ?? pageSize;
  const no = page.pageNo ?? pageNo;
  const totalPages = page.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)));

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

export function getOrganizationName(org: Organization): string {
  return org.orgName?.trim() || org.shortName?.trim() || '—';
}

export function getOrganizationCode(org: Organization): string {
  return org.orgCode?.trim() || '—';
}

export function getOrganizationType(org: Organization): string {
  return org.orgType?.trim() || '—';
}

export function getOrganizationPhone(org: Organization): string {
  return org.primaryPhone?.trim() || org.secondaryPhone?.trim() || org.contactPersonPhone?.trim() || '—';
}

export function getOrganizationEmail(org: Organization): string {
  return org.email?.trim() || org.contactPersonEmail?.trim() || '—';
}

/** Table Status column — uses `approvalStatus` (e.g. PENDING). */
export function getOrganizationStatus(org: Organization): string {
  if (org.approvalStatus?.trim()) return org.approvalStatus.trim().toUpperCase();
  if (org.isActive === true) return 'ACTIVE';
  if (org.isActive === false) return 'INACTIVE';
  return '—';
}

/**
 * GET `/api/v1/organizations/all?pageNo=0&pageSize=10&branchId=1`
 */
export async function fetchAllOrganizations(
  params: FetchOrganizationsParams = {}
): Promise<OrganizationsListApiResponse> {
  const isSearch = params.searchTerm && params.searchTerm.trim().length > 0;
  const endpoint = isSearch ? '/organizations/search' : '/organizations/all';

  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });

  if (isSearch) {
    query.set('searchTerm', params.searchTerm!.trim());
  }

  //   if (params.branchId != null && params.branchId > 0) {
  //     query.set('branchId', String(params.branchId));
  //   }

  const res = (await organizationClient.get(
    `${endpoint}?${query.toString()}`
  )) as OrganizationsListApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load organizations.');
  }

  if (res.data) {
    res.data = normalizeOrganizationsPage(
      res.data,
      params.pageNo ?? 0,
      params.pageSize ?? 10
    );
  }

  return res;
}

/**
 * GET `/api/v1/organizations/{organizationId}`
 */
export async function fetchOrganizationById(
  organizationId: number
): Promise<OrganizationDetailApiResponse> {
  const res = (await organizationClient.get(
    `/organizations/${organizationId}`
  )) as OrganizationDetailApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to load organization details.');
  }

  return res;
}

/**
 * POST `/api/v1/organizations/create`
 * Required: orgName, orgType.
 */
export async function createOrganization(
  payload: CreateOrganizationPayload
): Promise<CreateOrganizationApiResponse> {
  const body = buildCreateOrganizationPayload(payload);
  const res = (await organizationClient.post(
    '/organizations/create',
    body
  )) as CreateOrganizationApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to create organization.');
  }

  return res;
}

/**
 * PUT `/api/v1/organizations/{organizationId}`
 */
export async function updateOrganization(
  organizationId: number,
  payload: UpdateOrganizationPayload
): Promise<UpdateOrganizationApiResponse> {
  const res = (await organizationClient.put(
    `/organizations/${organizationId}`,
    payload
  )) as UpdateOrganizationApiResponse;

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to update organization.');
  }

  return res;
}

/**
 * PUT `/api/v1/organizations/{organizationId}/approve`
 */
export async function approveOrganization(
  organizationId: number
): Promise<{ message: string; response: boolean; status: string }> {
  const res = (await organizationClient.put(
    `/organizations/${organizationId}/approve`
  )) as { message: string; response: boolean; status: string };

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to approve organization.');
  }

  return res;
}

/**
 * PUT `/api/v1/organizations/{organizationId}/status?isActive=true`
 */
export async function toggleOrganizationStatus(
  organizationId: number,
  isActive: boolean
): Promise<{ message: string; response: boolean; status: string }> {
  const res = (await organizationClient.put(
    `/organizations/${organizationId}/status?isActive=${isActive}`
  )) as { message: string; response: boolean; status: string };

  if (res.response === false) {
    throw new Error(res.message?.trim() || `Failed to ${isActive ? 'activate' : 'deactivate'} organization.`);
  }

  return res;
}

/**
 * DELETE `/api/v1/organizations/{organizationId}`
 */
export async function deleteOrganization(
  organizationId: number
): Promise<{ message: string; response: boolean; status: string }> {
  const res = (await organizationClient.delete(
    `/organizations/${organizationId}`
  )) as { message: string; response: boolean; status: string };

  if (res.response === false) {
    throw new Error(res.message?.trim() || 'Failed to delete organization.');
  }

  return res;
}

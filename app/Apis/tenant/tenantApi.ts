import tenantAxios from './axios';
export interface Tenant {
    id?: number;
    tenantName: string;
    companyName: string;
    domainName?: string;
    domain?: string | null;
    subscriptionPlan: string;
    contactPhone: string;
    tenantEmail?: string;
    adminEmail?: string;
    contactEmail?: string;
    status: string;
    isActive: boolean;
    isDeleted?: boolean;
    maxBranches: number;
    maxUsersPerBranch: number;
    totalBranches?: number;
    totalUsers?: number | null;
}

export interface CreateTenantPayload {
    "tenantCode": string;
    "tenantName": string;
    "companyName": string;
    "contactEmail": string;
    "contactPhone": string;
    "address": string;
    "city": string;
    "state": string;
    "country": string;
    "postalCode": string;
    "adminEmail": string;
    "subscriptionPlan": string;
    "maxBranches": number;
    "maxUsersPerBranch": number;
    isActive?: boolean;
}

export interface UpdateTenantPayload {
    tenantName?: string;
    companyName?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    adminEmail?: string;
    subscriptionPlan?: string;
    maxBranches?: number;
    maxUsersPerBranch?: number;
    isActive?: boolean;
}

export interface TenantsPage {
    content: Tenant[];
    pageNo?: number;
    pageSize?: number;
    totalPages: number;
    totalElements: number;
    first?: boolean;
    last?: boolean;
}

export interface TenantsApiResponse {
    data: TenantsPage;
    message: string;
    response: boolean;
    status: string;
    timestamp?: string;
}

export interface TenantApiResponse {
    data?: Tenant;
    message: string;
    response: boolean;
    status: string;
    timestamp?: string;
}

/** Full tenant record from GET `/api/v1/tenants/{id}`. */
export interface TenantDetail {
    id: number;
    tenantName: string;
    domain: string | null;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    adminEmail: string;
    adminId: number;
    adminUsername: string | null;
    subscriptionPlan: string;
    status: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    maxBranches: number;
    maxUsersPerBranch: number;
    isActive: boolean;
    isDeleted: boolean;
    requestId: string;
    createdBy: number;
    updatedBy: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    totalBranches: number;
    activeBranches: number;
    totalUsers: number | null;
    tenantCode?: string;
}

export interface TenantDetailApiResponse {
    data?: TenantDetail;
    message: string;
    response: boolean;
    status: string;
    timestamp?: string;
}

export interface ExpiringTenantsApiResponse {
    data: TenantDetail[];
    message: string;
    response: boolean;
    status: string;
    timestamp?: string;
}

export const EXPIRING_DAYS_OPTIONS = [30, 60, 90, 180, 360] as const;
export type ExpiringDaysOption = (typeof EXPIRING_DAYS_OPTIONS)[number];

export const RENEW_SUBSCRIPTION_MONTH_OPTIONS = [3, 6, 12, 24] as const;
export type RenewSubscriptionMonths = (typeof RENEW_SUBSCRIPTION_MONTH_OPTIONS)[number];

export type SubscriptionPlan = 'BASIC' | 'STANDARD' | 'PREMIUM' | 'ENTERPRISE';

export const SUBSCRIPTION_PLAN_OPTIONS: SubscriptionPlan[] = [
    'BASIC',
    'STANDARD',
    'PREMIUM',
    'ENTERPRISE',
];

/** Strip formatting and normalize to digits (10-digit Indian mobile when prefixed with 91). */
export function normalizeContactPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
        return digits.slice(2);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
        return digits.slice(1);
    }
    return digits;
}

export function countPhoneDigits(phone: string): number {
    return phone.replace(/\D/g, '').length;
}

export type CreateTenantFormInput = {
    tenantCode: string;
    tenantName: string;
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    adminEmail: string;
    subscriptionPlan: string;
    maxBranches: string | number;
    maxUsersPerBranch: string | number;
    isActive?: boolean;
};

export type UpdateTenantFormInput = Omit<CreateTenantFormInput, 'tenantCode'> & {
    isActive?: boolean;
};

/** Map validated form values to the update API contract. */
export function buildUpdateTenantPayload(values: UpdateTenantFormInput): UpdateTenantPayload {
    const maxBranches = parseInt(String(values.maxBranches), 10);
    const maxUsersPerBranch = parseInt(String(values.maxUsersPerBranch), 10);
    const subscriptionPlan = String(values.subscriptionPlan).trim().toUpperCase();

    if (!SUBSCRIPTION_PLAN_OPTIONS.includes(subscriptionPlan as SubscriptionPlan)) {
        throw new Error('Please select a valid subscription plan.');
    }

    return {
        tenantName: String(values.tenantName).trim(),
        companyName: String(values.companyName).trim(),
        contactEmail: String(values.contactEmail).trim().toLowerCase(),
        contactPhone: normalizeContactPhone(String(values.contactPhone)),
        address: String(values.address).trim(),
        city: String(values.city).trim(),
        state: String(values.state).trim(),
        country: String(values.country).trim(),
        postalCode: String(values.postalCode).trim().replace(/\s+/g, ''),
        adminEmail: String(values.adminEmail).trim().toLowerCase(),
        subscriptionPlan,
        maxBranches,
        maxUsersPerBranch,
        isActive: Boolean(values.isActive),
    };
}

/** Map validated form values to the API contract. */
export function buildCreateTenantPayload(values: CreateTenantFormInput): CreateTenantPayload {
    const maxBranches = parseInt(String(values.maxBranches), 10);
    const maxUsersPerBranch = parseInt(String(values.maxUsersPerBranch), 10);
    const subscriptionPlan = String(values.subscriptionPlan).trim().toUpperCase();

    if (!SUBSCRIPTION_PLAN_OPTIONS.includes(subscriptionPlan as SubscriptionPlan)) {
        throw new Error('Please select a valid subscription plan.');
    }

    return {
        tenantCode: String(values.tenantCode).trim().toUpperCase(),
        tenantName: String(values.tenantName).trim(),
        companyName: String(values.companyName).trim(),
        contactEmail: String(values.contactEmail).trim().toLowerCase(),
        contactPhone: normalizeContactPhone(String(values.contactPhone)),
        address: String(values.address).trim(),
        city: String(values.city).trim(),
        state: String(values.state).trim(),
        country: String(values.country).trim(),
        postalCode: String(values.postalCode).trim().replace(/\s+/g, ''),
        adminEmail: String(values.adminEmail).trim().toLowerCase(),
        subscriptionPlan,
        maxBranches,
        maxUsersPerBranch,
        isActive: Boolean(values.isActive),
    };
}

export interface FetchTenantsParams {
    page: number;
    size: number;
}

export interface SearchTenantsParams extends FetchTenantsParams {
    term: string;
}

export function getTenantName(row: Tenant): string {
    return row.tenantName?.trim() || '—';
}

export function getTenantCompanyName(row: Tenant): string {
    return row.companyName?.trim() || '—';
}

export function getTenantAdminEmail(row: Tenant): string {
    return row.tenantEmail?.trim() || row.adminEmail?.trim() || '—';
}

export function getTenantDomain(row: Tenant): string {
    return row.domainName?.trim() || row.domain?.trim() || '';
}

export function getTenantAdminPhone(row: Tenant): string {
    return row.contactPhone?.trim() || '—';
}

export function getTenantSubscriptionPlan(row: Tenant): string {
    return row.subscriptionPlan?.trim() || '—';
}

export function getTenantStatusLabel(row: Tenant): string {
    if (row.status?.trim()) return row.status.trim();
    if (typeof row.isActive === 'boolean') {
        return row.isActive ? 'Active' : 'Inactive';
    }
    return '—';
}

export function isTenantActive(row: Tenant): boolean {
    if (typeof row.isActive === 'boolean') return row.isActive;
    const status = row.status?.trim().toUpperCase();
    return status === 'ACTIVE';
}

export function getTenantRowKey(row: Tenant, index: number): string {
    if (row.id != null) return String(row.id);
    const domain = getTenantDomain(row);
    if (domain) return domain;
    return `${row.tenantName ?? 'tenant'}-${index}`;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/tenants/all?page=0&size=10`
 */
export async function fetchTenants(
    params: FetchTenantsParams
): Promise<TenantsApiResponse> {
    const { page, size } = params;

    return tenantAxios.get('/api/v1/tenants/all', {
        params: { page, size },
    }) as Promise<TenantsApiResponse>;
}

/** GET search tenants by tenant name — `/api/v1/tenants/search?term=&page=&size=`. */
export async function searchTenantsByName(
    params: SearchTenantsParams
): Promise<TenantsApiResponse> {
    const { term, page, size } = params;
    return tenantAxios.get('/api/v1/tenants/search', {
        params: { term: term.trim(), page, size },
    }) as Promise<TenantsApiResponse>;
}

/** GET active tenants — `/api/v1/tenants/active?page=&size=`. */
export async function getActiveTenants(
    params: FetchTenantsParams
): Promise<TenantsApiResponse> {
    const { page, size } = params;
    return tenantAxios.get('/api/v1/tenants/active', {
        params: { page, size },
    }) as Promise<TenantsApiResponse>;
}

/**
 * Inactive tenants — loads all pages from `/all` and returns only non-active rows
 * with client-side pagination (no dedicated inactive endpoint).
 */
export async function fetchInactiveTenants(
    params: FetchTenantsParams
): Promise<TenantsApiResponse> {
    const { page, size } = params;
    const inactive: Tenant[] = [];
    let currentPage = 0;
    let last = false;

    while (!last) {
        const res = await fetchTenants({ page: currentPage, size: 100 });
        const batch = res.data?.content ?? [];
        inactive.push(...batch.filter((tenant) => !isTenantActive(tenant)));
        last = res.data?.last ?? batch.length === 0;
        currentPage += 1;
        if (currentPage > 100) break;
    }

    const totalElements = inactive.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const start = page * size;
    const content = inactive.slice(start, start + size);

    return {
        response: true,
        message: 'Inactive tenants loaded',
        status: '200 OK',
        data: {
            content,
            pageNo: page,
            pageSize: size,
            totalElements,
            totalPages,
            first: page === 0,
            last: page >= totalPages - 1,
        },
    };
}

/**
 * POST `api/v1/tenants/register` - Create a new tenant
 */
export async function createTenant(payload: CreateTenantPayload): Promise<TenantApiResponse> {
    return tenantAxios.post('/api/v1/tenants/register', payload) as Promise<TenantApiResponse>;
}

export function isTenantMutationSuccess(res: TenantApiResponse): boolean {
    return res.response === true;
}


export function formatTenantDate(value: string | null | undefined): string {
    if (!value?.trim()) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.trim();
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/** Whole days from today until `dateStr` (negative if already past). */
export function getDaysUntilDate(dateStr: string | null | undefined): number | null {
    if (!dateStr?.trim()) return null;
    const end = new Date(dateStr);
    if (Number.isNaN(end.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function displayTenantValue(value: string | number | null | undefined): string {
    if (value == null) return '—';
    if (typeof value === 'string' && !value.trim()) return '—';
    return String(value);
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/tenants/{tenantId}`
 */
export async function getTenantDetails(tenantId: number): Promise<TenantDetailApiResponse> {
    return tenantAxios.get(`/api/v1/tenants/${tenantId}`) as Promise<TenantDetailApiResponse>;
}

/** delete tenant by id `/api/v1/tenants/{tenantId}`
 * DELETE `{NEXT_PUBLIC_API_AUTH}/api/v1/tenants/{tenantId}`
 */
export async function deleteTenant(tenantId: number): Promise<TenantApiResponse> {
    return tenantAxios.delete(`/api/v1/tenants/${tenantId}`) as Promise<TenantApiResponse>;
}

/** update tenant by id `/api/v1/tenants/{tenantId}`
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/tenants/{tenantId}`
 */
export async function updateTenant(tenantId: number, payload: UpdateTenantPayload): Promise<TenantApiResponse> {
    return tenantAxios.put(`/api/v1/tenants/${tenantId}`, payload) as Promise<TenantApiResponse>;
}

/** GET `/api/v1/tenants/expiring?days=` — tenants expiring within N days. */
export async function getExpiringTenants(days: number): Promise<ExpiringTenantsApiResponse> {
    return tenantAxios.get('/api/v1/tenants/expiring', {
        params: { days },
    }) as Promise<ExpiringTenantsApiResponse>;
}

/** PUT `/api/v1/tenants/{tenantId}/renew?months=` — renew tenant subscription. */
export async function renewTenantSubscription(
    tenantId: number,
    months: number
): Promise<TenantApiResponse> {
    return tenantAxios.put(`/api/v1/tenants/${tenantId}/renew`, null, {
        params: { months },
    }) as Promise<TenantApiResponse>;
}

/** 
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/tenants/{tenantId}/activate?active=true|false`
 */
export async function activateTenant(
    tenantId: number,
    isActive: boolean
): Promise<TenantApiResponse> {
    return tenantAxios.put(`/api/v1/tenants/${tenantId}/activate`, null, {
        params: { active: isActive },
    }) as Promise<TenantApiResponse>;
}
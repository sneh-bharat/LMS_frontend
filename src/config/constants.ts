export const AUTH_STORAGE_KEYS = [
  'token',
  'refreshToken',
  'role',
  'tenantId',
  'fullName',
] as const;

export const AUTHORIZED_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'BRANCH_MANAGER',
  'PATHOLOGIST',
  'LAB_TECHNICIAN',
  'LAB_COORDINATOR',
  'BLOOD_COLLECTOR',
  'RECEPTIONIST',
] as const;

export type AuthorizedRole = (typeof AUTHORIZED_ROLES)[number];

export const API_TIMEOUT_MS = 15_000;

export const QUERY_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes

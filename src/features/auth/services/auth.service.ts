/**
 * Auth service seam.
 *
 * Wraps the legacy `@/app/Apis/Auth/*` clients so the feature's hooks depend on this
 * module instead of reaching into the Apis layer directly. When these are ported onto
 * `authClient`/`doctorAuthClient` from `@/lib/api`, only this file changes.
 */
import { authApi as adminAuthApi } from '@/app/Apis/Auth/auth';
import { authApi as doctorAuthApi } from '@/app/Apis/Auth/doctor_auth';

/** Admin/staff login. */
export const login = adminAuthApi.login;

/** Doctor-portal login. */
export const doctorLogin = doctorAuthApi.login;

export type LoginPayload = Parameters<typeof login>[0];

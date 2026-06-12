import axios from 'axios';
import type { ApiResponse } from './Patient_Service_API';
import { patientServiceAxios } from './axios';

/** TanStack Query hooks: `./usePatientFamilyLinks.ts`. */

/**
 * Family link row — list GET `family-links/patient/{id}` includes UHID and mobiles.
 */
export interface PatientFamilyLinkRow {
  id: number;
  patientId: number;
  patientName: string;
  patientMobile?: string;
  patientUhid?: string;
  familyMemberId: number;
  familyMemberName: string;
  familyMemberMobile?: string;
  familyMemberUhid?: string;
  relation: string;
}

/** Create response / minimal row (subset of {@link PatientFamilyLinkRow}). */
export interface PatientFamilyLink {
  id: number;
  patientId: number;
  patientName: string;
  familyMemberId: number;
  familyMemberName: string;
  relation: string;
}

/**
 * Allowed `relation` values for POST family-links (must match backend validation).
 * Server error example: "Relation must be Father, Mother, Spouse, Child, Sibling, or Guardian".
 */
export const FAMILY_RELATIONS = ['Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Guardian'] as const;
export type FamilyRelation = (typeof FAMILY_RELATIONS)[number];

export interface CreatePatientFamilyLinkPayload {
  patientId: number;
  familyMemberId: number;
  relation: string;
}

/**
 * POST create — default `family-links` → `/api/v1/family-links`.
 * Bearer `Authorization` uses `localStorage` token via {@link patientServiceAxios}.
 * Override with `NEXT_PUBLIC_PATIENT_FAMILY_LINK_CREATE_PATH` (no leading slash).
 */
const CREATE_PATH =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_PATIENT_FAMILY_LINK_CREATE_PATH?.replace(/^\//, '')) ||
  'family-links';

export async function createPatientFamilyLink(
  payload: CreatePatientFamilyLinkPayload
): Promise<ApiResponse<PatientFamilyLink>> {
  try {
    const { data } = await patientServiceAxios.post<ApiResponse<PatientFamilyLink>>(
      `/${CREATE_PATH}`,
      payload
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      const body = e.response.data as { message?: string; error?: string };
      throw new Error(body.message || body.error || e.message || 'Failed to create family link');
    }
    throw e instanceof Error ? e : new Error('Failed to create family link');
  }
}

const LIST_BY_PATIENT_PREFIX =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_PATIENT_FAMILY_LINK_LIST_PREFIX?.replace(/\/$/, '')) ||
  'family-links/patient';

/**
 * GET /api/v1/family-links/patient/{patientId}
 */
export async function fetchFamilyLinksByPatientId(
  patientId: number
): Promise<ApiResponse<PatientFamilyLinkRow[]>> {
  try {
    const { data } = await patientServiceAxios.get<ApiResponse<PatientFamilyLinkRow[]>>(
      `/${LIST_BY_PATIENT_PREFIX}/${patientId}`
    );
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      const body = e.response.data as { message?: string; error?: string };
      throw new Error(body.message || body.error || e.message || 'Failed to load family links');
    }
    throw e instanceof Error ? e : new Error('Failed to load family links');
  }
}

/**
 * DELETE /api/v1/family-links/patient/{patientId}/member/{familyMemberId}
 */
export async function deletePatientFamilyLink(
  patientId: number,
  familyMemberId: number
): Promise<void> {
  try {
    await patientServiceAxios.delete(
      `/${LIST_BY_PATIENT_PREFIX}/${patientId}/member/${familyMemberId}`
    );
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data) {
      const body = e.response.data as { message?: string; error?: string };
      throw new Error(body.message || body.error || e.message || 'Failed to unlink family member');
    }
    throw e instanceof Error ? e : new Error('Failed to unlink family member');
  }
}

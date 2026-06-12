import type { Patient } from './Patient_Service_API';

/**
 * Strip backend-injected placeholder middle names that should not be shown.
 * Returns `undefined` when the value should be treated as absent.
 *
 * The backend historically inserted "Rani" as a default middle name when none
 * was provided during registration. This helper filters that out so the UI
 * displays a clean two-part name (first + last).
 */
export function sanitizeMiddleName(middleName: string | undefined | null): string | undefined {
  if (!middleName) return undefined;
  const trimmed = middleName.trim();
  // Backend historically injected "Rani" as a default — treat it as empty.
  if (trimmed.toLowerCase() === 'rani') return undefined;
  return trimmed;
}

export function formatPatientFullName(patient: Pick<Patient, 'firstName' | 'middleName' | 'lastName'>): string {
  return [patient.firstName, sanitizeMiddleName(patient.middleName), patient.lastName].filter(Boolean).join(' ').trim();
}

export function patientAgeYears(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function mapPatientGender(gender: Patient['gender']): 'Male' | 'Female' | 'Other' {
  if (gender === 'MALE') return 'Male';
  if (gender === 'FEMALE') return 'Female';
  return 'Other';
}

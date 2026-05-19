import type { Patient } from './Patient_Service_API';

export function formatPatientFullName(patient: Pick<Patient, 'firstName' | 'middleName' | 'lastName'>): string {
  return [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ').trim();
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

import type { Patient } from '@/app/Apis/Patients/Patient_Service_API';

export const BOOKING_DISEASES = [
  'Diabetes',
  'Hypertension',
  'Anaemia',
  'Thyroid',
  'Arthritis',
  'Asthma',
] as const;

export interface DiagnosticBookingFormFields {
  mobile: string;
  title: string;
  patientName: string;
  age: string;
  gender: string;
  address: string;
  email: string;
  drugAllergy: string;
  diseases: string[];
  referringDoctorId?: number | null;
  referredDoctor?: string;
  patientId?: number;
}

function ageFromDateOfBirth(dob: string): string {
  if (!dob) return '';
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return '';
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return String(Math.max(0, age));
}

function mapGender(gender: Patient['gender']): string {
  if (gender === 'MALE') return 'Male';
  if (gender === 'FEMALE') return 'Female';
  return 'Other';
}

function mapTitle(gender: Patient['gender']): string {
  if (gender === 'FEMALE') return 'Ms.';
  if (gender === 'MALE') return 'Mr.';
  return 'Mr.';
}

function formatAddress(patient: Patient): string {
  const primary =
    patient.addresses?.find((a) => a.isPrimary) ?? patient.addresses?.[0];
  if (!primary) return '';
  return [
    primary.addressLine1,
    primary.addressLine2,
    primary.city,
    primary.district,
    primary.state,
    primary.pinCode,
  ]
    .filter(Boolean)
    .join(', ');
}

/** Map API allergies to known pre-existing diseases only (not drug allergies). */
export function mapAllergiesToPreExistingDynamics(
  allergies: Patient['allergies'],
  knownDiseases: readonly string[] = BOOKING_DISEASES
): string[] {
  const selected: string[] = [];
  if (!allergies?.length) return selected;

  for (const allergy of allergies) {
    const name = allergy.allergyName?.trim();
    if (!name) continue;

    const matched = knownDiseases.find(
      (d) =>
        d.toLowerCase() === name.toLowerCase() ||
        name.toLowerCase().includes(d.toLowerCase()) ||
        d.toLowerCase().includes(name.toLowerCase())
    );

    if (matched && !selected.includes(matched)) {
      selected.push(matched);
    }
  }

  return selected;
}

function uniqueAllergyNames(allergies: Patient['allergies']): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const allergy of allergies ?? []) {
    const name = allergy.allergyName?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export function mapPatientToBookingForm(
  patient: Patient,
  currentMobile: string
): Partial<DiagnosticBookingFormFields> {
  const fullName = [patient.firstName, patient.middleName, patient.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  const allergyNames = uniqueAllergyNames(patient.allergies);

  return {
    patientId: patient.id,
    mobile: currentMobile || patient.mobilePrimary,
    title: mapTitle(patient.gender),
    patientName: fullName,
    age: ageFromDateOfBirth(patient.dateOfBirth),
    gender: mapGender(patient.gender),
    address: formatAddress(patient),
    email: patient.email ?? '',
    drugAllergy: allergyNames.join(', '),
    diseases: mapAllergiesToPreExistingDynamics(patient.allergies),
    referringDoctorId:
      patient.referringDoctorId != null && patient.referringDoctorId > 0
        ? patient.referringDoctorId
        : null,
  };
}

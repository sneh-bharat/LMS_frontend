import type { PatientAddress, PatientAllergy } from './Patient_Service_API';

/** True if the user entered anything in address fields (backend often returns blank rows). */
export function addressRowHasContent(
  addr: Pick<PatientAddress, 'addressLine1' | 'addressLine2' | 'city' | 'district' | 'state' | 'pinCode'>
): boolean {
  return [addr.addressLine1, addr.addressLine2, addr.city, addr.district, addr.state, addr.pinCode].some(
    (v) => (v || '').trim().length > 0
  );
}

/** True if allergy name is non-empty (do not treat blank rows as real allergies). */
export function allergyRowHasContent(allergy: Pick<PatientAllergy, 'allergyName'>): boolean {
  return (allergy.allergyName || '').trim().length > 0;
}

/**
 * Shared rules for hydrating edit forms from API lists:
 * 1. Drop rows with no meaningful content first (so empty rows never "consume" an `id`).
 * 2. Among kept rows, skip duplicate `id` (first occurrence wins).
 *
 * Addresses and allergies use the same ordering so ID dedupe behaves consistently.
 */
function sanitizePatientChildRows<T extends { id?: number }>(
  rows: T[] | undefined,
  hasContent: (row: T) => boolean
): T[] {
  const list = rows ?? [];
  const seenId = new Set<number>();
  const out: T[] = [];
  for (const row of list) {
    if (!hasContent(row)) continue;
    if (row.id != null) {
      if (seenId.has(row.id)) continue;
      seenId.add(row.id);
    }
    out.push(row);
  }
  return out;
}

/** Drop empty address rows, then drop duplicate IDs (keep first row per id). */
export function sanitizeAddressesForEdit(addresses: PatientAddress[] | undefined): PatientAddress[] {
  return sanitizePatientChildRows(addresses, addressRowHasContent);
}

/** Drop empty allergy rows, then drop duplicate IDs (keep first row per id). */
export function sanitizeAllergiesForEdit(allergies: PatientAllergy[] | undefined): PatientAllergy[] {
  return sanitizePatientChildRows(allergies, allergyRowHasContent);
}

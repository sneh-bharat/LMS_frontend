import type { DiagnosticBookingFormState } from '@/features/diagnosis/diagnostic-booking/bookingFormTypes';
import type { EstimationMetaState } from '@/features/diagnosis/diagnostic-booking/bookingFormTypes';
import {
  computeBookingFinancials,
  type BookingInvestigation,
} from './mapBookingToTestOrder';
import type { CreateEstimationPayload, EstimationItemCreatePayload } from './estimation';
import { isEmergencyPriority, normalizeOrderPriority } from './orderPriority';
import { BOOKING_DISEASES } from '@/features/diagnosis/diagnostic-booking/patientFormUtils';

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function diseaseFlags(diseases: string[]) {
  const normalized = new Set(diseases.map((d) => d.trim().toLowerCase()));
  const has = (name: string) => normalized.has(name.toLowerCase());
  const known = new Set(BOOKING_DISEASES.map((d) => d.toLowerCase()));
  const other = diseases
    .map((d) => d.trim())
    .filter((d) => d && !known.has(d.toLowerCase()));

  return {
    hasDiabetes: has('Diabetes'),
    hasHypertension: has('Hypertension'),
    hasAnaemia: has('Anaemia'),
    hasThyroid: has('Thyroid'),
    hasArthritis: has('Arthritis'),
    hasAsthma: has('Asthma'),
    otherPreExistingDisease: other.length > 0 ? other.join(', ') : null,
  };
}

function buildEstimationItems(
  investigations: BookingInvestigation[],
  discountType: string,
  discountValue: number
): EstimationItemCreatePayload[] {
  const testsSubtotal = investigations.reduce((sum, inv) => sum + inv.mrp, 0);
  const usePercent = discountType === '%' && discountValue > 0;

  return investigations.map((inv) => {
    const basePrice = inv.mrp;
    let netPrice = basePrice;

    if (usePercent) {
      netPrice = roundMoney(basePrice * (1 - discountValue / 100));
    } else if (discountValue > 0 && testsSubtotal > 0) {
      const share = basePrice / testsSubtotal;
      netPrice = roundMoney(Math.max(0, basePrice - discountValue * share));
    }

    return {
      testId: inv.id,
      basePrice: roundMoney(basePrice),
      netPrice,
      quantity: 1,
    };
  });
}

export interface MapBookingToEstimationInput {
  form: DiagnosticBookingFormState;
  meta: EstimationMetaState;
  investigations: BookingInvestigation[];
  branchId: number;
  referringDoctorId?: number | null;
}

/** Maps diagnostic-booking form state to POST `/api/v1/estimations` body. */
export function mapBookingFormToEstimationPayload(
  input: MapBookingToEstimationInput
): CreateEstimationPayload {
  const { form, meta, investigations, branchId, referringDoctorId } = input;

  if (!form.patientId || form.patientId < 1) {
    throw new Error('Search and select a patient before creating the estimation.');
  }
  if (!branchId || branchId < 1) {
    throw new Error('Select a branch before creating the estimation.');
  }
  if (investigations.length === 0) {
    throw new Error('Add at least one test to the order cart.');
  }

  const priority = normalizeOrderPriority(form.processing);
  const flags = diseaseFlags(form.diseases);
  const discountValue = Number(form.discount) || 0;
  const discountType = form.discountType === 'Flat' ? 'Flat' : '%';
  const items = buildEstimationItems(investigations, discountType, discountValue);
  const financials = computeBookingFinancials(investigations, form);

  const totalAmount = roundMoney(financials.totalAmount);
  const discountAmount = roundMoney(financials.discountAmount);
  const discountPercentage =
    totalAmount > 0 ? roundMoney((discountAmount / totalAmount) * 100) : 0;

  const payload: CreateEstimationPayload = {
    patientId: form.patientId,
    estimationDate: meta.estimationDate.trim(),
    validUntil: meta.validUntil.trim(),
    priority,
    clinicalNotes: form.diagnosis.trim() || undefined,
    drugAllergy: form.drugAllergy.trim() || undefined,
    lmpDate: form.lmpDate.trim() || null,
    ...flags,
    isEmergency: isEmergencyPriority(priority),
    referrerName: form.referrer.trim() || undefined,
    srfId: form.srfId.trim() || undefined,
    totalAmount,
    discountAmount,
    discountPercentage,
    concessionAmount: roundMoney(financials.concessionAmount),
    emergencyCharge: roundMoney(financials.emergencyCharge),
    contrastCharge: roundMoney(financials.contrastCharge),
    estimatedTaxAmount: roundMoney(Number(meta.estimatedTaxAmount) || 0),
    estimatedCollectionDate: form.collectionDate.trim() || undefined,
    estimatedCollectionTime: form.collectionTime.trim() || undefined,
    estimatedReportDate: form.expectedReportDate.trim() || undefined,
    requestedBy: form.createdByName.trim() || undefined,
    contactEmail: form.email.trim() || undefined,
    contactPhone: form.mobile.trim() || undefined,
    remarks: meta.remarks.trim() || undefined,
    createdByName: form.createdByName.trim() || undefined,
    branchId,
    estimationItems: items,
  };

  const doctorId =
    referringDoctorId != null && referringDoctorId > 0
      ? referringDoctorId
      : form.referringDoctorId;
  if (doctorId != null && doctorId > 0) {
    payload.referringDoctor = doctorId;
  }

  if (form.referringHospitalId != null && form.referringHospitalId > 0) {
    payload.referringHospital = form.referringHospitalId;
  }

  const concessionBy = form.concessionBy.trim();
  if (concessionBy) payload.concessionBy = concessionBy;

  return payload;
}

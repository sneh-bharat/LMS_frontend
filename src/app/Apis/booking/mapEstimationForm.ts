import { BOOKING_DISEASES } from '@/app/(admin)/diagnosis/diagnostic-booking/patientFormUtils';
import type {
  CreateEstimationPayload,
  EstimationItemCreatePayload,
} from './estimation';
import { isEmergencyPriority, normalizeOrderPriority } from './orderPriority';

export interface EstimationInvestigation {
  id: number;
  name: string;
  mrp: number;
}

export interface EstimationFormSnapshot {
  patientId?: number | null;
  estimationDate: string;
  validUntil: string;
  priority: string;
  referringDoctorId?: number | null;
  referringHospitalId?: number | null;
  clinicalNotes: string;
  drugAllergy: string;
  diseases: string[];
  lmpDate: string;
  referrerName: string;
  srfId: string;
  discount: string;
  discountType: string;
  concessionAmount: string;
  concessionBy: string;
  emergencyCharge: string;
  contrastCharge: string;
  estimatedTaxAmount: string;
  estimatedCollectionDate: string;
  estimatedCollectionTime: string;
  estimatedReportDate: string;
  requestedBy: string;
  contactEmail: string;
  contactPhone: string;
  remarks: string;
  createdByName: string;
}

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
  investigations: EstimationInvestigation[],
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

export interface MapEstimationFormInput {
  form: EstimationFormSnapshot;
  investigations: EstimationInvestigation[];
  branchId: number;
  referringDoctorId?: number | null;
}

export function mapEstimationFormToPayload(
  input: MapEstimationFormInput
): CreateEstimationPayload {
  const { form, investigations, branchId, referringDoctorId } = input;

  if (!form.patientId || form.patientId < 1) {
    throw new Error('Select a patient before creating the estimation.');
  }
  if (!branchId || branchId < 1) {
    throw new Error('Select a branch before creating the estimation.');
  }
  if (investigations.length === 0) {
    throw new Error('Add at least one test to the estimation.');
  }

  const priority = normalizeOrderPriority(form.priority);
  const flags = diseaseFlags(form.diseases);
  const discountValue = Number(form.discount) || 0;
  const items = buildEstimationItems(investigations, form.discountType, discountValue);

  const totalAmount = roundMoney(
    items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0)
  );
  const netFromItems = roundMoney(
    items.reduce((sum, item) => sum + item.netPrice * item.quantity, 0)
  );
  const discountAmount = roundMoney(Math.max(0, totalAmount - netFromItems));
  const discountPercentage =
    totalAmount > 0 ? roundMoney((discountAmount / totalAmount) * 100) : 0;

  const payload: CreateEstimationPayload = {
    patientId: form.patientId,
    estimationDate: form.estimationDate.trim(),
    validUntil: form.validUntil.trim(),
    priority,
    clinicalNotes: form.clinicalNotes.trim() || undefined,
    drugAllergy: form.drugAllergy.trim() || undefined,
    lmpDate: form.lmpDate.trim() || null,
    ...flags,
    isEmergency: isEmergencyPriority(priority),
    referrerName: form.referrerName.trim() || undefined,
    srfId: form.srfId.trim() || undefined,
    totalAmount,
    discountAmount,
    discountPercentage,
    concessionAmount: roundMoney(Number(form.concessionAmount) || 0),
    emergencyCharge: roundMoney(Number(form.emergencyCharge) || 0),
    contrastCharge: roundMoney(Number(form.contrastCharge) || 0),
    estimatedTaxAmount: roundMoney(Number(form.estimatedTaxAmount) || 0),
    estimatedCollectionDate: form.estimatedCollectionDate.trim() || undefined,
    estimatedCollectionTime: form.estimatedCollectionTime.trim() || undefined,
    estimatedReportDate: form.estimatedReportDate.trim() || undefined,
    requestedBy: form.requestedBy.trim() || undefined,
    contactEmail: form.contactEmail.trim() || undefined,
    contactPhone: form.contactPhone.trim() || undefined,
    remarks: form.remarks.trim() || undefined,
    createdByName:
      form.requestedBy.trim() || form.createdByName.trim() || undefined,
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

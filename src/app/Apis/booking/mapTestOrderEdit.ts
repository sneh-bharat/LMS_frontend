import { BOOKING_DISEASES } from '@/features/diagnosis/diagnostic-booking/patientFormUtils';
import type { TestOrder, UpdateTestOrderFinancialPayload, UpdateTestOrderMedicalPayload } from './testOrderApi';
import { normalizeOrderPriority, orderPriorityLabel } from './orderPriority';

export interface OrderMedicalFormState {
  processing: string;
  drugAllergy: string;
  diseases: string[];
  diagnosis: string;
  referrer: string;
  srfId: string;
  referringDoctorId: number | null;
  referringHospitalId: number | null;
  collectionDate: string;
  collectionTime: string;
  expectedReportDate: string;
  phlebotomist: string;
  lmpDate: string;
}

export interface OrderFinancialFormState {
  discountAmount: string;
  concessionAmount: string;
  concessionBy: string;
  emergencyCharge: string;
  contrast: string;
  payment: string;
  paymentMode: string;
  paymentReference: string;
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
    otherPreExistingDisease: other.join(', '),
  };
}

/** Form select value — API enum (`ROUTINE`, `URGENT`, `STAT`, `TIMED`). */
export function priorityToProcessing(priority: string): string {
  return normalizeOrderPriority(priority);
}

export function testOrderToDiseases(order: TestOrder): string[] {
  const diseases: string[] = [];
  if (order.hasDiabetes) diseases.push('Diabetes');
  if (order.hasHypertension) diseases.push('Hypertension');
  if (order.hasAnaemia) diseases.push('Anaemia');
  if (order.hasThyroid) diseases.push('Thyroid');
  if (order.hasArthritis) diseases.push('Arthritis');
  if (order.hasAsthma) diseases.push('Asthma');
  if (order.otherPreExistingDisease?.trim()) {
    for (const part of order.otherPreExistingDisease.split(',')) {
      const t = part.trim();
      if (t && !diseases.some((d) => d.toLowerCase() === t.toLowerCase())) {
        diseases.push(t);
      }
    }
  }
  return diseases;
}

export function mapTestOrderToMedicalForm(order: TestOrder): OrderMedicalFormState {
  return {
    processing: priorityToProcessing(order.priority),
    drugAllergy: order.drugAllergy ?? '',
    diseases: testOrderToDiseases(order),
    diagnosis: order.clinicalNotes ?? '',
    referrer: order.referrerName ?? '',
    srfId: order.srfId ?? '',
    referringDoctorId: order.referringDoctorId ?? null,
    referringHospitalId: order.referringHospitalId ?? null,
    collectionDate: order.collectionDate ?? '',
    collectionTime: order.collectionTime ?? '09:00',
    expectedReportDate: order.expectedReportDate ?? '',
    phlebotomist: order.collectorName ?? '',
    lmpDate: order.lmpDate ?? '',
  };
}

export function mapTestOrderToFinancialForm(order: TestOrder): OrderFinancialFormState {
  return {
    discountAmount: String(order.discountAmount ?? 0),
    concessionAmount: String(order.concessionAmount ?? 0),
    concessionBy: order.concessionBy ?? '',
    emergencyCharge: String(order.emergencyCharge ?? 0),
    contrast: String(order.contrastCharge ?? 0),
    payment: String(order.paidAmount ?? 0),
    paymentMode: order.paymentMode ?? 'Cash',
    paymentReference: order.paymentReference ?? '',
  };
}

/** Map booking form to `PUT /test-orders/{id}` medical body (patient medical info only). */
export function mapBookingFormToMedicalPayload(form: {
  drugAllergy: string;
  diseases: string[];
  lmpDate: string;
}): UpdateTestOrderMedicalPayload {
  const flags = diseaseFlags(form.diseases);
  return {
    drugAllergy: form.drugAllergy.trim(),
    lmpDate: form.lmpDate.trim() || null,
    hasDiabetes: flags.hasDiabetes,
    hasHypertension: flags.hasHypertension,
    hasAnaemia: flags.hasAnaemia,
    hasThyroid: flags.hasThyroid,
    hasArthritis: flags.hasArthritis,
    hasAsthma: flags.hasAsthma,
    otherPreExistingDisease: flags.otherPreExistingDisease || '',
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Map booking checkout fields to `PUT /test-orders/{id}` financial body. */
export function mapBookingFormToFinancialPayload(form: {
  processing: string;
  concessionAmount: string;
  concessionBy: string;
  emergencyCharge: string;
  contrast: string;
  phlebotomist: string;
  actualPayable: number;
}): UpdateTestOrderFinancialPayload {
  const payload: UpdateTestOrderFinancialPayload = {
    concessionAmount: roundMoney(Number(form.concessionAmount) || 0),
    emergencyCharge: roundMoney(Number(form.emergencyCharge) || 0),
    contrastCharge: roundMoney(Number(form.contrast) || 0),
    actualPayable: roundMoney(form.actualPayable),
    processingType: orderPriorityLabel(form.processing),
  };

  const concessionBy = form.concessionBy.trim();
  if (concessionBy) payload.concessionBy = concessionBy;

  const collectorName = form.phlebotomist.trim();
  if (collectorName) payload.collectorName = collectorName;

  return payload;
}

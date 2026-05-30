import { BOOKING_DISEASES } from '@/app/diagnosis/diagnostic-booking/patientFormUtils';
import {
  MEMBERSHIP_CARD_PAYMENT_MODE,
  MEMBERSHIP_CARD_PAYMENT_MODE_API,
  type CreateTestOrderPayload,
  type TestOrderItemPayload,
} from './testOrderApi';
import { isEmergencyPriority, normalizeOrderPriority } from './orderPriority';
import { formatCollectionTime, normalizeCreateTestOrderPayload } from './testOrderPayloadUtils';

export interface BookingInvestigation {
  id: number;
  name: string;
  mrp: number;
  category: string;
}

export interface BookingFormSnapshot {
  patientId?: number;
  referringDoctorId?: number | null;
  referringHospitalId?: number | null;
  drugAllergy: string;
  diseases: string[];
  referrer: string;
  srfId: string;
  diagnosis: string;
  processing: string;
  emergencyCharge: string;
  phlebotomist: string;
  contrast: string;
  discount: string;
  discountType: string;
  discountBy: string;
  concessionAmount: string;
  concessionBy: string;
  collectionDate: string;
  collectionTime: string;
  expectedReportDate: string;
  payment: string;
  paymentMode: string;
  paymentReference: string;
  createdByName: string;
  membershipCardNumber?: string;
  membershipCardHolderEmail?: string;
  membershipCardOtp?: string;
}

export interface MapBookingToTestOrderInput {
  form: BookingFormSnapshot;
  investigations: BookingInvestigation[];
  branchId: number;
  testsSubtotal: number;
  createdByName?: string;
  /** Selected referring doctor id (from booking UI list); overrides form when set. */
  referringDoctorId?: number | null;
}

/** Local calendar date (avoids UTC shift on order/collection dates). */
function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export { formatCollectionTime, normalizeCreateTestOrderPayload } from './testOrderPayloadUtils';

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

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface BookingFinancialSummary {
  /** Sum of test line prices (API `totalAmount`) */
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  concessionAmount: number;
  emergencyCharge: number;
  contrastCharge: number;
  actualPayable: number;
  paidAmount: number;
  balanceDue: number;
}

/** Matches API financial fields for checkout display and POST body */
export function computeBookingFinancials(
  investigations: BookingInvestigation[],
  form: Pick<
    BookingFormSnapshot,
    'discount' | 'discountType' | 'concessionAmount' | 'emergencyCharge' | 'contrast' | 'payment'
  >
): BookingFinancialSummary {
  const testsSubtotal = investigations.reduce((sum, inv) => sum + inv.mrp, 0);
  const discountValue = Number(form.discount) || 0;
  const emergencyCharge = Number(form.emergencyCharge) || 0;
  const contrastCharge = Number(form.contrast) || 0;
  const concessionAmount = Number(form.concessionAmount) || 0;
  const paidAmount = Number(form.payment) || 0;

  const orderItems = buildOrderItems(
    investigations,
    form.discountType,
    discountValue,
    testsSubtotal
  );
  const totalAmount = roundMoney(orderItems.reduce((sum, item) => sum + item.testPrice, 0));
  const netAmount = roundMoney(orderItems.reduce((sum, item) => sum + item.netPrice, 0));
  const discountAmount = roundMoney(Math.max(0, totalAmount - netAmount));
  const actualPayable = roundMoney(
    Math.max(0, netAmount - concessionAmount + emergencyCharge + contrastCharge)
  );
  const balanceDue = roundMoney(Math.max(0, actualPayable - paidAmount));

  return {
    totalAmount,
    discountAmount,
    netAmount,
    concessionAmount: roundMoney(concessionAmount),
    emergencyCharge: roundMoney(emergencyCharge),
    contrastCharge: roundMoney(contrastCharge),
    actualPayable,
    paidAmount: roundMoney(paidAmount),
    balanceDue,
  };
}

function buildOrderItems(
  investigations: BookingInvestigation[],
  discountType: string,
  discountValue: number,
  testsSubtotal: number
): TestOrderItemPayload[] {
  const usePercent = discountType === '%' && discountValue > 0;

  return investigations.map((inv) => {
    const testPrice = inv.mrp;
    let discountPercentage = 0;
    let netPrice = testPrice;

    if (usePercent) {
      discountPercentage = discountValue;
      netPrice = roundMoney(testPrice * (1 - discountPercentage / 100));
    } else if (discountValue > 0 && testsSubtotal > 0) {
      const share = testPrice / testsSubtotal;
      const itemDiscount = discountValue * share;
      netPrice = roundMoney(Math.max(0, testPrice - itemDiscount));
      discountPercentage = testPrice > 0 ? roundMoney((itemDiscount / testPrice) * 100) : 0;
    }

    return {
      testId: inv.id,
      testPrice: roundMoney(testPrice),
      discountPercentage: roundMoney(discountPercentage),
      netPrice,
    };
  });
}

export function mapBookingToTestOrderPayload(
  input: MapBookingToTestOrderInput
): CreateTestOrderPayload {
  const { form, investigations, branchId, testsSubtotal, createdByName, referringDoctorId } =
    input;

  if (!form.patientId || form.patientId < 1) {
    throw new Error('Patient is required. Search by mobile to load or register the patient first.');
  }
  if (investigations.length === 0) {
    throw new Error('Add at least one investigation to the order cart.');
  }

  const today = new Date();
  const flags = diseaseFlags(form.diseases);
  const priority = normalizeOrderPriority(form.processing);

  const financials = computeBookingFinancials(investigations, form);
  const orderItems = buildOrderItems(
    investigations,
    form.discountType,
    Number(form.discount) || 0,
    testsSubtotal
  );

  const concessionBy =
    form.concessionBy?.trim() ||
    (form.discountBy && form.discountBy !== 'N/A' ? form.discountBy.trim() : '');

  const collectionDate = form.collectionDate?.trim() || toLocalIsoDate(today);
  const expectedReportDate =
    form.expectedReportDate?.trim() || form.collectionDate?.trim() || collectionDate;

  const uiPaymentMode = form.paymentMode?.trim() || 'Cash';
  const isMembershipPayment = uiPaymentMode === MEMBERSHIP_CARD_PAYMENT_MODE;
  const paymentMode = isMembershipPayment ? MEMBERSHIP_CARD_PAYMENT_MODE_API : uiPaymentMode;

  const payload: CreateTestOrderPayload = {
    patientId: form.patientId,
    orderDate: toLocalIsoDate(today),
    priority,
    drugAllergy: form.drugAllergy?.trim() || '',
    ...flags,
    otherPreExistingDisease: flags.otherPreExistingDisease || '',
    isEmergency: isEmergencyPriority(priority),
    collectionDate,
    collectionTime: formatCollectionTime(form.collectionTime),
    expectedReportDate,
    orderItems,
    totalAmount: financials.totalAmount,
    discountAmount: financials.discountAmount,
    concessionAmount: financials.concessionAmount,
    emergencyCharge: financials.emergencyCharge,
    contrastCharge: financials.contrastCharge,
    netAmount: financials.netAmount,
    actualPayable: financials.actualPayable,
    paidAmount: financials.paidAmount,
    paymentMode,
    createdByName:
      form.createdByName?.trim() || createdByName?.trim() || 'Diagnostic Booking',
    branchId,
  };

  if (isMembershipPayment) {
    payload.requiresOtpVerification = true;
    const membershipCardNumber = form.membershipCardNumber?.trim();
    const cardholderEmail = form.membershipCardHolderEmail?.trim();
    const otpCode = form.membershipCardOtp?.trim();
    if (membershipCardNumber) payload.membershipCardNumber = membershipCardNumber;
    if (cardholderEmail) payload.cardholderEmail = cardholderEmail;
    if (otpCode) payload.otpCode = otpCode;
  }

  const referrerName = form.referrer?.trim();
  if (referrerName) payload.referrerName = referrerName;

  const srfId = form.srfId?.trim();
  if (srfId) payload.srfId = srfId;

  const clinicalNotes = form.diagnosis?.trim();
  if (clinicalNotes) payload.clinicalNotes = clinicalNotes;

  const collectorName = form.phlebotomist?.trim();
  if (collectorName) payload.collectorName = collectorName;

  if (concessionBy) {
    payload.concessionBy = concessionBy;
  }

  const paymentReference = form.paymentReference?.trim();
  if (paymentReference) {
    payload.paymentReference = paymentReference;
  } else if (financials.paidAmount > 0) {
    payload.paymentReference = `PAY-${Date.now()}`;
  }

  const resolvedReferringDoctorId =
    referringDoctorId != null && referringDoctorId > 0
      ? referringDoctorId
      : form.referringDoctorId != null && form.referringDoctorId > 0
        ? form.referringDoctorId
        : null;

  if (resolvedReferringDoctorId != null) {
    payload.referringDoctor = resolvedReferringDoctorId;
  }
  if (form.referringHospitalId != null && form.referringHospitalId > 0) {
    payload.referringHospital = form.referringHospitalId;
  }

  return normalizeCreateTestOrderPayload(payload);
}

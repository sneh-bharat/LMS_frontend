import {
  MEMBERSHIP_CARD_PAYMENT_MODE,
  MEMBERSHIP_CARD_PAYMENT_MODE_API,
  type CreateTestOrderPayload,
} from './testOrderApi';

/** API expects `HH:mm` (e.g. `"09:00"`). */
export function formatCollectionTime(time: string): string {
  const trimmed = time.trim();
  if (!trimmed) return '09:00';
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed.slice(0, 5);
  return '09:00';
}

/**
 * Ensures POST body matches ThinkLAB contract (no `referringDoctorId`, `collectionTime` as HH:mm).
 */
export function normalizeCreateTestOrderPayload(
  payload: CreateTestOrderPayload & {
    referringDoctorId?: number | null;
    /** Legacy alias from booking form — mapped to `otpCode`. */
    membershipCardOtp?: string;
  }
): CreateTestOrderPayload {
  const { referringDoctorId, membershipCardOtp, ...rest } = payload;
  const normalized = { ...rest } as CreateTestOrderPayload;

  if (
    (normalized.referringDoctor == null || normalized.referringDoctor < 1) &&
    referringDoctorId != null &&
    referringDoctorId > 0
  ) {
    normalized.referringDoctor = referringDoctorId;
  }

  if (normalized.collectionTime) {
    normalized.collectionTime = formatCollectionTime(normalized.collectionTime);
  }

  if (normalized.paymentMode === MEMBERSHIP_CARD_PAYMENT_MODE) {
    normalized.paymentMode = MEMBERSHIP_CARD_PAYMENT_MODE_API;
  }

  if (!normalized.otpCode && membershipCardOtp?.trim()) {
    normalized.otpCode = membershipCardOtp.trim();
  }

  if (normalized.paymentMode === MEMBERSHIP_CARD_PAYMENT_MODE_API) {
    normalized.requiresOtpVerification = true;
  }

  return normalized;
}

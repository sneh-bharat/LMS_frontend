// ─── Types ────────────────────────────────────────────────────────────────────

export type MembershipType = 'Basic' | 'Silver' | 'Gold' | 'Platinum' | 'Premium' | 'Loyalty';
export type PaymentMode = 'Cash' | 'Card' | 'Online' | 'UPI';
export type WalletStatus = 'Active' | 'Inactive';
export type ValidityType = 'Lifetime' | 'Months';

export interface MarketingStaff {
  id: number;
  name: string;
  employeeCode: string;
}

export interface Member {
  id: number;
  cardId: string;
  type: MembershipType;
  cashbackPercentage: number;
  discountPercentage: number;
  validity: { type: ValidityType; value: number };
  walletStatus: WalletStatus;
  marketingStaff: MarketingStaff;
  createdDate: string;
  registrationCharges: number;
  paymentMode: PaymentMode;
}

export interface MemberFormData {
  cardId: string;
  type: MembershipType;
  cashbackPercentage: number;
  discountPercentage: number;
  validityType: ValidityType;
  validityMonths: number;
  walletStatus: WalletStatus;
  marketingStaffId: number;
  marketingStaffName: string;
  marketingStaffCode: string;
  registrationCharges: number;
  paymentMode: PaymentMode;
  notes: string;
}
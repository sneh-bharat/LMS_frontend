import doctorClient from './doctorClient';

/** GET `/api/v1/doctors/{doctorId}` — `data` object. */
export interface DoctorProfileData {
  id: number;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  username: string;
  role: string;
  specialization: string;
  branchId: number | null;
  branchName?: string | null;
  isActive: boolean;
  isVerified: boolean;
  deviceId?: string | null;
  deviceTypes?: string | null;
  tenantId?: number | null;
  hospitalName?: string | null;
}

export interface DoctorProfileApiResponse {
  data: DoctorProfileData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/doctors/{doctorId}` — doctor details (doctor portal token).
 * Base: `NEXT_PUBLIC_API_AUTH`
 */
export async function fetchDoctorProfileById(
  doctorId: number
): Promise<DoctorProfileApiResponse> {
  return doctorClient.get(`/api/v1/doctors/${doctorId}`) as Promise<DoctorProfileApiResponse>;
}

export const DOCTOR_ID_STORAGE_KEY = 'doctor-id';
export const DOCTOR_NAME_STORAGE_KEY = 'doctor-name';

export function getStoredDoctorId(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DOCTOR_ID_STORAGE_KEY);
  const id = raw ? Number(raw) : NaN;
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function persistDoctorSession(profile: DoctorProfileData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DOCTOR_ID_STORAGE_KEY, String(profile.id));
  if (profile.doctorName?.trim()) {
    localStorage.setItem(DOCTOR_NAME_STORAGE_KEY, profile.doctorName.trim());
  }
}

// get doctor Profile /api/v1/users/profile — `data` object.

export interface UserProfileData {
  accessLevel: string | null;
  address: string | null;
  adminType: string | null;
  age: number | null;
  branchCode: string | null;
  branchName: string | null;
  branchStatus: string | null;
  branchType: string | null;
  collectionCenter: string | null;
  companyName: string;
  createdAt: string;
  department: string | null;
  deskNumber: string | null;
  deviceId: string | null;
  deviceType: string | null;
  email: string;
  fullName: string;
  gender: string | null;
  id: number;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  licenseNumber: string | null;
  name: string | null;
  phone: string;
  role: string;
  roleSpecificAttributes: {
    adminType: string;
    isVerified: boolean;
  };
  shift: string | null;
  showOnReport: string | null;
  specialization: string | null;
  subscriptionPlan: string;
  tenantCode: string;
  tenantId: number;
  tenantName: string;
  tenantStatus: string;
  updatedAt: string;
  }


  export interface UserProfileApiResponse {
    data: UserProfileData;
    message: string;
    response: boolean;
    status: string;
    timestamp: string;
  }

 
  export async function fetchUserProfile(): Promise<UserProfileApiResponse> {
    return doctorClient.get('/api/v1/users/profile') as Promise<UserProfileApiResponse>;
  }

 
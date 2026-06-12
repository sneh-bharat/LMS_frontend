import { authClient, doctorAuthClient } from '@/lib/api/client';

export interface LoginPayload {
  username: string;
  password: string;
  deviceTypes: 'BROWSER';
  deviceId: string;
}

export interface LoginDetails {
  id: number;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  adminType: string | null;
  branchId: number | null;
  tenantId: number | null;
}

export interface LoginResponse {
  data: { token: string; refreshToken: string; loginDetails: LoginDetails };
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

export interface DoctorLoginPayload {
  username: string;
  password: string;
  deviceTypes: 'BROWSER';
  deviceId: string;
}

export const authService = {
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    authClient.post('/api/v1/auth/login', payload),

  doctorLogin: (payload: DoctorLoginPayload): Promise<LoginResponse> =>
    doctorAuthClient.post('/api/v1/auth/doctor/login', payload),

  refreshToken: (refreshToken: string): Promise<{ data: { token: string } }> =>
    authClient.post('/api/v1/auth/refresh', { refreshToken }),
};

import { patientClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/types';

export interface Patient {
  id: number;
  patientCode?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  age?: number;
  address?: string;
  isActive: boolean;
  tenantId?: number | null;
}

export interface PatientSearchParams {
  query?: string;
  page?: number;
  size?: number;
  tenantId?: number;
}

export const patientService = {
  search: (params: PatientSearchParams): Promise<{ data: PaginatedResponse<Patient> }> =>
    patientClient.get('/patients/search', { params }),

  getById: (id: number): Promise<{ data: Patient }> =>
    patientClient.get(`/patients/${id}`),

  create: (data: Omit<Patient, 'id' | 'isActive'>): Promise<{ data: Patient }> =>
    patientClient.post('/patients', data),

  update: (id: number, data: Partial<Patient>): Promise<{ data: Patient }> =>
    patientClient.put(`/patients/${id}`, data),

  getByIds: (ids: number[]): Promise<{ data: Patient[] }> =>
    patientClient.post('/patients/bulk', { ids }),
};

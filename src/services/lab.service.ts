import { labClient, reportClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/types';

export interface LabTest {
  id: number;
  testName: string;
  testCode?: string;
  departmentId?: number;
  departmentName?: string;
  sampleType?: string;
  price?: number;
  isActive: boolean;
}

export interface Department {
  id: number;
  departmentName: string;
  isActive: boolean;
}

export interface TestCategory {
  id: number;
  categoryName: string;
  isActive: boolean;
}

export interface ReportTemplate {
  id: number;
  templateName: string;
  testId?: number;
  content?: string;
  isActive: boolean;
}

export const labService = {
  getTests: (params?: { page?: number; size?: number; departmentId?: number; search?: string }): Promise<PaginatedResponse<LabTest>> =>
    labClient.get('/api/v1/tests', { params }),

  getTestById: (id: number): Promise<{ data: LabTest }> =>
    labClient.get(`/api/v1/tests/${id}`),

  getDepartments: (): Promise<{ data: Department[] }> =>
    labClient.get('/api/v1/departments'),

  getCategories: (): Promise<{ data: TestCategory[] }> =>
    labClient.get('/api/v1/categories'),

  getTemplates: (): Promise<{ data: ReportTemplate[] }> =>
    reportClient.get('/api/v1/report-templates'),

  getTemplateById: (id: number): Promise<{ data: ReportTemplate }> =>
    reportClient.get(`/api/v1/report-templates/${id}`),

  createTemplate: (data: Omit<ReportTemplate, 'id' | 'isActive'>) =>
    reportClient.post('/api/v1/report-templates', data),

  updateTemplate: (id: number, data: Partial<ReportTemplate>) =>
    reportClient.put(`/api/v1/report-templates/${id}`, data),
};

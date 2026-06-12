import reportClient from '@/app/Apis/lab/report/axios';

export interface ReportTemplate {
  templateId: number;
  templateName: string;
  testId: number;
  testName: string;
  testCode: string;
  departmentId: number;
  departmentName: string;
  allTests: boolean;
  allDepartments: boolean;
  templateContent: string;
  applicableFor: string;
  isActive: boolean;
  allowedTemplateTypes: string;
  tenantId: number;
  branchId: number;
}

export interface ReportTemplateApiResponse {
  response: boolean;
  message: string;
  status: string;
  data: ReportTemplate;
  timestamp?: string;
}

/** GET `/api/v1/report-templates/test/{testId}` */
export async function fetchReportTemplateByTestId(
  testId: number
): Promise<ReportTemplateApiResponse> {
  return reportClient.get(`/api/v1/report-templates/test/${testId}`) as Promise<ReportTemplateApiResponse>;
}

export function mapApplicableForFromApi(value: string | null | undefined): string {
  const v = (value ?? '').trim().toUpperCase();
  if (v === 'MALE') return 'Male';
  if (v === 'FEMALE') return 'Female';
  if (v === 'BOTH') return 'Both';
  return value?.trim() || 'Both';
}

export function mapApplicableForToApi(value: string): string {
  const v = value.trim().toUpperCase();
  if (v === 'MALE') return 'MALE';
  if (v === 'FEMALE') return 'FEMALE';
  return 'BOTH';
}

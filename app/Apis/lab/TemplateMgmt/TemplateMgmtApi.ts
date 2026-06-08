import reportClient from '@/app/Apis/lab/report/axios';

// ── Types ──────────────────────────────────────────────────────────────────

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
  templateContent?: string;
  applicableFor?: string;
  isActive?: boolean;
  allowedTemplateTypes?: string;
  tenantId?: number;
  branchId?: number;
}

export interface ReportTemplatesPage {
  content: ReportTemplate[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface ReportTemplatesApiResponse {
  data: ReportTemplatesPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchReportTemplatesParams {
  pageNo: number;
  pageSize: number;
  branchId?: number;
  departmentId?: number;
  testId?: number;
}

// ── API Function ───────────────────────────────────────────────────────────

/**
 * GET `/api/v1/report-templates?pageNo=&pageSize=&branchId=&departmentId=&testId=`
 * — Fetch paginated report templates with optional filters.
 */
export async function fetchReportTemplates(
  params: FetchReportTemplatesParams
): Promise<ReportTemplatesApiResponse> {
  const queryParams: Record<string, number> = {
    pageNo: params.pageNo,
    pageSize: params.pageSize,
  };
  if (params.branchId != null) queryParams.branchId = params.branchId;
  if (params.departmentId != null) queryParams.departmentId = params.departmentId;
  if (params.testId != null) queryParams.testId = params.testId;

  return reportClient.get('/api/v1/report-templates', {
    params: queryParams,
  }) as Promise<ReportTemplatesApiResponse>;
}

// ── Create Report Template ─────────────────────────────────────────────────

export interface CreateReportTemplatePayload {
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
  branchId: number;
}

export interface CreateReportTemplateApiResponse {
  data?: ReportTemplate;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * POST `/api/v1/report-templates`
 * — Create a new report template.
 */
export async function createReportTemplate(
  payload: CreateReportTemplatePayload
): Promise<CreateReportTemplateApiResponse> {
  return reportClient.post(
    '/api/v1/report-templates',
    payload
  ) as Promise<CreateReportTemplateApiResponse>;
}

import slaMonitoringAxios from './axios';

export type SlaRulePriority = 'ROUTINE' | 'URGENT' | 'STAT' | 'NORMAL';

export interface SlaRule {
  id: number;
  priority: SlaRulePriority;
  testType: string;
  departmentId: number;
  departmentName?: string;
  categoryId: number;
  categoryName?: string;
  slaHours: number;
  warningThresholdHours: number;
  breachEscalationHours: number;
  description: string;
  branchId: number;
  branchName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSlaRuleInput {
  priority: SlaRulePriority;
  testType: string;
  departmentId: number;
  categoryId: number;
  slaHours: number;
  warningThresholdHours: number;
  breachEscalationHours: number;
  description: string;
  branchId: number;
}

export type UpdateSlaRuleInput = Partial<CreateSlaRuleInput>;

export interface SlaRulesApiResponse {
  data: SlaRule[];
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

export interface SlaRuleApiResponse {
  data: SlaRule;
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

function normalizeSlaRule(raw: Record<string, unknown>, index: number): SlaRule {
  const priority = String(raw.priority ?? 'ROUTINE').toUpperCase() as SlaRulePriority;

  return {
    id: Number(raw.id ?? index + 1),
    priority:
      priority === 'URGENT' || priority === 'STAT' || priority === 'NORMAL'
        ? priority
        : 'ROUTINE',
    testType: String(raw.testType ?? raw.test_type ?? '—'),
    departmentId: Number(raw.departmentId ?? raw.department_id ?? 0),
    departmentName:
      typeof raw.departmentName === 'string' ? raw.departmentName : undefined,
    categoryId: Number(raw.categoryId ?? raw.category_id ?? 0),
    categoryName: typeof raw.categoryName === 'string' ? raw.categoryName : undefined,
    slaHours: Number(raw.slaHours ?? raw.sla_hours ?? 0),
    warningThresholdHours: Number(
      raw.warningThresholdHours ?? raw.warning_threshold_hours ?? 0
    ),
    breachEscalationHours: Number(
      raw.breachEscalationHours ?? raw.breach_escalation_hours ?? 0
    ),
    description: String(raw.description ?? ''),
    branchId: Number(raw.branchId ?? raw.branch_id ?? 0),
    branchName: typeof raw.branchName === 'string' ? raw.branchName : undefined,
    isActive: raw.isActive !== false,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  };
}

function unwrapList(response: SlaRulesApiResponse): SlaRule[] {
  const rows = Array.isArray(response?.data) ? response.data : [];
  return rows.map((row, index) =>
    normalizeSlaRule(row as unknown as Record<string, unknown>, index)
  );
}

function assertSuccess<T extends { response?: boolean; message?: string }>(
  response: T,
  fallback: string
): T {
  if (response?.response === false) {
    throw new Error(response.message || fallback);
  }
  return response;
}

export const getSlaRules = async (): Promise<SlaRulesApiResponse> => {
  const response = (await slaMonitoringAxios.get(
    '/api/v1/sla'
  )) as SlaRulesApiResponse;

  assertSuccess(response, 'Failed to load SLA rules.');

  return {
    ...response,
    data: unwrapList(response),
  };
};

export const createSlaRule = async (
  input: CreateSlaRuleInput
): Promise<SlaRuleApiResponse> => {
  const response = (await slaMonitoringAxios.post(
    '/api/v1/sla',
    input
  )) as SlaRuleApiResponse;

  return assertSuccess(response, 'Failed to create SLA configuration.');
};

export const updateSlaRule = async (
  id: number,
  input: UpdateSlaRuleInput
): Promise<SlaRuleApiResponse> => {
  const response = (await slaMonitoringAxios.put(
    `/api/v1/sla/${id}`,
    input
  )) as SlaRuleApiResponse;

  return assertSuccess(response, 'Failed to update SLA configuration.');
};

export const deleteSlaRule = async (id: number): Promise<SlaRuleApiResponse> => {
  const response = (await slaMonitoringAxios.delete(
    `/api/v1/sla-management/${id}`
  )) as SlaRuleApiResponse;

  return assertSuccess(response, 'Failed to delete SLA configuration.');
};

/* get sla rules by priority `api/v1/sla/priority/URGENT` */
export const getSlaRulesByPriority = async (
  priority: SlaRulePriority
): Promise<SlaRulesApiResponse> => {
  const response = (await slaMonitoringAxios.get(
    `/api/v1/sla/priority/${priority}`
  )) as SlaRulesApiResponse;

  assertSuccess(response, 'Failed to get SLA rules by priority.');

  return {
    ...response,
    data: unwrapList(response),
  };
};


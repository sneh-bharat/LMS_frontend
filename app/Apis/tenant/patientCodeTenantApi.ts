import tenantClient from './axios';
import type { ApiResponse } from '../branch/branchApi';

export interface PatientCodeTenantConfig {
  tenantId: number;
  isActive: boolean;
  patientCodePrefix: string;
  patientCodeSequence: number;
}

/** Request body for PUT patient-code-prefix (matches backend contract). */
export interface UpdatePatientCodePrefixBody {
  patientCodePrefix: string;
}

const TENANT_CONFIG_PATH = '/api/v1/tenant-config';
const PATIENT_CODE_PREFIX_PATH = '/api/v1/tenant-config/patient-code-prefix';

/** GET full tenant config (prefix, sequence, active, tenantId). Bearer via `tenantClient`. */
export function fetchTenantPatientCodeConfig(): Promise<
  ApiResponse<PatientCodeTenantConfig>
> {
  return tenantClient.get(TENANT_CONFIG_PATH);
}

/**
 * PUT update patient code prefix only.
 * `curl … PUT …/api/v1/tenant-config/patient-code-prefix -d '{"patientCodePrefix":"HOSP"}'`
 */
export function updatePatientCodePrefix(
  body: UpdatePatientCodePrefixBody
): Promise<ApiResponse<PatientCodeTenantConfig>> {
  return tenantClient.put(PATIENT_CODE_PREFIX_PATH, body);
}

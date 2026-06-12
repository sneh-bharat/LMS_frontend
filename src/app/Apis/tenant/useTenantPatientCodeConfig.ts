import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchTenantPatientCodeConfig,
  updatePatientCodePrefix,
  type PatientCodeTenantConfig,
  type UpdatePatientCodePrefixBody,
} from './patientCodeTenantApi';

export const tenantPatientCodeKeys = {
  all: ['tenant-patient-code-config'] as const,
  config: () => [...tenantPatientCodeKeys.all, 'single'] as const,
};

function isApiSuccess(res: {
  response?: boolean;
  status?: string;
  data?: PatientCodeTenantConfig;
}): boolean {
  return res.response === true || String(res.status || '').includes('200');
}

/**
 * GET `/api/v1/tenant-config` — tenant patient code settings (single record).
 */
export function useTenantPatientCodeConfig() {
  return useQuery({
    queryKey: tenantPatientCodeKeys.config(),
    queryFn: () => fetchTenantPatientCodeConfig(),
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * PUT `/api/v1/tenant-config/patient-code-prefix` — body `{ "patientCodePrefix": "…" }`.
 */
export function useUpdatePatientCodePrefix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePatientCodePrefixBody) => updatePatientCodePrefix(payload),
    onSuccess: (result) => {
      if (isApiSuccess(result)) {
        toast.success(result.message || 'Patient code prefix updated');
        void queryClient.invalidateQueries({ queryKey: tenantPatientCodeKeys.config() });
      } else {
        toast.error(result.message || 'Update failed');
      }
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        err.response?.data?.message ||
        err.message ||
        'An error occurred while updating the prefix';
      toast.error(String(msg));
    },
  });
}

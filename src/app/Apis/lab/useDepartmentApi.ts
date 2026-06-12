import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentApi, Department, CreateDepartmentInput, UpdateDepartmentInput, DepartmentQueryParams } from './departmentApi';
import { toast } from 'sonner';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params: DepartmentQueryParams) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: number) => [...departmentKeys.details(), id] as const,
  active: () => [...departmentKeys.all, 'active'] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch departments with pagination, search, and filtering
 */
export function useDepartments(params: DepartmentQueryParams = {}) {
  return useQuery({
    queryKey: departmentKeys.list(params),
    queryFn: () => departmentApi.getAllDepartments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch active departments
 */
export function useActiveDepartments(params: { pageNo?: number; pageSize?: number; search?: string } = {}) {
  return useQuery({
    queryKey: [...departmentKeys.active(), params],
    queryFn: () => departmentApi.getActiveDepartments(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single department by ID
 */
export function useDepartmentById(id: number) {
  return useQuery({
    queryKey: departmentKeys.detail(id),
    queryFn: () => departmentApi.getDepartmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

/**
 * Hook to create a new department
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDepartmentInput) => departmentApi.createDepartment(input),
    onSuccess: (result) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Department created successfully');
        queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      } else {
        toast.error(result.message || 'Failed to create department');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while creating department');
    },
  });
}

/**
 * Hook to update an existing department
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateDepartmentInput }) =>
      departmentApi.updateDepartment(id, input),
    onSuccess: (result, variables) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Department updated successfully');
        queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      } else {
        toast.error(result.message || 'Failed to update department');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating department');
    },
  });
}

/**
 * Hook to delete a department
 */
export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => departmentApi.deleteDepartment(id),
    onSuccess: (result) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Department deleted successfully');
        queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      } else {
        toast.error(result.message || 'Failed to delete department');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while deleting department');
    },
  });
}

/**
 * Hook to toggle department status (active/inactive)
 */
export function useToggleDepartmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      departmentApi.toggleDepartmentStatus(id, isActive),
    onSuccess: (result, variables) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Department status updated successfully');
        queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
        queryClient.invalidateQueries({ queryKey: departmentKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: departmentKeys.active() });
      } else {
        toast.error(result.message || 'Failed to update department status');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating department status');
    },
  });
}

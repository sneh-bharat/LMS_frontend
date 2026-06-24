'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdministrator,
  updateAdministratorStatus,
  type CreateAdministratorPayload,
  type UpdateAdministratorStatusPayload,
} from './AdministratorApis';

export const administratorQueryKeys = {
  all: ['administrators'] as const,
};

/** POST register administrator; invalidates list queries on success. */
export function useCreateAdministrator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAdministratorPayload) => createAdministrator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: administratorQueryKeys.all });
    },
  });
}

/** PUT update administrator; invalidates list queries on success. */
export function useUpdateAdministrator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateAdministratorStatusPayload;
    }) => updateAdministratorStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: administratorQueryKeys.all });
    },
  });
}

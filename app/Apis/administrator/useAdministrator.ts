'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdministrator,
  type CreateAdministratorPayload,
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

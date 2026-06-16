'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import useDeviceId from '@/app/utils/custom-hooks/UseDeviceId';
import { login } from '../services/auth.service';
import type { LoginFormValues } from '../schemas/login.schema';

/**
 * Admin/staff login. Owns the mutation, token persistence, redirect, and the
 * already-logged-in guard — keeping all of it out of the page component.
 */
export function useLogin() {
  const router = useRouter();
  const deviceId = useDeviceId();

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      router.replace('/dashboard');
    }
  }, [router]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      if (!result.response) {
        toast.error(result.message || 'Login failed');
        return;
      }
      const { token, refreshToken, loginDetails } = result.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', loginDetails.role);
      if (loginDetails.fullName) localStorage.setItem('fullName', loginDetails.fullName);
      if (loginDetails.tenantId != null) localStorage.setItem('tenantId', String(loginDetails.tenantId));
      toast.success(result.message || 'Login successful');
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'An error occurred during login');
    },
  });

  const submit = (values: LoginFormValues) => {
    if (!deviceId) {
      toast.error('Device ID not initialized');
      return;
    }
    mutation.mutate({ ...values, deviceTypes: 'BROWSER', deviceId });
  };

  return { submit, isLoading: mutation.isPending };
}

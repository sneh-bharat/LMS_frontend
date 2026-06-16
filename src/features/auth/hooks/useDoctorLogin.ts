'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import useDeviceId from '@/app/utils/custom-hooks/UseDeviceId';
import { doctorLogin } from '../services/auth.service';
import type { LoginFormValues } from '../schemas/login.schema';

/**
 * Doctor-portal login. Same shape as {@link useLogin} but with doctor-scoped storage
 * keys and redirect target, plus a `mounted` flag to avoid hydration mismatch.
 */
export function useDoctorLogin() {
  const router = useRouter();
  const deviceId = useDeviceId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (localStorage.getItem('doctor-token')) {
      router.replace('/forDoctors/dashboard');
    }
  }, [router, mounted]);

  const mutation = useMutation({
    mutationFn: doctorLogin,
    onSuccess: (result) => {
      if (!result.response) {
        toast.error(result.message || 'Login failed');
        return;
      }
      const { token, refreshToken, loginDetails } = result.data;
      localStorage.setItem('doctor-token', token);
      localStorage.setItem('doctor-refreshToken', refreshToken);
      localStorage.setItem('role', loginDetails.role);
      if (loginDetails.id != null) localStorage.setItem('doctor-id', String(loginDetails.id));
      if (loginDetails.fullName?.trim()) localStorage.setItem('doctor-name', loginDetails.fullName.trim());
      toast.success(result.message || 'Login successful');
      router.push('/forDoctors/dashboard');
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

  return { submit, isLoading: mutation.isPending, mounted };
}

'use client';

import { Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { useDoctorLogin } from '../hooks/useDoctorLogin';

/** Doctor-portal sign-in screen. */
export default function DoctorLoginPage() {
  const { submit, isLoading, mounted } = useDoctorLogin();

  return (
    <AuthLayout>
      {mounted ? (
        <LoginForm onSubmit={submit} isLoading={isLoading} />
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12" aria-busy="true">
          <Loader2 className="animate-spin text-[#00ac80]" size={36} aria-hidden />
          <p className="text-sm font-medium text-slate-500">Loading…</p>
        </div>
      )}
    </AuthLayout>
  );
}

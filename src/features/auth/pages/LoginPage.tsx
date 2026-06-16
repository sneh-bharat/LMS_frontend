'use client';

import { AuthLayout } from '../components/AuthLayout';
import { LoginForm } from '../components/LoginForm';
import { useLogin } from '../hooks/useLogin';

/** Admin/staff sign-in screen. */
export default function LoginPage() {
  const { submit, isLoading } = useLogin();

  return (
    <AuthLayout>
      <LoginForm onSubmit={submit} isLoading={isLoading} />
    </AuthLayout>
  );
}

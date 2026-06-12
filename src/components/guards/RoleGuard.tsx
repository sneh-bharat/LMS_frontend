'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AUTHORIZED_ROLES, AUTH_STORAGE_KEYS } from '@/config/constants';

interface RoleGuardProps {
  children: React.ReactNode;
}

export default function RoleGuard({ children }: RoleGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || !role) {
      router.replace('/login');
      return;
    }

    if (!(AUTHORIZED_ROLES as readonly string[]).includes(role)) {
      toast.error('You are not authorised');
      AUTH_STORAGE_KEYS.forEach((k) => localStorage.removeItem(k));
      router.replace('/login');
      return;
    }

    setIsAuthorized(true);
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#eceff1] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#00ac80] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

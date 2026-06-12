import React from 'react';
import DoctorGuard from '@/app/components/DoctorGuard';

export default function DoctorProfileLayout({ children }: { children: React.ReactNode }) {
  return <DoctorGuard>{children}</DoctorGuard>;
}

import React from 'react';
import DoctorGuard from '@/components/guards/DoctorGuard';

export default function DoctorProfileLayout({ children }: { children: React.ReactNode }) {
  return <DoctorGuard>{children}</DoctorGuard>;
}

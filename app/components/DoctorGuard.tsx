'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DoctorGuardProps {
    children: React.ReactNode;
}

/**
 * DoctorGuard Component
 * Strictly enforces authentication and doctor-only role access.
 */
export default function DoctorGuard({ children }: DoctorGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        // Precautionary check to ensure we are on the client
        if (typeof window === 'undefined') return;

        const token = localStorage.getItem('doctor-token');
        const role = localStorage.getItem('role');

        console.log('DoctorGuard Debug:', { token: !!token, role });

        if (!token || !role || role !== 'DOCTOR') {
            console.log('DoctorGuard: Unauthorized access, redirecting...');
            if (role !== 'DOCTOR' && role) {
                toast.error('You are not authorized as a doctor');
            }
            router.replace('/doctor-login');
        } else {
            console.log('DoctorGuard: Authorized');
            setIsAuthorized(true);
        }
    }, [router]);

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}

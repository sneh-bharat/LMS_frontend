'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AUTHORIZED_ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "BRANCH_MANAGER",
    "PATHOLOGIST",
    "LAB_TECHNICIAN",
    "LAB_COORDINATOR",
    "BLOOD_COLLECTOR",
    "RECEPTIONIST",
];

interface RoleGuardProps {
    children: React.ReactNode;
}

/**
 * RoleGuard Component
 * Enforces authentication and role-based access control.
 */
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

        if (!AUTHORIZED_ROLES.includes(role)) {
            toast.error('You are not authorised');

            // Clear unauthorized session
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('role');

            router.replace('/login');
            return;
        }

        setIsAuthorized(true);
    }, [router]);

    // Prevent rendering children until authorization is verified
    if (!isAuthorized) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}

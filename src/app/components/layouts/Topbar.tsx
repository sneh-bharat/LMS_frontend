'use client';

import React, { useEffect, useState } from 'react';
import {
    Bell,
    User,
    Phone,
    CalendarCheck,
    Menu,
    LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogoutConfirmDialog } from '@/components/guards/LogoutConfirmDialog';

const ROLE_LABELS: Record<string, string> = {
    "SUPER_ADMIN": "Super Admin",
    "ADMIN": "Admin",
    "BRANCH_MANAGER": "Branch Manager",
    "PATHOLOGIST": "Pathologist",
    "LAB_TECHNICIAN": "Lab Technician",
    "LAB_COORDINATOR": "Lab Coordinator",
    "BLOOD_COLLECTOR": "Blood Collector",
    "RECEPTIONIST": "Receptionist",
};

interface TopbarProps {
    onToggleSidebar: () => void;
}

export default function Topbar({ onToggleSidebar }: TopbarProps) {
    const router = useRouter();
    const [userRole, setUserRole] = useState('User');
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role && ROLE_LABELS[role]) {
            setUserRole(ROLE_LABELS[role]);
        } else if (role) {
            setUserRole(role.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' '));
        }
    }, []);

    const handleLogout = () => {
        setIsLogoutDialogOpen(false);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        toast.success('Logged out successfully');
        router.replace('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-49 transition-all shadow-sm">
            <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                suppressHydrationWarning
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#00AC80] hover:bg-[#00AC80]/5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#00AC80]/20"
            >
                <Menu size={20} />
            </button>

            <div className="md:flex items-center hidden">
                <div className="flex items-center font-semibold text-gray-700 border rounded-md px-2 py-1 text-sm bg-red-50">
                    <span>Snehbharat Pvt Ltd.</span>
                </div>
            </div>

            <div className="ml-auto flex items-center gap-6">
                <div className="hidden sm:flex flex-col items-end pr-4 border-r border-slate-200">
                    <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Phone size={16} className="text-emerald-500" />
                        08062179988
                    </div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        Priority Support Active
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" aria-label="Notifications" suppressHydrationWarning>
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" aria-label="Calendar" suppressHydrationWarning>
                        <CalendarCheck size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900">Admin User</span>
                        <span className="text-xs font-semibold text-emerald-600 uppercase">{userRole}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-lg">
                        <User size={20} />
                    </div>
                </div>

                <button
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="p-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    aria-label="Logout"
                >
                    <LogOut size={20} />
                </button>

                <LogoutConfirmDialog
                    isOpen={isLogoutDialogOpen}
                    onClose={() => setIsLogoutDialogOpen(false)}
                    onConfirm={handleLogout}
                />
            </div>
        </header>
    );
}

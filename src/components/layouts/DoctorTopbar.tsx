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
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogoutConfirmDialog } from '@/components/guards/LogoutConfirmDialog';

interface DoctorTopbarProps {
    onToggleSidebar: () => void;
}

export default function DoctorTopbar({ onToggleSidebar }: DoctorTopbarProps) {
    const router = useRouter();
    const [userRole, setUserRole] = useState('Doctor');
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role) {
            setUserRole(role.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' '));
        }
    }, []);

    const handleLogout = () => {
        setIsLogoutDialogOpen(false);
        localStorage.removeItem('doctor-token');
        localStorage.removeItem('doctor-refreshToken');
        localStorage.removeItem('role');
        toast.success('Doctor logged out successfully');
        router.replace('/doctor-login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-49 transition-all shadow-sm">
            {/* ── Hamburger ── */}
            <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                suppressHydrationWarning
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#00AC80] hover:bg-[#00AC80]/5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#00AC80]/20"
            >
                <Menu size={20} />
            </button>

            {/* ── Page context label ── */}
            <div className="md:flex items-center hidden">
                <div className="flex items-center font-semibold text-[#00AC80] border border-[#00AC80]/20 rounded-md px-3 py-1 text-sm bg-[#00AC80]/5">
                    <span>Doctor Portal</span>
                </div>
            </div>

            {/* ── Right side ─ */}
            <div className="ml-auto flex items-center gap-6">
                {/* Notification Icons */}
                <div className="hidden md:flex items-center gap-2">
                    <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" aria-label="Notifications" suppressHydrationWarning>
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                    </button>
                    <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all" aria-label="Calendar" suppressHydrationWarning>
                        <CalendarCheck size={20} />
                    </button>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900">Dr. User</span>
                        <span className="text-xs font-semibold text-emerald-600 uppercase">{userRole}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-lg">
                        <User size={20} />
                    </div>
                </div>

                {/* Logout Button */}
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

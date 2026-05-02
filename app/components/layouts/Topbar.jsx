'use client';

import React, { useEffect, useState } from 'react';
import {
    Bell,
    User,
    Phone,
    CalendarCheck,
    Menu,
    Search,
    LogOut
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LogoutConfirmDialog } from '../LogoutConfirmDialog';

const ROLE_LABELS = {
    "SUPER_ADMIN": "Super Admin",
    "ADMIN": "Admin",
    "BRANCH_MANAGER": "Branch Manager",
    "PATHOLOGIST": "Pathologist",
    "LAB_TECHNICIAN": "Lab Technician",
    "LAB_COORDINATOR": "Lab Coordinator",
    "BLOOD_COLLECTOR": "Blood Collector",
    "RECEPTIONIST": "Receptionist",
};

export default function Topbar({ onToggleSidebar }) {
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
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 md:gap-4 sticky top-0 z-49 transition-all shadow-sm">
            {/* ── Hamburger ── */}
            <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                suppressHydrationWarning
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-[#00AC80] hover:bg-[#00AC80]/5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-[#00AC80]/20"
            >
                <Menu size={20} />
            </button>

            {/* ── Page context label (Responsive: Hide sub-header on small mobile) ── */}

            <div className="md:flex items-center hidden">
                <div className="flex items-center font-semibold text-gray-700 border rounded-md px-2 py-1 text-sm bg-red-50">
                    <span>Snehbharat Pvt Ltd.</span>
                </div>
            </div>



            {/* ── Right side ── */}
            <div className="ml-auto md:ml-0 flex items-center gap-2 md:gap-6 lg:gap-8">
                {/* Support call info (Hidden on Mobile/Tablet) */}
                <div className="hidden lg:flex flex-col items-end pr-6 border-r border-slate-200/60">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Phone size={14} className="text-[#00AC80]" />
                        08062179988
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Priority Support Active
                    </div>
                </div>

                {/* Info Badges (Responsive: Icons only on smaller screens) */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2.5 md:p-3 text-slate-400 hover:text-[#00AC80] hover:bg-[#00AC80]/5 rounded-xl transition-all relative group" aria-label="Notifications" suppressHydrationWarning>
                        <Bell size={20} className="group-hover:animate-shake" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                    </button>
                    <button className="hidden sm:flex p-2.5 md:p-3 text-slate-400 hover:text-[#00AC80] hover:bg-[#00AC80]/5 rounded-xl transition-all" aria-label="Apps" suppressHydrationWarning>
                        <CalendarCheck size={20} />
                    </button>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-2 md:gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group">
                    <div className="flex flex-col items-end pl-1 md:pl-3">
                        <span className="text-[11px] md:text-xs font-bold text-slate-900 group-hover:text-[#00AC80] transition-colors tracking-tight">Admin User</span>
                        <span className="text-[9px] md:text-[10px] font-bold text-[#00AC80] uppercase tracking-wider">{userRole}</span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-[#0C7372] to-[#3A6172] flex items-center justify-center text-white shadow-md shadow-[#0C7372]/20 transform group-hover:scale-105 transition-transform duration-200">
                        <User size={18} />
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={() => setIsLogoutDialogOpen(true)}
                    className="p-2.5 md:p-3 text-rose-500 hover:text-rose-600 cursor-pointer hover:bg-rose-50 rounded-xl transition-all group lg:ml-2 border border-transparent hover:border-rose-100"
                    aria-label="Logout"
                >
                    <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
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

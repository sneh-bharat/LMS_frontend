'use client';

import { 
    Grid, 
    Bell, 
    User, 
    Phone, 
    CalendarCheck, 
    Menu
} from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Topbar({ onToggleSidebar }) {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-49 transition-all shadow-sm">
            {/* ── Hamburger ── */}
            <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
            >
                <Menu size={20} />
            </button>

            {/* ── Page context label ── */}
            <div className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-nowrap">Hive Lab Management</span>
                </div>
                <span className="font-bold text-lg text-slate-900 leading-none tracking-tight text-nowrap">
                    Customer Support & <span className="text-blue-600">Quality Control</span>
                </span>
            </div>

            {/* ── Right side ── */}
            <div className="ml-auto flex items-center gap-8">
                {/* Support call info */}
                <div className="hidden lg:flex flex-col items-end pr-8 border-r border-slate-200/60">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Phone size={14} className="text-blue-500" />
                        08062179988
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        Priority Support Active
                    </div>
                </div>

                {/* Dashboard Stats (Tiny version for Topbar) */}
                <div className="hidden xl:flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter italic">Live Load</span>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-12 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[65%] shadow-[0_0_5px_rgba(59,130,246,0.4)]"></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">65%</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative group" aria-label="Notifications">
                        <Bell size={22} className="group-hover:animate-shake" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
                    </button>
                    <button className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" aria-label="Apps">
                        <CalendarCheck size={22} />
                    </button>
                </div>

                {/* Profile Widget */}
                <div className="flex items-center gap-3 p-1 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all cursor-pointer group bg-slate-50">
                    <div className="flex flex-col items-end pl-3">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">Admin User</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level 10 Master</span>
                    </div>
                    <div className="w-9 h-9 rounded-lg custom-gradient bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white transition-all">
                        <User size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
}

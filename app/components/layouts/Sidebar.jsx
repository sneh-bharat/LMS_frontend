import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Zap,
    FlaskConical,
    Microscope,
    Stethoscope,
    FileText,
    Palette,
    CreditCard,
    LayoutDashboard,
    ChevronDown,
    Activity
} from 'lucide-react';
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// NAV DATA
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
    {
        id: 'quick',
        label: 'Quick Activity',
        icon: <Zap size={20} />,
        children: [
            { label: 'Online Booking Request', href: '#' },
            { label: 'Find Diagnostic Invoice', href: '/diagnosis/invoice-list' },
            { label: 'Diagnostic Booking', href: '/diagnosis/Diagnosticbooking' },
            { label: 'Report Unlock Request', href: '/report-unlock' },
            { label: 'Find Register Patient', href: '/register-patient' },
            { label: 'Error Invoices', href: '#' },
            { label: 'Sample Tracking', href: '/SampleTracking' },
            { label: 'Daily Worksheet', href: '#' },
            { label: 'Appointments', href: '/Appointments' },
            { label: 'Bulk Report Print', href: '/reports/BulkReport' },
            { label: 'Invoice Journey', href: '#' },
        ],
    },
    {
        id: 'diagnostic',
        label: 'Diagnostic',
        icon: <FlaskConical size={20} />,
        children: [
            { label: 'Invoices', href: '/diagnosis/invoice-list' },
            { label: 'Doctors', href: '/doctor' },
            { label: 'Collectors', href: '/collector' },
            { label: 'Members', href: '/member' },
            { label: 'Estimations', href: '/estimation' },
            { label: 'Branch & B2B', href: '/branches' },
            { label: 'Referrers', href: '/referrer' },
            { label: 'Investigations', href: '/investigation' },
            { label: 'Bulk Report Download', href: '/reports/bulk-download' },
        ],
    },
    {
        id: 'lab',
        label: 'Processing Lab',
        icon: <Microscope size={20} />,
        children: [
            { label: 'Test Packages', href: '/lab/test-packages' },
            { label: 'Units', href: '/lab/units' },
            { label: 'Invoice', href: '/lab/invoice' },
        ],
    },
    {
        id: 'polyclinic',
        label: 'Polyclinic',
        icon: <Stethoscope size={20} />,
        children: [
            { label: 'Polyclinic Booking', href: '/polyclinic/booking' },
            { label: 'OPD Schedule', href: '/polyclinic/opdschedule' },
            { label: 'Patient Queue', href: '/polyclinic/patientqueue' },
            { label: 'Invoice List', href: '/reception' },
            
        ],
    },
    {
        id: 'report',
        label: 'Report',
        icon: <FileText size={20} />,
        children: [
            { label: 'Pathology Parameter', href: '/reports/pathology-parameter' },
            { label: 'Signature', href: '/reports/Signature' },
            { label: 'Result Verification', href: '/reports/result-verification' },
            { label: 'Urine Sensitivity', href: '/reports/urineSensitivity' },
            { label: 'Report Unlock', href: '/report-unlock' },
            { label: 'MIS Reports', href: '/reports/MisReports' },
        ],
    },
    {
        id: 'branding',
        label: 'Branding',
        icon: <Palette size={20} />,
        children: [
            { label: 'Brand', href: '/brand' },
            { label: 'Reference Value', href: '/brand/ReferenceValue' },
            { label: 'Options Mapping', href: '/brand/OptionsMaping' }
        ],
    },
    {
        id: 'accounts',
        label: 'Accounts',
        icon: <CreditCard size={20} />,
        children: [
            { label: 'Cash Expense', href: '/accounts/cash-expense' },
            { label: 'Bank Expense', href: '/accounts/bank-expense' },
            { label: 'Bank Info', href: '/accounts/BankInfo' },
            { label: 'Bank History', href: '/accounts/bank-history' },
            { label: 'Payment History', href: '/accounts/payment-history' },
            { label: 'Franchise Ledger', href: '/accounts/franchise-ledger' },
            { label: 'Invoice', href: '/accounts/invoice' },
            { label: 'Financial reports', href: '/accounts/financial-reports' },
        ],
    },
    {
        id: 'management',
        label: 'Management',
        icon: <LayoutDashboard size={20} />,
        children: [
            { label: 'Concession Authority', href: '/ConcessionAuthority' },
            { label: 'Users', href: '/management/users' },
              { label: 'User Access Control', href: '/management/userAccess' },
            { label: 'Patient Information', href: '/register-patient' },
            { label: 'Management Doctor', href: '/management/management-docotor' },
            { label: 'Vendors & Suppliers', href: '/management/vendors' },
            { label: 'Machine & Instrument', href: '/management/Machineinstrument' },
            { label: 'Settings', href: '/management/settings' },
            { label: 'Interface Monitor', href: '/management/InterfaceMonitor' },
          
        ],
    },
];

export default function Sidebar({ isOpen }) {
    const pathname = usePathname();

    const getDefaultOpen = () => {
        const match = NAV.find((g) =>
            g.children.some(
                (c) => pathname === c.href || pathname.startsWith(c.href + '/')
            )
        );
        return match ? [match.id] : [];
    };

    const [openGroups, setOpenGroups] = useState(getDefaultOpen);

    const toggleGroup = (id) => {
        if (!isOpen) return;
        setOpenGroups((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            className={cn(
                "flex flex-col h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950 border-r border-white/10 transition-all duration-300 ease-in-out relative z-49 shadow-2xl",
                isOpen ? 'w-72' : 'w-20'
            )}
        >
            {/* ═══ LOGO ═══════════════════════════════════════════════ */}
            <div className={cn(
                "flex items-center justify-center h-24 border-b border-white/5 transition-all overflow-hidden bg-white/5 backdrop-blur-sm",
                isOpen ? "px-4" : "px-2"
            )}>
                <div className={cn(
                    "flex items-center justify-center transition-all duration-500 group relative overflow-hidden",
                    isOpen 
                        ? "w-full bg-white rounded-xl shadow-2xl border border-white/10 hover:scale-[1.02] transform transition-transform" 
                        : "w-12 h-12 bg-white rounded-lg p-1 shadow-lg border border-white/10"
                )}>
                    {isOpen ? (
                        <img 
                            src="/images/sneh-bharat-logo.jpeg" 
                            alt="WellnessHive Logo" 
                            className="w-full h-auto object-contain max-h-16"
                        />
                    ) : (
                        <img 
                            src="/images/favicon2.png" 
                            alt="Icon" 
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            </div>

            {/* ═══ NAV ════════════════════════════════════════════════ */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 scrollbar-none">
                {NAV.map((group) => {
                    const groupOpen = openGroups.includes(group.id);
                    const isGroupActive = group.children.some(c => isActive(c.href));

                    return (
                        <div key={group.id} className="px-3 mb-2">
                            {/* ── Group header button ── */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                title={!isOpen ? group.label : ''}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                    groupOpen && isOpen
                                        ? 'bg-white/10 text-white'
                                        : isGroupActive && !isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                                )}
                            >
                                <span className={cn(
                                    "transition-all duration-200",
                                    (groupOpen && isOpen) || (isGroupActive && !isOpen) ? 'text-white' : 'text-blue-200 group-hover:text-white'
                                )}>
                                    {group.icon}
                                </span>

                                {isOpen && (
                                    <>
                                        <span className="text-sm font-semibold tracking-tight truncate flex-1 text-left">
                                            {group.label}
                                        </span>
                                        <ChevronDown size={14} className={cn(
                                            "opacity-40 transition-transform duration-200",
                                            groupOpen && "rotate-180 opacity-100"
                                        )} />
                                    </>
                                )}
                            </button>

                            {/* ── Child links ── */}
                            {isOpen && (
                                <div className={cn(
                                    "overflow-hidden transition-all duration-500 ease-in-out",
                                    groupOpen ? 'max-h-[800px] mt-2' : 'max-h-0'
                                )}>
                                    {group.children.map((child, index) => {
                                        const active = isActive(child.href);
                                        return (
                                            <Link
                                                key={`${child.href}-${index}`}
                                                href={child.href}
                                                className={cn(
                                                    "block py-2 px-4 ml-10 mr-2 rounded-lg text-[13px] transition-all duration-200 group relative",
                                                    active
                                                        ? 'text-white font-bold bg-white/20 backdrop-blur-md shadow-sm border border-white/10'
                                                        : 'text-blue-100/70 hover:text-white hover:bg-white/10'
                                                )}
                                            >
                                                {active && (
                                                    <span className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></span>
                                                )}
                                                {child.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}

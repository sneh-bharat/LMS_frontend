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
    Activity,
    Scan,
    UserPlus,
    Layers,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui';

// ─────────────────────────────────────────────────────────────────────────────
// NAV DATA
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={20} />,
        href: '/dashboard',
    },
    {
        id: 'quick',
        label: 'Quick Activity',
        icon: <Zap size={20} />,
        children: [

            { label: 'Find Diagnostic Invoice', href: '/diagnosis/invoice-list' },
            { label: 'Report Unlock Request', href: '/report-unlock' },
            { label: 'Find Register Patient', href: '/register-patient' },
            { label: 'Error Invoices', href: '#' },
            { label: 'Daily Worksheet', href: '#' },
            { label: 'Bulk Report Print', href: '/reports/BulkReport' },
            { label: 'Invoice Journey', href: '#' },
        ],
    },
    {
        id: 'booking', label: 'Booking & Registration',
        icon: <UserPlus size={20} />,
        children: [

            { label: 'Online Booking Request', href: '/OnlineBooking' },
            { label: 'Diagnostic Booking', href: '/diagnosis/Diagnosticbooking' },
            { label: 'Radiology Booking', href: '#' },
            { label: 'Polyclinic Booking', href: '/polyclinic/booking' },
            { label: 'Find Register Patient', href: '/register-patient' },
            { label: 'Appointments', href: '/Appointments' },
            { label: 'Test Order', href: '/lab/test-order' },

        ]
    },
    {
        id: 'diagnostic',
        label: 'Diagnostic',
        icon: <FlaskConical size={20} />,
        children: [

            { label: 'Invoices', href: '/diagnosis/invoice-list' },
            { label: 'Estimations', href: '/estimation' },
            { label: 'Referrers', href: '/referrer' },
            { label: 'Investigations', href: '/investigation' },
            { label: 'Sample Tracking', href: '/SampleTracking' },
            { label: 'Bulk Report Download', href: '/reports/bulk-download' },
        ],
    },
    {
        id: 'radiology',
        label: 'Radiology',
        icon: <Scan size={20} />,
        children: [

            { label: 'Radiology Schedule', href: '#' },
            { label: 'Radiology Reports', href: '#' },
            { label: ' Radiology Invoice', href: '#' },
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
            { label: 'Create Tests', href: '/lab/tests' },
            { label: 'Test Categories', href: '/lab/categories' },
            { label: 'Test Sample ', href: '/lab/sample' },
            { label: 'Sample Receipt', href: '/lab/sample-receipt' },
            { label: 'Machine & Instrument', href: '/management/Machineinstrument' },
            { label: 'Test Result', href: '/lab/test-result' },
        ],
    },
    {
        id: 'polyclinic',
        label: 'Polyclinic',
        icon: <Stethoscope size={20} />,
        children: [

            { label: 'OPD Schedule', href: '/polyclinic/opdschedule' },
            { label: 'Patient Queue', href: '/polyclinic/patientqueue' },
            { label: 'Invoice List', href: '/reception' },

        ],
    },
    {
        id: 'masters', label: 'Masters',
        icon: <Layers size={20} />,
        children: [

            { label: 'Doctors', href: '/doctor' },
            { label: 'Collectors', href: '/collector' },
            { label: 'Members', href: '/member' },
            { label: 'Referrers', href: '/referrer' },
            { label: 'Branch & B2B', href: '/branches' },
            { label: 'Interface Monitor', href: '/management/InterfaceMonitor' },
        ]
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
            { label: 'Lab Branchs', href: '/management/branch' },
            { label: 'Branch Lab Test', href: '/management/branch-test' },
            { label: 'User Access Control', href: '/management/userAccess' },
            { label: 'Patient Information', href: '/register-patient' },
            { label: 'Management Doctor', href: '/management/management-docotor' },
            { label: 'Vendors & Suppliers', href: '/management/vendors' },
            { label: 'Machine & Instrument', href: '/management/Machineinstrument' },
            { label: 'Settings', href: '/management/settings' }

        ],
    },
];

export default function Sidebar({ isOpen, onExtendSidebar }) {
    const pathname = usePathname();

    const getDefaultOpen = () => {
        const match = NAV.find((g) =>
            g.children?.some(
                (c) => pathname === c.href || pathname.startsWith(c.href + '/')
            )
        );
        return match ? [match.id] : [];
    };

    const [openGroups, setOpenGroups] = useState(getDefaultOpen);

    const toggleGroup = (id) => {
        if (!isOpen) {
            onExtendSidebar?.();
            setOpenGroups([id]);
            return;
        }
        setOpenGroups((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            className={cn(
                "flex flex-col h-screen bg-gradient-to-b from-[#0C7372] via-[#0C7372] to-[#3A6172] border-r border-white/10 transition-all duration-300 ease-in-out relative z-49 shadow-2xl overflow-y-auto",
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
                            src="/images/logo.png"
                            alt="snehbharat"
                            className="w-full h-auto object-contain max-h-16"
                        />
                    ) : (
                        <img
                            src="/images/snehbharat-favicon.png"
                            alt="Icon"
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>
            </div>

            {/* ═══ NAV ════════════════════════════════════════════════ */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 scrollbar-none">
                {NAV.map((item) => {
                    const isGroup = !!item.children;
                    const groupOpen = openGroups.includes(item.id);
                    const isItemActive = item.href ? isActive(item.href) : item.children?.some(c => isActive(c.href));

                    return (
                        <div key={item.id} className="px-3 mb-2">
                            {/* ── Item header (Button or Link) ── */}
                            {isGroup ? (
                                <button
                                    onClick={() => toggleGroup(item.id)}
                                    title={!isOpen ? item.label : ''}
                                    suppressHydrationWarning
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                        groupOpen && isOpen
                                            ? 'bg-white/10 text-white'
                                            : isItemActive && !isOpen ? 'bg-[#00AC80]/20 text-[#00AC80]' : 'text-slate-100/70 hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <span className={cn(
                                        "transition-all duration-200",
                                        (groupOpen && isOpen) || (isItemActive && !isOpen) ? 'text-white' : 'text-teal-100/80 group-hover:text-white'
                                    )}>
                                        {item.icon}
                                    </span>

                                    {isOpen && (
                                        <>
                                            <span className="text-sm font-semibold tracking-tight truncate flex-1 text-left">
                                                {item.label}
                                            </span>
                                            <ChevronDown size={14} className={cn(
                                                "opacity-40 transition-transform duration-200",
                                                groupOpen && "rotate-180 opacity-100"
                                            )} />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <Link
                                    href={item.href}
                                    title={!isOpen ? item.label : ''}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                                        isItemActive
                                            ? 'bg-white/10 text-white shadow-sm border border-white/10'
                                            : 'text-slate-100/70 hover:bg-white/5 hover:text-white'
                                    )}
                                >
                                    <span className={cn(
                                        "transition-all duration-200",
                                        isItemActive ? 'text-white' : 'text-teal-100/80 group-hover:text-white'
                                    )}>
                                        {item.icon}
                                    </span>

                                    {isOpen && (
                                        <span className={cn(
                                            "text-sm tracking-tight truncate flex-1 text-left",
                                            isItemActive ? "font-bold" : "font-semibold text-teal-50/70"
                                        )}>
                                            {item.label}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* ── Child links ── */}
                            {isGroup && isOpen && (
                                <div className={cn(
                                    "overflow-hidden transition-all duration-500 ease-in-out",
                                    groupOpen ? 'max-h-[800px] mt-2' : 'max-h-0'
                                )}>
                                    {item.children.map((child, index) => {
                                        const active = isActive(child.href);
                                        return (
                                            <Link
                                                key={`${child.href}-${index}`}
                                                href={child.href}
                                                className={cn(
                                                    "block py-2 px-4 ml-10 mr-2 rounded-lg text-[13px] transition-all duration-200 group relative",
                                                    active
                                                        ? 'text-white font-bold bg-white/20 backdrop-blur-md shadow-sm border border-white/10'
                                                        : 'text-teal-50/70 hover:text-white hover:bg-white/10'
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
                <div className="h-24" />
            </nav>



        </aside>
    );
}

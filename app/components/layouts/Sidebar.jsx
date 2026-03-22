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
    LifeBuoy,
    User,
    ClipboardList,
    Search,
    Unlock,
    UserPlus,
    Activity,
    Calendar,
    Printer,
    BarChart3,
    Table,
    Signature,
    PenTool
} from 'lucide-react';

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
            { label: 'User Access Control', href: '#' },
            { label: 'Error Invoices', href: '#' },
            { label: 'Sample Tracking', href: '/SampleTracking' },
            { label: 'Daily Worksheet', href: '#' },
            { label: 'Appointments', href: '/Appointments' },
            { label: 'Bulk Report Print', href: '/reports/BulkReport' },
            { label: 'MIS Reports', href: '/reports' },
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
            { label: 'Units', href: '/lab/units' },
            { label: 'Invoice', href: '/lab/invoice' },
        ],
    },
    {
        id: 'polyclinic',
        label: 'Polyclinic',
        icon: <Stethoscope size={20} />,
        children: [
            { label: 'Invoice List', href: '/reception' },
            { label: 'Manage Doctor', href: '/reception/doctors' },
        ],
    },
    {
        id: 'report',
        label: 'Report',
        icon: <FileText size={20} />,
        children: [
            { label: 'Pathology Parameter', href: '/reports/pathology-parameter' },
            { label: 'Signature', href: '/reports/Signature' },
            { label: 'Report Unlock', href: '/report-unlock' },
        ],
    },
    {
        id: 'branding',
        label: 'Branding',
        icon: <Palette size={20} />,
        children: [
            { label: 'Reference Value', href: '/brand/ReferenceValue' },
            { label: 'Options Mapping', href: '/brand/OptionsMaping' }
        ],
    },
    {
        id: 'accounts',
        label: 'Accounts',
        icon: <CreditCard size={20} />,
        children: [
            { label: 'Cash Expense', href: '/accounts/cash' },
            { label: 'Bank Expense', href: '/accounts/bank' },
            { label: 'Franchise Due List', href: '/accounts/franchise-due' },
            { label: 'Franchise Ledger', href: '/accounts/franchise-ledger' },
            { label: 'Vendors', href: '/accounts/vendors' },
        ],
    },
    {
        id: 'management',
        label: 'Management',
        icon: <LayoutDashboard size={20} />,
        children: [
            { label: 'EMR', href: '/emr' },
            { label: 'Users', href: '/management/users' },
            { label: 'Roles', href: '/management/roles' },
            { label: 'Settings', href: '/management/settings' },
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
        if (!isOpen) return; // Don't toggle closed accordion in mini mode
        setOpenGroups((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            className={`flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out relative z-[99] ${isOpen ? 'w-72' : 'w-20'
                }`}
        >
            {/* ═══ LOGO ═══════════════════════════════════════════════ */}
            <div className={`flex items-center gap-3 px-6 h-20 border-b border-white/5 custom-gradient2 transition-all overflow-hidden ${!isOpen ? 'justify-center px-2' : ''}`}>
                <div className={`flex items-center gap-2 font-bold tracking-tighter text-white drop-shadow-sm transition-all ${isOpen ? 'text-2xl' : 'text-xl'}`}>
                    <span className="text-emerald-300">THINK</span>
                    {isOpen && <span className="font-light text-white/90">LAB</span>}
                </div>
            </div>

            {/* ═══ NAV ════════════════════════════════════════════════ */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-6 scrollbar-none hover:scrollbar-thin scrollbar-thumb-white/10">
                {NAV.map((group) => {
                    const groupOpen = openGroups.includes(group.id);
                    const isGroupActive = group.children.some(c => isActive(c.href));

                    return (
                        <div key={group.id} className="px-3 mb-2">
                            {/* ── Group header button ── */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                title={!isOpen ? group.label : ''}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${groupOpen && isOpen
                                    ? 'bg-white/10 text-white'
                                    : isGroupActive && !isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                                    }`}
                            >
                                <span className={`transition-all duration-200 ${(groupOpen && isOpen) || (isGroupActive && !isOpen) ? 'text-emerald-400' : 'group-hover:text-emerald-400'
                                    }`}>
                                    {group.icon}
                                </span>

                                {isOpen && (
                                    <>
                                        <span className="text-sm font-semibold tracking-tight truncate flex-1 text-left">
                                            {group.label}
                                        </span>
                                        <ChevronDown size={14} className={`opacity-40 transition-transform duration-200 ${groupOpen ? 'rotate-180 opacity-100' : ''}`} />
                                    </>
                                )}
                            </button>

                            {/* ── Child links ── */}
                            {isOpen && (
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${groupOpen ? 'max-h-[800px] mt-2' : 'max-h-0'}`}>
                                    {group.children.map((child, index) => {
                                        const active = isActive(child.href);
                                        return (
                                            <Link
                                                key={`${child.href}-${index}`}
                                                href={child.href}
                                                className={`block py-2 px-4 ml-10 mr-2 rounded-lg text-[13px] transition-all duration-200 group relative ${active
                                                    ? 'text-emerald-400 font-semibold bg-emerald-500/5'
                                                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                                                    }`}
                                            >
                                                {active && (
                                                    <span className="absolute left-[-15px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
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

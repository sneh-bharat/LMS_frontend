'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─────────────────────────────────────────────────────────────────────────────
// NAV DATA
// Hrefs matched to YOUR folder structure visible in the screenshot:
//   /diagnosis/invoice-list, /doctor, /collector, /member, /estimation,
//   /branches, /referrer, /investigation, /accounts, /reception,
//   /report-unlock, /report-user, /reports, /emr
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
    {
        id: 'quick',
        label: 'Quick Activity',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
        ),
        children: [
            { label: 'Online Booking Request', href: '#' },
            { label: 'Find Diagnostic Invoice', href: '/diagnosis/invoice-list' },
            { label: ' Diagnostic  booking ', href: '/diagnosis/Diagnosticbooking' },
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
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H8v-2h4v2zm4-4H8v-2h8v2zm0-4H8V7h8v2z" />
            </svg>
        ),
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
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 2v2h1v14c0 2.21 1.79 4 4 4s4-1.79 4-4V4h1V2H7zm4 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm1-6h-4V4h4v2z" />
            </svg>
        ),
        children: [
            { label: 'Units', href: '/lab/units' },
            { label: 'Invoice', href: '/lab/invoice' },
        ],
    },
    {
        id: 'polyclinic',
        label: 'Polyclinic',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
            </svg>
        ),
        children: [
            { label: 'Invoice List', href: '/reception' },
            { label: 'Manage Doctor', href: '/reception/doctors' },
        ],
    },
    {
        id: 'report',
        label: 'Report',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
            </svg>
        ),
        children: [
            
            { label: 'Pathology Parameter', href: '/reports/pathology-parameter' },
            { label: 'Signature', href: '/reports/Signature' },
            { label: 'Report Unlock', href: '/report-unlock' },
        ],
    },
    {
        id: 'branding',
        label: 'Branding',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        ),
        href: '/brand',
        children: [
            { label: 'Reference Value', href: '/brand/ReferenceValue' },
            { label: 'Options Mapping', href: '/brand/OptionsMaping' }
        ],
    },
    {
        id: 'accounts',
        label: 'Accounts',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
            </svg>
        ),
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
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        ),
        children: [
            { label: 'EMR', href: '/emr' },
            { label: 'Users', href: '/management/users' },
            { label: 'Roles', href: '/management/roles' },
            { label: 'Settings', href: '/management/settings' },
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen }) {
    const pathname = usePathname();

    // Auto-open the group that contains the current page
    const getDefaultOpen = () => {
        const match = NAV.find((g) =>
            g.children.some(
                (c) => pathname === c.href || pathname.startsWith(c.href + '/')
            )
        );
        return match ? [match.id] : ['diagnostic'];
    };

    const [openGroups, setOpenGroups] = useState(getDefaultOpen);

    const toggleGroup = (id) =>
        setOpenGroups((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );

    const isActive = (href) =>
        pathname === href || pathname.startsWith(href + '/');

    return (
        <aside
            style={{
                width: isOpen ? '240px' : '0px',
                minWidth: isOpen ? '240px' : '0px',
                background: '#1a237e',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.28s ease, min-width 0.28s ease',
                overflow: 'hidden',
                flexShrink: 0,
                height: '100%',
            }}
        >
``
            {/* ═══ LOGO ═══════════════════════════════════════════════ */}
            <div
                style={{
                    padding: '18px 16px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.12)',
                    textAlign: 'center',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                }}
            >
                <div style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.5px' }}>
                    <span style={{ color: '#ffffff' }}>Think</span>
                    <span style={{ color: '#90caf9', fontWeight: 400 }}>LAB</span>
                </div>
                <div
                    style={{
                        display: 'inline-block',
                        marginTop: '6px',
                        background: 'rgba(255,255,255,0.13)',
                        borderRadius: '3px',
                        padding: '2px 10px',
                        fontSize: '10px',
                        letterSpacing: '0.7px',
                        color: '#c5cae9',
                    }}
                >
                    Enterprise Cloud LIS
                </div>
            </div>

            {/* ═══ NAV ════════════════════════════════════════════════ */}
            <nav
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '6px 0',
                    // Custom scrollbar
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(255,255,255,0.2) transparent',
                }}
            >
                {NAV.map((group) => {
                    const groupOpen = openGroups.includes(group.id);

                    return (
                        <div key={group.id}>

                            {/* ── Group header button ── */}
                            <button
                                onClick={() => toggleGroup(group.id)}
                                suppressHydrationWarning
                                style={{
                                    width: '100%',
                                    background: groupOpen ? 'rgba(255,255,255,0.07)' : 'none',
                                    border: 'none',
                                    color: '#e3e8ff',
                                    padding: '10px 16px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '13.5px',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'background 0.15s',
                                    gap: '8px',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={(e) => {
                                    if (!groupOpen)
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!groupOpen) e.currentTarget.style.background = 'none';
                                }}
                            >
                                {/* Icon + Label */}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '9px', overflow: 'hidden' }}>
                                    <span style={{ opacity: 0.85, display: 'flex', flexShrink: 0 }}>
                                        {group.icon}
                                    </span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {group.label}
                                    </span>
                                </span>

                                {/* Chevron */}
                                <svg
                                    width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
                                    style={{
                                        opacity: 0.5,
                                        flexShrink: 0,
                                        transform: groupOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s ease',
                                    }}
                                >
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            </button>

                            {/* ── Child links ── */}
                            {groupOpen && (
                                <div>
                                    {group.children.map((child, index) => {
                                        const active = isActive(child.href);
                                        return (
                                            <Link
                                                key={`${child.href}-${index}`}
                                                href={child.href}
                                                style={{
                                                    display: 'block',
                                                    padding: '8px 16px 8px 36px',
                                                    fontSize: '13px',
                                                    whiteSpace: 'nowrap',
                                                    textDecoration: 'none',
                                                    transition: 'background 0.12s, color 0.12s',
                                                    // Active = white text + blue left bar + subtle bg
                                                    background: active ? 'rgba(255,255,255,0.12)' : 'none',
                                                    color: active ? '#ffffff' : '#b0bec5',
                                                    fontWeight: active ? 600 : 400,
                                                    borderLeft: active ? '3px solid #90caf9' : '3px solid transparent',
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!active) {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                                        e.currentTarget.style.color = '#e0e0ff';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!active) {
                                                        e.currentTarget.style.background = 'none';
                                                        e.currentTarget.style.color = '#b0bec5';
                                                    }
                                                }}
                                            >
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

            {/* ═══ FOOTER BUTTONS ══════════════════════════════════════ */}
            <div
                style={{
                    padding: '12px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    flexShrink: 0,
                }}
            >
                <button
                    suppressHydrationWarning
                    style={{
                        width: '100%', background: '#ffffff', color: '#1a237e',
                        border: 'none', borderRadius: '5px', padding: '9px',
                        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    Support
                </button>
                <button
                    suppressHydrationWarning
                    style={{
                        width: '100%', background: '#3949ab', color: '#ffffff',
                        border: 'none', borderRadius: '5px', padding: '9px',
                        fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}
                >
                    Account Info
                </button>
            </div>

        </aside>
    );
}
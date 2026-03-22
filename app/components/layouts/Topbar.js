'use client';

// app/components/layouts/Topbar.js
// ─────────────────────────────────────────────────────────────────────────────
// Props:
//   onToggleSidebar  {function}  — called when hamburger is clicked
//                                  passed in from app/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────

export default function Topbar({ onToggleSidebar }) {
    return (
        <header
            style={{
                height: '56px',
                background: '#ffffff',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: '14px',
                flexShrink: 0,
                zIndex: 200,
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
        >
            {/* ── Hamburger (toggles sidebar) ── */}
            <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                style={{
                    background: '#1a237e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '5px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'opacity 0.15s',
                    fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
                {/* Hamburger icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
            </button>

            {/* ── Page context label ── */}
            <span
                style={{
                    fontWeight: 600,
                    fontSize: '15px',
                    color: '#333333',
                    whiteSpace: 'nowrap',
                }}
            >
                Customer Support &amp; Quality Assurance
            </span>

            {/* ── Right side ── */}
            <div
                style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                }}
            >
                {/* Support call info */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
                        Support Call: 08062179988
                    </div>
                    <div style={{ fontSize: '11px', color: '#888888', whiteSpace: 'nowrap' }}>
                        Monday to Saturday 10 AM ~ 7 PM
                    </div>
                </div>

                {/* Grid icon */}
                <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', padding: 0 }}
                    aria-label="Apps"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z" />
                    </svg>
                </button>

                {/* Bell */}
                <button
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', padding: 0 }}
                    aria-label="Notifications"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                    </svg>
                </button>

                {/* User */}
                <button
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        fontSize: '14px', fontWeight: 500, color: '#333', padding: 0,
                        fontFamily: 'inherit',
                    }}
                >
                    Administrator
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
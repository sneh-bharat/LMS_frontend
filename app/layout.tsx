'use client';

// app/layout.tsx
// ─────────────────────────────────────────────────────────────────────────────
// This is the ROOT layout for your lab-management-system.
// It wraps EVERY page automatically — you never need to import
// Sidebar or Topbar in individual page files.
//
// File lives at:  app/layout.tsx
// Sidebar lives at: app/components/layouts/Sidebar.js
// Topbar lives at:  app/components/layouts/Topbar.js
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import './globals.css';

// Your components — paths relative to app/layout.tsx
import Sidebar from './components/layouts/Sidebar';
import Topbar from './components/layouts/Topbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          background: '#eceff1',
        }}
      >
        {/*
          ┌─────────────────────────────────────────────────────┐
          │  Full-screen app shell                              │
          │  ┌──────────┐ ┌───────────────────────────────┐    │
          │  │          │ │  TOPBAR (56px)                │    │
          │  │          │ ├───────────────────────────────┤    │
          │  │ SIDEBAR  │ │                               │    │
          │  │ (240px)  │ │  PAGE CONTENT                 │    │
          │  │          │ │  (scrollable)                 │    │
          │  └──────────┘ └───────────────────────────────┘    │
          └─────────────────────────────────────────────────────┘
        */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* ── Top bar (passes toggle handler down) ── */}
          <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />

          {/* ── Sidebar + page content ── */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar isOpen={sidebarOpen} />

            {/* Page content */}
            <main
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                background: '#eceff1',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
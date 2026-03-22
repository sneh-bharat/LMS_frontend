'use client';

import { useState } from 'react';
import './globals.css';

// Your components — paths relative to app/layout.tsx
import Sidebar from './components/layouts/Sidebar';
import Topbar from './components/layouts/Topbar';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="m-0 p-0 font-sans bg-[#eceff1] text-[#212121]">
        <div className="flex flex-col h-screen overflow-hidden">
          {/* ── Top bar (passes toggle handler down) ── */}
          <Topbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />

          {/* ── Sidebar + page content ── */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-4 bg-[#eceff1]">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

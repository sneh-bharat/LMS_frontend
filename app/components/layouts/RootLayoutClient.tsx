'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { usePathname } from 'next/navigation';
import RoleGuard from '../RoleGuard';

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(true);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  if (isLoginPage) {
    return (
      <main className="min-h-screen bg-[#eceff1]">
        {children}
      </main>
    );
  }

  return (
    <RoleGuard>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* ── Top bar (passes toggle handler down) ── */}
        <Topbar onToggleSidebar={handleToggleSidebar} />

        {/* ── Sidebar + page content ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar (hidden on mobile) */}
          <div className="hidden md:flex">
            <Sidebar isOpen={sidebarOpen} onExtendSidebar={() => setSidebarOpen(true)} />
          </div>

          {/* Mobile Sidebar (Drawer) */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-full bg-gradient-to-b from-[#0C7372] via-[#0C7372] to-[#3A6172] border-none">
              <div className="h-full flex flex-col ">
                <Sidebar isOpen={true} onExtendSidebar={() => { }} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 bg-[#eceff1]">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}

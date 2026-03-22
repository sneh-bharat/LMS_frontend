'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileMenuOpen(true);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar (passes toggle handler down) ── */}
      <Topbar onToggleSidebar={handleToggleSidebar} />

      {/* ── Sidebar + page content ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex">
            <Sidebar isOpen={sidebarOpen} />
        </div>

        {/* Mobile Sidebar (Drawer) */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-slate-900 border-none">
            <div className="h-full flex flex-col bg-slate-900">
               <Sidebar isOpen={true} />
            </div>
          </SheetContent>
        </Sheet>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 bg-[#eceff1]">
          {children}
        </main>
      </div>
    </div>
  );
}

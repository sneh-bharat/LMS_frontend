'use client';

import { useState } from 'react';
import Sidebar from '@/components/layouts/Sidebar';
import Topbar from '@/components/layouts/Topbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import RoleGuard from '@/components/guards/RoleGuard';
import Providers from '@/components/Providers';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    <Providers>
      <RoleGuard>
        <div className="flex flex-col h-screen overflow-hidden">
          <Topbar onToggleSidebar={handleToggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:flex">
              <Sidebar isOpen={sidebarOpen} onExtendSidebar={() => setSidebarOpen(true)} />
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent side="left" className="p-0 w-full bg-gradient-to-b from-[#0C7372] via-[#0C7372] to-[#3A6172] border-none">
                <div className="h-full flex flex-col">
                  <Sidebar isOpen={true} onExtendSidebar={() => {}} />
                </div>
              </SheetContent>
            </Sheet>
            <main className="flex-1 overflow-y-auto py-4 px-8 bg-[#eceff1]">
              {children}
            </main>
          </div>
        </div>
      </RoleGuard>
    </Providers>
  );
}

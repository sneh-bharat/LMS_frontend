'use client';

import { useState } from 'react';
import DoctorSidebar from '@/components/layouts/DoctorSidebar';
import DoctorTopbar from '@/components/layouts/DoctorTopbar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import DoctorGuard from '@/components/guards/DoctorGuard';
import Providers from '@/components/Providers';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
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
      <DoctorGuard>
        <div className="flex flex-col h-screen overflow-hidden">
          <DoctorTopbar onToggleSidebar={handleToggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:flex">
              <DoctorSidebar isOpen={sidebarOpen} onExtendSidebar={() => setSidebarOpen(true)} />
            </div>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent side="left" className="p-0 w-full bg-gradient-to-b from-[#0C7372] via-[#0C7372] to-[#3A6172] border-none">
                <div className="h-full flex flex-col">
                  <DoctorSidebar isOpen={true} onExtendSidebar={() => {}} />
                </div>
              </SheetContent>
            </Sheet>
            <main className="flex-1 overflow-y-auto p-4 bg-[#eceff1]">
              {children}
            </main>
          </div>
        </div>
      </DoctorGuard>
    </Providers>
  );
}

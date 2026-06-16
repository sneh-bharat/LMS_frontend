'use client';

import * as React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import SnehBharatEmr_Info from './SnehBharatEmr_Info';

/** Two-pane auth shell (branding + logo + footer) shared by the login screens. */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white xl:grid xl:grid-cols-2">
      <SnehBharatEmr_Info />

      <div className="flex min-h-screen items-center justify-center bg-light-teal/20 p-4 sm:p-8 xl:p-12">
        <div className="w-full max-w-[440px] space-y-10">
          <div className="mb-16 flex w-full items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="SnehBharat Logo"
              width={280}
              height={90}
              className="object-contain"
              priority
            />
          </div>

          {children}

          <div className="flex flex-col items-center space-y-6 pt-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <ShieldCheck size={14} className="text-[#00ac80]" />
              Protected by Enterprise-grade Security
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;

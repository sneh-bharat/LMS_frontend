import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Metadata } from 'next';
import RootLayoutClient from './components/layouts/RootLayoutClient';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Snehbharat | Integrated Systems Lab Management',
  description: 'Enterprise-grade laboratory and diagnostic management system for seamless clinical workflows and quality control.',
  keywords: ['diagnostic', 'lab management', 'wellnesshive', 'clinical workflow', 'healthcare systems'],
  icons: {
    icon: '/images/snehbharat-favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className="m-0 p-0 font-sans" suppressHydrationWarning>
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  );
}
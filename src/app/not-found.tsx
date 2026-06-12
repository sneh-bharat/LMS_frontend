import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#eceff1] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
          <FileQuestion className="text-slate-400" size={32} />
        </div>

        <div className="space-y-2">
          <p className="text-6xl font-black text-slate-100 leading-none">404</p>
          <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-sm text-slate-500">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#00ac80] text-white text-sm font-semibold hover:bg-[#006d77] transition-colors"
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
          <Link
            href="javascript:history.back()"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}

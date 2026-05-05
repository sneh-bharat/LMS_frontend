'use client';

import { FlaskConical, Plus, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui';

interface PathologyHeaderProps {
  onAddParameter: () => void;
}

export default function PathologyHeader({ onAddParameter }: PathologyHeaderProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
        {/* Title */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
              <FlaskConical size={24} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Parameters
              </h1>
              <p className="text-sm text-slate-500 font-medium">Laboratory test definitions</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Manage and configure laboratory parameters, reference ranges, and analytical methods.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button variant="outline" className="gap-2 h-11 px-5">
            <Settings2 size={16} />
            Configure
          </Button>
          <Button 
            variant="gradient" 
            className="gap-2 h-11 px-6 shadow-xl shadow-emerald-500/20"
            onClick={onAddParameter}
          >
            <Plus size={18} />
            Add Parameter
          </Button>
        </div>
      </div>
    </div>
  );
}

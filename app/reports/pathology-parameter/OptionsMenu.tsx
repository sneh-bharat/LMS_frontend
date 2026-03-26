'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Button,
} from '@/components/ui';
import {
  Activity,
  FileText,
  Settings,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RangeRow {
  id: number; gender: string; ageType: string;
  minAge: string; maxAge: string; minRange: string; maxRange: string;
  refRange: string;
}

interface PathologyParam {
  id: number; sn: number; name: string; unit: string;
  inputType: string; priority: number;
  linked: number; isHeader: boolean;
  ranges: RangeRow[]; defaultValue: string;
  parameters: any[];
}

export function OptionsMenu({ param, onRange, onDefault, onOptions, onDelete }: {
  param: PathologyParam;
  onRange: () => void; onDefault: () => void; onOptions: () => void; onDelete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const items = [
    {
      label: 'Range',
      icon: <Activity size={14} />,
      action: onRange,
      show: param.inputType === 'txt' || param.inputType === '%',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Default',
      icon: <FileText size={14} />,
      action: onDefault,
      show: true,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Options',
      icon: <Settings size={14} />,
      action: onOptions,
      show: param.inputType === 'op',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Delete',
      icon: <Trash2 size={14} />,
      action: onDelete,
      show: true,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50'
    },
  ].filter(i => i.show);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 gap-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all px-3",
          isOpen
            ? "bg-slate-100 text-slate-900 border-slate-300"
            : "bg-slate-50 text-slate-500 border border-slate-200/60 hover:bg-slate-100"
        )}
      >
        Options
        <ChevronDown size={14} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-2xl border border-slate-100 p-2 z-[100] animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="px-3 py-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Parameter Actions</p>
          </div>
          <div className="h-px bg-slate-100 mx-1 mb-1" />
          {items.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              onClick={() => {
                item.action();
                setIsOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all group",
                item.label === 'Delete' ? "hover:bg-rose-50" : "hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                item.bgColor, item.color,
                "group-hover:scale-110"
              )}>
                {item.icon}
              </div>
              <span className={cn(
                "text-sm font-bold transition-colors",
                item.label === 'Delete' ? "text-rose-600" : "text-slate-700 group-hover:text-slate-900"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

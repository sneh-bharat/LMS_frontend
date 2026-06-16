'use client';

import { useState } from 'react';
import { Edit2, MoreHorizontal, Trash2 } from 'lucide-react';

export interface ConcessionActionMenuProps {
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ConcessionActionMenu({ onEdit, onDelete }: ConcessionActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-100 bg-white py-2 shadow-lg">
          <button
            onClick={() => {
              onEdit?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-600 hover:bg-slate-50"
          >
            <Edit2 size={14} /> Edit
          </button>
          <div className="my-1 h-px bg-slate-100" />
          <button
            onClick={() => {
              onDelete?.();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold uppercase text-rose-600 hover:bg-rose-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default ConcessionActionMenu;

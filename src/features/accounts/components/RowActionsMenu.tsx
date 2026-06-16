'use client';

import { useState } from 'react';
import { Edit2, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

export interface RowActionsMenuProps {
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
}

/** Compact row "kebab" menu with edit / view / delete actions. */
export function RowActionsMenu({ onEdit, onView, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const run = (fn?: () => void) => () => {
    fn?.();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-slate-100 bg-white py-2 shadow-lg">
          {onEdit && (
            <button
              type="button"
              onClick={run(onEdit)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}
          {onView && (
            <button
              type="button"
              onClick={run(onView)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Eye size={14} /> View
            </button>
          )}
          {onDelete && (
            <>
              <div className="my-1 h-px bg-slate-100" />
              <button
                type="button"
                onClick={run(onDelete)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-bold uppercase text-rose-600 transition-colors hover:bg-rose-50"
              >
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default RowActionsMenu;

import * as React from "react"
import { cn } from "@/lib/utils"

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

interface TableProps {
  columns?: Column[];
  data?: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  className?: string;
  rowClassName?: (row: any, index: number) => string;
  children?: React.ReactNode;
}

export default function Table({
  columns = [],
  data = [],
  loading = false,
  onRowClick,
  className,
  rowClassName,
  children
}: TableProps) {
  if (children) {
    return (
      <div className={cn("w-full overflow-auto rounded-[2rem] border border-slate-200 bg-white/50 backdrop-blur-md", className)}>
        <table className="w-full text-sm">
          {children}
        </table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Gathering Data...</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white/50 backdrop-blur-md shadow-sm", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest",
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  )}
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-0.5">No records found</h4>
                      <p className="text-xs font-semibold text-slate-500 tracking-tight">Try adjusting your search or filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-emerald-50/30 transition-all group",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row, idx)
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-8 py-5 text-slate-700 font-bold transition-colors group-hover:text-emerald-700",
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      )}
                    >
                      {col.render
                        ? col.render(row[col.key], row, idx)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

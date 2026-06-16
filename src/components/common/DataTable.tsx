'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Generic, fully-typed data table.
 *
 * Replaces the per-page `columns`/`<Table>` scaffolding the audit found copy-pasted
 * across list pages. Columns are typed against the row type `T`, so `render`
 * callbacks receive correctly-typed values instead of `any`.
 */
export interface DataTableColumn<T> {
  /** Stable key for the column. */
  key: string;
  /** Header label. */
  label: string;
  /** Accessor for the cell value; defaults to `row[key]` when `key` is a field of T. */
  accessor?: (row: T) => React.ReactNode;
  /** Custom cell renderer. Receives the row and its index. */
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  /** Stable key extractor — strongly preferred over array index. */
  rowKey?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T, index: number) => string | undefined;
  emptyMessage?: string;
  className?: string;
}

function alignClass(align?: 'left' | 'center' | 'right'): string {
  return align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  rowKey,
  onRowClick,
  rowClassName,
  emptyMessage = 'No records found',
  className,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Gathering Data…</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/50 shadow-sm backdrop-blur-md',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400',
                    alignClass(col.align),
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{emptyMessage}</h4>
                    <p className="text-xs font-semibold text-slate-500">
                      Try adjusting your search or filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey ? rowKey(row, idx) : idx}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'group transition-all hover:bg-emerald-50/30',
                    onRowClick && 'cursor-pointer',
                    rowClassName?.(row, idx),
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-6 py-4 font-bold text-slate-700 transition-colors group-hover:text-emerald-700',
                        alignClass(col.align),
                      )}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : col.accessor
                          ? col.accessor(row)
                          : (row as Record<string, React.ReactNode>)[col.key]}
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

export default DataTable;

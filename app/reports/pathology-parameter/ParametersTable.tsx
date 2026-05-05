'use client';

import { useState } from 'react';
import { Mars, Venus, Zap } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ReferenceRange, PathologyParam } from '../pathology-parameter/types';

interface ParametersTableProps {
  params: PathologyParam[];
  onDelete: (id: number) => void;
  onViewDetails: (param: PathologyParam) => void;
}

export default function ParametersTable({ params, onDelete, onViewDetails }: ParametersTableProps) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const columns = [
  {
    key: 'id',
    label: '#',
    width: '60px',
    align: 'center' as const,
    render: (_: number, row: PathologyParam) => (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm font-bold text-slate-700">{row.id}</span>
      </div>
    )
  },
  {
    key: 'parameterName',
    label: 'Parameter Name',
    render: (_: string, row: PathologyParam) => (
      <div className="py-3 space-y-2">
        <div className="text-sm font-bold text-slate-900 leading-tight">
          {row.parameterName}
        </div>
        {row.referenceRanges && row.referenceRanges.length > 0 && (
          <div className="mt-2 space-y-1">
            {row.referenceRanges.map((range: ReferenceRange, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-3 py-2 bg-amber-50/60 border border-amber-100 rounded-md"
              >
                {range.gender === 'MALE' ? (
                  <Mars size={16} className="text-blue-600" />
                ) : range.gender === 'FEMALE' ? (
                  <Venus size={16} className="text-pink-600" />
                ) : null}
                <span className="text-xs text-slate-700 font-semibold">
                  Age {range.ageMin}-{range.ageMax}: {range.minValue}-{range.maxValue} {range.unit}
                </span>
              </div>
            ))}
          </div>
        )}
        {row.isCalculated && (
          <Badge variant="secondary" className="mt-2 text-xs">
            Calculated
          </Badge>
        )}
      </div>
    )
  },
  {
    key: 'unit',
    label: 'Unit',
    width: '80px',
    align: 'center' as const,
    render: (val: string) => (
      <span className="text-sm text-slate-700 font-semibold">
        {val || '—'}
      </span>
    )
  },
  {
    key: 'resultType',
    label: 'Type',
    width: '100px',
    align: 'center' as const,
    render: (val: string) => (
      <Badge variant={val === 'NUMERIC' ? 'default' : val === 'OPTION' ? 'secondary' : 'outline'} className="text-xs">
        {val}
      </Badge>
    )
  },
  {
    key: 'criticalLow',
    label: 'Critical Range',
    width: '120px',
    align: 'center' as const,
    render: (_: number, row: PathologyParam) => (
      <span className="text-xs text-slate-700 font-semibold">
        {row.criticalLow} - {row.criticalHigh}
      </span>
    )
  },
  {
    key: 'actions',
    label: 'Action',
    width: '120px',
    align: 'center' as const,
    render: (_: any, row: PathologyParam) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8"
          onClick={() => onViewDetails(row)}
        >
          Edit
        </Button>
      </div>
    )
  }
  ];

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {params.map((row) => (
              <tr
                key={row.id}
                onMouseEnter={() => setHoveredRow(row.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className={`border-b border-slate-100 transition-all duration-200 hover:bg-slate-50/70 ${
                  hoveredRow === row.id ? 'bg-emerald-50/30' : ''
                }`}
              >
                {columns.map(col => (
                  <td
                    key={`${row.id}-${col.key}`}
                    className="px-4 py-3 text-sm"
                    style={{ width: col.width, textAlign: col.align }}
                  >
                    {col.render(row[col.key as keyof PathologyParam] as never, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {params.length === 0 && (
        <div className="py-16 px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Zap size={24} className="text-slate-400" />
          </div>
          <p className="text-slate-600 font-semibold mb-1">No parameters found</p>
          <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
        </div>
      )}
    </Card>
  );
}

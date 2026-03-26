'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Info,
  Clock,
} from 'lucide-react';
import {
  Button,
  Input,
  Label,
  Card,
  Badge,
  Table
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RangeRow {
  id: number; gender: string; ageType: string;
  minAge: string; maxAge: string; minRange: string; maxRange: string;
  refRange: string;
}

interface Parameter {
  id: number; name: string; nabl: string; specimenType: string;
  method: string; unit: string; type: string; priority: string;
  isRequired: string; validation: string; left: string;
  bottom: string; top: string; interface1: string;
  interface2: string; calc: string; paramCode: string;
}

interface PathologyParam {
  id: number; sn: number; name: string; unit: string;
  inputType: string; priority: number;
  linked: number; isHeader: boolean;
  ranges: RangeRow[]; defaultValue: string;
  parameters: Parameter[];
}

const BLANK_RANGE: Omit<RangeRow, 'id'> = {
  gender: 'Male', ageType: 'Days', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: '',
};

export function ReferenceRangeForm({
  param,
  onAddRange,
  onDeleteRange,
  onBack
}: {
  param: PathologyParam;
  onAddRange: (range: RangeRow) => void;
  onDeleteRange: (id: number) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK_RANGE });

  const handleAdd = () => {
    onAddRange({ id: Date.now(), ...form });
    setForm({ ...BLANK_RANGE });
  };

  const columns = [
    {
      key: 'sn',
      label: '#',
      width: '60px',
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <span className="font-black text-slate-400 text-xs">{index + 1}</span>
      )
    },
    {
      key: 'gender',
      label: 'Gender',
      render: (val: string) => (
        <Badge variant="secondary" className="font-black uppercase text-[10px] tracking-widest px-2 py-1">
          {val}
        </Badge>
      )
    },
    {
      key: 'ageGroup',
      label: 'Age Group',
      render: (_: any, row: RangeRow) => (
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Clock size={14} className="text-slate-400" />
          {row.minAge} {row.ageType} <span className="text-slate-300 mx-1">→</span> {row.maxAge} {row.ageType === 'Days' ? 'Years' : row.ageType}
        </div>
      )
    },
    {
      key: 'refRange',
      label: 'Ref Range',
      render: (val: string, row: RangeRow) => (
        <div className="font-black text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg inline-block border border-slate-100">
          {val || `${row.minRange} – ${row.maxRange}`}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      width: '100px',
      align: 'right' as const,
      render: (_: any, row: RangeRow) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDeleteRange(row.id)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-xl"
        >
          <Trash2 size={16} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack} className="rounded-2xl border-slate-200">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {param.name}
              <Badge variant="secondary" className="font-black">REFERENCE RANGE</Badge>
            </h2>
            <p className="text-slate-500 font-medium">Configure biological reference intervals for this parameter.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Existing Ranges */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="rounded-[2.5rem] border border-white/40 shadow-xl overflow-hidden glass">
            <Table
              columns={columns}
              data={param.ranges}
            />
          </Card>
        </div>

        {/* Add Range Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-8 rounded-[2.5rem] border border-white/40 shadow-xl glass sticky top-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                <Plus size={20} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Add New Range</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v ?? '' })}>
                    <SelectTrigger className="rounded-xl font-bold h-11 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Age Type</Label>
                  <Select value={form.ageType} onValueChange={(v) => setForm({ ...form, ageType: v ?? '' })}>
                    <SelectTrigger className="rounded-xl font-bold h-11 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Days">Days</SelectItem>
                      <SelectItem value="Month">Month</SelectItem>
                      <SelectItem value="Year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Age</Label>
                  <Input
                    value={form.minAge}
                    onChange={e => setForm({ ...form, minAge: e.target.value })}
                    className="rounded-xl h-11 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Age</Label>
                  <Input
                    value={form.maxAge}
                    onChange={e => setForm({ ...form, maxAge: e.target.value })}
                    className="rounded-xl h-11 border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Range</Label>
                  <Input
                    value={form.minRange}
                    onChange={e => setForm({ ...form, minRange: e.target.value })}
                    className="rounded-xl h-11 border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Max Range</Label>
                  <Input
                    value={form.maxRange}
                    onChange={e => setForm({ ...form, maxRange: e.target.value })}
                    className="rounded-xl h-11 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Range Override</Label>
                <textarea
                  value={form.refRange}
                  onChange={e => setForm({ ...form, refRange: e.target.value })}
                  rows={3}
                  placeholder="Enter descriptive range text (optional)"
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all font-medium"
                />
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1">
                  <Info size={12} /> Use | for line breaks
                </div>
              </div>

              <Button
                onClick={handleAdd}
                className="w-full h-12 rounded-2xl shadow-lg shadow-green-500/20"
                variant="gradient"
              >
                Confirm Range
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

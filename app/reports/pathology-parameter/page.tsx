'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  TestTube,
  ChevronRight,
  Settings2,
  Trash2,
  Database,
  Beaker
} from 'lucide-react';
import { ReferenceRangeForm } from './ReferenceRangeForm';
import { DefaultValueEditor } from './DefaultValueEditor';
import { ParameterModal } from './ParameterModal';
import { AddParameterModal } from './AddParameterModal';
import { OptionsMenu } from './OptionsMenu';
import {
  Button,
  Input,
  Badge,
  Card,
  Table
} from '@/components/ui';

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Sample Data ──────────────────────────────────────────────────────────────
const SAMPLE: PathologyParam[] = [
  {
    id: 1, sn: 1, name: 'Creatine Phosphokinase-MM', unit: 'u/l', inputType: 'txt',
    priority: 1, linked: 2, isHeader: false, defaultValue: '',
    ranges: [
      { id: 1, gender: 'Male', ageType: 'Days', minAge: '1', maxAge: '120', minRange: '39', maxRange: '308', refRange: '' },
      { id: 2, gender: 'Female', ageType: 'Days', minAge: '1', maxAge: '120', minRange: '26', maxRange: '192', refRange: '' },
    ],
    parameters: [],
  },
  {
    id: 2, sn: 2, name: 'Hepatitis A virus IgG', unit: '', inputType: 'op',
    priority: 1, linked: 1, isHeader: false, defaultValue: '',
    ranges: [
      { id: 1, gender: 'Both', ageType: 'Year', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: 'Non Reactive\nReactive' },
    ],
    parameters: [],
  },
  {
    id: 3, sn: 3, name: 'Hepatitis A virus IgM', unit: '', inputType: 'op',
    priority: 1, linked: 2, isHeader: false, defaultValue: '',
    ranges: [
      { id: 1, gender: 'Both', ageType: 'Year', minAge: '', maxAge: '', minRange: '', maxRange: '', refRange: 'Non Reactive\nReactive' },
    ],
    parameters: [],
  },
  {
    id: 4, sn: 4, name: 'Maternal Screening - Quadruple Marker', unit: '', inputType: 'textarea',
    priority: 1, linked: 1, isHeader: false, defaultValue: '',
    ranges: [], parameters: [],
  },
  {
    id: 5, sn: 5, name: 'Haemoglobin A', unit: '%', inputType: 'txt',
    priority: 1, linked: 0, isHeader: false, defaultValue: '',
    ranges: [], parameters: [],
  },
];

type View = 'list' | 'range' | 'default';

export default function PathologyParameterPage() {
  const [params, setParams] = useState<PathologyParam[]>(SAMPLE);
  const [view, setView] = useState<View>('list');
  const [activeParam, setActive] = useState<PathologyParam | null>(null);
  const [search, setSearch] = useState('');
  const [paramModal, setParamModal] = useState(false);
  const [addRowModal, setAddRowModal] = useState(false);
  const [optionsTarget, setOptionsTarget] = useState<PathologyParam | null>(null);

  const filtered = params.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const deleteParam = (id: number) => setParams(prev => prev.filter(p => p.id !== id));

  const addParam = (data: Omit<PathologyParam, 'id' | 'ranges' | 'parameters' | 'defaultValue'>) => {
    setParams(prev => [...prev, { id: Date.now(), ...data, ranges: [], parameters: [], defaultValue: '' }]);
  };

  const addRange = (range: RangeRow) => {
    if (activeParam) {
      const updated = { ...activeParam, ranges: [...activeParam.ranges, range] };
      setParams(prev => prev.map(p => p.id === activeParam.id ? updated : p));
      setActive(updated);
    }
  };

  const deleteRange = (id: number) => {
    if (activeParam) {
      const updated = { ...activeParam, ranges: activeParam.ranges.filter(r => r.id !== id) };
      setParams(prev => prev.map(p => p.id === activeParam.id ? updated : p));
      setActive(updated);
    }
  };

  const saveDefaultValue = (value: string) => {
    if (activeParam) {
      const updated = { ...activeParam, defaultValue: value };
      setParams(prev => prev.map(p => p.id === activeParam.id ? updated : p));
      setActive(updated);
    }
    setView('list');
  };

  const columns = [
    {
      key: 'sn',
      label: 'SN',
      width: '60px',
      align: 'center' as const,
      render: (val: number, row: PathologyParam) => (
        <span className="font-black text-slate-400 text-xs"># {row.sn > SAMPLE.length ? val : row.sn}</span>
      )
    },
    {
      key: 'name',
      label: 'Parameter Name',
      render: (val: string, row: PathologyParam) => (
        <div className="py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-black tracking-tight ${row.isHeader ? 'text-lg text-slate-900' : 'text-slate-700'}`}>
              {row.linked > 0 ? <span className="text-emerald-500 mr-2">»</span> : ''}
              {val}
            </span>
            {row.isHeader && <Badge variant="secondary" className="text-[9px] uppercase">Section Header</Badge>}
          </div>
          {!row.isHeader && row.linked > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              <Database size={10} /> {row.linked} Investigations Linked
            </div>
          )}
          {/* Range pills */}
          <div className="flex flex-wrap gap-2 mt-2">
            {row.ranges.map(r => (
              <Badge key={r.id} variant="outline" className="bg-amber-50/50 border-amber-100 text-amber-800 text-[10px] py-1 px-2 flex items-center gap-2">
                <span className="opacity-70">{r.gender === 'Male' ? 'M' : r.gender === 'Female' ? 'F' : 'B'}</span>
                <span className="font-black underline decoration-amber-200 underline-offset-2">
                  {r.minAge} Days ~ {r.maxAge} Years
                </span>
                <span className="font-bold bg-amber-100/50 px-1.5 rounded">{r.minRange} ~ {r.maxRange}</span>
              </Badge>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'unit',
      label: 'Unit',
      width: '100px',
      render: (val: string) => <span className="font-bold text-slate-500 italic">{val || '-'}</span>
    },
    {
      key: 'inputType',
      label: 'Type',
      width: '120px',
      render: (val: string) => (
        <Badge variant="secondary" className="font-black uppercase text-[10px] tracking-widest px-2 py-1">
          {val}
        </Badge>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '80px',
      align: 'center' as const,
      render: (val: number) => <span className="font-black text-slate-900">{val}</span>
    },
    {
      key: 'actions',
      label: 'Action',
      width: '240px',
      align: 'right' as const,
      render: (_: any, row: PathologyParam) => (
        <div className="flex items-center justify-end gap-2">
          {(row.inputType === 'txt' || row.inputType === '%') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setActive(row); setView('range'); }}
              className="h-8 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
            >
              Range
            </Button>
          )}
          {row.inputType === 'textarea' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => { setActive(row); setView('default'); }}
              className="h-8 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
            >
              Default
            </Button>
          )}
          <OptionsMenu
            param={row}
            onRange={() => { setActive(row); setView('range'); }}
            onDefault={() => { setActive(row); setView('default'); }}
            onOptions={() => { setOptionsTarget(row); setParamModal(true); }}
            onDelete={() => deleteParam(row.id)}
          />
        </div>
      )
    }
  ];

  if (view === 'range' && activeParam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <ReferenceRangeForm
          param={activeParam}
          onAddRange={addRange}
          onDeleteRange={deleteRange}
          onBack={() => setView('list')}
        />
      </div>
    );
  }

  if (view === 'default' && activeParam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <DefaultValueEditor
          param={activeParam}
          onSave={saveDefaultValue}
          onBack={() => setView('list')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <ParameterModal
        isOpen={paramModal}
        onClose={() => setParamModal(false)}
        onSave={p => { if (optionsTarget) setParams(prev => prev.map(param => param.id === optionsTarget.id ? { ...param, parameters: [...param.parameters, p] } : param)); }}
      />
      <AddParameterModal
        isOpen={addRowModal}
        onClose={() => setAddRowModal(false)}
        onSave={addParam}
      />

      {/* ═══ HEADER ═════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Pathology <span className="text-gradient">Parameters</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-xl">
            Define and manage laboratory parameters, reference ranges, and analytical methods.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-2xl h-12 shadow-sm">
            <Settings2 size={18} />
            Configure
          </Button>
          <Button
            variant="gradient"
            className="gap-2 shadow-xl shadow-green-500/20 px-6 h-12"
            onClick={() => setAddRowModal(true)}
          >
            <Plus size={18} />
            Add Parameter
          </Button>
        </div>
      </div>

      {/* ═══ CONTROL BAR ════════════════════════════════════════ */}
      <Card className="p-4 rounded-[2.5rem] border border-white/40 shadow-xl flex flex-col md:flex-row items-center gap-4 glass bg-white/20">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors z-10" size={20} />
          <Input
            type="text"
            placeholder="Search by parameter name or method..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-12 h-12 rounded-2xl bg-white/50 border-slate-200/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gradient" className="px-4 py-2 text-[10px] shadow-sm">All (5)</Badge>
          <Badge variant="secondary" className="px-4 py-2 text-[10px] hover:bg-slate-200 transition-colors cursor-pointer">Biochemistry</Badge>
        </div>
      </Card>

      {/* ═══ TABLE CONTENT ═══════════════════════════════════════ */}
      <div className="glass rounded-[3rem] overflow-hidden border border-white/40 shadow-2xl transition-all">
        <Table
          columns={columns}
          data={filtered}
          rowClassName={(row) => row.isHeader ? "bg-slate-50/80" : ""}
        />
      </div>
    </div>
  );
}

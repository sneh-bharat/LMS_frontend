'use client';

import { useState } from 'react';
import {
  Button,
  Input,
  Label,
  RightDrawer,
} from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Beaker, ShieldCheck, Microscope, Layers, Activity, Code2 } from 'lucide-react';

interface Parameter {
  id: number; name: string; nabl: string; specimenType: string;
  method: string; unit: string; type: string; priority: string;
  isRequired: string; validation: string; left: string;
  bottom: string; top: string; interface1: string;
  interface2: string; calc: string; paramCode: string;
}

const BLANK_PARAM: Omit<Parameter, 'id'> = {
  name: '', nabl: 'NA', specimenType: 'N/A', method: '', unit: '',
  type: 'Input Box', priority: '', isRequired: 'N/A',
  validation: 'Alphanumeric', left: '0', bottom: '0', top: '0',
  interface1: 'Instrument 1', interface2: 'Instrument 2', calc: 'No', paramCode: '',
};

export function ParameterModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void; onSave: (p: Parameter) => void;
}) {
  const [form, setForm] = useState({ ...BLANK_PARAM });

  const handleSubmit = () => {
    onSave({ id: Date.now(), ...form });
    setForm({ ...BLANK_PARAM });
    onClose();
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Parameter Details"
      description="Manage clinical methodology, specimen requirements, and analytical interfaces for this parameter."
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-green-500/20" onClick={handleSubmit}>
            Update Configuration
          </Button>
        </div>
      }
    >
      <div className="space-y-8 pb-8">
        {/* Basic Identification */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 mb-2">
            <Beaker className="text-emerald-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Identification</h4>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 space-y-2">
              <Label htmlFor="param-name">Parameter Name</Label>
              <Input
                id="param-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Glucose Fasting"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <div className="col-span-4 space-y-2">
              <Label htmlFor="nabl">NABL</Label>
              <Select value={form.nabl} onValueChange={(v) => setForm({ ...form, nabl: v ?? '' })}>
                <SelectTrigger id="nabl" className="rounded-xl h-11 font-bold border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="NA">NA</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Methodology */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Microscope className="text-blue-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Clinical Methodology</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specimen">Specimen Type</Label>
              <Select value={form.specimenType} onValueChange={(v) => setForm({ ...form, specimenType: v ?? '' })}>
                <SelectTrigger id="specimen" className="rounded-xl h-11 font-bold border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="N/A">N/A</SelectItem>
                  <SelectItem value="Blood">Blood</SelectItem>
                  <SelectItem value="Urine">Urine</SelectItem>
                  <SelectItem value="Serum">Serum</SelectItem>
                  <SelectItem value="Plasma">Plasma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Input
                id="method"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                placeholder="e.g. GOD-PAP"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Input Component Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v ?? '' })}>
                <SelectTrigger id="type" className="rounded-xl h-11 font-bold border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Input Box">Input Box</SelectItem>
                  <SelectItem value="Dropdown">Dropdown</SelectItem>
                  <SelectItem value="Textarea">Textarea</SelectItem>
                  <SelectItem value="Checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="e.g. mg/dL"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Validation & Constraints */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-amber-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Logic & Constraints</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Sorting Priority</Label>
              <Input
                id="priority"
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="required">Field Requirement</Label>
              <Select value={form.isRequired} onValueChange={(v) => setForm({ ...form, isRequired: v ?? '' })}>
                <SelectTrigger id="required" className="rounded-xl h-11 font-bold border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="N/A">N/A</SelectItem>
                  <SelectItem value="Yes">Yes (Mandatory)</SelectItem>
                  <SelectItem value="No">No (Optional)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Formatting */}
        <div className="space-y-4 p-5 bg-slate-50/80 border border-slate-100 rounded-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="text-indigo-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Visual Offsets (Margins)</h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-500 text-[10px] font-black">LEFT</Label>
              <Select value={form.left} onValueChange={(v) => setForm({ ...form, left: v ?? '' })}>
                <SelectTrigger className="rounded-xl h-10 font-bold bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {['0', '1', '2', '3', '4', '5'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-500 text-[10px] font-black">BOTTOM</Label>
              <Select value={form.bottom} onValueChange={(v) => setForm({ ...form, bottom: v ?? '' })}>
                <SelectTrigger className="rounded-xl h-10 font-bold bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {['0', '1', '2', '3', '4', '5'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-500 text-[10px] font-black">TOP</Label>
              <Select value={form.top} onValueChange={(v) => setForm({ ...form, top: v ?? '' })}>
                <SelectTrigger className="rounded-xl h-10 font-bold bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {['0', '1', '2', '3', '4', '5'].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Technical Integration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-rose-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Technical Integration</h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="iface1" className="text-slate-500">Analyzer Interface 1</Label>
              <Input
                id="iface1"
                value={form.interface1}
                onChange={(e) => setForm({ ...form, interface1: e.target.value })}
                placeholder="Device ID 1"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iface2" className="text-slate-500">Analyzer Interface 2</Label>
              <Input
                id="iface2"
                value={form.interface2}
                onChange={(e) => setForm({ ...form, interface2: e.target.value })}
                placeholder="Device ID 2"
                className="rounded-xl h-11 border-slate-200"
              />
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4 space-y-2">
              <Label htmlFor="calc">Computed</Label>
              <Select value={form.calc} onValueChange={(v) => setForm({ ...form, calc: v ?? '' })}>
                <SelectTrigger id="calc" className="rounded-xl h-11 font-bold border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-8 space-y-2">
              <Label htmlFor="pcode">LIS Parameter Code</Label>
              <div className="relative group">
                <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                <Input
                  id="pcode"
                  value={form.paramCode}
                  onChange={(e) => setForm({ ...form, paramCode: e.target.value })}
                  placeholder="e.g. LIS_GLU_001"
                  className="rounded-xl h-11 pl-10 border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}

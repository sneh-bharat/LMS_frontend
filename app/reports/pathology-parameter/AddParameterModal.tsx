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

export function AddParameterModal({ isOpen, onClose, onSave }: {
  isOpen: boolean; onClose: () => void;
  onSave: (p: { sn: number; name: string; unit: string; inputType: string; priority: number; linked: number; isHeader: boolean }) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    unit: '',
    inputType: 'txt',
    priority: '1',
    isHeader: false
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave({
      sn: Date.now(),
      name: form.name,
      unit: form.unit,
      inputType: form.inputType,
      priority: Number(form.priority) || 1,
      linked: 0,
      isHeader: form.isHeader
    });
    setForm({ name: '', unit: '', inputType: 'txt', priority: '1', isHeader: false });
    onClose();
  };

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Pathology Parameter"
      description="Define a new parameter for laboratory reports, including its unit and input type."
      footer={
        <div className="flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" className="flex-1" onClick={handleSubmit}>
            Create Parameter
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Parameter Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Creatine Phosphokinase"
            className="rounded-xl h-11"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="e.g. mg/dL"
              className="rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="rounded-xl h-11"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-type">Input Type</Label>
          <Select
            value={form.inputType}
            onValueChange={(value) => setForm({ ...form, inputType: value ?? '' })}
          >
            <SelectTrigger id="input-type" className="rounded-xl h-11 font-bold">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="txt">txt (Text Input)</SelectItem>
              <SelectItem value="op">op (Option/Select)</SelectItem>
              <SelectItem value="textarea">textarea (Large Text)</SelectItem>
              <SelectItem value="%">% (Percentage)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <input
            type="checkbox"
            id="isHeader"
            checked={form.isHeader}
            onChange={e => setForm(f => ({ ...f, isHeader: e.target.checked }))}
            className="w-5 h-5 accent-green-600 rounded-md cursor-pointer"
          />
          <div>
            <Label htmlFor="isHeader" className="font-black text-slate-900 cursor-pointer block">Is Header</Label>
            <p className="text-[10px] font-bold text-slate-400">Mark this parameter as a section title / header.</p>
          </div>
        </div>
      </div>
    </RightDrawer>
  );
}

'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  Save,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Undo2,
  Redo2,
  CheckCircle2
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
} from '@/components/ui';

interface PathologyParam {
  id: number; sn: number; name: string; unit: string;
  inputType: string; priority: number;
  linked: number; isHeader: boolean;
  ranges: any[]; defaultValue: string;
  parameters: any[];
}

export function DefaultValueEditor({
  param,
  onSave,
  onBack
}: {
  param: PathologyParam;
  onSave: (value: string) => void;
  onBack: () => void;
}) {
  const [value, setValue] = useState(param.defaultValue);

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
              <Badge variant="secondary" className="font-black text-emerald-600 bg-emerald-50 border-emerald-100">DEFAULT VALUE</Badge>
            </h2>
            <p className="text-slate-500 font-medium">Define a pre-filled value or template for this parameter's output.</p>
          </div>
        </div>
        <Button
          onClick={() => onSave(value)}
          variant="gradient"
          className="gap-2 px-6 h-12 shadow-lg shadow-green-500/20"
        >
          <Save size={18} />
          Save Template
        </Button>
      </div>

      <Card className="rounded-[2.5rem] border border-white/40 shadow-2xl overflow-hidden glass min-h-[500px] flex flex-col">
        {/* Editor Toolbar */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Undo2 size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><Redo2 size={16} /></Button>
          </div>

          <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg font-bold"><Bold size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg italic"><Italic size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg underline"><Underline size={16} /></Button>
          </div>

          <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><AlignLeft size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><AlignCenter size={16} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><AlignRight size={16} /></Button>
          </div>

          <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><List size={16} /></Button>
          </div>

          <div className="flex-1" />

          <Badge variant="outline" className="font-bold text-slate-400 border-slate-200 text-[10px] uppercase tracking-widest px-3 py-1 bg-white">
            Rich Text Mode
          </Badge>
        </div>

        {/* Editor Content */}
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            className="w-full h-full min-h-[400px] p-8 text-lg font-medium text-slate-700 focus:outline-none resize-none bg-transparent leading-relaxed"
            placeholder="Start typing your default response template here..."
          />
        </div>

        {/* Editor Status Bar */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">
            <span>{value.trim().split(/\s+/).filter(Boolean).length} Words</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span>{value.length} Characters</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-black text-emerald-500 uppercase tracking-widest">
            <CheckCircle2 size={12} />
            Auto-saved
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100">
          <h4 className="font-black text-blue-900 text-sm mb-2">Pro Tip</h4>
          <p className="text-xs text-blue-700 font-medium leading-relaxed">
            Use descriptive templates to standardize reporting across different testing locations.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100">
          <h4 className="font-black text-amber-900 text-sm mb-2">Variables</h4>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Templates are automatically applied to new report entries for this parameter.
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-green-50/50 border border-green-100">
          <h4 className="font-black text-green-900 text-sm mb-2">Formatting</h4>
          <p className="text-xs text-green-700 font-medium leading-relaxed">
            Standard formatting will be preserved in the final generated clinical reports.
          </p>
        </div>
      </div>
    </div>
  );
}

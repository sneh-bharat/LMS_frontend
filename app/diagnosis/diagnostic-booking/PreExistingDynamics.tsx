'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { Input, Label, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { BOOKING_DISEASES } from './patientFormUtils';

export interface PreExistingDynamicsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
  /** Allergy / API-sourced labels to add to the option list */
  apiOptions?: string[];
  className?: string;
}

function mergeOptions(base: string[], incoming: string[]): string[] {
  const merged = [...base];
  for (const item of incoming) {
    const trimmed = item?.trim();
    if (!trimmed) continue;
    if (!merged.some((o) => o.toLowerCase() === trimmed.toLowerCase())) {
      merged.push(trimmed);
    }
  }
  return merged;
}

export default function PreExistingDynamics({
  selected,
  onChange,
  apiOptions = [],
  className,
}: PreExistingDynamicsProps) {
  const [options, setOptions] = useState<string[]>([...BOOKING_DISEASES]);
  const [customInput, setCustomInput] = useState('');

  const defaultSet = useMemo(() => new Set(BOOKING_DISEASES.map((d) => d.toLowerCase())), []);
  const apiSet = useMemo(
    () => new Set(apiOptions.map((a) => a.trim().toLowerCase()).filter(Boolean)),
    [apiOptions]
  );

  useEffect(() => {
    if (apiOptions.length === 0) return;
    setOptions((prev) => mergeOptions(prev, apiOptions));
  }, [apiOptions]);

  useEffect(() => {
    if (selected.length === 0) return;
    setOptions((prev) => mergeOptions(prev, selected));
  }, [selected]);

  const toggle = (name: string) => {
    onChange(
      selected.includes(name)
        ? selected.filter((x) => x !== name)
        : [...selected, name]
    );
  };

  const addCustom = () => {
    const name = customInput.trim();
    if (!name) return;

    setOptions((prev) => mergeOptions(prev, [name]));
    if (!selected.includes(name)) {
      onChange([...selected, name]);
    }
    setCustomInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustom();
    }
  };

  const chipStyle = (name: string, active: boolean) => {
    const isApi = apiSet.has(name.toLowerCase()) && !defaultSet.has(name.toLowerCase());
    if (active && isApi) {
      return 'bg-rose-600 text-white border-transparent shadow-lg';
    }
    if (active) {
      return 'bg-[#050b18] text-white border-transparent shadow-lg';
    }
    if (isApi) {
      return 'bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-300 shadow-sm';
    }
    return 'bg-white border-gray-300 text-slate-400 hover:border-emerald-200 hover:text-slate-600 shadow-sm';
  };

  return (
    <div className={cn('space-y-4 pt-2', className)}>
      <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
      Disease
      </Label>

      <div className="flex flex-wrap gap-2">
        {options.map((name) => {
          const active = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggle(name)}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 border',
                chipStyle(name, active)
              )}
            >
              {active ? (
                <CheckCircle2
                  size={14}
                  className={apiSet.has(name.toLowerCase()) && !defaultSet.has(name.toLowerCase()) ? 'text-rose-200' : 'text-emerald-400'}
                />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
              )}
              {name}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add condition (e.g. CKD, COPD)..."
          className="border-gray-300 text-sm font-semibold"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addCustom}
          disabled={!customInput.trim()}
          className="shrink-0 rounded-xl border-gray-300 gap-1.5 font-bold text-xs"
        >
          <Plus size={16} />
          Add
        </Button>
      </div>
    </div>
  );
}


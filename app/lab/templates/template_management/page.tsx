'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import AdvancedTemplateEditor from '@/app/components/editor/AdvancedTemplateEditor';

const APPLICABLE_OPTIONS = ['Male', 'Female', 'Both'];

const INITIAL_CONTENT = '<p>Enter report template content here...</p>';

export default function TemplateManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testName = searchParams.get('testName') || '';
  const testId = searchParams.get('testId') || '';
  const [templateTitle, setTemplateTitle] = useState(testName ? `${testName} Template` : '');
  const [applicableFor, setApplicableFor] = useState('Both');
  const [content, setContent] = useState(INITIAL_CONTENT);

  const handleSaveTemplate = () => {
    const payload = {
      testId,
      templateTitle,
      applicableFor,
      content,
    };

    console.log('Save template:', payload);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            <span className="text-[#006D77]">Template</span>{' '}
            <span className="text-highlight">Management</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Configure report templates and interpretation layouts.
          </p>
          {testName && (
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#00AC80]">
              Selected Test: {testName}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          suppressHydrationWarning
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Template Title
            </label>
            <input
              value={templateTitle}
              onChange={(event) => setTemplateTitle(event.target.value)}
              placeholder="Enter template title"
              className="input-refined w-full px-4 py-3 text-sm font-semibold"
              suppressHydrationWarning
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
              Applicable For
            </label>
            <select
              value={applicableFor}
              onChange={(event) => setApplicableFor(event.target.value)}
              className="input-refined w-full px-4 py-3 text-sm font-semibold"
              suppressHydrationWarning
            >
              {APPLICABLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <AdvancedTemplateEditor content={content} onChange={setContent} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveTemplate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#006D77] to-[#00AC80] px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90"
            suppressHydrationWarning
          >
            <Save size={16} />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
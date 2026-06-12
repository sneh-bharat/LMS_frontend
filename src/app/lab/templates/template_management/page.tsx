'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import Badge from '@/components/ui/badge';

const AdvancedTemplateEditor = dynamic(
  () => import('@/app/components/editor/AdvancedTemplateEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader size={16} className="animate-spin" />
          <span className="text-sm">Loading editor...</span>
        </div>
      </div>
    ),
  }
);
import { useCreateReportTemplate } from '@/app/Apis/lab/TemplateMgmt/useReportTemplates';
import { mapApplicableForToApi } from '@/app/Apis/lab/reportTemplateApi';

const APPLICABLE_OPTIONS = ['Male', 'Female', 'Both'];

const INITIAL_CONTENT = '<p>Enter report template content here...</p>';

export default function TemplateManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Params passed from the tests page (hidden, used in payload)
  const testName = searchParams.get('testName') || '';
  const testIdParam = searchParams.get('testId') || '';
  const testCode = searchParams.get('testCode') || '';
  const departmentIdParam = searchParams.get('departmentId') || '';
  const departmentName = searchParams.get('departmentName') || '';
  const branchIdParam = searchParams.get('branchId') || '1';

  const createMutation = useCreateReportTemplate();

  const [templateTitle, setTemplateTitle] = useState(testName ? `${testName} Template` : '');
  const [applicableFor, setApplicableFor] = useState('Both');
  const [content, setContent] = useState(INITIAL_CONTENT);

  const handleSaveTemplate = () => {
    const parsedTestId = Number(testIdParam);
    const parsedDeptId = Number(departmentIdParam);
    const parsedBranchId = Number(branchIdParam);

    if (!templateTitle.trim()) {
      toast.error('Please enter a template title.');
      return;
    }
    if (!testIdParam || !Number.isFinite(parsedTestId)) {
      toast.error('Test ID is required.');
      return;
    }

    const payload = {
      templateName: templateTitle.trim(),
      testId: parsedTestId,
      testName: testName,
      testCode: testCode,
      departmentId: parsedDeptId,
      departmentName: departmentName,
      allTests: false,
      allDepartments: false,
      templateContent: content,
      applicableFor: mapApplicableForToApi(applicableFor),
      isActive: true,
      allowedTemplateTypes: 'STANDARD',
      branchId: parsedBranchId,
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || 'Report template created successfully.');
        router.back();
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to create report template.';
        toast.error(msg);
      },
    });
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
        {/* Row 1: Template Title + Applicable For */}
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

        {/* Row 2: Read-only info from test (testCode, departmentId, branchId are hidden) */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {departmentName && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Department
              </label>
              <Badge variant="primary" className="px-3 py-1.5 text-[10px] font-bold">
                {departmentName}
              </Badge>
            </div>
          )}
          {testCode && (
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                Test Code
              </label>
              <Badge variant="outline" className="px-3 py-1.5 text-[10px] font-bold font-mono">
                {testCode}
              </Badge>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="mt-6">
          <AdvancedTemplateEditor content={content} onChange={setContent} />
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleSaveTemplate}
            disabled={createMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#006D77] to-[#00AC80] px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            suppressHydrationWarning
          >
            {createMutation.isPending ? (
              <Loader size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {createMutation.isPending ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

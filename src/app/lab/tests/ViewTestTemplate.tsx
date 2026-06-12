'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  FileText,
  FlaskConical,
  Loader2,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  fetchReportTemplateByTestId,
  mapApplicableForFromApi,
  type ReportTemplate,
} from '@/app/Apis/lab/reportTemplateApi';

export interface ViewTestTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  testId: number | null | undefined;
  testName?: string;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest sm:w-36 shrink-0">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-900 break-all">{value}</span>
    </div>
  );
}

export default function ViewTestTemplate({
  isOpen,
  onClose,
  testId,
  testName,
}: ViewTestTemplateProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  const [panel, setPanel] = useState<'preview' | 'source'>('preview');

  useEffect(() => {
    if (!isOpen || testId == null || testId < 1) {
      setTemplate(null);
      setError(null);
      setPanel('preview');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetchReportTemplateByTestId(testId);
        if (cancelled) return;
        if (res?.data) {
          setTemplate(res.data);
        } else {
          setTemplate(null);
          setError(res?.message?.trim() || 'No template found for this test.');
        }
      } catch (err) {
        if (!cancelled) {
          setTemplate(null);
          const msg =
            err instanceof Error
              ? err.message
              : typeof err === 'object' &&
                  err !== null &&
                  'message' in err &&
                  typeof (err as { message: unknown }).message === 'string'
                ? (err as { message: string }).message
                : 'Failed to load report template.';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, testId]);

  const displayTestName = template?.testName?.trim() || testName?.trim() || '—';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          View <span className="text-emerald-200">report template</span>
        </>
      }
      description={displayTestName !== '—' ? displayTestName : undefined}
      maxWidth="2xl"
      footer={
        <Button type="button" variant="outline" className="w-full font-bold" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading template…</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 flex gap-3 text-sm text-rose-800">
          <AlertCircle size={20} className="shrink-0" aria-hidden />
          <p className="font-medium">{error}</p>
        </div>
      ) : template ? (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <FileText size={18} aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-900">{template.templateName}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {template.testCode} · {template.departmentName}
                </p>
              </div>
            </div>
            <MetaRow label="Template ID" value={String(template.templateId)} />
            <MetaRow label="Test" value={template.testName} />
            <MetaRow label="Applicable for" value={mapApplicableForFromApi(template.applicableFor)} />
            <MetaRow label="Template type" value={template.allowedTemplateTypes || '—'} />
            <div className="flex flex-wrap gap-2 pt-3">
              <Badge
                variant={template.isActive ? 'default' : 'secondary'}
                className={
                  template.isActive
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                    : 'text-[10px] font-bold'
                }
              >
                {template.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {template.allTests ? (
                <Badge variant="outline" className="text-[10px] font-bold">
                  All tests
                </Badge>
              ) : null}
              {template.allDepartments ? (
                <Badge variant="outline" className="text-[10px] font-bold">
                  All departments
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FlaskConical size={14} className="text-emerald-600" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Template content
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPanel('preview')}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                panel === 'preview'
                  ? 'bg-[#006D77] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Live preview
            </button>
            <button
              type="button"
              onClick={() => setPanel('source')}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                panel === 'source'
                  ? 'bg-[#006D77] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              HTML source
            </button>
          </div>

          {panel === 'preview' ? (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <iframe
                title={`Report template preview — ${template.templateName}`}
                srcDoc={template.templateContent}
                className="w-full min-h-[480px] border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <textarea
              readOnly
              value={template.templateContent}
              className="w-full min-h-[480px] rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-800 leading-relaxed resize-y"
              spellCheck={false}
            />
          )}

          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="inline-flex items-center gap-1">
              <Building2 size={12} aria-hidden />
              Branch {template.branchId}
            </span>
            <span className="inline-flex items-center gap-1">
              <Tag size={12} aria-hidden />
              Tenant {template.tenantId}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm font-medium text-slate-500 py-8 text-center">No template data.</p>
      )}
    </RightDrawer>
  );
}

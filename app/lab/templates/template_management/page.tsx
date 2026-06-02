'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlertCircle,
  ArrowLeft,
  Bold,
  Heading1,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Save,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import Badge from '@/components/ui/badge';
import {
  fetchReportTemplateByTestId,
  mapApplicableForFromApi,
  type ReportTemplate,
} from '@/app/Apis/lab/reportTemplateApi';

const APPLICABLE_OPTIONS = ['Male', 'Female', 'Both'];

const EMPTY_EDITOR = '<p>Enter report template content here...</p>';

function ToolbarButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2 text-slate-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-[#006D77] bg-[#006D77]/10 text-[#006D77]'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
      suppressHydrationWarning
    >
      {children}
    </button>
  );
}

export default function TemplateManagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testNameParam = searchParams.get('testName') || '';
  const testIdParam = searchParams.get('testId') || '';
  const mode = searchParams.get('mode') || 'edit';
  const isViewMode = mode === 'view';

  const parsedTestId = testIdParam ? Number(testIdParam) : NaN;
  const testId = Number.isFinite(parsedTestId) && parsedTestId > 0 ? parsedTestId : null;

  const [templateTitle, setTemplateTitle] = useState(
    testNameParam ? `${testNameParam} Template` : ''
  );
  const [applicableFor, setApplicableFor] = useState('Both');
  const [content, setContent] = useState(EMPTY_EDITOR);
  const [templateMeta, setTemplateMeta] = useState<ReportTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panel, setPanel] = useState<'editor' | 'preview'>('editor');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: EMPTY_EDITOR,
    immediatelyRender: false,
    editable: !isViewMode,
    editorProps: {
      attributes: {
        class:
          'min-h-[320px] px-5 py-4 text-sm text-slate-700 outline-none focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => {
      setContent(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!isViewMode);
  }, [editor, isViewMode]);

  useEffect(() => {
    if (!testId) {
      setTemplateMeta(null);
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const res = await fetchReportTemplateByTestId(testId);
        if (cancelled) return;

        if (res?.data) {
          const data = res.data;
          setTemplateMeta(data);
          setTemplateTitle(data.templateName);
          setApplicableFor(mapApplicableForFromApi(data.applicableFor));
          setContent(data.templateContent);
          editor?.commands.setContent(data.templateContent);
          if (isViewMode) setPanel('preview');
        } else {
          setLoadError(res?.message?.trim() || 'Template not found for this test.');
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : typeof err === 'object' &&
                  err !== null &&
                  'message' in err &&
                  typeof (err as { message: unknown }).message === 'string'
                ? (err as { message: string }).message
                : 'Failed to load template.';
          setLoadError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [testId, isViewMode, editor]);

  const handleSaveTemplate = () => {
    const payload = {
      testId,
      templateTitle,
      applicableFor,
      content,
    };
    console.log('Save template:', payload);
    toast.info('Save template API will be connected next.');
  };

  const displayTestLabel =
    templateMeta?.testName?.trim() ||
    testNameParam ||
    (testId ? `Test ID ${testId}` : '');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            <span className="text-[#006D77]">Template</span>{' '}
            <span className="text-highlight">Management</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            {isViewMode
              ? 'View report template linked to this test.'
              : 'Configure report templates and interpretation layouts.'}
          </p>
          {displayTestLabel ? (
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-[#00AC80]">
              Selected Test: {displayTestLabel}
              {templateMeta?.testCode ? ` (${templateMeta.testCode})` : ''}
            </p>
          ) : null}
          {templateMeta ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[10px] font-bold">
                {templateMeta.departmentName}
              </Badge>
              <Badge
                variant={templateMeta.isActive ? 'default' : 'secondary'}
                className={
                  templateMeta.isActive
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                    : 'text-[10px] font-bold'
                }
              >
                {templateMeta.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          ) : null}
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#006D77]" size={32} aria-hidden />
          <p className="text-sm font-medium text-slate-600">Loading template…</p>
        </div>
      ) : loadError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-4 flex gap-3 text-sm text-rose-800">
          <AlertCircle size={20} className="shrink-0" aria-hidden />
          <p className="font-medium">{loadError}</p>
        </div>
      ) : (
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
                readOnly={isViewMode}
                className="input-refined w-full px-4 py-3 text-sm font-semibold disabled:bg-slate-50"
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
                disabled={isViewMode}
                className="input-refined w-full px-4 py-3 text-sm font-semibold disabled:bg-slate-50"
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

          {isViewMode ? (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setPanel('preview')}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  panel === 'preview'
                    ? 'bg-[#006D77] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Live preview
              </button>
              <button
                type="button"
                onClick={() => setPanel('editor')}
                className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider ${
                  panel === 'editor'
                    ? 'bg-[#006D77] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Editor
              </button>
            </div>
          ) : null}

          {isViewMode && panel === 'preview' && templateMeta ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <iframe
                title={`Template preview — ${templateMeta.templateName}`}
                srcDoc={templateMeta.templateContent}
                className="w-full min-h-[520px] border-0 bg-white"
                sandbox="allow-same-origin"
              />
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
                <ToolbarButton
                  active={editor?.isActive('bold')}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive('italic')}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive('underline')}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                >
                  <UnderlineIcon size={16} />
                </ToolbarButton>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <ToolbarButton
                  active={editor?.isActive('heading', { level: 1 })}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                  <Heading1 size={16} />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive('heading', { level: 2 })}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                  <Heading2 size={16} />
                </ToolbarButton>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <ToolbarButton
                  active={editor?.isActive('bulletList')}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                  <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive('orderedList')}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered size={16} />
                </ToolbarButton>

                <div className="mx-1 h-7 w-px bg-slate-200" />

                <ToolbarButton
                  active={editor?.isActive({ textAlign: 'left' })}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                >
                  <AlignLeft size={16} />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive({ textAlign: 'center' })}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                >
                  <AlignCenter size={16} />
                </ToolbarButton>
                <ToolbarButton
                  active={editor?.isActive({ textAlign: 'right' })}
                  disabled={!editor || isViewMode}
                  onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                >
                  <AlignRight size={16} />
                </ToolbarButton>
              </div>

              <EditorContent
                editor={editor}
                className="bg-white [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6"
              />

              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Rich Text Editor</span>
                <span>
                  {content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length} Words
                </span>
              </div>
            </div>
          )}

          {!isViewMode ? (
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
          ) : null}
        </div>
      )}
    </div>
  );
}

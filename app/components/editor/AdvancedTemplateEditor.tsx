'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight,
  Bold, ChevronDown, Code, Code2, Columns2,
  Highlighter, Image as ImageIcon, Italic,
  Link as LinkIcon, Link2Off,
  List, ListChecks, ListOrdered, Merge,
  Minus, Plus, Quote, Redo2, Rows3, Scissors,
  Strikethrough, Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon, Table as TableIcon,
  Trash2, Type, Underline as UnderlineIcon, Undo2,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const lowlight = createLowlight(common);

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
];

const FONT_SIZES = [
  '8px', '9px', '10px', '11px', '12px', '14px', '16px',
  '18px', '20px', '24px', '28px', '32px', '36px', '48px', '72px',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Renders the dropdown panel via React portal on document.body so no ancestor
// overflow:auto/hidden ever clips the menu. Positions smartly: opens downward with
// maxHeight = remaining viewport space; flips upward when there is more room above.
function usePortalDropdown() {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const openMenu = useCallback(() => {
    if (!triggerRef.current) return;
    const r  = triggerRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const spaceBelow = vh - r.bottom - 8;
    const spaceAbove = r.top - 8;

    // Prefer opening downward; flip up only when below-space < 220 px AND more room above
    const openDown = spaceBelow >= 220 || spaceBelow >= spaceAbove;
    const maxH     = openDown ? spaceBelow : spaceAbove;

    // Clamp left so panel doesn't overflow the right viewport edge (panel width ≈ 224 px)
    const panelW = 224;
    const left   = Math.min(r.left, vw - panelW - 8);

    setPanelStyle({
      position : 'fixed',
      top      : openDown ? r.bottom + 4 : undefined,
      bottom   : openDown ? undefined : vh - r.top + 4,
      left,
      zIndex   : 9999,
      maxHeight: `${Math.max(maxH, 120)}px`,
      overflowY: 'auto',
    });
    setOpen(true);
  }, []);

  const toggle = useCallback(() => {
    if (open) setOpen(false); else openMenu();
  }, [open, openMenu]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  return { open, setOpen, toggle, triggerRef, panelRef, panelStyle, mounted };
}

// ── Shared primitives ─────────────────────────────────────────────────────────
function Btn({
  active, disabled, onClick, title, children,
}: {
  active?: boolean; disabled?: boolean; onClick: () => void;
  title?: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button" title={title} onClick={onClick} disabled={disabled}
      className={`inline-flex flex-shrink-0 items-center justify-center rounded px-2 py-1.5 text-xs transition-colors
        disabled:cursor-not-allowed disabled:opacity-40
        ${active ? 'bg-[#006D77]/12 text-[#006D77]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-5 w-px flex-shrink-0 self-center bg-slate-200" />;
}

// Section heading inside a dropdown panel
function PanelSection({ label }: { label: string }) {
  return (
    <div className="border-t border-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 first:border-t-0">
      {label}
    </div>
  );
}

// Row inside a dropdown panel
function PanelItem({
  icon, label, danger, disabled, onClick,
}: {
  icon?: React.ReactNode; label: string; danger?: boolean;
  disabled?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] transition-colors
        disabled:cursor-not-allowed disabled:opacity-35
        ${danger
          ? 'text-red-500 hover:bg-red-50 hover:text-red-600'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}

// ── Color picker button ───────────────────────────────────────────────────────
function ColorBtn({ editor, type }: { editor: Editor; type: 'text' | 'highlight' }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isText = type === 'text';
  const color = isText
    ? ((editor.getAttributes('textStyle').color as string | undefined) ?? '#000000')
    : ((editor.getAttributes('highlight').color as string | undefined) ?? '#ffff00');

  return (
    <div className="relative flex-shrink-0">
      <Btn title={isText ? 'Text Color' : 'Highlight Color'} onClick={() => inputRef.current?.click()}>
        <div className="flex flex-col items-center gap-0.5">
          {isText ? <Type size={14} /> : <Highlighter size={14} />}
          <div className="h-[3px] w-4 rounded-full" style={{ backgroundColor: color }} />
        </div>
      </Btn>
      <input
        ref={inputRef} type="color" value={color}
        className="absolute left-0 top-full h-0 w-0 opacity-0"
        onChange={(e) => {
          if (isText) editor.chain().focus().setColor(e.target.value).run();
          else        editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
        }}
      />
    </div>
  );
}

// ── Heading dropdown (portal) ─────────────────────────────────────────────────
function HeadingDropdown({ editor }: { editor: Editor }) {
  const { open, setOpen, toggle, triggerRef, panelRef, panelStyle, mounted } = usePortalDropdown();
  const levels = [1, 2, 3, 4, 5, 6] as const;
  const active = levels.find((l) => editor.isActive('heading', { level: l }));

  const HEADING_SIZES = ['text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs', 'text-[11px]'];

  const panel = (
    <div ref={panelRef} style={panelStyle}
      className="w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5">
      <button type="button"
        className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-slate-50
          ${!active ? 'font-semibold text-[#006D77]' : 'text-slate-700'}`}
        onClick={() => { editor.chain().focus().setParagraph().run(); setOpen(false); }}>
        Paragraph
      </button>
      {levels.map((level, i) => (
        <button key={level} type="button"
          className={`flex w-full items-center px-3 py-2 font-semibold transition-colors hover:bg-slate-50
            ${HEADING_SIZES[i]}
            ${editor.isActive('heading', { level }) ? 'text-[#006D77]' : 'text-slate-800'}`}
          onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setOpen(false); }}>
          Heading {level}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={triggerRef} className="flex-shrink-0">
      <Btn title="Heading / Paragraph" onClick={toggle}>
        <span className="w-5 text-center text-xs font-bold">{active ? `H${active}` : 'P'}</span>
        <ChevronDown size={11} className="ml-0.5 opacity-60" />
      </Btn>
      {open && mounted && createPortal(panel, document.body)}
    </div>
  );
}

// ── Table size grid (CKEditor / Word style) ───────────────────────────────────
// Uses a <table> with border-collapse so cells share crisp 1 px borders — no gaps,
// no rounded bubbles. Hovered region fills with teal to preview selection size.
function TableSizePicker({ onSelect }: { onSelect: (r: number, c: number) => void }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  const ROWS = 8; const COLS = 8;

  return (
    <div className="px-3 py-2.5">
      {/* Live size label */}
      <p className="mb-2 text-center text-xs text-slate-400">
        {hover.r > 0
          ? <span className="font-semibold text-[#006D77]">{hover.r} × {hover.c} Table</span>
          : 'Hover to select size'}
      </p>

      {/* Grid — border-collapse gives shared 1 px cell borders */}
      <table
        className="border-collapse"
        onMouseLeave={() => setHover({ r: 0, c: 0 })}
      >
        <tbody>
          {Array.from({ length: ROWS }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: COLS }, (_, c) => {
                const on = r < hover.r && c < hover.c;
                return (
                  <td
                    key={c}
                    className={`h-[22px] w-[22px] cursor-pointer border transition-colors
                      ${on
                        ? 'border-[#006D77]/40 bg-[#006D77]/20'
                        : 'border-slate-300 bg-white hover:border-[#006D77]/50 hover:bg-[#006D77]/10'}`}
                    onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                    onClick={() => hover.r > 0 && onSelect(hover.r, hover.c)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Table dropdown (portal) ───────────────────────────────────────────────────
function TableDropdown({ editor }: { editor: Editor }) {
  const { open, setOpen, toggle, triggerRef, panelRef, panelStyle, mounted } = usePortalDropdown();
  const inTable = editor.isActive('table');
  const act = (fn: () => void) => { fn(); setOpen(false); };

  const panel = (
    <div ref={panelRef} style={panelStyle}
      className="w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-black/5">

      {/* Insert */}
      <PanelSection label="Insert Table" />
      <TableSizePicker onSelect={(r, c) => { editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run(); setOpen(false); }} />

      {/* Row */}
      <PanelSection label="Row" />
      <PanelItem disabled={!inTable} icon={<Plus size={13} />}     label="Add Row Above"  onClick={() => act(() => editor.chain().focus().addRowBefore().run())} />
      <PanelItem disabled={!inTable} icon={<Plus size={13} />}     label="Add Row Below"  onClick={() => act(() => editor.chain().focus().addRowAfter().run())} />
      <PanelItem disabled={!inTable} icon={<Trash2 size={13} />}   label="Delete Row"     onClick={() => act(() => editor.chain().focus().deleteRow().run())} danger />

      {/* Column */}
      <PanelSection label="Column" />
      <PanelItem disabled={!inTable} icon={<Plus size={13} />}     label="Add Column Left"  onClick={() => act(() => editor.chain().focus().addColumnBefore().run())} />
      <PanelItem disabled={!inTable} icon={<Plus size={13} />}     label="Add Column Right" onClick={() => act(() => editor.chain().focus().addColumnAfter().run())} />
      <PanelItem disabled={!inTable} icon={<Trash2 size={13} />}   label="Delete Column"    onClick={() => act(() => editor.chain().focus().deleteColumn().run())} danger />

      {/* Cells */}
      <PanelSection label="Cells" />
      <PanelItem disabled={!inTable} icon={<Merge size={13} />}    label="Merge Cells"   onClick={() => act(() => editor.chain().focus().mergeCells().run())} />
      <PanelItem disabled={!inTable} icon={<Scissors size={13} />} label="Split Cell"    onClick={() => act(() => editor.chain().focus().splitCell().run())} />

      {/* Headers */}
      <PanelSection label="Headers" />
      <PanelItem disabled={!inTable} icon={<Rows3 size={13} />}    label="Toggle Header Row"    onClick={() => act(() => editor.chain().focus().toggleHeaderRow().run())} />
      <PanelItem disabled={!inTable} icon={<Columns2 size={13} />} label="Toggle Header Column" onClick={() => act(() => editor.chain().focus().toggleHeaderColumn().run())} />
      <PanelItem disabled={!inTable} icon={<TableIcon size={13} />} label="Toggle Header Cell"  onClick={() => act(() => editor.chain().focus().toggleHeaderCell().run())} />

      {/* Danger */}
      <div className="mt-1 border-t border-slate-100 pt-1">
        <PanelItem disabled={!inTable} icon={<Trash2 size={13} />} label="Delete Table" onClick={() => act(() => editor.chain().focus().deleteTable().run())} danger />
      </div>
    </div>
  );

  return (
    <div ref={triggerRef} className="flex-shrink-0">
      <Btn title="Table" onClick={toggle} active={inTable}>
        <TableIcon size={15} />
        <ChevronDown size={11} className="ml-0.5 opacity-60" />
      </Btn>
      {open && mounted && createPortal(panel, document.body)}
    </div>
  );
}

// ── Link button ───────────────────────────────────────────────────────────────
function LinkBtn({ editor }: { editor: Editor }) {
  const isActive = editor.isActive('link');
  const handle = useCallback(() => {
    if (isActive) { editor.chain().focus().unsetLink().run(); return; }
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
  }, [editor, isActive]);
  return (
    <Btn title={isActive ? 'Remove Link' : 'Add Link'} onClick={handle} active={isActive}>
      {isActive ? <Link2Off size={15} /> : <LinkIcon size={15} />}
    </Btn>
  );
}

// ── Image button ──────────────────────────────────────────────────────────────
function ImageBtn({ editor }: { editor: Editor }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFile = useCallback(async (file: File) => {
    const src = await fileToBase64(file);
    editor.chain().focus().setImage({ src }).run();
  }, [editor]);
  return (
    <>
      <Btn title="Insert Image" onClick={() => inputRef.current?.click()}>
        <ImageIcon size={15} />
      </Btn>
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleFile(f); e.target.value = ''; }} />
    </>
  );
}

// ── Two-row sticky toolbar ────────────────────────────────────────────────────
// Row 1 — history · font · heading · inline format · colors · scripts
// Row 2 — alignment · lists · block · code · link · image · table
// Dropdowns render via portals — never clipped by overflow.
function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const fontFamily = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? '';
  const fontSize   = (editor.getAttributes('textStyle').fontSize   as string | undefined) ?? '';

  const scrollClass =
    'overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

  return (
    <div className="sticky top-0 z-10 divide-y divide-slate-100 border-b border-slate-200 bg-white">

      {/* ── Row 1 ── */}
      <div className={scrollClass}>
        <div className="flex min-w-max items-center gap-0.5 px-2 py-1">

          <Btn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo2 size={15} />
          </Btn>
          <Btn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo2 size={15} />
          </Btn>

          <Sep />

          {/* Font family */}
          <select title="Font Family" value={fontFamily}
            className="h-7 flex-shrink-0 rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-700 outline-none hover:border-slate-300 focus:border-[#006D77]"
            onChange={(e) => e.target.value
              ? editor.chain().focus().setFontFamily(e.target.value).run()
              : editor.chain().focus().unsetFontFamily().run()}>
            {FONT_FAMILIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {/* Font size */}
          <select title="Font Size" value={fontSize}
            className="h-7 w-[4.5rem] flex-shrink-0 rounded border border-slate-200 bg-white px-1 text-xs text-slate-700 outline-none hover:border-slate-300 focus:border-[#006D77]"
            onChange={(e) => e.target.value
              ? editor.chain().focus().setFontSize(e.target.value).run()
              : editor.chain().focus().unsetFontSize().run()}>
            <option value="">Size</option>
            {FONT_SIZES.map((s) => <option key={s} value={s}>{s.replace('px', '')}</option>)}
          </select>

          <Sep />

          <HeadingDropdown editor={editor} />

          <Sep />

          <Btn title="Bold (Ctrl+B)"      active={editor.isActive('bold')}      onClick={() => editor.chain().focus().toggleBold().run()}>      <Bold size={15} /></Btn>
          <Btn title="Italic (Ctrl+I)"    active={editor.isActive('italic')}    onClick={() => editor.chain().focus().toggleItalic().run()}>    <Italic size={15} /></Btn>
          <Btn title="Underline (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}> <UnderlineIcon size={15} /></Btn>
          <Btn title="Strikethrough"      active={editor.isActive('strike')}    onClick={() => editor.chain().focus().toggleStrike().run()}>    <Strikethrough size={15} /></Btn>

          <Sep />

          <ColorBtn editor={editor} type="text" />
          <ColorBtn editor={editor} type="highlight" />

          <Sep />

          <Btn title="Superscript" active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
            <SuperscriptIcon size={15} />
          </Btn>
          <Btn title="Subscript" active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}>
            <SubscriptIcon size={15} />
          </Btn>

        </div>
      </div>

      {/* ── Row 2 ── */}
      <div className={scrollClass}>
        <div className="flex min-w-max items-center gap-0.5 px-2 py-1">

          <Btn title="Align Left"    active={editor.isActive({ textAlign: 'left'    })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>    <AlignLeft size={15} /></Btn>
          <Btn title="Align Center"  active={editor.isActive({ textAlign: 'center'  })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>  <AlignCenter size={15} /></Btn>
          <Btn title="Align Right"   active={editor.isActive({ textAlign: 'right'   })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>   <AlignRight size={15} /></Btn>
          <Btn title="Justify"       active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}> <AlignJustify size={15} /></Btn>

          <Sep />

          <Btn title="Bullet List"     active={editor.isActive('bulletList')}  onClick={() => editor.chain().focus().toggleBulletList().run()}>  <List size={15} /></Btn>
          <Btn title="Numbered List"   active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}> <ListOrdered size={15} /></Btn>
          <Btn title="Task Checklist"  active={editor.isActive('taskList')}    onClick={() => editor.chain().focus().toggleTaskList().run()}>    <ListChecks size={15} /></Btn>

          <Sep />

          <Btn title="Blockquote"     active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}> <Quote size={15} /></Btn>
          <Btn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}> <Minus size={15} /></Btn>

          <Sep />

          <Btn title="Inline Code" active={editor.isActive('code')}      onClick={() => editor.chain().focus().toggleCode().run()}>      <Code size={15} /></Btn>
          <Btn title="Code Block"  active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}> <Code2 size={15} /></Btn>

          <Sep />

          <LinkBtn editor={editor} />

          <Sep />

          <ImageBtn editor={editor} />

          <Sep />

          <TableDropdown editor={editor} />

        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface AdvancedTemplateEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function AdvancedTemplateEditor({
  content,
  onChange,
  placeholder = 'Enter report template content here...',
}: AdvancedTemplateEditorProps) {
  const isInternalUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Superscript,
      Subscript,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'min-h-[480px] px-7 py-5 text-sm leading-relaxed text-slate-800 outline-none focus:outline-none',
      },
      handleDrop(view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file?.type.startsWith('image/')) return false;
        event.preventDefault();
        fileToBase64(file).then((src) => {
          const node = view.state.schema.nodes.image?.create({ src });
          if (node) view.dispatch(view.state.tr.replaceSelectionWith(node));
        });
        return true;
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) fileToBase64(file).then((src) => {
              const node = view.state.schema.nodes.image?.create({ src });
              if (node) view.dispatch(view.state.tr.replaceSelectionWith(node));
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return; }
    if (editor.getHTML() !== content) editor.commands.setContent(content);
  }, [content, editor]);

  const wordCount = editor?.getText().trim().split(/\s+/).filter(Boolean).length ?? 0;
  const charCount = (editor?.storage.characterCount as { characters?: () => number } | undefined)?.characters?.() ?? 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Toolbar editor={editor} />

      <EditorContent
        editor={editor}
        className={[
          'bg-white',
          /* Headings */
          '[&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h1]:mt-5 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-slate-900',
          '[&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:text-xl  [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:text-slate-900',
          '[&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-lg  [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-slate-900',
          '[&_.ProseMirror_h4]:mb-1 [&_.ProseMirror_h4]:mt-3 [&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-semibold',
          '[&_.ProseMirror_h5]:mb-1 [&_.ProseMirror_h5]:mt-2 [&_.ProseMirror_h5]:text-sm   [&_.ProseMirror_h5]:font-semibold',
          '[&_.ProseMirror_h6]:mb-1 [&_.ProseMirror_h6]:mt-2 [&_.ProseMirror_h6]:text-xs   [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_h6]:uppercase [&_.ProseMirror_h6]:tracking-wide',
          /* Paragraph */
          '[&_.ProseMirror_p]:my-1',
          /* Lists */
          '[&_.ProseMirror_ul]:my-2 [&_.ProseMirror_ul]:list-disc   [&_.ProseMirror_ul]:pl-6',
          '[&_.ProseMirror_ol]:my-2 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6',
          '[&_.ProseMirror_li]:my-0.5',
          '[&_.ProseMirror_ul[data-type=taskList]]:list-none [&_.ProseMirror_ul[data-type=taskList]]:pl-0',
          '[&_.ProseMirror_li[data-type=taskItem]]:flex [&_.ProseMirror_li[data-type=taskItem]]:items-start [&_.ProseMirror_li[data-type=taskItem]]:gap-2',
          '[&_.ProseMirror_li[data-type=taskItem]>label]:flex [&_.ProseMirror_li[data-type=taskItem]>label]:gap-2',
          '[&_.ProseMirror_li[data-type=taskItem]>label>input]:mt-1',
          /* Blockquote */
          '[&_.ProseMirror_blockquote]:my-3 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[#006D77] [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-slate-500',
          /* Code */
          '[&_.ProseMirror_pre]:my-3 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:bg-slate-900 [&_.ProseMirror_pre]:px-5 [&_.ProseMirror_pre]:py-4 [&_.ProseMirror_pre]:text-slate-100',
          '[&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-slate-100 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:text-[0.85em] [&_.ProseMirror_code]:text-rose-600',
          '[&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:text-inherit [&_.ProseMirror_pre_code]:p-0',
          /* HR */
          '[&_.ProseMirror_hr]:my-5 [&_.ProseMirror_hr]:border-slate-200',
          /* Links */
          '[&_.ProseMirror_a]:text-[#006D77] [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2',
          /* Images */
          '[&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-md [&_.ProseMirror_img]:shadow-sm',
          /* Tables — no border-radius on cells, crisp 1 px borders */
          '[&_.ProseMirror_table]:my-4 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:text-sm',
          '[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-slate-300 [&_.ProseMirror_td]:px-3 [&_.ProseMirror_td]:py-2 [&_.ProseMirror_td]:align-top [&_.ProseMirror_td]:relative',
          '[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-slate-400 [&_.ProseMirror_th]:bg-slate-100 [&_.ProseMirror_th]:px-3 [&_.ProseMirror_th]:py-2 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-semibold [&_.ProseMirror_th]:text-slate-700 [&_.ProseMirror_th]:relative',
          '[&_.ProseMirror_.selectedCell]:bg-[#006D77]/8 [&_.ProseMirror_.selectedCell]:outline [&_.ProseMirror_.selectedCell]:outline-2 [&_.ProseMirror_.selectedCell]:outline-offset-[-2px] [&_.ProseMirror_.selectedCell]:outline-[#006D77]/50',
          '[&_.ProseMirror_.column-resize-handle]:absolute [&_.ProseMirror_.column-resize-handle]:right-[-2px] [&_.ProseMirror_.column-resize-handle]:top-0 [&_.ProseMirror_.column-resize-handle]:bottom-0 [&_.ProseMirror_.column-resize-handle]:z-10 [&_.ProseMirror_.column-resize-handle]:w-1 [&_.ProseMirror_.column-resize-handle]:cursor-col-resize [&_.ProseMirror_.column-resize-handle]:bg-[#006D77]',
          '[&_.ProseMirror.resize-cursor]:cursor-col-resize',
          '[&_.ProseMirror_.tableWrapper]:overflow-x-auto',
          /* Placeholder */
          '[&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0 [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-slate-400 [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]',
        ].join(' ')}
      />

      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        <span>Rich Text Editor</span>
        <span>{wordCount} words · {charCount} chars</span>
      </div>
    </div>
  );
}

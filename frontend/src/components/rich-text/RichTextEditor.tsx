'use client';

import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import { useState, type ReactNode } from 'react';
import type { UploadMedia } from '@/lib/admin/media';
import { isImageSrc } from '@/lib/images';
import { MediaSourceField } from '@/components/admin/MediaSourceField';
import { Button, TextInput } from '@/components/admin/ui';
import { CodeTabsExtension, DEFAULT_CODE_TABS } from './extensions/code-tabs/code-tabs';
import { safeHref, toDoc, type RichTextValue } from './types';

interface RichTextEditorProps {
  value: unknown;
  onChange: (doc: RichTextValue) => void;
  placeholder?: string;
  /** Accessible name for the editing area */
  label: string;
  /** Stores an image and resolves to its URL, for inserted images */
  onUpload: UploadMedia;
}

/** TipTap editor for any rich text field. Emits TipTap JSON; see docs/RichContent.md. */
export function RichTextEditor({ value, onChange, placeholder, label, onUpload }: RichTextEditorProps) {
  const editor = useEditor({
    // Rendered on the client only, so there is no server markup to hydrate
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] },
      }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
      CodeTabsExtension,
    ],
    content: toDoc(value),
    editorProps: {
      attributes: {
        class: 'prose min-h-40 max-w-none px-4 py-3 focus:outline-none',
        'aria-label': label,
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  return (
    <div className="rich-text-editor overflow-hidden rounded-card border border-border bg-surface focus-within:border-accent">
      {editor && <Toolbar editor={editor} onUpload={onUpload} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, onUpload }: { editor: Editor; onUpload: UploadMedia }) {
  const [imagePanelOpen, setImagePanelOpen] = useState(false);
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      link: e.isActive('link'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
    }),
  });

  const chain = () => editor.chain().focus();

  function toggleLink() {
    if (state.link) {
      chain().unsetLink().run();
      return;
    }
    const href = safeHref(window.prompt('Link URL (https://…, mailto:…, or /path)')?.trim());
    if (href) chain().extendMarkRange('link').setLink({ href }).run();
  }

  function insertImage(src: string, alt: string) {
    chain().setImage({ src, alt }).run();
    setImagePanelOpen(false);
  }

  return (
    <>
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5 border-b border-border bg-background px-2 py-1.5">
      <ToolButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <strong>B</strong>
      </ToolButton>
      <ToolButton label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <em>I</em>
      </ToolButton>
      <ToolButton label="Underline" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <span className="underline">U</span>
      </ToolButton>
      <ToolButton label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}>
        <s>S</s>
      </ToolButton>
      <ToolButton label="Inline code" active={state.code} onClick={() => chain().toggleCode().run()}>
        <span className="font-mono">{'<>'}</span>
      </ToolButton>
      <ToolButton label={state.link ? 'Remove link' : 'Add link'} active={state.link} onClick={toggleLink}>
        Link
      </ToolButton>
      <Divider />
      <ToolButton label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolButton>
      <ToolButton label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolButton>
      <ToolButton label="Bulleted list" active={state.bulletList} onClick={() => chain().toggleBulletList().run()}>
        • List
      </ToolButton>
      <ToolButton label="Numbered list" active={state.orderedList} onClick={() => chain().toggleOrderedList().run()}>
        1. List
      </ToolButton>
      <ToolButton label="Quote" active={state.blockquote} onClick={() => chain().toggleBlockquote().run()}>
        Quote
      </ToolButton>
      <Divider />
      <ToolButton label="Code block" active={state.codeBlock} onClick={() => chain().toggleCodeBlock().run()}>
        Code
      </ToolButton>
      <ToolButton
        label="Tabbed code"
        onClick={() => chain().insertContent({ type: 'codeTabs', attrs: { tabs: DEFAULT_CODE_TABS } }).run()}
      >
        Code tabs
      </ToolButton>
      <ToolButton label="Image" active={imagePanelOpen} onClick={() => setImagePanelOpen((open) => !open)}>
        Image
      </ToolButton>
      <ToolButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        ―
      </ToolButton>
    </div>
    {imagePanelOpen && (
      <ImageInsertPanel onUpload={onUpload} onInsert={insertImage} onCancel={() => setImagePanelOpen(false)} />
    )}
    </>
  );
}

/** Choose an image (upload by default, or URL) and its alt text, then insert it. */
function ImageInsertPanel({
  onUpload,
  onInsert,
  onCancel,
}: {
  onUpload: UploadMedia;
  onInsert: (src: string, alt: string) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');

  return (
    <div className="grid gap-3 border-b border-border bg-background px-4 py-3">
      <MediaSourceField label="Image" value={src} onChange={setSrc} onUpload={onUpload} />
      <TextInput
        aria-label="Image description"
        placeholder="Describe the image for screen readers (alt text)"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
      />
      <div className="flex gap-2">
        <Button variant="primary" disabled={!isImageSrc(src)} onClick={() => onInsert(src, alt.trim())}>
          Insert image
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

interface ToolButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}

function ToolButton({ label, active = false, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition-colors ${
        active ? 'bg-accent-soft text-foreground' : 'text-muted hover:bg-accent-soft hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 w-px self-stretch bg-border" />;
}

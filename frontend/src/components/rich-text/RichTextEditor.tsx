'use client';

import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { UploadMedia } from '@/lib/admin/media';
import { isImageSrc, isVideoSrc } from '@/lib/images';
import { MediaSourceField } from '@/components/admin/MediaSourceField';
import { Button, TextInput } from '@/components/admin/ui';
import { AlignedImage } from './extensions/aligned-image';
import { HighlightedCodeBlock } from './extensions/code-block/code-block';
import { CodeTabsExtension, DEFAULT_CODE_TABS } from './extensions/code-tabs/code-tabs';
import { ImageCarouselExtension } from './extensions/image-carousel/image-carousel';
import { VideoExtension } from './extensions/video';
import { useDraft } from './extensions/use-draft';
import { imageAlign, imageShowsCaption, isEmptyDoc, safeHref, toDoc, type ImageAlign, type RichTextValue } from './types';

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
  // The latest value, for the update handler the editor was created with
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  }, [value]);

  const editor = useEditor({
    // Rendered on the client only, so there is no server markup to hydrate
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // Replaced by HighlightedCodeBlock (language field + colors)
        codeBlock: false,
        link: { openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] },
      }),
      AlignedImage,
      HighlightedCodeBlock,
      Placeholder.configure({ placeholder: placeholder ?? 'Start writing…' }),
      CodeTabsExtension,
      // The node view uploads carousel images itself
      ImageCarouselExtension.configure({ onUpload }),
      VideoExtension,
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
    onUpdate: ({ editor: current }) => {
      const doc = current.getJSON();
      // An empty document opens as one empty paragraph; that isn't an edit, so a saved empty
      // field (e.g. a new topic) doesn't show as unsaved. Emptied fields are stored as no content
      // so they match one that was never written in.
      if (!isEmptyDoc(doc)) onChange(doc);
      else if (!isEmptyDoc(latest.current)) onChange({ type: 'doc', content: [] });
    },
  });

  return (
    // overflow-clip, not overflow-hidden: hidden would make this a scroll container and the
    // sticky toolbar would stick inside it instead of to the window
    <div className="rich-text-editor overflow-clip rounded-card border border-border bg-surface focus-within:border-accent">
      {editor && <Toolbar editor={editor} onUpload={onUpload} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor, onUpload }: { editor: Editor; onUpload: UploadMedia }) {
  // At most one insert panel is open at a time
  const [panel, setPanel] = useState<'image' | 'video'>();
  const togglePanel = (name: 'image' | 'video') => setPanel((open) => (open === name ? undefined : name));
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
      image: e.isActive('image'),
      imageAlign: imageAlign({ attrs: e.getAttributes('image') }),
      imageCaption: imageShowsCaption({ attrs: e.getAttributes('image') }),
      imageAlt: String(e.getAttributes('image').alt ?? ''),
      // Which image is selected, so the description box starts over on another image
      imagePos: e.state.selection.from,
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

  function insertImage(src: string, alt: string, align: ImageAlign, showCaption: boolean) {
    chain().insertContent({ type: 'image', attrs: { src, alt, align, showCaption } }).run();
    setPanel(undefined);
  }

  function insertVideo(src: string, title: string) {
    chain().insertContent({ type: 'video', attrs: { src, title } }).run();
    setPanel(undefined);
  }

  return (
    // The toolbar and the image panel stick to the top of the window together while scrolling
    // through a long write-up
    <div className="sticky top-0 z-10">
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
      <ToolButton label="Image" active={panel === 'image'} onClick={() => togglePanel('image')}>
        Image
      </ToolButton>
      <ToolButton label="Video" active={panel === 'video'} onClick={() => togglePanel('video')}>
        Video
      </ToolButton>
      <ToolButton
        label="Image carousel"
        onClick={() => chain().insertContent({ type: 'imageCarousel', attrs: { images: [] } }).run()}
      >
        Carousel
      </ToolButton>
      <ToolButton label="Divider" onClick={() => chain().setHorizontalRule().run()}>
        ―
      </ToolButton>
    </div>
    {state.image && (
      <ImageSettings
        key={state.imagePos}
        align={state.imageAlign}
        alt={state.imageAlt}
        showCaption={state.imageCaption}
        onAlign={(align) => chain().updateAttributes('image', { align }).run()}
        // Not chained through focus(), so typing stays in the description box
        onAlt={(alt) => editor.chain().updateAttributes('image', { alt }).run()}
        onShowCaption={(showCaption) => chain().updateAttributes('image', { showCaption }).run()}
      />
    )}
    {panel === 'image' && (
      <ImageInsertPanel onUpload={onUpload} onInsert={insertImage} onCancel={() => setPanel(undefined)} />
    )}
    {panel === 'video' && (
      <VideoInsertPanel onUpload={onUpload} onInsert={insertVideo} onCancel={() => setPanel(undefined)} />
    )}
    </div>
  );
}

/** Choose a video (upload by default, or URL; MP4 or WebM) and its description, then insert it. */
function VideoInsertPanel({
  onUpload,
  onInsert,
  onCancel,
}: {
  onUpload: UploadMedia;
  onInsert: (src: string, title: string) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState('');
  const [title, setTitle] = useState('');

  return (
    // Capped so a stuck panel never hides the write-up it's inserting into
    <div className="grid max-h-[60dvh] gap-3 overflow-y-auto border-b border-border bg-background px-4 py-3">
      <MediaSourceField label="Video" kind="video" value={src} onChange={setSrc} onUpload={onUpload} />
      <TextInput
        aria-label="Video description"
        placeholder="Describe the video for screen readers"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className="flex gap-2">
        <Button variant="primary" disabled={!isVideoSrc(src)} onClick={() => onInsert(src, title.trim())}>
          Insert video
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

const IMAGE_ALIGNS: { value: ImageAlign; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];

/** The selected image's settings, on their own row under the toolbar. */
function ImageSettings({
  align,
  alt,
  showCaption,
  onAlign,
  onAlt,
  onShowCaption,
}: {
  align: ImageAlign;
  alt: string;
  showCaption: boolean;
  onAlign: (align: ImageAlign) => void;
  onAlt: (alt: string) => void;
  onShowCaption: (showCaption: boolean) => void;
}) {
  const [draft, setDraft] = useDraft(alt, onAlt);

  return (
    <div
      role="group"
      aria-label="Selected image"
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border bg-background px-2 py-1.5 text-sm"
    >
      <span className="px-1 text-muted">Image</span>
      <div className="flex gap-0.5">
        {IMAGE_ALIGNS.map(({ value, label }) => (
          <ToolButton key={value} label={`Align image ${value}`} active={align === value} onClick={() => onAlign(value)}>
            {label}
          </ToolButton>
        ))}
      </div>
      <TextInput
        aria-label="Image description"
        placeholder="Description (alt text)"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        className="min-w-48 flex-1 py-1"
      />
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={showCaption}
          onChange={(event) => onShowCaption(event.target.checked)}
          className="accent-accent"
        />
        Show description under the image
      </label>
    </div>
  );
}

/** Choose an image (upload by default, or URL), its alt text, alignment and caption, then insert it. */
function ImageInsertPanel({
  onUpload,
  onInsert,
  onCancel,
}: {
  onUpload: UploadMedia;
  onInsert: (src: string, alt: string, align: ImageAlign, showCaption: boolean) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState('');
  const [alt, setAlt] = useState('');
  const [align, setAlign] = useState<ImageAlign>('left');
  const [showCaption, setShowCaption] = useState(false);

  return (
    // Capped so a stuck panel never hides the write-up it's inserting into
    <div className="grid max-h-[60dvh] gap-3 overflow-y-auto border-b border-border bg-background px-4 py-3">
      <MediaSourceField label="Image" value={src} onChange={setSrc} onUpload={onUpload} />
      <TextInput
        aria-label="Image description"
        placeholder="Describe the image for screen readers (alt text)"
        value={alt}
        onChange={(event) => setAlt(event.target.value)}
      />
      <fieldset className="flex items-center gap-4 text-sm">
        <legend className="sr-only">Alignment</legend>
        <span aria-hidden="true" className="text-muted">
          Alignment
        </span>
        {IMAGE_ALIGNS.map(({ value, label }) => (
          <label key={value} className="flex items-center gap-1.5">
            <input
              type="radio"
              name="image-align"
              value={value}
              checked={align === value}
              onChange={() => setAlign(value)}
              className="accent-accent"
            />
            {label}
          </label>
        ))}
      </fieldset>
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          checked={showCaption}
          onChange={(event) => setShowCaption(event.target.checked)}
          className="accent-accent"
        />
        Show the description under the image
      </label>
      <div className="flex gap-2">
        <Button
          variant="primary"
          disabled={!isImageSrc(src)}
          onClick={() => onInsert(src, alt.trim(), align, showCaption)}
        >
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

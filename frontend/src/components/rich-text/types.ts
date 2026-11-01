/** Minimal TipTap JSON shapes. Stored documents are untrusted: always narrow with the guards. */
export interface RichTextMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  text?: string;
  marks?: RichTextMark[];
}

export interface CodeTab {
  label: string;
  language: string;
  code: string;
}

/** The value API DTOs use for rich text fields. */
export type RichTextValue = { [key: string]: unknown };

export const EMPTY_DOC: RichTextNode = { type: 'doc', content: [] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isRichTextNode(value: unknown): value is RichTextNode {
  return isRecord(value) && typeof value.type === 'string';
}

/** The document's top-level node, or an empty doc when the value isn't a document. */
export function toDoc(value: unknown): RichTextNode {
  return isRichTextNode(value) && value.type === 'doc' ? value : EMPTY_DOC;
}

export function childrenOf(node: RichTextNode): RichTextNode[] {
  return Array.isArray(node.content) ? node.content.filter(isRichTextNode) : [];
}

export function stringAttr(node: { attrs?: Record<string, unknown> }, name: string): string | undefined {
  const value = node.attrs?.[name];
  return typeof value === 'string' ? value : undefined;
}

export function numberAttr(node: { attrs?: Record<string, unknown> }, name: string): number | undefined {
  const value = node.attrs?.[name];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function codeTabsOf(node: RichTextNode): CodeTab[] {
  const tabs = node.attrs?.tabs;
  if (!Array.isArray(tabs)) return [];
  return tabs.filter(isRecord).map((tab) => ({
    label: typeof tab.label === 'string' ? tab.label : 'Untitled',
    language: typeof tab.language === 'string' ? tab.language : 'text',
    code: typeof tab.code === 'string' ? tab.code : '',
  }));
}

/** True when the document has no visible content, so sections can be hidden. */
export function isEmptyDoc(value: unknown): boolean {
  const doc = toDoc(value);
  const children = childrenOf(doc);
  return (
    children.length === 0 ||
    children.every((child) => child.type === 'paragraph' && childrenOf(child).length === 0)
  );
}

/** Links may only point to http(s), mailto, or same-site paths. */
export function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  if (/^(https?:|mailto:)/i.test(href) || href.startsWith('/') || href.startsWith('#')) return href;
  return undefined;
}

/** Where an image sits in the text column. Images saved before alignment existed are left-aligned. */
export type ImageAlign = 'left' | 'center';

export function imageAlign(node: { attrs?: Record<string, unknown> }): ImageAlign {
  return node.attrs?.align === 'center' ? 'center' : 'left';
}

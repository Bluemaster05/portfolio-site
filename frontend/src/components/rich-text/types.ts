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
  const topics = topicsOf(value);
  if (topics) return topics.every((topic) => isEmptyDoc(topic.doc));
  const children = childrenOf(toDoc(value));
  return (
    children.length === 0 ||
    children.every((child) => child.type === 'paragraph' && childrenOf(child).length === 0)
  );
}

/** One titled part of a write-up split into topics; `doc` is a plain document. */
export interface Topic {
  title: string;
  doc: RichTextNode;
}

/**
 * A write-up's topics, or undefined for a plain document. Topics are top-level `topic` nodes
 * (`{ type: 'topic', attrs: { title }, content }`); a write-up only has them when there are two or
 * more, and then they're shown as tabs. Anything else at the top level is ignored.
 */
export function topicsOf(value: unknown): Topic[] | undefined {
  const topics = childrenOf(toDoc(value)).filter((child) => child.type === 'topic');
  if (topics.length === 0) return undefined;
  return topics.map((topic) => ({
    title: stringAttr(topic, 'title') ?? '',
    doc: { type: 'doc', content: childrenOf(topic) },
  }));
}

/** The document for these topics; a single topic becomes a plain document (its title is dropped). */
export function docFromTopics(topics: Topic[]): RichTextValue {
  if (topics.length === 1) return { ...toDoc(topics[0].doc) };
  return {
    type: 'doc',
    content: topics.map((topic) => ({
      type: 'topic',
      attrs: { title: topic.title },
      content: childrenOf(toDoc(topic.doc)),
    })),
  };
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

/** Whether an image node shows its alt text as a caption below it (off for older images). */
export function imageShowsCaption(node: { attrs?: Record<string, unknown> }): boolean {
  return node.attrs?.showCaption === true;
}

/** Whether an image node has a thin outline, e.g. so a screenshot stands apart from the page (off for older images). */
export function imageHasBorder(node: { attrs?: Record<string, unknown> }): boolean {
  return node.attrs?.border === true;
}

/** One image in an imageCarousel block. */
export interface CarouselImageAttr {
  src: string;
  alt: string;
}

/** Whether an imageCarousel shows the selected image's alt text below it (on for older carousels). */
export function carouselShowsCaptions(node: { attrs?: Record<string, unknown> }): boolean {
  return node.attrs?.showCaptions !== false;
}

/** The images of an imageCarousel node, skipping malformed entries. */
export function carouselImagesOf(node: { attrs?: Record<string, unknown> }): CarouselImageAttr[] {
  const images = node.attrs?.images;
  if (!Array.isArray(images)) return [];
  return images
    .filter(isRecord)
    .flatMap((image) =>
      typeof image.src === 'string' ? [{ src: image.src, alt: typeof image.alt === 'string' ? image.alt : '' }] : [],
    );
}

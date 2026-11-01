import type { RichTextValue } from '@/components/rich-text/types';

/** An image or video with its description, as the API's MediaItemDto. */
export interface MediaItem {
  kind: 'image' | 'video';
  url: string;
  alt?: string;
  /** Marked as the main image or main video */
  main?: boolean;
}

/** Values held by the generic content form, keyed by field name. */
export type FormValue = string | boolean | string[] | number[] | MediaItem[] | RichTextValue;
export type FormValues = Record<string, FormValue>;

export function text(values: FormValues, name: string): string {
  const value = values[name];
  return typeof value === 'string' ? value.trim() : '';
}

export function bool(values: FormValues, name: string): boolean {
  return values[name] === true;
}

export function list(values: FormValues, name: string): string[] {
  const value = values[name];
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

/** Numeric ids, e.g. selected technologies, in order. */
export function ids(values: FormValues, name: string): number[] {
  const value = values[name];
  return Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : [];
}

export function isMediaItem(item: unknown): item is MediaItem {
  return typeof item === 'object' && item !== null && 'url' in item && 'kind' in item;
}

export function mediaItems(values: FormValues, name: string): MediaItem[] {
  const value = values[name];
  if (!Array.isArray(value)) return [];
  return value
    .filter(isMediaItem)
    .map((item) => ({ kind: item.kind, url: item.url, alt: item.alt?.trim() ?? '', main: item.main === true }));
}

export function richText(values: FormValues, name: string): RichTextValue {
  const value = values[name];
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : { type: 'doc', content: [] };
}

/** Optional strings travel as '' when empty, which the API stores as "no value". */
export function optional(value: string | undefined | null): string {
  return value ?? '';
}

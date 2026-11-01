import type { RichTextValue } from '@/components/rich-text/types';

/** Values held by the generic content form, keyed by field name. */
export type FormValue = string | boolean | string[] | RichTextValue;
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
  return Array.isArray(value) ? value : [];
}

export function richText(values: FormValues, name: string): RichTextValue {
  const value = values[name];
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value
    : { type: 'doc', content: [] };
}

/** Optional strings travel as '' when empty, which the API stores as "no value". */
export function optional(value: string | undefined | null): string {
  return value ?? '';
}

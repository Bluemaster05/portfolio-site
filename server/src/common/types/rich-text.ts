/** A TipTap JSON document. Stored as-is; the frontend renderer only knows a fixed set of nodes. */
export type RichTextDoc = { type: 'doc'; content?: unknown[] } & Record<string, unknown>;

export const MAX_RICH_TEXT_BYTES = 512 * 1024;

export const emptyDoc = (): RichTextDoc => ({ type: 'doc', content: [] });

export function isRichTextDoc(value: unknown): value is RichTextDoc {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  if (!('type' in value) || value.type !== 'doc') return false;
  if ('content' in value && value.content !== undefined && !Array.isArray(value.content)) {
    return false;
  }
  return Buffer.byteLength(JSON.stringify(value), 'utf8') <= MAX_RICH_TEXT_BYTES;
}

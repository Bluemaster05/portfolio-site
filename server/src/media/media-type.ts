export type MediaKind = 'image' | 'video';

export interface MediaType {
  kind: MediaKind;
  mimeType: string;
  extension: string;
}

export const MEDIA_TYPES_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

export const VIDEO_EXTENSIONS = ['mp4', 'webm'];
export const IMAGE_EXTENSIONS = Object.keys(MEDIA_TYPES_BY_EXTENSION).filter(
  (extension) => !VIDEO_EXTENSIONS.includes(extension),
);

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function ascii(buffer: Buffer, start: number, end: number): string {
  return buffer.subarray(start, end).toString('latin1');
}

/**
 * Identifies an image or video from its contents rather than the client-supplied name or MIME
 * type. Video signatures sit in the first bytes, so for large files the head is enough.
 * Returns undefined for anything that isn't supported.
 */
export function detectMediaType(buffer: Buffer): MediaType | undefined {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { kind: 'image', mimeType: 'image/png', extension: 'png' };
  }
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { kind: 'image', mimeType: 'image/jpeg', extension: 'jpg' };
  if (['GIF87a', 'GIF89a'].includes(ascii(buffer, 0, 6))) {
    return { kind: 'image', mimeType: 'image/gif', extension: 'gif' };
  }
  if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') {
    return { kind: 'image', mimeType: 'image/webp', extension: 'webp' };
  }
  if (ascii(buffer, 4, 8) === 'ftyp') {
    const brand = ascii(buffer, 8, 12);
    if (brand === 'avif' || brand === 'avis') return { kind: 'image', mimeType: 'image/avif', extension: 'avif' };
    // QuickTime (.mov) isn't reliably playable in browsers; everything else in this family is MP4
    if (brand === 'qt  ') return undefined;
    return { kind: 'video', mimeType: 'video/mp4', extension: 'mp4' };
  }
  if (startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])) return { kind: 'video', mimeType: 'video/webm', extension: 'webm' };
  if (isSvg(buffer)) return { kind: 'image', mimeType: 'image/svg+xml', extension: 'svg' };
  return undefined;
}

/**
 * SVG is text, so it is checked by shape. Files with scripts or event handlers are refused even
 * though uploads are only ever shown through <img> and served with a sandboxing CSP.
 */
function isSvg(buffer: Buffer): boolean {
  const text = buffer.toString('utf8').replace(/^﻿/, '').trimStart();
  if (!/^(<\?xml|<svg|<!--|<!DOCTYPE svg)/i.test(text) || !/<svg[\s>]/i.test(text)) return false;
  return !/<script|javascript:|\son[a-z]+\s*=|<foreignObject/i.test(text);
}

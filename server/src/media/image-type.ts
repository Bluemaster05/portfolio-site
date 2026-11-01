export interface ImageType {
  mimeType: string;
  extension: string;
}

export const IMAGE_TYPES_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
};

function startsWith(buffer: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((byte, index) => buffer[offset + index] === byte);
}

function ascii(buffer: Buffer, start: number, end: number): string {
  return buffer.subarray(start, end).toString('latin1');
}

/**
 * Identifies an image from its contents rather than the client-supplied name or MIME type.
 * Returns undefined for anything that isn't a supported image.
 */
export function detectImageType(buffer: Buffer): ImageType | undefined {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mimeType: 'image/png', extension: 'png' };
  }
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { mimeType: 'image/jpeg', extension: 'jpg' };
  if (['GIF87a', 'GIF89a'].includes(ascii(buffer, 0, 6))) return { mimeType: 'image/gif', extension: 'gif' };
  if (ascii(buffer, 0, 4) === 'RIFF' && ascii(buffer, 8, 12) === 'WEBP') {
    return { mimeType: 'image/webp', extension: 'webp' };
  }
  if (ascii(buffer, 4, 8) === 'ftyp' && ['avif', 'avis'].includes(ascii(buffer, 8, 12))) {
    return { mimeType: 'image/avif', extension: 'avif' };
  }
  if (isSvg(buffer)) return { mimeType: 'image/svg+xml', extension: 'svg' };
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

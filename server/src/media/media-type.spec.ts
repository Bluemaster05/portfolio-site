import { detectMediaType } from './media-type.js';

function ftyp(brand: string): Buffer {
  return Buffer.concat([Buffer.from([0, 0, 0, 0x20]), Buffer.from(`ftyp${brand}`, 'latin1'), Buffer.alloc(8)]);
}

describe('detectMediaType', () => {
  it('recognises raster images by their signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    expect(detectMediaType(png)?.extension).toBe('png');
    expect(detectMediaType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))?.extension).toBe('jpg');
    expect(detectMediaType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'latin1'))?.extension).toBe('webp');
    expect(detectMediaType(ftyp('avif'))).toMatchObject({ kind: 'image', extension: 'avif' });
  });

  it('accepts plain SVG icons', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>');
    expect(detectMediaType(svg)?.mimeType).toBe('image/svg+xml');
  });

  it('recognises MP4 and WebM video, and refuses QuickTime', () => {
    expect(detectMediaType(ftyp('isom'))).toMatchObject({ kind: 'video', extension: 'mp4' });
    expect(detectMediaType(ftyp('mp42'))).toMatchObject({ kind: 'video', extension: 'mp4' });
    expect(detectMediaType(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f])))
      .toMatchObject({ kind: 'video', extension: 'webm' });
    expect(detectMediaType(ftyp('qt  '))).toBeUndefined();
  });

  it('refuses scripted SVG and other files', () => {
    expect(detectMediaType(Buffer.from('<svg><script>alert(1)</script></svg>'))).toBeUndefined();
    expect(detectMediaType(Buffer.from('<svg onload="alert(1)"></svg>'))).toBeUndefined();
    expect(detectMediaType(Buffer.from('%PDF-1.7'))).toBeUndefined();
    expect(detectMediaType(Buffer.from('<html><body></body></html>'))).toBeUndefined();
  });
});

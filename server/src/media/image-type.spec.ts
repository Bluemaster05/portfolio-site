import { detectImageType } from './image-type.js';

describe('detectImageType', () => {
  it('recognises raster images by their signature', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    expect(detectImageType(png)?.extension).toBe('png');
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))?.extension).toBe('jpg');
    expect(detectImageType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'latin1'))?.extension).toBe('webp');
  });

  it('accepts plain SVG icons', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><path d="M0 0h1v1z"/></svg>');
    expect(detectImageType(svg)?.mimeType).toBe('image/svg+xml');
  });

  it('refuses scripted SVG and non-images', () => {
    expect(detectImageType(Buffer.from('<svg><script>alert(1)</script></svg>'))).toBeUndefined();
    expect(detectImageType(Buffer.from('<svg onload="alert(1)"></svg>'))).toBeUndefined();
    expect(detectImageType(Buffer.from('%PDF-1.7'))).toBeUndefined();
    expect(detectImageType(Buffer.from('<html><body></body></html>'))).toBeUndefined();
  });
});

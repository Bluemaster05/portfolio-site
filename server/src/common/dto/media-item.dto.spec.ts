import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { HasOneMainPerKind, MediaItemDto } from './media-item.dto.js';

const errorsFor = (item: object) => validateSync(plainToInstance(MediaItemDto, item)).map((error) => error.property);

describe('MediaItemDto', () => {
  const image = '/media/3d9c8b19-6fc8-4e5f-88c4-ed787419ecfc.png';
  const video = '/media/2e2ebc31-750b-4b1a-92e6-0af489db3279.mp4';

  it('accepts uploads that match their kind, and external URLs for either', () => {
    expect(errorsFor({ kind: 'image', url: image })).toEqual([]);
    expect(errorsFor({ kind: 'video', url: video })).toEqual([]);
    expect(errorsFor({ kind: 'video', url: 'https://example.com/clip.mp4' })).toEqual([]);
  });

  it('allows one main image and one main video, not two of a kind', () => {
    class List {
      @HasOneMainPerKind()
      media!: object[];
    }
    const list = (media: object[]) => validateSync(Object.assign(new List(), { media })).length;
    expect(list([{ kind: 'image', main: true }, { kind: 'video', main: true }, { kind: 'image' }])).toBe(0);
    expect(list([{ kind: 'image', main: true }, { kind: 'image', main: true }])).toBe(1);
  });

  it('refuses an upload of the other kind, unknown kinds, and unsafe URLs', () => {
    expect(errorsFor({ kind: 'image', url: video })).toEqual(['url']);
    expect(errorsFor({ kind: 'video', url: image })).toEqual(['url']);
    expect(errorsFor({ kind: 'audio', url: image })).toContain('kind');
    expect(errorsFor({ kind: 'image', url: 'javascript:alert(1)' })).toEqual(['url']);
  });
});

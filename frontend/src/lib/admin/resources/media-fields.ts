import type { components } from '@/lib/api/schema';
import { mediaItems, text, type FormValues } from '../form-values';
import type { FieldConfig } from './resource';

type MediaLayout = components['schemas']['ProjectMediaLayout'];
type MediaItemBody = components['schemas']['MediaItemDto'];

export const MEDIA_LAYOUTS: { value: MediaLayout; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'single', label: 'Single header (one image or video)' },
  { value: 'gallery', label: 'Gallery' },
];

export function mediaLayoutOf(values: FormValues): MediaLayout {
  const value = text(values, 'mediaLayout');
  return MEDIA_LAYOUTS.find((layout) => layout.value === value)?.value ?? 'none';
}

/**
 * The "Images & videos" tab used by projects and honors: a layout select and one ordered list
 * of images and videos with a main image and main video. `noun` names the content ("project");
 * `cover` says where its main image is used ("the cover on cards and the home page").
 */
export function mediaFields(noun: string, cover: string): FieldConfig[] {
  return [
    { name: 'mediaLayout', label: 'Layout', kind: 'select', options: MEDIA_LAYOUTS, tab: 'Images & videos' },
    {
      name: 'media',
      label: `${noun[0].toUpperCase()}${noun.slice(1)} images & videos`,
      kind: 'media',
      tab: 'Images & videos',
      visibleWhen: (values) => mediaLayoutOf(values) !== 'none',
      maxItemsFor: (values) => (mediaLayoutOf(values) === 'single' ? 1 : undefined),
      helpFor: (values) =>
        mediaLayoutOf(values) === 'single'
          ? `One image or video, shown as a header on the ${noun}’s page. If it is an image it is also ${cover}.`
          : `Tiles follow this order. The main video (or the main image if there is no video) is shown large first; the main image is ${cover}.`,
    },
  ];
}

/** The layout and media for a create/update body; a single header keeps only its first item. */
export function mediaBody(values: FormValues): { mediaLayout: MediaLayout; media: MediaItemBody[] } {
  const layout = mediaLayoutOf(values);
  const media = mediaItems(values, 'media');
  return { mediaLayout: layout, media: layout === 'single' ? media.slice(0, 1) : media };
}

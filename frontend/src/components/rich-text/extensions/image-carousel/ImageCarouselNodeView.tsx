'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { useState } from 'react';
import { MediaListField } from '@/components/admin/MediaListField';
import type { MediaItem } from '@/lib/admin/form-values';
import { carouselImagesOf, carouselShowsCaptions, type CarouselImageAttr } from '../../types';
import { useDraft } from '../use-draft';
import type { ImageCarouselOptions } from './image-carousel';

const toItems = (images: CarouselImageAttr[]): MediaItem[] =>
  images.map(({ src, alt }) => ({ kind: 'image', url: src, alt }));
const toImages = (items: MediaItem[]): CarouselImageAttr[] =>
  items.map(({ url, alt }) => ({ src: url, alt: alt ?? '' }));

/** Thumbnails shown in the compact view before the rest are summarised as "+N". */
const PREVIEW_COUNT = 6;

/**
 * Editing UI for an imageCarousel block. Compact by default (thumbnails and a count) so it doesn't
 * take over the write-up; Edit opens the list to add (upload or URL), describe, reorder, and remove.
 * "Show descriptions" toggles the alt text under the public carousel (full size always shows it).
 */
export function ImageCarouselNodeView({ node, updateAttributes, deleteNode, selected, extension }: ReactNodeViewProps) {
  const { onUpload } = extension.options as ImageCarouselOptions;
  // A local copy, so typing alt text doesn't jump the caret (see useDraft)
  const [items, setItems] = useDraft(toItems(carouselImagesOf(node)), (next) =>
    updateAttributes({ images: toImages(next) }),
  );
  // A new, empty carousel opens ready to add images
  const [editing, setEditing] = useState(items.length === 0);
  const hidden = items.length - PREVIEW_COUNT;

  return (
    <NodeViewWrapper
      className={`not-prose my-4 grid gap-3 rounded-card border bg-surface p-3 ${selected ? 'border-accent' : 'border-border'}`}
      contentEditable={false}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium">Image carousel</p>
        <p className="text-sm text-muted">
          {items.length === 0 ? 'No images yet' : `${items.length} image${items.length === 1 ? '' : 's'}`}
        </p>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={carouselShowsCaptions(node)}
              onChange={(event) => updateAttributes({ showCaptions: event.target.checked })}
              className="accent-accent"
            />
            Show descriptions
          </label>
          <button
            type="button"
            aria-expanded={editing}
            onClick={() => setEditing((open) => !open)}
            className="text-sm font-medium text-accent hover:underline"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
          <button type="button" onClick={deleteNode} className="text-sm text-muted hover:text-red-600">
            Remove carousel
          </button>
        </div>
      </div>

      {editing ? (
        <>
          {onUpload ? (
            <MediaListField label="Carousel images" imagesOnly value={items} onChange={setItems} onUpload={onUpload} />
          ) : (
            <p className="text-sm text-muted">Uploading isn’t available here.</p>
          )}
          <p className="text-xs text-muted">
            Shown one at a time with arrows, the current image centered between faded neighbours. The order here is the
            carousel order.
          </p>
        </>
      ) : (
        items.length > 0 && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Edit carousel images"
            className="flex flex-wrap items-center gap-2 text-left"
          >
            {items.slice(0, PREVIEW_COUNT).map((item, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${item.url}-${index}`}
                src={item.url}
                alt=""
                className="h-12 w-16 rounded border border-border bg-background object-cover"
              />
            ))}
            {hidden > 0 && <span className="text-sm text-muted">+{hidden} more</span>}
          </button>
        )
      )}
    </NodeViewWrapper>
  );
}

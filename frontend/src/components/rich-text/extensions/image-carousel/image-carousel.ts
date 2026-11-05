import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { UploadMedia } from '@/lib/admin/media';
import { ImageCarouselNodeView } from './ImageCarouselNodeView';

export interface ImageCarouselOptions {
  /** Stores an image and resolves to its URL; set by the editor so the node view can upload */
  onUpload?: UploadMedia;
}

/**
 * Images shown one at a time with arrows. Stored as
 * `{ type: 'imageCarousel', attrs: { images: { src, alt }[], showCaptions } }` and rendered on the public site by
 * RichTextRenderer as an ImageCarousel (see docs/RichContent.md).
 */
export const ImageCarouselExtension = Node.create<ImageCarouselOptions>({
  name: 'imageCarousel',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { onUpload: undefined };
  },

  addAttributes() {
    return {
      images: {
        default: [],
        // Kept in a data attribute so copy/paste between editors round-trips
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute('data-images') ?? '[]');
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({ 'data-images': JSON.stringify(attributes.images) }),
      },
      showCaptions: {
        default: true,
        parseHTML: (element) => !element.hasAttribute('data-no-captions'),
        renderHTML: (attributes) => (attributes.showCaptions === false ? { 'data-no-captions': '' } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-image-carousel]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-image-carousel': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageCarouselNodeView);
  },
});

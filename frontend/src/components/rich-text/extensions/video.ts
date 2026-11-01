import { mergeAttributes, Node } from '@tiptap/core';

/**
 * A video in a write-up. Stored as `{ type: 'video', attrs: { src, title } }` (an upload or an
 * http(s) MP4/WebM; `title` describes it for screen readers) and rendered on the public site by
 * RichTextRenderer with controls, showing its first frame until played (see docs/RichContent.md).
 */
export const VideoExtension = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'video[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'video',
      mergeAttributes(HTMLAttributes, { controls: '', preload: 'metadata', playsinline: '', 'aria-label': HTMLAttributes.title }),
    ];
  },
});

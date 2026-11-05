import Image from '@tiptap/extension-image';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { imageAlign, imageHasBorder, imageShowsCaption } from '../types';

/**
 * The stock image node plus an `align` attr ('left' | 'center'), shown as data-align so the editor
 * and the public renderer share the `.prose img[data-align]` styles, a `showCaption` flag that
 * puts the alt text under the image on the public site (and in the editor, via the node view), and
 * a `border` flag shown as data-border (`.prose img[data-border]`).
 */
export const AlignedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
        parseHTML: (element) => imageAlign({ attrs: { align: element.getAttribute('data-align') } }),
        renderHTML: (attributes) => ({ 'data-align': imageAlign({ attrs: attributes }) }),
      },
      showCaption: {
        default: false,
        parseHTML: (element) => element.hasAttribute('data-caption'),
        renderHTML: (attributes) => (attributes.showCaption === true ? { 'data-caption': '' } : {}),
      },
      border: {
        default: false,
        parseHTML: (element) => element.hasAttribute('data-border'),
        renderHTML: (attributes) => (attributes.border === true ? { 'data-border': '' } : {}),
      },
    };
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('div');
      dom.className = 'editor-image';
      const img = document.createElement('img');
      const caption = document.createElement('p');
      caption.className = 'editor-image-caption';
      dom.append(img, caption);

      const render = (current: ProseMirrorNode) => {
        const alt = typeof current.attrs.alt === 'string' ? current.attrs.alt : '';
        const align = imageAlign(current);
        img.src = typeof current.attrs.src === 'string' ? current.attrs.src : '';
        img.alt = alt;
        img.dataset.align = align;
        img.toggleAttribute('data-border', imageHasBorder(current));
        caption.dataset.align = align;
        caption.textContent = alt;
        caption.hidden = !(imageShowsCaption(current) && alt);
      };
      render(node);

      return {
        dom,
        update: (updated) => {
          if (updated.type !== node.type) return false;
          render(updated);
          return true;
        },
      };
    };
  },
});

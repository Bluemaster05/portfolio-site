import Image from '@tiptap/extension-image';
import { imageAlign } from '../types';

/**
 * The stock image node plus an `align` attr ('left' | 'center'), shown as data-align so the editor
 * and the public renderer share the `.prose img[data-align]` styles, and a `showCaption` flag that
 * puts the alt text under the image on the public site.
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
    };
  },
});

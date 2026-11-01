import Image from '@tiptap/extension-image';
import { imageAlign } from '../types';

/**
 * The stock image node plus an `align` attr ('left' | 'center'), shown as data-align so the editor
 * and the public renderer share the `.prose img[data-align]` styles.
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
    };
  },
});

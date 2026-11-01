import { isRichTextDoc } from './rich-text.js';

describe('isRichTextDoc', () => {
  it('accepts a TipTap document', () => {
    expect(isRichTextDoc({ type: 'doc', content: [] })).toBe(true);
  });

  it('rejects other values', () => {
    expect(isRichTextDoc('<p>hi</p>')).toBe(false);
    expect(isRichTextDoc({ type: 'paragraph' })).toBe(false);
    expect(isRichTextDoc({ type: 'doc', content: 'nope' })).toBe(false);
  });
});

import { slugify } from './slugify.js';

describe('slugify', () => {
  it('lowercases and joins words with dashes', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('strips accents and trims dashes', () => {
    expect(slugify('  Café Über  ')).toBe('cafe-uber');
  });
});

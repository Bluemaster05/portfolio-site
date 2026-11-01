import { slugify } from '../common/utils/slugify.js';

/**
 * Slug for a technology name. Symbols that distinguish technologies are spelled out first, so
 * "C", "C#" and "C++" don't all become "c": c, c-sharp, c-plus-plus; ".NET" → dot-net.
 */
export function technologySlug(name: string): string {
  return slugify(
    name
      .replace(/#/g, ' sharp ')
      .replace(/\+/g, ' plus ')
      .replace(/(^|\s)\.(?=\w)/g, '$1dot '),
  );
}

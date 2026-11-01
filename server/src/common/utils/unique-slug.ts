import { FlushMode, type EntityName, type FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { slugify } from './slugify.js';

/**
 * slugify(text), with -2, -3… added if another row of the entity already uses it. `self` is the
 * row being saved (so it doesn't clash with its own slug); `fallback` is used when text has no
 * letters or digits.
 */
export async function uniqueSlug<T extends { slug: string }>(
  em: EntityManager,
  entity: EntityName<T>,
  text: string,
  self: T,
  fallback: string,
): Promise<string> {
  const base = slugify(text).slice(0, 110) || fallback;
  // COMMIT: don't auto-flush the row being created, which has no slug yet
  const others = await em.find(entity, { slug: { $like: `${base}%` } } as FilterQuery<T>, {
    flushMode: FlushMode.COMMIT,
  });
  const taken = new Set(others.filter((other) => other !== self).map((other) => other.slug));
  let slug = base;
  for (let suffix = 2; taken.has(slug); suffix++) slug = `${base}-${suffix}`;
  return slug;
}

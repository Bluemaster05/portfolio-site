import { FlushMode, type EntityName, type FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';

/**
 * For content where only one item can be featured: when `item` is featured, every other featured
 * row of the entity is unfeatured (saved with the same flush).
 */
export async function featureOnly<T extends { featured: boolean }>(
  em: Pick<EntityManager, 'find'>,
  entity: EntityName<T>,
  item: T,
): Promise<void> {
  if (!item.featured) return;
  // COMMIT: don't auto-flush the item being created before it's complete
  const others = await em.find(entity, { featured: true } as FilterQuery<T>, { flushMode: FlushMode.COMMIT });
  for (const other of others) {
    if (other !== item) other.featured = false;
  }
}

import { wrap, type AnyEntity } from '@mikro-orm/core';

/** The entity as a plain object without one heavy field (e.g. the rich text body for lists). */
export function toSummary<T extends AnyEntity, K extends keyof T>(entity: T, omit: K): Omit<T, K> {
  const plain = { ...wrap(entity).toObject() } as Record<string, unknown>;
  delete plain[omit as string];
  return plain as Omit<T, K>;
}

import { FlushMode } from '@mikro-orm/core';
import type { EntityManager } from '@mikro-orm/postgresql';
import { featureOnly } from './feature-only.js';

class Item {
  constructor(
    public id: number,
    public featured: boolean,
  ) {}
}

/** Stands in for the entity manager: find() returns the currently featured rows. */
function fakeEm(rows: Item[]) {
  const find = vi.fn(async () => rows.filter((row) => row.featured));
  const em: Pick<EntityManager, 'find'> = { find: find as unknown as EntityManager['find'] };
  return { em, find };
}

describe('featureOnly', () => {
  it('unfeatures every other featured row when the item is featured', async () => {
    const item = new Item(3, true);
    const others = [new Item(1, true), new Item(2, false)];
    const { em, find } = fakeEm([...others, item]);

    await featureOnly(em, Item, item);

    expect(item.featured).toBe(true);
    expect(others.map((other) => other.featured)).toEqual([false, false]);
    // Must not auto-flush a half-built new item
    expect(find).toHaveBeenCalledWith(Item, { featured: true }, { flushMode: FlushMode.COMMIT });
  });

  it('leaves others alone when the item is not featured', async () => {
    const other = new Item(1, true);
    const { em, find } = fakeEm([other]);

    await featureOnly(em, Item, new Item(2, false));

    expect(other.featured).toBe(true);
    expect(find).not.toHaveBeenCalled();
  });
});

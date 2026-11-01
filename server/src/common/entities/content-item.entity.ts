import { type Opt } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

/** Shared columns for every orderable, publishable item shown on the public site. */
export abstract class ContentItem {
  @PrimaryKey()
  id!: number;

  /** Hidden from the public site until true */
  @Property()
  published: boolean & Opt = false;

  /** Lower numbers are shown first */
  @Property()
  sortOrder: number & Opt = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

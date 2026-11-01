import { type Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';

/** A language, framework, or tool that projects can be tagged with and filtered by. */
@Entity()
export class Technology {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 60 })
  name!: string;

  /** URL-safe name, used in the project filter (`/projects?tech=<slug>`) */
  @Unique()
  @Property({ length: 80 })
  slug!: string;

  /** Small icon shown in the technology pill: an upload or an http(s) image URL */
  @Property({ length: 2048, nullable: true })
  iconUrl?: string;

  /** Optional link to the technology's own site */
  @Property({ length: 2048, nullable: true })
  url?: string;

  /** Lower numbers are listed first in the admin and in the project filter */
  @Property()
  sortOrder: number & Opt = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

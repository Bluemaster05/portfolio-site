import { type Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';

/** A company or organization; each experience entry (job) belongs to one. */
@Entity()
export class Employer {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 200 })
  name!: string;

  /** The employer's website */
  @Property({ length: 2048, nullable: true })
  url?: string;

  /** Small logo shown on the experience page: an upload or an http(s) image URL */
  @Property({ length: 2048, nullable: true })
  logoUrl?: string;

  /** Lower numbers are listed first; ties go to the employer with the most recent job */
  @Property()
  sortOrder: number & Opt = 0;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

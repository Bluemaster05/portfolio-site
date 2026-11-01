import { Collection, type Opt } from '@mikro-orm/core';
import { Entity, ManyToMany, ManyToOne, Property, Unique } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';
import { Technology } from '../../technologies/entities/technology.entity.js';
import { Employer } from './employer.entity.js';

/** One job: a role held at an employer for a period. */
@Entity()
export class Experience extends ContentItem {
  @ManyToOne(() => Employer)
  employer!: Employer;

  /** Job title */
  @Property({ length: 200 })
  role!: string;

  /** URL segment for /experience/[slug] */
  @Unique()
  @Property({ length: 120 })
  slug!: string;

  /** e.g. "Full-time", "Internship", "Contract" */
  @Property({ length: 60, nullable: true })
  employmentType?: string;

  @Property({ length: 120, nullable: true })
  location?: string;

  @Property({ length: 10 })
  startDate!: string;

  /** Empty while the role is current */
  @Property({ length: 10, nullable: true })
  endDate?: string;

  /** Short summary, shown in the experience list and on the job's page */
  @Property({ type: 'json' })
  description: RichTextDoc & Opt = emptyDoc();

  /** Longer write-up, shown only on the job's own page */
  @Property({ type: 'json' })
  writeup: RichTextDoc & Opt = emptyDoc();

  /** Free-text skills, e.g. "Leadership" */
  @Property({ type: 'json' })
  skills: string[] & Opt = [];

  /** Technologies used, in the order the admin picked */
  @ManyToMany(() => Technology, undefined, { fixedOrder: true })
  technologies = new Collection<Technology>(this);
}

import { type Opt } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

@Entity()
export class Experience extends ContentItem {
  /** Company or organization */
  @Property({ length: 200 })
  organization!: string;

  /** Job title */
  @Property({ length: 200 })
  role!: string;

  /** e.g. "Full-time", "Internship", "Contract" */
  @Property({ length: 60, nullable: true })
  employmentType?: string;

  @Property({ length: 120, nullable: true })
  location?: string;

  @Property({ length: 2048, nullable: true })
  url?: string;

  @Property({ length: 10 })
  startDate!: string;

  /** Empty while the role is current */
  @Property({ length: 10, nullable: true })
  endDate?: string;

  @Property({ type: 'json' })
  description: RichTextDoc & Opt = emptyDoc();

  @Property({ type: 'json' })
  skills: string[] & Opt = [];
}

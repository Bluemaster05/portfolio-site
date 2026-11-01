import { type Opt } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

@Entity()
export class Education extends ContentItem {
  @Property({ length: 200 })
  institution!: string;

  /** e.g. "B.S. Computer Science" */
  @Property({ length: 200 })
  degree!: string;

  /** e.g. "Minor in Mathematics" */
  @Property({ length: 200, nullable: true })
  fieldOfStudy?: string;

  @Property({ length: 120, nullable: true })
  location?: string;

  @Property({ length: 2048, nullable: true })
  url?: string;

  @Property({ length: 10, nullable: true })
  startDate?: string;

  /** Expected or actual graduation */
  @Property({ length: 10, nullable: true })
  endDate?: string;

  /** e.g. "3.9 GPA", "First Class Honours" */
  @Property({ length: 100, nullable: true })
  grade?: string;

  @Property({ type: 'json' })
  description: RichTextDoc & Opt = emptyDoc();
}

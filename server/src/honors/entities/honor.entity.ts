import { type Opt } from '@mikro-orm/core';
import { Entity, Property } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

/** An honor, award, scholarship, or certification. */
@Entity()
export class Honor extends ContentItem {
  @Property({ length: 200 })
  title!: string;

  /** Who awarded it */
  @Property({ length: 200, nullable: true })
  issuer?: string;

  @Property({ length: 10, nullable: true })
  date?: string;

  @Property({ length: 2048, nullable: true })
  url?: string;

  @Property({ type: 'json' })
  description: RichTextDoc & Opt = emptyDoc();
}

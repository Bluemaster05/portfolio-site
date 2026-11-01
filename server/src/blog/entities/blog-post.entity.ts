import { type Opt } from '@mikro-orm/core';
import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

@Entity()
export class BlogPost extends ContentItem {
  @Property({ length: 200 })
  title!: string;

  @Unique()
  @Property({ length: 120 })
  slug!: string;

  /** Short plain-text teaser for the list and meta description */
  @Property({ length: 500 })
  excerpt: string & Opt = '';

  @Property({ type: 'json' })
  content: RichTextDoc & Opt = emptyDoc();

  @Property({ type: 'json' })
  tags: string[] & Opt = [];

  @Property({ length: 2048, nullable: true })
  coverImageUrl?: string;

  /** Set the first time the post is published; posts are listed newest first */
  @Property({ nullable: true })
  publishedAt?: Date;
}

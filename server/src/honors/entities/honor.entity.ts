import { type Opt } from '@mikro-orm/core';
import { Entity, Property, Unique } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

export interface HonorImage {
  url: string;
  alt?: string;
}

/** An honor, award, scholarship, or certification. */
@Entity()
export class Honor extends ContentItem {
  @Property({ length: 200 })
  title!: string;

  /** URL segment for /honors/[slug] */
  @Unique()
  @Property({ length: 120 })
  slug!: string;

  /** Who awarded it */
  @Property({ length: 200, nullable: true })
  issuer?: string;

  @Property({ length: 10, nullable: true })
  date?: string;

  @Property({ length: 2048, nullable: true })
  url?: string;

  /** Main image (e.g. the award or certificate): an upload or an http(s) image URL */
  @Property({ length: 2048, nullable: true })
  imageUrl?: string;

  /** Describes the main image for screen readers; the title is used when empty */
  @Property({ length: 300, nullable: true })
  imageAlt?: string;

  /** More images, shown in a carousel on the honor's page */
  @Property({ type: 'json' })
  images: HonorImage[] & Opt = [];

  /** Shown on the home page; only one honor can be featured at a time */
  @Property()
  featured: boolean & Opt = false;

  /** Short summary, shown on the honors page and at the top of the honor's own page */
  @Property({ type: 'json' })
  description: RichTextDoc & Opt = emptyDoc();

  /** Longer write-up, shown only on the honor's own page */
  @Property({ type: 'json' })
  writeup: RichTextDoc & Opt = emptyDoc();
}

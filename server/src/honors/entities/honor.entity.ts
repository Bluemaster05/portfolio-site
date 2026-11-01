import { type Opt } from '@mikro-orm/core';
import { Entity, Enum, Property, Unique } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

import { ProjectMediaLayout, type ProjectMediaItem } from '../../projects/entities/project.entity.js';

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

  /** How media shows on the honor's page: none, one header item, or a gallery (as for projects) */
  @Enum({ items: () => ProjectMediaLayout, nativeEnumName: 'project_media_layout' })
  mediaLayout: ProjectMediaLayout & Opt = ProjectMediaLayout.None;

  /**
   * Images and videos in gallery order, as for projects. The main image is the picture on the honor's
   * card; the main video, else the main image, leads its page. Unmarked: first of each kind.
   */
  @Property({ type: 'json' })
  media: ProjectMediaItem[] & Opt = [];

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

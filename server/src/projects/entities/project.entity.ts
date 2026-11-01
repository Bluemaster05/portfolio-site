import { type Opt } from '@mikro-orm/core';
import { Entity, Enum, Property, Unique } from '@mikro-orm/decorators/legacy';
import { ContentItem } from '../../common/entities/content-item.entity.js';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';

export enum ProjectMediaLayout {
  None = 'none',
  Single = 'single',
  Gallery = 'gallery',
}

export interface ProjectMediaItem {
  kind: 'image' | 'video';
  url: string;
  alt?: string;
}

@Entity()
export class Project extends ContentItem {
  @Property({ length: 200 })
  title!: string;

  /** URL segment for /projects/[slug] */
  @Unique()
  @Property({ length: 120 })
  slug!: string;

  /** Short plain-text summary for cards and meta descriptions */
  @Property({ length: 500 })
  summary: string & Opt = '';

  @Property({ type: 'json' })
  content: RichTextDoc & Opt = emptyDoc();

  @Property({ type: 'json' })
  technologies: string[] & Opt = [];

  @Property({ length: 2048, nullable: true })
  repoUrl?: string;

  @Property({ length: 2048, nullable: true })
  liveUrl?: string;

  /** How media shows on the project page: none, one header item, or a gallery */
  @Enum({ items: () => ProjectMediaLayout, nativeEnumName: 'project_media_layout' })
  mediaLayout: ProjectMediaLayout & Opt = ProjectMediaLayout.None;

  /**
   * Images and videos in display order. The first item is the header (single) or the large main
   * item (gallery); the first image is the cover on cards and the home page.
   */
  @Property({ type: 'json' })
  media: ProjectMediaItem[] & Opt = [];

  @Property({ length: 10, nullable: true })
  startDate?: string;

  @Property({ length: 10, nullable: true })
  endDate?: string;

  /** Shown on the home page */
  @Property()
  featured: boolean & Opt = false;
}

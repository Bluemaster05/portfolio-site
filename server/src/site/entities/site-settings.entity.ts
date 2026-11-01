import { type Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { emptyDoc, type RichTextDoc } from '../../common/types/rich-text.js';
import { DEFAULT_SECTION_TOGGLES, type SectionToggles } from '../section.enum.js';

export interface SiteLink {
  label: string;
  url: string;
}

/** Singleton row (id = 1): site metadata, the owner's profile, and section toggles. */
@Entity()
export class SiteSettings {
  static readonly SINGLETON_ID = 1;

  @PrimaryKey({ autoincrement: false })
  id: number & Opt = SiteSettings.SINGLETON_ID;

  /** Browser tab / SEO title */
  @Property({ length: 120 })
  siteTitle: string & Opt = 'My Portfolio';

  /** SEO meta description */
  @Property({ length: 300 })
  siteDescription: string & Opt = '';

  @Property({ length: 120 })
  ownerName: string & Opt = 'Your Name';

  /** One line under the name, e.g. "Full-stack developer" */
  @Property({ length: 200 })
  headline: string & Opt = '';

  @Property({ length: 120, nullable: true })
  location?: string;

  @Property({ length: 320, nullable: true })
  contactEmail?: string;

  @Property({ length: 2048, nullable: true })
  avatarUrl?: string;

  /** Intro shown on the home page */
  @Property({ type: 'json' })
  bio: RichTextDoc & Opt = emptyDoc();

  @Property({ type: 'json' })
  links: SiteLink[] & Opt = [];

  @Property({ type: 'json' })
  sections: SectionToggles & Opt = { ...DEFAULT_SECTION_TOGGLES };

  @Property({ onCreate: () => new Date(), onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();
}

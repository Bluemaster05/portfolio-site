import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { SiteSettings } from './entities/site-settings.entity.js';
import { Section } from './section.enum.js';
import { UpdateSiteSettingsDto } from './dto/site-settings.dto.js';
import { definedOnly } from '../common/utils/defined-only.js';

@Injectable()
export class SiteService {
  constructor(private readonly em: EntityManager) {}

  /** The settings row, created with defaults the first time it is needed. */
  async getSettings(): Promise<SiteSettings> {
    const existing = await this.em.findOne(SiteSettings, SiteSettings.SINGLETON_ID);
    if (existing) return existing;
    const settings = this.em.create(SiteSettings, {});
    await this.em.flush();
    return settings;
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettings> {
    const settings = await this.getSettings();
    Object.assign(settings, definedOnly(dto));
    await this.em.flush();
    return settings;
  }

  async isSectionEnabled(section: Section): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.sections[section] ?? false;
  }
}

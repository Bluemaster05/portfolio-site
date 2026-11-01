import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { SiteSettings } from '../site/entities/site-settings.entity.js';

/** Creates the settings row with its defaults (Blog off, everything else on). */
export class SiteSettingsSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    if (await em.findOne(SiteSettings, SiteSettings.SINGLETON_ID)) return;
    em.create(SiteSettings, {});
    await em.flush();
  }
}

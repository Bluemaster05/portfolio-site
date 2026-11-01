import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { AdminSeeder } from './AdminSeeder.js';
import { SiteSettingsSeeder } from './SiteSettingsSeeder.js';
import { DevApiTokenSeeder } from './DevApiTokenSeeder.js';

/**
 * Generic starting data: an admin, default settings, and optionally a dev API token.
 * Keep this free of personal content — that belongs in the database or a personal branch.
 */
export class DatabaseSeeder extends Seeder {
  run(em: EntityManager): Promise<void> {
    return this.call(em, [AdminSeeder, SiteSettingsSeeder, DevApiTokenSeeder]);
  }
}

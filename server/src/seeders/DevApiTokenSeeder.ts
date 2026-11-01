import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { ApiToken } from '../api-tokens/entities/api-token.entity.js';
import { ALL_API_SCOPES } from '../api-tokens/api-scope.enum.js';
import { hashToken } from '../common/utils/hash-token.js';

/**
 * Development convenience: stores SEED_API_TOKEN as a read-only token with every scope, so the
 * frontend can use the same value as PORTFOLIO_API_TOKEN. In production create tokens in the admin.
 */
export class DevApiTokenSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const raw = process.env.SEED_API_TOKEN;
    if (!raw) return;

    const tokenHash = hashToken(raw);
    if (await em.findOne(ApiToken, { tokenHash })) return;

    em.create(ApiToken, {
      name: 'Development (seeded)',
      prefix: raw.slice(0, 10),
      tokenHash,
      scopes: ALL_API_SCOPES,
    });
    await em.flush();
  }
}

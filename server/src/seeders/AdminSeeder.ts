import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { hash } from 'argon2';
import { User } from '../users/entities/user.entity.js';

/** Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD when no admin exists yet. */
export class AdminSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    if ((await em.count(User)) > 0) return;

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.warn('AdminSeeder: ADMIN_EMAIL / ADMIN_PASSWORD not set, no admin created');
      return;
    }
    if (password.length < 12) {
      throw new Error('AdminSeeder: ADMIN_PASSWORD must be at least 12 characters');
    }

    em.create(User, { email, name: 'Admin', passwordHash: await hash(password) });
    await em.flush();
    console.log(`AdminSeeder: created admin ${email}`);
  }
}

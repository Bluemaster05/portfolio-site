import { Migration } from '@mikro-orm/migrations';

/** Site settings remember which part of the avatar shows in its circle. */
export class Migration20261102002903 extends Migration {

  override name = 'Migration20261102002903';

  override up(): void | Promise<void> {
    // The existing avatar starts centered, unzoomed (how it showed before)
    this.addSql(`alter table "site_settings" add "avatar_crop" jsonb not null default '{"x":50,"y":50,"zoom":1}';`);
    this.addSql(`alter table "site_settings" alter column "avatar_crop" drop default;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "site_settings" drop column "avatar_crop";`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20261101221033 extends Migration {

  override name = 'Migration20261101221033';

  override up(): void | Promise<void> {
    this.addSql(`alter table "education" add "featured" boolean not null default false;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "education" drop column "featured";`);
  }

}

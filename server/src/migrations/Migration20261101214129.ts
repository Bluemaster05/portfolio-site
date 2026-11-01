import { Migration } from '@mikro-orm/migrations';

export class Migration20261101214129 extends Migration {

  override name = 'Migration20261101214129';

  override up(): void | Promise<void> {
    this.addSql(`alter table "experience" add "featured" boolean not null default false;`);

    this.addSql(`alter table "honor" add "featured" boolean not null default false;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "experience" drop column "featured";`);

    this.addSql(`alter table "honor" drop column "featured";`);
  }

}

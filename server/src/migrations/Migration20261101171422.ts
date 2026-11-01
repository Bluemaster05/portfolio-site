import { Migration } from '@mikro-orm/migrations';

export class Migration20261101171422 extends Migration {

  override name = 'Migration20261101171422';

  override up(): void | Promise<void> {
    this.addSql(`alter table "project" add "video_url" varchar(2048) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "project" drop column "video_url";`);
  }

}

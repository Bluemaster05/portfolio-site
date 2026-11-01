import { Migration } from '@mikro-orm/migrations';

export class Migration20261101214716 extends Migration {

  override name = 'Migration20261101214716';

  override up(): void | Promise<void> {
    this.addSql(`alter table "honor" add "image_url" varchar(2048) null, add "image_alt" varchar(300) null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "honor" drop column "image_url", drop column "image_alt";`);
  }

}

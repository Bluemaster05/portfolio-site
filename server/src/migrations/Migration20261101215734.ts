import { Migration } from '@mikro-orm/migrations';

/** Honors get more images (beyond the main one) for a carousel on their page. */
export class Migration20261101215734 extends Migration {

  override name = 'Migration20261101215734';

  override up(): void | Promise<void> {
    // Existing honors start with no extra images
    this.addSql(`alter table "honor" add "images" jsonb not null default '[]';`);
    this.addSql(`alter table "honor" alter column "images" drop default;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "honor" drop column "images";`);
  }

}

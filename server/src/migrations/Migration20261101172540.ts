import { Migration } from '@mikro-orm/migrations';

export class Migration20261101172540 extends Migration {

  override name = 'Migration20261101172540';

  override up(): void | Promise<void> {
    // One ordered list of images and videos replaces images[] + video_url; the video (if any) leads
    this.addSql(`alter table "project" add "media" jsonb not null default '[]';`);
    this.addSql(`update "project" set "media" = coalesce((select jsonb_agg(jsonb_build_object('kind', 'image', 'url', item->>'url', 'alt', coalesce(item->>'alt', '')) order by position) from jsonb_array_elements("images") with ordinality as entries(item, position)), '[]');`);
    this.addSql(`update "project" set "media" = jsonb_build_array(jsonb_build_object('kind', 'video', 'url', "video_url", 'alt', '')) || "media" where "video_url" is not null;`);
    this.addSql(`alter table "project" alter column "media" drop default;`);
    this.addSql(`alter table "project" drop column "images", drop column "video_url";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "project" add "images" jsonb not null default '[]', add "video_url" varchar(2048) null;`);
    this.addSql(`update "project" set "images" = coalesce((select jsonb_agg(jsonb_build_object('url', item->>'url', 'alt', coalesce(item->>'alt', '')) order by position) from jsonb_array_elements("media") with ordinality as entries(item, position) where item->>'kind' = 'image'), '[]');`);
    this.addSql(`update "project" set "video_url" = (select item->>'url' from jsonb_array_elements("media") with ordinality as entries(item, position) where item->>'kind' = 'video' order by position limit 1);`);
    this.addSql(`alter table "project" alter column "images" drop default;`);
    this.addSql(`alter table "project" drop column "media";`);
  }

}

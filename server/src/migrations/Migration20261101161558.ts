import { Migration } from '@mikro-orm/migrations';

export class Migration20261101161558 extends Migration {

  override name = 'Migration20261101161558';

  override up(): void | Promise<void> {
    this.addSql(`create type "project_media_layout" as enum ('none', 'single', 'gallery');`);
    this.addSql(`create table "media_asset" ("id" serial primary key, "key" varchar(64) not null, "original_name" varchar(255) not null, "mime_type" varchar(40) not null, "size" int not null, "created_at" timestamptz not null);`);
    this.addSql(`alter table "media_asset" add constraint "media_asset_key_unique" unique ("key");`);

    // Defaults let existing rows pass NOT NULL; an existing image_url becomes a single header image
    this.addSql(`alter table "project" add "media_layout" "project_media_layout" not null default 'none', add "images" jsonb not null default '[]';`);
    this.addSql(`update "project" set "images" = jsonb_build_array(jsonb_build_object('url', "image_url", 'alt', '')), "media_layout" = 'single' where "image_url" is not null;`);
    this.addSql(`alter table "project" alter column "images" drop default;`);
    this.addSql(`alter table "project" drop column "image_url";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "media_asset" cascade;`);

    this.addSql(`alter table "project" add "image_url" varchar(2048) null;`);
    this.addSql(`update "project" set "image_url" = "images"->0->>'url' where jsonb_array_length("images") > 0;`);
    this.addSql(`alter table "project" drop column "media_layout", drop column "images";`);

    this.addSql(`drop type "project_media_layout";`);
  }

}

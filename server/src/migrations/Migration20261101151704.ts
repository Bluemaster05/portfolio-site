import { Migration } from '@mikro-orm/migrations';

export class Migration20261101151704 extends Migration {

  override name = 'Migration20261101151704';

  override up(): void | Promise<void> {
    this.addSql(`create table "api_token" ("id" serial primary key, "name" varchar(100) not null, "prefix" varchar(16) not null, "token_hash" varchar(64) not null, "scopes" text[] not null, "expires_at" timestamptz null, "last_used_at" timestamptz null, "revoked_at" timestamptz null, "created_at" timestamptz not null);`);
    this.addSql(`alter table "api_token" add constraint "api_token_token_hash_unique" unique ("token_hash");`);
    this.addSql(`alter table "api_token" add constraint "api_token_scopes_check" check ("scopes" <@ array['site:read'::text, 'projects:read'::text, 'experience:read'::text, 'education:read'::text, 'honors:read'::text, 'blog:read'::text]);`);

    this.addSql(`create table "blog_post" ("id" serial primary key, "published" boolean not null default false, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(200) not null, "slug" varchar(120) not null, "excerpt" varchar(500) not null default '', "content" jsonb not null, "tags" jsonb not null, "cover_image_url" varchar(2048) null, "published_at" timestamptz null);`);
    this.addSql(`alter table "blog_post" add constraint "blog_post_slug_unique" unique ("slug");`);

    this.addSql(`create table "education" ("id" serial primary key, "published" boolean not null default false, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, "institution" varchar(200) not null, "degree" varchar(200) not null, "field_of_study" varchar(200) null, "location" varchar(120) null, "url" varchar(2048) null, "start_date" varchar(10) null, "end_date" varchar(10) null, "grade" varchar(100) null, "description" jsonb not null);`);

    this.addSql(`create table "experience" ("id" serial primary key, "published" boolean not null default false, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, "organization" varchar(200) not null, "role" varchar(200) not null, "employment_type" varchar(60) null, "location" varchar(120) null, "url" varchar(2048) null, "start_date" varchar(10) not null, "end_date" varchar(10) null, "description" jsonb not null, "skills" jsonb not null);`);

    this.addSql(`create table "honor" ("id" serial primary key, "published" boolean not null default false, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(200) not null, "issuer" varchar(200) null, "date" varchar(10) null, "url" varchar(2048) null, "description" jsonb not null);`);

    this.addSql(`create table "project" ("id" serial primary key, "published" boolean not null default false, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, "title" varchar(200) not null, "slug" varchar(120) not null, "summary" varchar(500) not null default '', "content" jsonb not null, "technologies" jsonb not null, "repo_url" varchar(2048) null, "live_url" varchar(2048) null, "image_url" varchar(2048) null, "start_date" varchar(10) null, "end_date" varchar(10) null, "featured" boolean not null default false);`);
    this.addSql(`alter table "project" add constraint "project_slug_unique" unique ("slug");`);

    this.addSql(`create table "site_settings" ("id" int not null default 1, "site_title" varchar(120) not null default 'My Portfolio', "site_description" varchar(300) not null default '', "owner_name" varchar(120) not null default 'Your Name', "headline" varchar(200) not null default '', "location" varchar(120) null, "contact_email" varchar(320) null, "avatar_url" varchar(2048) null, "bio" jsonb not null, "links" jsonb not null, "sections" jsonb not null, "updated_at" timestamptz not null, primary key ("id"));`);

    this.addSql(`create table "user" ("id" serial primary key, "email" varchar(320) not null, "name" varchar(100) not null, "password_hash" varchar(255) not null, "created_at" timestamptz not null, "last_login_at" timestamptz null);`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "refresh_token" ("id" serial primary key, "user_id" int not null, "token_hash" varchar(64) not null, "expires_at" timestamptz not null, "revoked_at" timestamptz null, "created_at" timestamptz not null);`);
    this.addSql(`create index "refresh_token_token_hash_index" on "refresh_token" ("token_hash");`);

    this.addSql(`alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on delete cascade;`);
  }

}

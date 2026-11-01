import { Migration } from '@mikro-orm/migrations';

/** SQL equivalent of slugify() for the data copy: lowercase, runs of other characters become "-". */
const SLUG = (column: string) =>
  `trim(both '-' from regexp_replace(lower(trim(${column})), '[^a-z0-9]+', '-', 'g'))`;

export class Migration20261101175612 extends Migration {

  override name = 'Migration20261101175612';

  override up(): void | Promise<void> {
    this.addSql(`create table "technology" ("id" serial primary key, "name" varchar(60) not null, "slug" varchar(80) not null, "icon_url" varchar(2048) null, "url" varchar(2048) null, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "technology" add constraint "technology_name_unique" unique ("name");`);
    this.addSql(`alter table "technology" add constraint "technology_slug_unique" unique ("slug");`);

    this.addSql(`create table "project_technologies" ("id" serial primary key, "project_id" int not null, "technology_id" int not null);`);
    this.addSql(`alter table "project_technologies" add constraint "project_technologies_project_id_foreign" foreign key ("project_id") references "project" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "project_technologies" add constraint "project_technologies_technology_id_foreign" foreign key ("technology_id") references "technology" ("id") on update cascade on delete cascade;`);

    // Each distinct tag becomes a technology (first spelling wins for names that slug the same)
    this.addSql(`insert into "technology" ("name", "slug", "created_at", "updated_at")
      select distinct on (slug) left(trim(name), 60), slug, now(), now()
      from (
        select tag.value as name, ${SLUG('tag.value')} as slug, project.id as project_id, tag.position
        from "project", jsonb_array_elements_text(project."technologies") with ordinality as tag(value, position)
      ) tags
      where slug <> ''
      order by slug, project_id, position;`);

    // Link projects to them in the original tag order (the pivot id keeps that order)
    this.addSql(`insert into "project_technologies" ("project_id", "technology_id")
      select project_id, technology_id from (
        select distinct on (project.id, technology.id) project.id as project_id, technology.id as technology_id, tag.position
        from "project"
        cross join jsonb_array_elements_text(project."technologies") with ordinality as tag(value, position)
        join "technology" on technology.slug = ${SLUG('tag.value')}
        order by project.id, technology.id, tag.position
      ) links
      order by project_id, position;`);

    this.addSql(`alter table "project" drop column "technologies";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "project" add "technologies" jsonb not null default '[]';`);
    this.addSql(`update "project" set "technologies" = coalesce((
      select jsonb_agg(technology.name order by link.id)
      from "project_technologies" link join "technology" on technology.id = link.technology_id
      where link.project_id = project.id), '[]');`);
    this.addSql(`alter table "project" alter column "technologies" drop default;`);

    this.addSql(`drop table if exists "project_technologies" cascade;`);
    this.addSql(`drop table if exists "technology" cascade;`);
  }

}

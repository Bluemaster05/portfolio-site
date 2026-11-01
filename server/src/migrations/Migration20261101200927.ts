import { Migration } from '@mikro-orm/migrations';

/** SQL equivalent of slugify(): lowercase, runs of other characters become "-". */
const SLUG = (expression: string) =>
  `left(trim(both '-' from regexp_replace(lower(trim(${expression})), '[^a-z0-9]+', '-', 'g')), 110)`;

const EMPTY_DOC = `'{"type":"doc","content":[]}'::jsonb`;

/**
 * Experience entries become jobs at employers: each distinct organization becomes an employer
 * (keeping its URL), and jobs gain a slug for their own page, a write-up, and technologies.
 */
export class Migration20261101200927 extends Migration {

  override name = 'Migration20261101200927';

  override up(): void | Promise<void> {
    this.addSql(`create table "employer" ("id" serial primary key, "name" varchar(200) not null, "url" varchar(2048) null, "logo_url" varchar(2048) null, "sort_order" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
    this.addSql(`alter table "employer" add constraint "employer_name_unique" unique ("name");`);

    // One employer per organization name (ignoring case); the first entry with a URL supplies it
    this.addSql(`insert into "employer" ("name", "url", "created_at", "updated_at")
      select distinct on (lower(trim(organization))) trim(organization), url, now(), now()
      from "experience"
      order by lower(trim(organization)), (url is null), id;`);

    this.addSql(`alter table "experience" add "employer_id" int null, add "slug" varchar(120) null, add "writeup" jsonb not null default ${EMPTY_DOC};`);
    this.addSql(`alter table "experience" alter column "writeup" drop default;`);
    this.addSql(`update "experience" set "employer_id" = employer.id
      from "employer" where lower(employer.name) = lower(trim(experience.organization));`);

    // "role-organization", with -2, -3… on repeats
    this.addSql(`update "experience" set "slug" = numbered.slug from (
        select id, case when position = 1 then base else base || '-' || position end as slug
        from (
          select id, base, row_number() over (partition by base order by id) as position
          from (select id, ${SLUG(`role || ' ' || organization`)} as base from "experience") bases
        ) positions
      ) numbered
      where numbered.id = experience.id;`);
    this.addSql(`update "experience" set "slug" = 'job-' || id where "slug" = '';`);

    this.addSql(`alter table "experience" alter column "employer_id" set not null, alter column "slug" set not null;`);
    this.addSql(`alter table "experience" add constraint "experience_employer_id_foreign" foreign key ("employer_id") references "employer" ("id");`);
    this.addSql(`alter table "experience" add constraint "experience_slug_unique" unique ("slug");`);
    this.addSql(`alter table "experience" drop column "organization", drop column "url";`);

    this.addSql(`create table "experience_technologies" ("id" serial primary key, "experience_id" int not null, "technology_id" int not null);`);
    this.addSql(`alter table "experience_technologies" add constraint "experience_technologies_experience_id_foreign" foreign key ("experience_id") references "experience" ("id") on update cascade on delete cascade;`);
    this.addSql(`alter table "experience_technologies" add constraint "experience_technologies_technology_id_foreign" foreign key ("technology_id") references "technology" ("id") on update cascade on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "experience_technologies" cascade;`);

    this.addSql(`alter table "experience" add "organization" varchar(200) null, add "url" varchar(2048) null;`);
    this.addSql(`update "experience" set "organization" = employer.name, "url" = employer.url
      from "employer" where employer.id = experience.employer_id;`);
    this.addSql(`alter table "experience" alter column "organization" set not null;`);

    this.addSql(`alter table "experience" drop constraint "experience_employer_id_foreign";`);
    this.addSql(`alter table "experience" drop constraint "experience_slug_unique";`);
    this.addSql(`alter table "experience" drop column "employer_id", drop column "slug", drop column "writeup";`);
    this.addSql(`drop table if exists "employer" cascade;`);
  }

}

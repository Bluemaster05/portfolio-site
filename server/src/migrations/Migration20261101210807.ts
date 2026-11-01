import { Migration } from '@mikro-orm/migrations';

/** SQL equivalent of slugify(): lowercase, runs of other characters become "-". */
const SLUG = (expression: string) =>
  `left(trim(both '-' from regexp_replace(lower(trim(${expression})), '[^a-z0-9]+', '-', 'g')), 110)`;

const EMPTY_DOC = `'{"type":"doc","content":[]}'::jsonb`;

/** Education entries get a slug for their own page (/education/[slug]) and a write-up. */
export class Migration20261101210807 extends Migration {

  override name = 'Migration20261101210807';

  override up(): void | Promise<void> {
    this.addSql(`alter table "education" add "slug" varchar(120) null, add "writeup" jsonb not null default ${EMPTY_DOC};`);
    this.addSql(`alter table "education" alter column "writeup" drop default;`);

    // "degree-institution", with -2, -3… on repeats
    this.addSql(`update "education" set "slug" = numbered.slug from (
        select id, case when position = 1 then base else base || '-' || position end as slug
        from (
          select id, base, row_number() over (partition by base order by id) as position
          from (select id, ${SLUG(`degree || ' ' || institution`)} as base from "education") bases
        ) positions
      ) numbered
      where numbered.id = education.id;`);
    this.addSql(`update "education" set "slug" = 'education-' || id where "slug" = '';`);

    this.addSql(`alter table "education" alter column "slug" set not null;`);
    this.addSql(`alter table "education" add constraint "education_slug_unique" unique ("slug");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "education" drop constraint "education_slug_unique";`);
    this.addSql(`alter table "education" drop column "slug", drop column "writeup";`);
  }

}

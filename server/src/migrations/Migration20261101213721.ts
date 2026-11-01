import { Migration } from '@mikro-orm/migrations';

/** SQL equivalent of slugify(): lowercase, runs of other characters become "-". */
const SLUG = (expression: string) =>
  `left(trim(both '-' from regexp_replace(lower(trim(${expression})), '[^a-z0-9]+', '-', 'g')), 110)`;

const EMPTY_DOC = `'{"type":"doc","content":[]}'::jsonb`;

/** Honors get a slug for their own page (/honors/[slug]) and a write-up. */
export class Migration20261101213721 extends Migration {

  override name = 'Migration20261101213721';

  override up(): void | Promise<void> {
    this.addSql(`alter table "honor" add "slug" varchar(120) null, add "writeup" jsonb not null default ${EMPTY_DOC};`);
    this.addSql(`alter table "honor" alter column "writeup" drop default;`);

    // "title-issuer", with -2, -3… on repeats
    this.addSql(`update "honor" set "slug" = numbered.slug from (
        select id, case when position = 1 then base else base || '-' || position end as slug
        from (
          select id, base, row_number() over (partition by base order by id) as position
          from (select id, ${SLUG(`title || ' ' || coalesce(issuer, '')`)} as base from "honor") bases
        ) positions
      ) numbered
      where numbered.id = honor.id;`);
    this.addSql(`update "honor" set "slug" = 'honor-' || id where "slug" = '';`);

    this.addSql(`alter table "honor" alter column "slug" set not null;`);
    this.addSql(`alter table "honor" add constraint "honor_slug_unique" unique ("slug");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "honor" drop constraint "honor_slug_unique";`);
    this.addSql(`alter table "honor" drop column "slug", drop column "writeup";`);
  }

}

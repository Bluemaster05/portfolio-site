import { Migration } from '@mikro-orm/migrations';

/**
 * Honors use project-style media: a layout plus one ordered list of images and videos with a main
 * item. The old main image becomes the first item (marked main) and the extra images follow; the
 * layout is a gallery with several items, a single header with one, else none.
 */
export class Migration20261101221634 extends Migration {

  override name = 'Migration20261101221634';

  override up(): void | Promise<void> {
    this.addSql(`alter table "honor" add "media_layout" "project_media_layout" not null default 'none', add "media" jsonb not null default '[]';`);
    this.addSql(`alter table "honor" alter column "media" drop default;`);

    this.addSql(`update "honor" set "media" =
      (case when image_url is not null
        then jsonb_build_array(jsonb_build_object('kind', 'image', 'url', image_url, 'alt', coalesce(image_alt, ''), 'main', true))
        else '[]'::jsonb end)
      || coalesce((
        select jsonb_agg(jsonb_build_object('kind', 'image', 'url', item->>'url', 'alt', coalesce(item->>'alt', '')) order by position)
        from jsonb_array_elements(images) with ordinality as extra(item, position)
      ), '[]'::jsonb);`);
    this.addSql(`update "honor" set "media_layout" = case
        when jsonb_array_length("media") > 1 then 'gallery'::project_media_layout
        when jsonb_array_length("media") = 1 then 'single'::project_media_layout
        else 'none'::project_media_layout end;`);

    this.addSql(`alter table "honor" drop column "image_url", drop column "image_alt", drop column "images";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "honor" add "image_url" varchar(2048) null, add "image_alt" varchar(300) null, add "images" jsonb not null default '[]';`);
    this.addSql(`alter table "honor" alter column "images" drop default;`);

    // The main image (marked, else the first image) goes back to image_url; other images to images
    this.addSql(`update "honor" set
        "image_url" = main.item->>'url',
        "image_alt" = nullif(main.item->>'alt', '')
      from (
        select h.id, (
          select item from jsonb_array_elements(h.media) with ordinality as m(item, position)
          where item->>'kind' = 'image'
          order by (item->>'main')::boolean is true desc, position limit 1
        ) as item
        from "honor" h
      ) main
      where main.id = honor.id;`);
    this.addSql(`update "honor" set "images" = coalesce((
        select jsonb_agg(jsonb_build_object('url', item->>'url', 'alt', coalesce(item->>'alt', '')) order by position)
        from jsonb_array_elements(media) with ordinality as m(item, position)
        where item->>'kind' = 'image' and item->>'url' is distinct from image_url
      ), '[]'::jsonb);`);

    this.addSql(`alter table "honor" drop column "media_layout", drop column "media";`);
  }

}

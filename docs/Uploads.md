# Uploads

Images can be uploaded from the admin portal anywhere an image is used, or linked by URL. Upload is
the default; a toggle switches a field to URL mode.

## How it works

```
Admin browser ──POST multipart──► /api/admin/media      (JWT cookie + CSRF)
                                    │ checks file contents, saves UPLOAD_DIR/<uuid>.<ext>
                                    └► { url: "/media/<uuid>.<ext>", … }

Any page ──GET /media/<key>──► Next.js rewrite ──► /api/media/<key>   (public)
```

- Content stores the image as a **URL string**: `/media/<key>` for uploads, or an `http(s)` URL.
  That is why every image field supports both modes with no schema differences.
- `/media/*` is a rewrite in `frontend/next.config.ts`, so pages reference images on their own
  origin and the API does not need to be publicly reachable.
- Each upload gets a `MediaAsset` row (original name, type, size) and a random UUID file name.

## Accepted files

PNG, JPEG, GIF, WebP, AVIF, and SVG, up to `MAX_UPLOAD_MB` (default 5). The type is detected from
the file's **contents**, not its name or the browser's MIME type. SVGs containing scripts, event
handlers, `javascript:` URLs, or `foreignObject` are refused.

Served files get `X-Content-Type-Options: nosniff`, a sandboxing `Content-Security-Policy`, and
`Cache-Control: immutable` (a key never changes content).

## Where images are used

| Place                 | Field                      | UI                                     |
| --------------------- | -------------------------- | -------------------------------------- |
| Site settings         | `avatarUrl`                | `ImageSourceField`                     |
| Projects              | `mediaLayout` + `images[]` | select + `ImageListField`              |
| Blog posts            | `coverImageUrl`            | `ImageSourceField`                     |
| Rich text             | `image` node `src`         | editor Image button → upload panel     |
| Technologies (next)   | icon                       | `ImageSourceField` with `compact`      |

Project `mediaLayout`:

- `none` — no images.
- `single` — the first image is a header above the write-up.
- `gallery` — the first image is shown large, with all images as smaller tiles (5 per row on wide
  screens); choosing a tile shows it large. The first image is also the project card's cover.

## Adding an image to a new feature

1. **Server:** an image URL field uses `@IsOptional() @EmptyToNull() @IsImageSource()` (single) or
   `ImageDto[]` with `@ValidateNested({ each: true }) @Type(() => ImageDto)` (list with alt text).
2. **Admin:** use `kind: 'image'` / `kind: 'images'` in a content resource, or `ImageSourceField` /
   `ImageListField` directly. Presenters take an `onUpload` prop; containers pass `uploadImage`.
3. **Public:** check sources with `isImageSrc()` from `lib/images.ts` before rendering, and always
   give meaningful `alt` text (or `alt=""` when the image is decorative).

## Operations

- `UPLOAD_DIR` (default `server/uploads`, git-ignored) must be persistent storage in production —
  mount a volume.
- Back it up together with the database: content references files by key.
- Replacing or removing an image in a form doesn't delete the old file. `DELETE /api/admin/media/:id`
  removes one; a cleanup for unreferenced uploads is not built yet.
- Uploaded files are public to anyone who knows the key, including images used only in drafts.

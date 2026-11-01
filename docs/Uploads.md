# Uploads

Images (and, for projects, a video) can be uploaded from the admin portal or linked by URL. Upload
is the default; a toggle switches a field to URL mode.

## How it works

```
Admin browser ──POST multipart──► /api/admin/media      (JWT cookie + CSRF)
                                    │ streams to a temp file, checks its contents,
                                    │ moves it to UPLOAD_DIR/<uuid>.<ext>
                                    └► { url: "/media/<uuid>.<ext>", … }

Any page ──GET /media/<key>──► Next.js rewrite ──► /api/media/<key>   (public)
```

- Content stores the image as a **URL string**: `/media/<key>` for uploads, or an `http(s)` URL.
  That is why every image field supports both modes with no schema differences.
- `/media/*` is a rewrite in `frontend/next.config.ts`, so pages reference images on their own
  origin and the API does not need to be publicly reachable.
- Each upload gets a `MediaAsset` row (original name, type, size) and a random UUID file name.

## Accepted files

| Kind   | Formats                              | Limit                                   |
| ------ | ------------------------------------ | --------------------------------------- |
| Images | PNG, JPEG, GIF, WebP, AVIF, SVG      | `MAX_UPLOAD_MB` (default 5)             |
| Videos | MP4, WebM                            | `MAX_VIDEO_UPLOAD_MB` (default 100)     |

The type is detected from the file's **contents**, not its name or the browser's MIME type. SVGs
containing scripts, event handlers, `javascript:` URLs, or `foreignObject` are refused. QuickTime
(`.mov`) is refused because browsers don't reliably play it — export MP4 (H.264) instead.

Uploads are written to a temp file rather than held in memory, so large videos don't use RAM.

Served files get `X-Content-Type-Options: nosniff`, a sandboxing `Content-Security-Policy`, and
`Cache-Control: immutable` (a key never changes content). Range requests work (206), so videos
can be seeked, including through the Next.js `/media` proxy.

## Where images are used

| Place                 | Field                      | UI                                     |
| --------------------- | -------------------------- | -------------------------------------- |
| Site settings         | `avatarUrl`                | `MediaSourceField`                     |
| Projects              | `mediaLayout` + `images[]` | select + `ImageListField`              |
| Projects              | `videoUrl`                 | `MediaSourceField kind="video"`        |
| Blog posts            | `coverImageUrl`            | `MediaSourceField`                     |
| Rich text             | `image` node `src`         | editor Image button → upload panel     |
| Technologies (next)   | icon                       | `MediaSourceField` with `compact`      |

Project `mediaLayout`:

- `none` — no images.
- `single` — the first image is a header above the write-up.
- `gallery` — the first image is shown large, with all images as smaller tiles (5 per row on wide
  screens); choosing a tile shows it large. The first image is also the project card's cover.

Project video (`videoUrl`, optional, for `single` and `gallery`): on the **project page only** it
takes the main spot — replacing the header image in `single`, and as the first (default) item in
`gallery`, with a ▶ tile. The first image is its poster. Everywhere else (cards, home) the main
item is always the first **image**. Videos never autoplay.

## Adding an image to a new feature

1. **Server:** an image URL field uses `@IsOptional() @EmptyToNull() @IsImageSource()` (videos:
   `@IsVideoSource()`; each only accepts uploads of its own kind) (single) or
   `ImageDto[]` with `@ValidateNested({ each: true }) @Type(() => ImageDto)` (list with alt text).
2. **Admin:** use `kind: 'image'` / `'images'` / `'video'` in a content resource, or `MediaSourceField`
   / `ImageListField` directly. Presenters take an `onUpload` prop; containers pass `uploadMedia`.
3. **Public:** check sources with `isImageSrc()` / `isVideoSrc()` from `lib/images.ts` before rendering, and always
   give meaningful `alt` text (or `alt=""` when the image is decorative).

## Operations

- `UPLOAD_DIR` (default `server/uploads`, git-ignored) must be persistent storage in production —
  mount a volume.
- Back it up together with the database: content references files by key.
- Replacing or removing an image in a form doesn't delete the old file. `DELETE /api/admin/media/:id`
  removes one; a cleanup for unreferenced uploads is not built yet.
- Uploaded files are public to anyone who knows the key, including images used only in drafts.

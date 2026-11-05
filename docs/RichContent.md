# Rich Content

Every long-form text field (profile bio, project body, experience description, blog post, …) is a
**TipTap document stored as JSON** (`jsonb` in PostgreSQL). Storing JSON instead of HTML means:

- The public renderer only knows a fixed set of node types, so it cannot emit arbitrary HTML
  (no XSS from stored content, no sanitizer needed for rendering).
- Custom block types are just new node types with typed attributes.
- The same document is editable in the admin editor without lossy HTML round trips.

## Shape

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph", "content": [{ "type": "text", "text": "Hello" }] },
    {
      "type": "codeTabs",
      "attrs": {
        "tabs": [
          { "label": "server.ts", "language": "typescript", "code": "console.log('hi')" },
          { "label": "main.py", "language": "python", "code": "print('hi')" }
        ]
      }
    }
  ]
}
```

The server validates that the value is an object with `type: "doc"` and caps its size; it does not
validate every node. The renderer ignores node types it does not know.

## Supported nodes

| Node                          | Source                       | Public rendering                                   |
| ----------------------------- | ---------------------------- | -------------------------------------------------- |
| paragraph, heading (h2–h4), blockquote, bulletList, orderedList, listItem, horizontalRule, hardBreak | TipTap StarterKit | Semantic HTML |
| marks: bold, italic, strike, code, underline, link | StarterKit / Link | Inline HTML; links limited to `http(s)`, `mailto`, relative |
| codeBlock                     | `@tiptap/extension-code-block`, extended in `extensions/code-block` (language field) | Shiki-highlighted `<pre>` in `attrs.language`; none or unknown → plain text |
| image                         | `@tiptap/extension-image`, extended in `extensions/aligned-image.ts` | `<img>` with alt text; uploaded `/media/…` or `http(s)` sources only; `align` attr `left` (default, also for older images) or `center`, output as `data-align` |
| **video** (custom)           | `frontend/src/components/rich-text/extensions/video.ts` | `<video controls>` showing its first frame (never autoplays); `attrs.src` (upload or `http(s)` MP4/WebM) and `attrs.title` (description for screen readers); inserted from the editor's Video panel |
| **imageCarousel** (custom)   | `frontend/src/components/rich-text/extensions/image-carousel` | `ImageCarousel`: one image at a time, centered between faded neighbours, arrows/keys to move (400ms slide, off under reduced motion); `attrs.images` = `{ src, alt }[]`. In the editor the block is compact (thumbnails + count) until Edit |
| **codeTabs** (custom)         | `frontend/src/components/rich-text/extensions/code-tabs` | Tabs of Shiki-highlighted snippets; tab switching is the only client JS |
| **topic** (custom, top level only) | `frontend/src/components/admin/WriteupField.tsx` (not a TipTap node) | Write-up topics shown as underlined tabs (`TopicTabs`); see below |

## Write-up topics

A write-up (project body, job/education/honor write-up) is either one document or two or more
**topics**: titled parts shown as tabs on the public page. Topics are top-level nodes of the same
stored document, so the server and API don't change:

```json
{
  "type": "doc",
  "content": [
    { "type": "topic", "attrs": { "title": "Overview" }, "content": [{ "type": "paragraph" }] },
    { "type": "topic", "attrs": { "title": "Architecture" }, "content": [] }
  ]
}
```

A document only has topics when there are at least two; `docFromTopics()` turns a single topic back
into a plain document. In the admin, write-up fields use `kind: 'writeup'` (`WriteupField`):
"Switch to topic-based write-up" (above the editor) turns the current write-up into the first topic
("Overview") plus a new one, and "+ Add topic" at the end of the tabs adds more; each
topic has its own title, editor, move left/right, and Delete; deleting down to one topic goes back
to a single write-up without tabs. `topicsOf()` reads topics, `isEmptyDoc()` treats a document whose
topics are all empty as empty, and `RichTextRenderer` renders topics as tabs (each panel rendered on
the server; only the tab switching runs in the browser).

## Syntax colors

The public site highlights code on the server (`highlight.ts`). The admin editor colors code as you
type with the same Shiki themes, loaded in the browser on first use (`client-highlight.ts`, with
Shiki's JavaScript regex engine so no WebAssembly ships). Code blocks are colored by a ProseMirror
decoration plugin (`extensions/code-block/highlight-plugin.ts`), which never changes the stored
document. Code tabs draw the colored code behind a textarea with transparent text. Both use the
language list in `languages.ts`.

Languages are picked with a searchable box (`extensions/LanguagePicker.tsx`) over every language
Shiki bundles, plus plain text. It matches ids, names and aliases (exact, then prefix, then
contains, common languages first) and shows the top 8; an empty search lists the common ones. Only a
picked language, or text that exactly names one, is stored, always as Shiki's id (`bash` becomes
`shellscript`).

In both, Tab indents by `CODE_INDENT` (four spaces) and Shift+Tab outdents, instead of moving
focus. In a code tab's textarea, Escape then Tab moves on. Node view text boxes edit a local draft
(`extensions/use-draft.ts`) so the caret doesn't jump when the node's attributes come back a render
later.

## Adding a new block type

1. **Editor extension** — create `frontend/src/components/rich-text/extensions/<name>/` with a TipTap
   `Node.create(...)` definition (attrs, `parseHTML`, `renderHTML`) and, if it needs a custom editing
   UI, a React node view. Register it in the editor's extension list and add a toolbar button.
2. **Renderer** — add a `case '<name>'` in the server renderer
   (`frontend/src/components/rich-text/RichTextRenderer.tsx`) that turns the node's attrs into
   markup. Put any interactive part in a small client component.
3. **Docs** — add the node to the table above.

No server change is needed: documents are stored as opaque JSON.

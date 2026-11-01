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
| codeBlock                     | StarterKit                   | Shiki-highlighted `<pre>`                          |
| image                         | `@tiptap/extension-image`, extended in `extensions/aligned-image.ts` | `<img>` with alt text; uploaded `/media/…` or `http(s)` sources only; `align` attr `left` (default, also for older images) or `center`, output as `data-align` |
| **codeTabs** (custom)         | `frontend/src/components/rich-text/extensions/code-tabs` | Tabs of Shiki-highlighted snippets; tab switching is the only client JS |

## Adding a new block type

1. **Editor extension** — create `frontend/src/components/rich-text/extensions/<name>/` with a TipTap
   `Node.create(...)` definition (attrs, `parseHTML`, `renderHTML`) and, if it needs a custom editing
   UI, a React node view. Register it in the editor's extension list and add a toolbar button.
2. **Renderer** — add a `case '<name>'` in the server renderer
   (`frontend/src/components/rich-text/RichTextRenderer.tsx`) that turns the node's attrs into
   markup. Put any interactive part in a small client component.
3. **Docs** — add the node to the table above.

No server change is needed: documents are stored as opaque JSON.

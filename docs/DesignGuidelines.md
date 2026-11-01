# Design Guidelines

The site should look modern and polished, but **readability always wins**. When a visual idea makes
text harder to read, drop the idea.

## Principles

- **Text first.** Body copy is 17–18px, line-height ~1.7, and content columns are capped at roughly
  70 characters (`max-width: 70ch` for prose).
- **High contrast.** Body text meets WCAG AA (4.5:1) in light and dark modes. Muted text is still AA.
- **Calm palette.** Neutral backgrounds, one accent color. No gradients behind text, no busy
  backgrounds, no neon.
- **Clear hierarchy.** A small type scale, generous whitespace, and obvious headings beat decoration.
- **Light motion.** Short (150–300ms), subtle fades/slides on page entry and hover. Nothing loops,
  bounces, or follows the cursor. All motion is disabled under `prefers-reduced-motion: reduce`.
  The one exception is a project's main video, which plays muted on a loop with visible controls —
  and stays paused on its first frame for reduced-motion visitors.
- **Tooltips.** `components/public/Tooltip` adds a short label to a link (e.g. "Read more" on a job,
  "Employer’s site" on an employer). It fades and rises in on hover or keyboard focus, is pure CSS,
  loses its motion under reduced motion, and is the link's `aria-describedby` (hidden from
  surrounding text so it never becomes part of a heading's name).
- **Light and dark.** Follows the visitor's system setting until they pick one with the theme toggle.
  Colors are CSS custom properties so a personal branch can re-theme by changing tokens only.
- **Accessible by default.** Semantic HTML, visible focus rings, keyboard reachable controls,
  `alt` text on images, and no information conveyed by color alone.
- **Fast.** Public pages are server components. Client JavaScript only where interaction needs it
  (code tabs, theme-aware bits).

## Theming

Design tokens live in `frontend/src/app/globals.css` under `:root`, each written as
`light-dark(<light>, <dark>)`. To re-theme a personal branch, change the tokens there rather than
individual components.

Which side of `light-dark()` applies comes from `color-scheme`: `light dark` by default (the system
decides), or a single scheme when `<html>` has `data-theme="light"` / `"dark"`. Tailwind's `dark:`
variant is redefined to follow the same rule, so `dark:` utilities keep working with the toggle.

The visitor's choice is stored in `localStorage` (`lib/theme.ts`) and applied by a small inline
script in the root layout's `<head>`, which runs before first paint. That keeps every page statically
prerendered — the server never reads a cookie for the theme — without a flash of the wrong scheme.
Toggling back to the system's own scheme clears the stored choice. The toggle's icon is chosen by CSS
rather than React state, so server HTML and hydration always agree.

## Code blocks

Code is highlighted on the server (Shiki) with a theme pair that reads well in both color schemes;
each token's color is emitted as `light-dark()`, so it follows the page's scheme with no extra CSS.
Code blocks scroll horizontally rather than wrap, and use a monospace font at a slightly smaller size
than body text.

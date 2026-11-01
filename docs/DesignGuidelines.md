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
- **Light and dark.** Follows the visitor's system setting. Colors are CSS custom properties so a
  personal branch can re-theme by changing tokens only.
- **Accessible by default.** Semantic HTML, visible focus rings, keyboard reachable controls,
  `alt` text on images, and no information conveyed by color alone.
- **Fast.** Public pages are server components. Client JavaScript only where interaction needs it
  (code tabs, theme-aware bits).

## Theming

Design tokens live in `frontend/src/app/globals.css` under `:root` and the dark-mode media query.
To re-theme a personal branch, change the tokens there rather than individual components.

## Code blocks

Code is highlighted on the server (Shiki) with a theme pair that reads well in both color schemes.
Code blocks scroll horizontally rather than wrap, and use a monospace font at a slightly smaller size
than body text.

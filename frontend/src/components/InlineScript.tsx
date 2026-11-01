'use client';

/**
 * A script that runs once while the server HTML is parsed (e.g. to apply the theme before first
 * paint). When React renders it on the client it's `text/plain`, so React doesn't warn about
 * script tags and nothing runs twice; suppressHydrationWarning covers the type difference.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

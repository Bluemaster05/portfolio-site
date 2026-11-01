import type { BundledLanguage, Highlighter } from 'shiki';

/**
 * Syntax colors for the admin editor, with the same Shiki themes the public site uses on the
 * server (highlight.ts). Shiki and each language load on first use; until then tokensFor() returns
 * null and the code shows uncolored. Subscribe to be told when more becomes available.
 */

export interface CodeToken {
  content: string;
  /** A light-dark() pair that follows the page's color scheme */
  color?: string;
}

const THEMES = { light: 'github-light', dark: 'github-dark' } as const;

let highlighter: Highlighter | undefined;
let languages: Record<string, unknown> | undefined;
let started = false;
const loadingLanguages = new Set<string>();
const cache = new Map<string, CodeToken[][]>();
const listeners = new Set<() => void>();
let version = 0;

function notify() {
  version += 1;
  for (const listener of listeners) listener();
}

/** Called whenever Shiki or a language finishes loading, so colors can be recomputed. */
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Changes whenever subscribers are notified; for useSyncExternalStore. */
export function getVersion(): number {
  return version;
}

function start() {
  if (started) return;
  started = true;
  void import('shiki').then(async ({ bundledLanguages, createHighlighter, createJavaScriptRegexEngine }) => {
    // The JavaScript regex engine avoids shipping Shiki's WebAssembly engine to the admin
    highlighter = await createHighlighter({
      themes: [THEMES.light, THEMES.dark],
      langs: [],
      engine: createJavaScriptRegexEngine(),
    });
    languages = bundledLanguages;
    notify();
  });
}

function isBundledLanguage(language: string): language is BundledLanguage {
  return languages !== undefined && language in languages;
}

/** Colored tokens per line, or null while loading or for unknown languages (show plain text). */
export function tokensFor(code: string, language: string): CodeToken[][] | null {
  const lang = language.trim().toLowerCase();
  if (!lang || lang === 'text') return null;
  if (!highlighter) {
    start();
    return null;
  }
  if (!isBundledLanguage(lang)) return null;
  if (!highlighter.getLoadedLanguages().includes(lang)) {
    if (!loadingLanguages.has(lang)) {
      loadingLanguages.add(lang);
      void highlighter.loadLanguage(lang).then(notify);
    }
    return null;
  }

  const key = `${lang}\u0000${code}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const { tokens } = highlighter.codeToTokens(code, { lang, themes: THEMES, defaultColor: 'light-dark()' });
  const result = tokens.map((line) => line.map((token) => ({ content: token.content, color: token.htmlStyle?.color })));
  if (cache.size > 200) cache.clear();
  cache.set(key, result);
  return result;
}

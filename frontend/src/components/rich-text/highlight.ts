import 'server-only';
import { cacheLife } from 'next/cache';
import { bundledLanguages, codeToHtml, type BundledLanguage } from 'shiki';

function isBundledLanguage(language: string): language is BundledLanguage {
  return language in bundledLanguages;
}

/**
 * Highlighted HTML for a snippet, with light-dark() colors that follow the page's color-scheme.
 * Cached: the output depends only on the arguments, and Shiki reads the clock internally,
 * which Next.js doesn't allow while prerendering uncached work.
 */
export async function highlight(code: string, language: string): Promise<string> {
  'use cache';
  cacheLife('max');
  const lang = language.toLowerCase();
  return codeToHtml(code, {
    lang: isBundledLanguage(lang) ? lang : 'text',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: 'light-dark()',
  });
}

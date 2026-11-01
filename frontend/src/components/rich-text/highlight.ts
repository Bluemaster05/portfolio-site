import 'server-only';
import { bundledLanguages, codeToHtml, type BundledLanguage } from 'shiki';

function isBundledLanguage(language: string): language is BundledLanguage {
  return language in bundledLanguages;
}

/** Highlighted HTML for a snippet, with light and dark colors (switched in globals.css). */
export async function highlight(code: string, language: string): Promise<string> {
  const lang = language.toLowerCase();
  return codeToHtml(code, {
    lang: isBundledLanguage(lang) ? lang : 'text',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: 'light',
  });
}

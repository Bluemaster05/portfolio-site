import { bundledLanguagesInfo } from 'shiki/langs';

export interface CodeLanguage {
  /** Stored in the document and passed to Shiki */
  id: string;
  name: string;
  aliases: string[];
}

/** Every language Shiki bundles, plus plain text (no highlighting). */
export const CODE_LANGUAGE_OPTIONS: CodeLanguage[] = [
  { id: 'text', name: 'Plain text', aliases: ['plaintext', 'txt'] },
  ...bundledLanguagesInfo.map(({ id, name, aliases }) => ({ id, name, aliases: aliases ?? [] })),
];

/** Shown when the search is empty, and ranked first among equally good matches. */
const POPULAR = [
  'typescript', 'tsx', 'javascript', 'jsx', 'python', 'java', 'csharp', 'cpp', 'c', 'go', 'rust',
  'kotlin', 'swift', 'php', 'ruby', 'sql', 'html', 'css', 'json', 'yaml', 'shellscript', 'powershell',
  'markdown', 'docker', 'text',
];

function popularity(language: CodeLanguage): number {
  const index = POPULAR.indexOf(language.id);
  return index === -1 ? POPULAR.length : index;
}

/** The language a stored id or alias refers to, if any. */
export function findLanguage(value: string): CodeLanguage | undefined {
  const key = value.trim().toLowerCase();
  return CODE_LANGUAGE_OPTIONS.find((language) => language.id === key || language.aliases.includes(key));
}

/** 0 exact, 1 starts with, 2 a word starts with, 3 contains; undefined when it doesn't match. */
function matchScore(text: string, query: string): number | undefined {
  const value = text.toLowerCase();
  if (value === query) return 0;
  if (value.startsWith(query)) return 1;
  if (value.split(/[^a-z0-9+#]+/).some((word) => word.startsWith(query))) return 2;
  if (value.includes(query)) return 3;
  return undefined;
}

/** Best matches for a search by id, name or alias; the popular languages when it's empty. */
export function searchLanguages(query: string, limit = 8): CodeLanguage[] {
  const q = query.trim().toLowerCase();
  if (!q) return POPULAR.flatMap((id) => CODE_LANGUAGE_OPTIONS.find((language) => language.id === id) ?? []).slice(0, limit);

  return CODE_LANGUAGE_OPTIONS.flatMap((language) => {
    const scores = [language.id, language.name, ...language.aliases]
      .map((text) => matchScore(text, q))
      .filter((score) => score !== undefined);
    return scores.length ? [{ language, score: Math.min(...scores) }] : [];
  })
    .sort(
      (a, b) =>
        a.score - b.score ||
        popularity(a.language) - popularity(b.language) ||
        a.language.name.length - b.language.name.length,
    )
    .slice(0, limit)
    .map(({ language }) => language);
}

/** What Tab inserts in code, in code blocks and code tabs alike. */
export const CODE_INDENT = '    ';

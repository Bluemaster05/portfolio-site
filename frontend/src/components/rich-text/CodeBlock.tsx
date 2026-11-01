import { highlight } from './highlight';

/** A single highlighted snippet. Shiki escapes the code, so its HTML is safe to inject. */
export async function CodeBlock({ code, language }: { code: string; language: string }) {
  const html = await highlight(code, language);
  return <div className="code-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

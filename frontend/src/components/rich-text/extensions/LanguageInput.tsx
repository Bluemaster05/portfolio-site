'use client';

import { useId } from 'react';
import { CODE_LANGUAGES } from '../languages';
import { useDraft } from './use-draft';

/** Language box for code in the editor: suggestions from CODE_LANGUAGES, any Shiki id accepted. */
export function LanguageInput({
  value,
  onChange,
  inline = false,
}: {
  value: string;
  onChange: (language: string) => void;
  /** Label beside the box instead of above it, for compact bars */
  inline?: boolean;
}) {
  const listId = useId();
  const [draft, change] = useDraft(value, onChange);
  return (
    <label className={`${inline ? 'flex items-center gap-2' : 'grid gap-1'} text-xs text-muted`}>
      Language
      <input
        list={listId}
        value={draft}
        placeholder="text"
        onChange={(event) => change(event.target.value)}
        className="rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
      />
      <datalist id={listId}>
        {CODE_LANGUAGES.map((language) => (
          <option key={language} value={language} />
        ))}
      </datalist>
    </label>
  );
}

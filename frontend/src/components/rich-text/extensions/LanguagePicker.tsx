'use client';

import { autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { findLanguage, searchLanguages, type CodeLanguage } from '../languages';

/**
 * Searchable language box for code in the editor (an ARIA combobox). Typing filters every Shiki
 * language by id, name or alias; arrows move, Enter or a click picks, Escape closes. Only a picked
 * language (or text that exactly names one) is stored; anything else reverts on leaving the box.
 */
export function LanguagePicker({
  value,
  onChange,
  inline = false,
}: {
  value: string;
  onChange: (language: string) => void;
  /** Label beside the box instead of above it, for compact bars */
  inline?: boolean;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const current = findLanguage(query);
  // Searching from what's in the box, except when it still shows the stored language
  const results = searchLanguages(query === value ? '' : query);

  // Fixed positioning so the list isn't clipped by the editor's frame
  useEffect(() => {
    const input = inputRef.current;
    const list = listRef.current;
    if (!open || !input || !list) return;
    return autoUpdate(input, list, () => {
      void computePosition(input, list, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [offset(4), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        list.style.left = `${x}px`;
        list.style.top = `${y}px`;
      });
    });
  }, [open]);

  function pick(language: CodeLanguage) {
    setQuery(language.id);
    setOpen(false);
    if (language.id !== value) onChange(language.id);
  }

  /** Leaving the box keeps an exact match and otherwise shows the stored language again. */
  function settle() {
    setOpen(false);
    const match = findLanguage(query);
    if (match) pick(match);
    else setQuery(value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(0);
          return;
        }
        const step = event.key === 'ArrowDown' ? 1 : -1;
        setActive((index) => (index + step + results.length) % Math.max(results.length, 1));
        return;
      }
      case 'Enter':
        event.preventDefault();
        if (open && results[active]) pick(results[active]);
        else settle();
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          setOpen(false);
          setQuery(value);
        }
        return;
    }
  }

  return (
    <div className={`${inline ? 'flex items-center gap-2' : 'grid gap-1'} text-xs text-muted`}>
      <label htmlFor={`${listId}-input`}>Language</label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        value={query}
        placeholder="Search languages"
        title={current?.name}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActive(0);
        }}
        onFocus={(event) => event.currentTarget.select()}
        onClick={() => setOpen(true)}
        onBlur={settle}
        onKeyDown={onKeyDown}
        className="w-44 rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
      />
      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Languages"
          // No height cap or scrolling: searchLanguages() returns at most 8 results
          className="fixed left-0 top-0 z-50 w-64 rounded-md border border-border bg-surface p-1 text-sm leading-5 shadow-lg"
        >
          {results.length === 0 && <li className="px-2 py-1.5 text-muted">No matching language</li>}
          {results.map((language, index) => (
            <li
              key={language.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // Keep focus in the input so blur doesn't settle before the click picks
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(language)}
              className={`flex cursor-pointer items-baseline justify-between gap-3 rounded px-2 py-1.5 ${
                index === active ? 'bg-accent-soft text-foreground' : 'text-foreground'
              }`}
            >
              <span>{language.name}</span>
              <span className="font-mono text-xs text-muted">{language.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

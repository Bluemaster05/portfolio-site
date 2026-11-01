'use client';

import { useId, useState } from 'react';
import type { TechnologySummary } from '@/lib/api/types';
import { errorMessage } from '@/lib/admin/api-error';
import { TechIcon } from '@/components/public/TechPill';
import { Button, TextInput } from './ui';

interface TechnologyPickerProps {
  /** Selected technology ids, in display order */
  value: number[];
  onChange: (ids: number[]) => void;
  technologies: TechnologySummary[];
  /** Creates a technology by name, for ones not added yet */
  onCreate?: (name: string) => Promise<TechnologySummary>;
  label: string;
}

/** Choose a project's technologies from the shared list, in order, with quick-add for new ones. */
export function TechnologyPicker({ value, onChange, technologies, onCreate, label }: TechnologyPickerProps) {
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>();
  const searchId = useId();

  const byId = new Map(technologies.map((technology) => [technology.id, technology]));
  const selected = value.map((id) => byId.get(id)).filter((technology) => technology !== undefined);
  const query = search.trim().toLowerCase();
  const available = technologies.filter(
    (technology) => !value.includes(technology.id) && technology.name.toLowerCase().includes(query),
  );
  const exactMatch = technologies.some((technology) => technology.name.toLowerCase() === query);

  function move(index: number, direction: -1 | 1) {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }

  async function create() {
    if (!onCreate || !search.trim()) return;
    setCreating(true);
    setError(undefined);
    try {
      const technology = await onCreate(search.trim());
      onChange([...value, technology.id]);
      setSearch('');
    } catch (createError) {
      setError(errorMessage(createError));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-3">
      {selected.length > 0 ? (
        <ol aria-label={`Selected ${label.toLowerCase()}`} className="flex flex-wrap gap-2">
          {selected.map((technology, index) => (
            <li
              key={technology.id}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-accent-soft py-0.5 pl-2.5 pr-1 text-sm"
            >
              <TechIcon technology={technology} />
              <span className="mx-0.5">{technology.name}</span>
              <button
                type="button"
                aria-label={`Move ${technology.name} earlier`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="rounded px-1 text-muted hover:text-foreground disabled:opacity-30"
              >
                ←
              </button>
              <button
                type="button"
                aria-label={`Move ${technology.name} later`}
                disabled={index === selected.length - 1}
                onClick={() => move(index, 1)}
                className="rounded px-1 text-muted hover:text-foreground disabled:opacity-30"
              >
                →
              </button>
              <button
                type="button"
                aria-label={`Remove ${technology.name}`}
                onClick={() => onChange(value.filter((id) => id !== technology.id))}
                className="rounded px-1.5 text-muted hover:text-foreground"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">None selected.</p>
      )}

      <div className="grid gap-2 rounded-md border border-border bg-surface p-3">
        <TextInput
          id={searchId}
          aria-label={`Find ${label.toLowerCase()}`}
          placeholder="Search or type a new technology"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            if (available.length === 1) {
              onChange([...value, available[0].id]);
              setSearch('');
            } else if (!exactMatch) void create();
          }}
        />
        <ul className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
          {available.map((technology) => (
            <li key={technology.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...value, technology.id]);
                  setSearch('');
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-sm text-muted hover:border-accent hover:text-foreground"
              >
                <TechIcon technology={technology} />+ {technology.name}
              </button>
            </li>
          ))}
        </ul>
        {onCreate && query && !exactMatch && (
          <div>
            <Button onClick={() => void create()} disabled={creating}>
              {creating ? 'Adding…' : `Create “${search.trim()}”`}
            </Button>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

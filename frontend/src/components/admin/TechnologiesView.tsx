'use client';

import { useState, type FormEvent } from 'react';
import type { Technology } from '@/lib/api/types';
import type { UploadMedia } from '@/lib/admin/media';
import { TechPill } from '@/components/public/TechPill';
import { MediaSourceField } from './MediaSourceField';
import { Button, ErrorBanner, Field, TextInput } from './ui';

export interface TechnologyDraft {
  name: string;
  iconUrl: string;
  url: string;
}

interface TechnologiesViewProps {
  technologies: Technology[];
  busy: boolean;
  error?: string;
  onCreate: (draft: TechnologyDraft) => Promise<void>;
  onUpdate: (id: number, draft: TechnologyDraft) => Promise<void>;
  onDelete: (id: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpload: UploadMedia;
}

/** Manage the technologies projects can use: name, icon, link, and order. */
export function TechnologiesView({
  technologies,
  busy,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onMove,
  onUpload,
}: TechnologiesViewProps) {
  const [editingId, setEditingId] = useState<number>();

  return (
    <div className="grid gap-8">
      <p className="max-w-[70ch] text-muted">
        Technologies show as pins on projects, with their icon, and visitors can filter the project list by them. Pick
        them for a project in its editor.
      </p>
      <ErrorBanner message={error} />

      <section aria-labelledby="new-technology" className="rounded-card border border-border bg-surface p-5">
        <h2 id="new-technology" className="mb-4 font-semibold">
          New technology
        </h2>
        <TechnologyForm submitLabel="Add technology" busy={busy} onUpload={onUpload} onSubmit={onCreate} resetOnSubmit />
      </section>

      {technologies.length === 0 ? (
        <p className="text-muted">No technologies yet.</p>
      ) : (
        <ol className="divide-y divide-border rounded-card border border-border bg-surface">
          {technologies.map((technology, index) => (
            <li key={technology.id} className="px-4 py-3">
              {editingId === technology.id ? (
                <TechnologyForm
                  initial={{ name: technology.name, iconUrl: technology.iconUrl ?? '', url: technology.url ?? '' }}
                  submitLabel="Save"
                  busy={busy}
                  onUpload={onUpload}
                  onSubmit={async (draft) => {
                    await onUpdate(technology.id, draft);
                    setEditingId(undefined);
                  }}
                  onCancel={() => setEditingId(undefined)}
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label={`Move ${technology.name} up`}
                      disabled={busy || index === 0}
                      onClick={() => onMove(index, -1)}
                      className="px-1 text-muted hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${technology.name} down`}
                      disabled={busy || index === technologies.length - 1}
                      onClick={() => onMove(index, 1)}
                      className="px-1 text-muted hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <div className="min-w-0 flex-1">
                    <TechPill technology={technology} />
                    {technology.url && <p className="mt-1 truncate text-sm text-muted">{technology.url}</p>}
                  </div>
                  <Button variant="ghost" disabled={busy} onClick={() => setEditingId(technology.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      if (window.confirm(`Delete “${technology.name}”? Projects using it will lose it.`)) {
                        onDelete(technology.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

interface TechnologyFormProps {
  initial?: TechnologyDraft;
  submitLabel: string;
  busy: boolean;
  onUpload: UploadMedia;
  onSubmit: (draft: TechnologyDraft) => Promise<void>;
  onCancel?: () => void;
  /** Clear the form after a successful submit (for adding several in a row) */
  resetOnSubmit?: boolean;
}

const EMPTY: TechnologyDraft = { name: '', iconUrl: '', url: '' };

function TechnologyForm({ initial = EMPTY, submitLabel, busy, onUpload, onSubmit, onCancel, resetOnSubmit }: TechnologyFormProps) {
  const [draft, setDraft] = useState(initial);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await onSubmit({ ...draft, name: draft.name.trim() });
      if (resetOnSubmit) {
        setDraft(EMPTY);
        setFormKey((key) => key + 1);
      }
    } catch {
      // The container shows the error; keep what was typed
    }
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Name" htmlFor={`tech-name-${formKey}`} required>
        <TextInput
          id={`tech-name-${formKey}`}
          required
          maxLength={60}
          placeholder="TypeScript"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Field>
      <Field label="Website" htmlFor={`tech-url-${formKey}`} help="Optional">
        <TextInput
          id={`tech-url-${formKey}`}
          type="url"
          placeholder="https://…"
          value={draft.url}
          onChange={(event) => setDraft({ ...draft, url: event.target.value })}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Icon" help="Square images work best; SVG stays sharp at any size">
          <MediaSourceField
            label="Icon"
            compact
            value={draft.iconUrl}
            onChange={(iconUrl) => setDraft({ ...draft, iconUrl })}
            onUpload={onUpload}
          />
        </Field>
      </div>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" variant="primary" disabled={busy || !draft.name.trim()}>
          {submitLabel}
        </Button>
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}

'use client';

import { useState, type FormEvent } from 'react';
import type { Employer } from '@/lib/api/types';
import type { UploadMedia } from '@/lib/admin/media';
import { EmployerLogo } from '@/components/public/EmployerLogo';
import { MediaSourceField } from './MediaSourceField';
import { Button, ErrorBanner, Field, TextInput } from './ui';

export interface EmployerDraft {
  name: string;
  url: string;
  logoUrl: string;
}

interface EmployersViewProps {
  employers: Employer[];
  busy: boolean;
  error?: string;
  onCreate: (draft: EmployerDraft) => Promise<void>;
  onUpdate: (id: number, draft: EmployerDraft) => Promise<void>;
  onDelete: (id: number) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onUpload: UploadMedia;
}

/** Manage employers: name, website, logo, and their order on the experience page. */
export function EmployersView({
  employers,
  busy,
  error,
  onCreate,
  onUpdate,
  onDelete,
  onMove,
  onUpload,
}: EmployersViewProps) {
  const [editingId, setEditingId] = useState<number>();

  return (
    <div className="grid gap-8">
      <p className="max-w-[70ch] text-muted">
        Each job under Experience belongs to an employer, and the experience page shows one card per employer with
        its jobs inside. Employers keep this order; ties go to the one with a current job, then the most recently
        active.
      </p>
      <ErrorBanner message={error} />

      <section aria-labelledby="new-employer" className="rounded-card border border-border bg-surface p-5">
        <h2 id="new-employer" className="mb-4 font-semibold">
          New employer
        </h2>
        <EmployerForm submitLabel="Add employer" busy={busy} onUpload={onUpload} onSubmit={onCreate} resetOnSubmit />
      </section>

      {employers.length === 0 ? (
        <p className="text-muted">No employers yet.</p>
      ) : (
        <ol className="divide-y divide-border rounded-card border border-border bg-surface">
          {employers.map((employer, index) => (
            <li key={employer.id} className="px-4 py-3">
              {editingId === employer.id ? (
                <EmployerForm
                  initial={{ name: employer.name, url: employer.url ?? '', logoUrl: employer.logoUrl ?? '' }}
                  submitLabel="Save"
                  busy={busy}
                  onUpload={onUpload}
                  onSubmit={async (draft) => {
                    await onUpdate(employer.id, draft);
                    setEditingId(undefined);
                  }}
                  onCancel={() => setEditingId(undefined)}
                />
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      aria-label={`Move ${employer.name} up`}
                      disabled={busy || index === 0}
                      onClick={() => onMove(index, -1)}
                      className="px-1 text-muted hover:text-foreground disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${employer.name} down`}
                      disabled={busy || index === employers.length - 1}
                      onClick={() => onMove(index, 1)}
                      className="px-1 text-muted hover:text-foreground disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  <EmployerLogo src={employer.logoUrl} height="h-10" maxWidth="max-w-28" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{employer.name}</p>
                    <p className="truncate text-sm text-muted">
                      {employer.jobCount} job{employer.jobCount === 1 ? '' : 's'}
                      {employer.url && ` · ${employer.url}`}
                    </p>
                  </div>
                  <Button variant="ghost" disabled={busy} onClick={() => setEditingId(employer.id)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={busy || employer.jobCount > 0}
                    title={employer.jobCount > 0 ? 'Move or delete its jobs first' : undefined}
                    onClick={() => {
                      if (window.confirm(`Delete “${employer.name}”?`)) onDelete(employer.id);
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

interface EmployerFormProps {
  initial?: EmployerDraft;
  submitLabel: string;
  busy: boolean;
  onUpload: UploadMedia;
  onSubmit: (draft: EmployerDraft) => Promise<void>;
  onCancel?: () => void;
  /** Clear the form after a successful submit (for adding several in a row) */
  resetOnSubmit?: boolean;
}

const EMPTY: EmployerDraft = { name: '', url: '', logoUrl: '' };

function EmployerForm({ initial = EMPTY, submitLabel, busy, onUpload, onSubmit, onCancel, resetOnSubmit }: EmployerFormProps) {
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
      <Field label="Name" htmlFor={`employer-name-${formKey}`} required>
        <TextInput
          id={`employer-name-${formKey}`}
          required
          maxLength={200}
          placeholder="Acme Corp"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </Field>
      <Field label="Website" htmlFor={`employer-url-${formKey}`} help="Optional">
        <TextInput
          id={`employer-url-${formKey}`}
          type="url"
          placeholder="https://…"
          value={draft.url}
          onChange={(event) => setDraft({ ...draft, url: event.target.value })}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Logo" help="Optional. Square images work best.">
          <MediaSourceField
            label="Logo"
            compact
            value={draft.logoUrl}
            onChange={(logoUrl) => setDraft({ ...draft, logoUrl })}
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

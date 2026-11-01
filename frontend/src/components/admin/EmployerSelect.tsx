'use client';

import { useState, type KeyboardEvent } from 'react';
import type { EmployerSummary } from '@/lib/api/types';
import { errorMessage } from '@/lib/admin/api-error';
import { Button, TextInput } from './ui';

interface EmployerSelectProps {
  id: string;
  /** The chosen employer's id as a string; '' for none */
  value: string;
  onChange: (value: string) => void;
  employers: EmployerSummary[];
  /** Creates an employer by name and resolves to it; enables "New…" */
  onCreate?: (name: string) => Promise<EmployerSummary>;
  required?: boolean;
}

/** Pick a job's employer, or add a new one by name without leaving the editor. */
export function EmployerSelect({ id, value, onChange, employers, onCreate, required }: EmployerSelectProps) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function add() {
    if (!onCreate || !name.trim()) return;
    setBusy(true);
    setError(undefined);
    try {
      const employer = await onCreate(name.trim());
      onChange(String(employer.id));
      setName('');
      setAdding(false);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  // Enter adds the employer instead of submitting the surrounding form
  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    void add();
  }

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <select
          id={id}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-md border border-border bg-surface px-3 py-2 text-[0.95rem] focus:border-accent focus:outline-none"
        >
          <option value="">Choose an employer…</option>
          {employers.map((employer) => (
            <option key={employer.id} value={String(employer.id)}>
              {employer.name}
            </option>
          ))}
        </select>
        {onCreate && (
          <Button onClick={() => setAdding((open) => !open)} aria-expanded={adding}>
            New…
          </Button>
        )}
      </div>
      {adding && (
        <div className="flex gap-2">
          <TextInput
            aria-label="New employer name"
            placeholder="Employer name"
            maxLength={200}
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <Button variant="primary" disabled={busy || !name.trim()} onClick={() => void add()}>
            Add
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

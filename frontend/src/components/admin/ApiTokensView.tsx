'use client';

import { useState, type FormEvent } from 'react';
import type { ApiScope, ApiToken } from '@/lib/api/types';
import { formatDate } from '@/lib/format';
import { Badge, Button, Checkbox, ErrorBanner, Field, TextInput } from './ui';

export const ALL_SCOPES: ApiScope[] = [
  'site:read',
  'projects:read',
  'experience:read',
  'education:read',
  'honors:read',
  'blog:read',
];

interface ApiTokensViewProps {
  tokens: ApiToken[];
  /** The full value of a token just created; shown once */
  createdToken?: string;
  creating: boolean;
  busy: boolean;
  error?: string;
  onCreate: (name: string, scopes: ApiScope[]) => void;
  onRevoke: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ApiTokensView({ tokens, createdToken, creating, busy, error, onCreate, onRevoke, onDelete }: ApiTokensViewProps) {
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<ApiScope[]>(ALL_SCOPES);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onCreate(name.trim(), scopes);
    setName('');
  }

  return (
    <div className="grid gap-10">
      <p className="max-w-[70ch] text-muted">
        The public site reads content with a read-only token set as <code className="font-mono">PORTFOLIO_API_TOKEN</code>{' '}
        on the frontend server. Tokens can only read published content from the scopes they&apos;re given.
      </p>
      <ErrorBanner message={error} />

      {createdToken && (
        <div role="status" className="grid gap-2 rounded-card border border-accent bg-accent-soft p-4">
          <p className="font-medium">Copy your new token now — it won&apos;t be shown again.</p>
          <code className="select-all break-all rounded bg-surface px-3 py-2 font-mono text-sm">{createdToken}</code>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-card border border-border bg-surface p-5">
        <h2 className="font-semibold">New token</h2>
        <Field label="Name" htmlFor="token-name" required help="Where it's used, e.g. “Production site”">
          <TextInput id="token-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <fieldset className="grid gap-2">
          <legend className="mb-1 text-sm font-medium">Scopes</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {ALL_SCOPES.map((scope) => (
              <Checkbox
                key={scope}
                id={`scope-${scope}`}
                label={scope}
                checked={scopes.includes(scope)}
                onChange={(checked) =>
                  setScopes((current) => (checked ? [...current, scope] : current.filter((s) => s !== scope)))
                }
              />
            ))}
          </div>
        </fieldset>
        <div>
          <Button type="submit" variant="primary" disabled={creating || scopes.length === 0}>
            {creating ? 'Creating…' : 'Create token'}
          </Button>
        </div>
      </form>

      <section aria-labelledby="tokens-heading" className="grid gap-3">
        <h2 id="tokens-heading" className="font-semibold">
          Tokens
        </h2>
        {tokens.length === 0 ? (
          <p className="text-muted">No tokens yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-card border border-border bg-surface">
            {tokens.map((token) => (
              <li key={token.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {token.name} <span className="font-mono text-sm text-muted">{token.prefix}…</span>
                  </p>
                  <p className="text-sm text-muted">
                    {token.scopes.join(', ')} · created {formatDate(token.createdAt)}
                    {token.lastUsedAt ? ` · last used ${formatDate(token.lastUsedAt)}` : ' · never used'}
                  </p>
                </div>
                <Badge tone={token.revokedAt ? 'muted' : 'success'}>{token.revokedAt ? 'Revoked' : 'Active'}</Badge>
                {!token.revokedAt && (
                  <Button variant="ghost" disabled={busy} onClick={() => onRevoke(token.id)}>
                    Revoke
                  </Button>
                )}
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete token “${token.name}”?`)) onDelete(token.id);
                  }}
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

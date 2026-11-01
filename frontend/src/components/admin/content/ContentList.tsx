'use client';

import Link from 'next/link';
import { Badge, Button } from '../ui';

export interface ContentListRow {
  id: number;
  title: string;
  subtitle?: string;
  published: boolean;
}

interface ContentListProps {
  rows: ContentListRow[];
  editHref: (id: number) => string;
  singular: string;
  busy: boolean;
  onMove: (index: number, direction: -1 | 1) => void;
  onTogglePublished: (id: number, published: boolean) => void;
  onDelete: (id: number) => void;
}

/** Items in display order with move, publish, edit, and delete controls. */
export function ContentList({ rows, editHref, singular, busy, onMove, onTogglePublished, onDelete }: ContentListProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border px-5 py-8 text-center text-muted">
        Nothing here yet — add your first {singular}.
      </p>
    );
  }

  return (
    <ol className="divide-y divide-border rounded-card border border-border bg-surface">
      {rows.map((row, index) => (
        <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex flex-col">
            <button
              type="button"
              aria-label={`Move ${row.title} up`}
              disabled={busy || index === 0}
              onClick={() => onMove(index, -1)}
              className="px-1 text-muted hover:text-foreground disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`Move ${row.title} down`}
              disabled={busy || index === rows.length - 1}
              onClick={() => onMove(index, 1)}
              className="px-1 text-muted hover:text-foreground disabled:opacity-30"
            >
              ↓
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <Link href={editHref(row.id)} className="font-medium hover:text-accent">
              {row.title}
            </Link>
            {row.subtitle && <p className="truncate text-sm text-muted">{row.subtitle}</p>}
          </div>
          <Badge tone={row.published ? 'success' : 'muted'}>{row.published ? 'Published' : 'Draft'}</Badge>
          <div className="flex gap-1">
            <Button variant="ghost" disabled={busy} onClick={() => onTogglePublished(row.id, !row.published)}>
              {row.published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Delete “${row.title}”? This can’t be undone.`)) onDelete(row.id);
              }}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ol>
  );
}

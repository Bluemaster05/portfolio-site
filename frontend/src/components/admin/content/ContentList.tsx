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
export function ContentList({ rows, singular, ...rest }: ContentListProps) {
  if (rows.length === 0) return <EmptyList singular={singular} />;
  return (
    <ol className="divide-y divide-border rounded-card border border-border bg-surface">
      <ContentRows rows={rows} {...rest} />
    </ol>
  );
}

function EmptyList({ singular }: { singular: string }) {
  return (
    <p className="rounded-card border border-dashed border-border px-5 py-8 text-center text-muted">
      Nothing here yet — add your first {singular}.
    </p>
  );
}

export interface ContentListGroup {
  id: number;
  title: string;
  rows: ContentListRow[];
}

interface GroupedContentListProps extends Omit<ContentListProps, 'rows' | 'onMove'> {
  groups: ContentListGroup[];
  /** e.g. "employer" */
  groupSingular: string;
  /** Where groups are edited, e.g. /admin/employers */
  manageHref: string;
  onMoveGroup: (index: number, direction: -1 | 1) => void;
  /** Moves a row within its group */
  onMove: (groupIndex: number, index: number, direction: -1 | 1) => void;
}

/**
 * Items under their groups (e.g. jobs under employers), in the order the public site shows them.
 * Groups move with their own arrows; items move only within their group.
 */
export function GroupedContentList({
  groups,
  groupSingular,
  manageHref,
  singular,
  busy,
  onMoveGroup,
  onMove,
  ...rest
}: GroupedContentListProps) {
  if (groups.length === 0) return <EmptyList singular={singular} />;
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted">
        Grouped by {groupSingular}, in the order the site shows them.{' '}
        <Link href={manageHref} className="text-accent underline underline-offset-4">
          Edit {groupSingular}s
        </Link>
      </p>
      {groups.map((group, groupIndex) => (
        <section
          key={group.id}
          aria-label={group.title}
          className="overflow-clip rounded-card border border-border bg-surface"
        >
          <header className="flex items-center gap-3 border-b border-border bg-background/60 px-4 py-2.5">
            <MoveButtons
              label={group.title}
              busy={busy}
              first={groupIndex === 0}
              last={groupIndex === groups.length - 1}
              onMove={(direction) => onMoveGroup(groupIndex, direction)}
            />
            <h2 className="font-semibold">{group.title}</h2>
          </header>
          <ol className="divide-y divide-border">
            <ContentRows
              rows={group.rows}
              busy={busy}
              onMove={(index, direction) => onMove(groupIndex, index, direction)}
              {...rest}
            />
          </ol>
        </section>
      ))}
    </div>
  );
}

function MoveButtons({
  label,
  busy,
  first,
  last,
  onMove,
}: {
  label: string;
  busy: boolean;
  first: boolean;
  last: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-label={`Move ${label} up`}
        disabled={busy || first}
        onClick={() => onMove(-1)}
        className="px-1 text-muted hover:text-foreground disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        aria-label={`Move ${label} down`}
        disabled={busy || last}
        onClick={() => onMove(1)}
        className="px-1 text-muted hover:text-foreground disabled:opacity-30"
      >
        ↓
      </button>
    </div>
  );
}

function ContentRows({
  rows,
  editHref,
  busy,
  onMove,
  onTogglePublished,
  onDelete,
}: Omit<ContentListProps, 'singular'>) {
  return (
    <>
      {rows.map((row, index) => (
        <li key={row.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
          <MoveButtons
            label={row.title}
            busy={busy}
            first={index === 0}
            last={index === rows.length - 1}
            onMove={(direction) => onMove(index, direction)}
          />
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
    </>
  );
}

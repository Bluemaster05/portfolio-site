'use client';

import Link from 'next/link';
import { $api } from '@/lib/api/admin-query';
import { RESOURCE_KEYS, RESOURCE_LABELS } from '@/lib/admin/resources';
import { AdminPageHeader } from '@/components/admin/ui';

export function DashboardPage() {
  const site = $api.useQuery('get', '/api/admin/site');
  const sections = site.data?.sections;

  return (
    <>
      <AdminPageHeader title="Dashboard" />
      <section aria-labelledby="sections-heading" className="grid gap-4">
        <h2 id="sections-heading" className="text-lg font-semibold">
          Sections
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {RESOURCE_KEYS.map((key) => {
            const enabled = sections?.[key];
            return (
              <li key={key}>
                <Link
                  href={`/admin/${key}`}
                  className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3 hover:border-accent"
                >
                  <span className="font-medium">{RESOURCE_LABELS[key]}</span>
                  {sections && (
                    <span className="text-sm text-muted">{enabled ? 'Shown on site' : 'Hidden'}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="text-sm text-muted">
          Turn sections on or off in{' '}
          <Link href="/admin/site" className="text-accent underline underline-offset-4">
            Site settings
          </Link>
          .
        </p>
      </section>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHonors, isSectionEnabled } from '@/lib/api/public-data';
import { formatPartialDate } from '@/lib/format';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';
import { Timeline, TimelineEntry } from '@/components/public/TimelineEntry';

export const metadata: Metadata = { title: 'Honors & Awards' };

export default async function HonorsPage() {
  if (!(await isSectionEnabled('honors'))) notFound();
  const honors = await getHonors();

  return (
    <>
      <PageHeader title="Honors & Awards" />
      {honors.length === 0 ? (
        <EmptyState>No honors listed yet.</EmptyState>
      ) : (
        <Timeline>
          {honors.map((honor) => (
            <TimelineEntry
              key={honor.id}
              title={honor.title}
              subtitle={honor.issuer}
              meta={[formatPartialDate(honor.date)]}
              description={honor.description}
              footer={
                honor.url && (
                  <a href={honor.url} className="text-sm text-accent underline underline-offset-4" rel="noopener noreferrer">
                    View credential
                  </a>
                )
              }
            />
          ))}
        </Timeline>
      )}
    </>
  );
}

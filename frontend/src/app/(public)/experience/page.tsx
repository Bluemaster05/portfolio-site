import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExperience, isSectionEnabled } from '@/lib/api/public-data';
import { formatDateRange } from '@/lib/format';
import { EmptyState, PageHeader, TagList } from '@/components/public/PageHeader';
import { Timeline, TimelineEntry } from '@/components/public/TimelineEntry';

export const metadata: Metadata = { title: 'Experience' };

export default async function ExperiencePage() {
  if (!(await isSectionEnabled('experience'))) notFound();
  const entries = await getExperience();

  return (
    <>
      <PageHeader title="Experience" />
      {entries.length === 0 ? (
        <EmptyState>No experience listed yet.</EmptyState>
      ) : (
        <Timeline>
          {entries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              title={entry.role}
              subtitle={
                entry.url ? (
                  <a href={entry.url} className="hover:underline" rel="noopener noreferrer">
                    {entry.organization}
                  </a>
                ) : (
                  entry.organization
                )
              }
              meta={[formatDateRange(entry.startDate, entry.endDate), entry.employmentType, entry.location]}
              description={entry.description}
              footer={<TagList tags={entry.skills} label="Skills" />}
            />
          ))}
        </Timeline>
      )}
    </>
  );
}

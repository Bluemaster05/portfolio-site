import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEducation, isSectionEnabled } from '@/lib/api/public-data';
import { formatDateRange } from '@/lib/format';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';
import { Timeline, TimelineEntry } from '@/components/public/TimelineEntry';

export const metadata: Metadata = { title: 'Education' };

export default async function EducationPage() {
  if (!(await isSectionEnabled('education'))) notFound();
  const entries = await getEducation();

  return (
    <>
      <PageHeader title="Education" />
      {entries.length === 0 ? (
        <EmptyState>No education listed yet.</EmptyState>
      ) : (
        <Timeline>
          {entries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              title={entry.degree}
              subtitle={
                entry.url ? (
                  <a href={entry.url} className="hover:underline" rel="noopener noreferrer">
                    {entry.institution}
                  </a>
                ) : (
                  entry.institution
                )
              }
              meta={[
                entry.fieldOfStudy,
                formatDateRange(entry.startDate, entry.endDate, 'Expected'),
                entry.grade,
                entry.location,
              ]}
              description={entry.description}
            />
          ))}
        </Timeline>
      )}
    </>
  );
}

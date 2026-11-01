import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEducation, isSectionEnabled } from '@/lib/api/public-data';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';
import { EducationCard } from '@/components/public/EducationCard';

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
        <div className="grid gap-5">
          {entries.map((entry) => (
            <EducationCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getExperience, isSectionEnabled } from '@/lib/api/public-data';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';
import { ExperienceCard } from '@/components/public/ExperienceCard';

export const metadata: Metadata = { title: 'Experience' };

export default async function ExperiencePage() {
  if (!(await isSectionEnabled('experience'))) notFound();
  const groups = await getExperience();

  return (
    <>
      <PageHeader title="Experience" />
      {groups.length === 0 ? (
        <EmptyState>No experience listed yet.</EmptyState>
      ) : (
        <div className="grid gap-5">
          {groups.map((group) => (
            <ExperienceCard key={group.employer.id} group={group} />
          ))}
        </div>
      )}
    </>
  );
}

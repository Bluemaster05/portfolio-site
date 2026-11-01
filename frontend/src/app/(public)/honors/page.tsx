import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getHonors, isSectionEnabled } from '@/lib/api/public-data';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';
import { HonorCard } from '@/components/public/HonorCard';

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
        <div className="grid gap-5">
          {honors.map((honor) => (
            <HonorCard key={honor.id} honor={honor} />
          ))}
        </div>
      )}
    </>
  );
}

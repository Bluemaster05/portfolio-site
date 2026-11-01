import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getEducationEntry } from '@/lib/api/public-data';
import { formatDateRange } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { educationMeta, SchoolName } from '@/components/public/EducationCard';

export async function generateMetadata(props: PageProps<'/education/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = await getEducationEntry(slug);
  if (!entry) return {};
  return { title: `${entry.degree} at ${entry.institution}` };
}

export default function EducationEntryPage(props: PageProps<'/education/[slug]'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <EntryDetails params={props.params} />
    </Suspense>
  );
}

async function EntryDetails({ params }: Pick<PageProps<'/education/[slug]'>, 'params'>) {
  const { slug } = await params;
  const entry = await getEducationEntry(slug);
  if (!entry) notFound();

  const meta = [formatDateRange(entry.startDate, entry.endDate, 'Expected'), educationMeta(entry)]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="animate-fade-up">
      <Link href="/education" className="text-sm text-muted hover:text-foreground">
        ← All education
      </Link>
      <header className="mb-6 mt-3 grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{entry.degree}</h1>
        <p className="text-lg font-medium">
          <SchoolName entry={entry} />
        </p>
        {meta && <p className="text-muted">{meta}</p>}
      </header>

      {!isEmptyDoc(entry.description) && <RichTextRenderer doc={entry.description} className="text-lg" />}

      {!isEmptyDoc(entry.writeup) && (
        <div className="mt-10 border-t border-border pt-8">
          <RichTextRenderer doc={entry.writeup} />
        </div>
      )}
    </article>
  );
}

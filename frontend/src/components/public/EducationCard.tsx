import Link from 'next/link';
import type { EducationSummary } from '@/lib/api/types';
import { formatDateRange } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { Tooltip } from './Tooltip';

/** "Minor in Mathematics · 3.9 GPA · Collegedale, TN" from whichever the entry has. */
export function educationMeta(entry: Pick<EducationSummary, 'fieldOfStudy' | 'grade' | 'location'>): string {
  return [entry.fieldOfStudy, entry.grade, entry.location].filter(Boolean).join(' · ');
}

/** The school's name, linked to its website when it has one. */
export function SchoolName({ entry }: { entry: Pick<EducationSummary, 'institution' | 'url'> }) {
  return entry.url ? (
    <Tooltip label="School’s site">
      <a href={entry.url} className="underline-offset-4 hover:underline" rel="noopener noreferrer">
        {entry.institution}
      </a>
    </Tooltip>
  ) : (
    <>{entry.institution}</>
  );
}

/** One school and degree as a card, laid out like the experience cards; the degree links to its page. */
export function EducationCard({ entry }: { entry: EducationSummary }) {
  const meta = educationMeta(entry);

  return (
    <article className="rounded-card border border-border bg-surface p-5 animate-fade-up sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="min-w-0 text-xl font-semibold leading-snug">
          <SchoolName entry={entry} />
        </h2>
        <p className="text-sm text-muted">{formatDateRange(entry.startDate, entry.endDate, 'Expected')}</p>
      </header>
      <div className="mt-4 grid gap-1">
        <h3 className="text-lg font-semibold leading-snug">
          <Tooltip label="Read more">
            <Link href={`/education/${entry.slug}`} className="hover:text-accent hover:underline underline-offset-4">
              {entry.degree}
            </Link>
          </Tooltip>
        </h3>
        {meta && <p className="text-sm text-muted">{meta}</p>}
        {!isEmptyDoc(entry.description) && <RichTextRenderer doc={entry.description} className="mt-2" />}
      </div>
    </article>
  );
}

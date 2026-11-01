import Link from 'next/link';
import type { EmployerSummary, ExperienceGroup, ExperienceSummary } from '@/lib/api/types';
import { formatDateRange } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { TagList } from './PageHeader';
import { TechList } from './TechPill';
import { Tooltip } from './Tooltip';
import { EmployerLogo } from './EmployerLogo';

/** "Full-time · Remote" from whichever of the two a job has. */
export function jobMeta(job: Pick<ExperienceSummary, 'employmentType' | 'location'>): string {
  return [job.employmentType, job.location].filter(Boolean).join(' · ');
}

/** Earliest start to latest end, or "Present" while any job there is current. */
function employerDates(jobs: ExperienceSummary[]): string {
  const start = jobs.map((job) => job.startDate).sort()[0];
  const current = jobs.some((job) => !job.endDate);
  const end = current ? undefined : jobs.map((job) => job.endDate ?? '').sort().at(-1);
  return formatDateRange(start, end);
}

/** The employer's name, linked to its website when it has one. */
export function EmployerName({ employer }: { employer: EmployerSummary }) {
  return employer.url ? (
    <Tooltip label="Employer’s site">
      <a href={employer.url} className="underline-offset-4 hover:underline" rel="noopener noreferrer">
        {employer.name}
      </a>
    </Tooltip>
  ) : (
    <>{employer.name}</>
  );
}

/** One employer with its jobs; each job links to its own page. */
export function ExperienceCard({ group }: { group: ExperienceGroup }) {
  const { employer, jobs } = group;

  return (
    <article className="rounded-card border border-border bg-surface p-5 animate-fade-up sm:p-6">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <EmployerLogo src={employer.logoUrl} />
        <h2 className="min-w-0 flex-1 text-xl font-semibold leading-snug">
          <EmployerName employer={employer} />
        </h2>
        <p className="text-sm text-muted">{employerDates(jobs)}</p>
      </header>
      <ol className="mt-4 divide-y divide-border">
        {jobs.map((job) => (
          <li key={job.id} className="grid gap-1 py-5 first:pt-1 last:pb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-lg font-semibold leading-snug">
                <Tooltip label="Read more">
                  <Link href={`/experience/${job.slug}`} className="hover:text-accent hover:underline underline-offset-4">
                    {job.role}
                  </Link>
                </Tooltip>
              </h3>
              {/* A lone job's dates are already the employer's dates in the header */}
              {jobs.length > 1 && <p className="text-sm text-muted">{formatDateRange(job.startDate, job.endDate)}</p>}
            </div>
            {jobMeta(job) && <p className="text-sm text-muted">{jobMeta(job)}</p>}
            {!isEmptyDoc(job.description) && <RichTextRenderer doc={job.description} className="mt-2" />}
            {(job.skills.length > 0 || job.technologies.length > 0) && (
              <div className="mt-3 grid gap-2">
                <TagList tags={job.skills} label="Skills" />
                <TechList technologies={job.technologies} linked />
              </div>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}

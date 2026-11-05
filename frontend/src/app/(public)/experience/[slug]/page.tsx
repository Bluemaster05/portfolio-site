import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getExperienceJob } from '@/lib/api/public-data';
import { formatDateRange } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { TagList } from '@/components/public/PageHeader';
import { TechList } from '@/components/public/TechPill';
import { EmployerName, jobMeta } from '@/components/public/ExperienceCard';
import { EmployerLogo } from '@/components/public/EmployerLogo';

export async function generateMetadata(props: PageProps<'/experience/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const job = await getExperienceJob(slug);
  if (!job) return {};
  return { title: `${job.role} at ${job.employer.name}` };
}

export default function ExperienceJobPage(props: PageProps<'/experience/[slug]'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <JobDetails params={props.params} />
    </Suspense>
  );
}

async function JobDetails({ params }: Pick<PageProps<'/experience/[slug]'>, 'params'>) {
  const { slug } = await params;
  const job = await getExperienceJob(slug);
  if (!job) notFound();

  const meta = [formatDateRange(job.startDate, job.endDate), jobMeta(job)].filter(Boolean).join(' · ');

  return (
    <article className="mx-auto max-w-4xl animate-fade-up">
      <Link href="/experience" className="text-sm text-muted hover:text-foreground">
        ← All experience
      </Link>
      <header className="mb-6 mt-3 grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{job.role}</h1>
        <p className="flex items-center gap-3 text-lg font-medium">
          <EmployerLogo src={job.employer.logoUrl} height="h-10" />
          <EmployerName employer={job.employer} />
        </p>
        {meta && <p className="text-muted">{meta}</p>}
      </header>

      {!isEmptyDoc(job.description) && <RichTextRenderer doc={job.description} className="text-lg" />}

      {job.skills.length > 0 && (
        <section aria-labelledby="skills" className="mt-8">
          <h2 id="skills" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Skills
          </h2>
          <TagList tags={job.skills} label="Skills" />
        </section>
      )}
      {job.technologies.length > 0 && (
        <section aria-labelledby="technologies" className="mt-6">
          <h2 id="technologies" className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Technologies
          </h2>
          {/* Each pin opens the project list filtered to that technology */}
          <TechList technologies={job.technologies} linked />
        </section>
      )}

      {!isEmptyDoc(job.writeup) && (
        <div className="mt-10 border-t border-border pt-8">
          <RichTextRenderer doc={job.writeup} className="prose-wide" />
        </div>
      )}
    </article>
  );
}

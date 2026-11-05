import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProject } from '@/lib/api/public-data';
import { formatDateRange } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { TechList } from '@/components/public/TechPill';
import { ProjectMedia } from '@/components/public/ProjectMedia';

export async function generateMetadata(props: PageProps<'/projects/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProject(slug);
  if (!project) return {};
  return { title: project.title, description: project.summary || undefined };
}

export default function ProjectPage(props: PageProps<'/projects/[slug]'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <ProjectDetails params={props.params} />
    </Suspense>
  );
}

async function ProjectDetails({ params }: Pick<PageProps<'/projects/[slug]'>, 'params'>) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const dates = formatDateRange(project.startDate, project.endDate, 'Ongoing');
  const links = [
    project.liveUrl && { label: 'Live site', href: project.liveUrl },
    project.repoUrl && { label: 'Source code', href: project.repoUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link));

  return (
    <article className="mx-auto max-w-4xl animate-fade-up">
      <Link href="/projects" className="text-sm text-muted hover:text-foreground">
        ← All projects
      </Link>
      <header className="mb-6 mt-3 grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
        {dates && <p className="text-muted">{dates}</p>}
        {project.summary && <p className="max-w-[70ch] text-lg text-muted">{project.summary}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2">
          {/* Each pin opens the project list filtered to that technology */}
          <TechList technologies={project.technologies} linked />
          {links.length > 0 && (
            <ul className="flex gap-5">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-accent underline underline-offset-4" rel="noopener noreferrer">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      <ProjectMedia layout={project.mediaLayout} media={project.media} title={project.title} />
      <RichTextRenderer doc={project.content} className="prose-wide" />
    </article>
  );
}

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ProjectSummary, TechnologyUsage } from '@/lib/api/types';
import { ProjectGrid } from './ProjectCard';
import { EmptyState } from './PageHeader';
import { TechIcon } from './TechPill';

interface ProjectsBrowserProps {
  projects: ProjectSummary[];
  technologies: TechnologyUsage[];
}

/** The project list filtered by `?tech=<slug>`. Render inside <Suspense> with <ProjectsFilterView> as fallback. */
export function ProjectsBrowser(props: ProjectsBrowserProps) {
  return <ProjectsFilterView {...props} activeSlug={useSearchParams().get('tech') ?? undefined} />;
}

/** Filter pills plus the matching projects. Each pill is a link, so filtered views can be shared. */
export function ProjectsFilterView({
  projects,
  technologies,
  activeSlug,
}: ProjectsBrowserProps & { activeSlug?: string }) {
  const active = technologies.find((technology) => technology.slug === activeSlug);
  const shown = active
    ? projects.filter((project) => project.technologies.some((technology) => technology.id === active.id))
    : projects;

  return (
    <div className="grid gap-6">
      {technologies.length > 0 && (
        <nav aria-label="Filter projects by technology">
          <ul className="flex flex-wrap gap-2">
            <li>
              <FilterLink href="/projects" active={!active}>
                All <Count n={projects.length} />
              </FilterLink>
            </li>
            {technologies.map((technology) => (
              <li key={technology.id}>
                <FilterLink href={`/projects?tech=${technology.slug}`} active={technology.id === active?.id}>
                  <TechIcon technology={technology} />
                  {technology.name} <Count n={technology.projectCount} />
                </FilterLink>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {active && (
        <p role="status" className="text-muted">
          {shown.length} {shown.length === 1 ? 'project uses' : 'projects use'} {active.name}.{' '}
          <Link href="/projects" scroll={false} replace className="text-accent underline underline-offset-4">
            Show all
          </Link>
        </p>
      )}

      {shown.length > 0 ? <ProjectGrid projects={shown} /> : <EmptyState>No projects yet.</EmptyState>}
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      replace
      aria-current={active ? 'true' : undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? 'border-accent bg-accent text-background'
          : 'border-border bg-surface text-foreground hover:border-accent'
      }`}
    >
      {children}
    </Link>
  );
}

function Count({ n }: { n: number }) {
  return <span className="tabular-nums opacity-70">{n}</span>;
}

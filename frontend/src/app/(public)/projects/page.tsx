import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getProjects, getProjectTechnologies, isSectionEnabled } from '@/lib/api/public-data';
import { PageHeader } from '@/components/public/PageHeader';
import { ProjectsBrowser, ProjectsFilterView } from '@/components/public/ProjectsBrowser';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  if (!(await isSectionEnabled('projects'))) notFound();
  const [projects, technologies] = await Promise.all([getProjects(), getProjectTechnologies()]);

  return (
    <>
      <PageHeader title="Projects" />
      {/* The ?tech filter is only known per request; the unfiltered list ships in the static shell */}
      <Suspense fallback={<ProjectsFilterView projects={projects} technologies={technologies} />}>
        <ProjectsBrowser projects={projects} technologies={technologies} />
      </Suspense>
    </>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProjects, isSectionEnabled } from '@/lib/api/public-data';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';
import { ProjectGrid } from '@/components/public/ProjectCard';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  if (!(await isSectionEnabled('projects'))) notFound();
  const projects = await getProjects();

  return (
    <>
      <PageHeader title="Projects" />
      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <EmptyState>No projects yet.</EmptyState>
      )}
    </>
  );
}

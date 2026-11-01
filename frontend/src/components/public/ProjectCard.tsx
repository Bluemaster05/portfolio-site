import Link from 'next/link';
import type { ProjectSummary } from '@/lib/api/types';
import { formatDateRange } from '@/lib/format';
import { isImageSrc } from '@/lib/images';
import { TagList } from './PageHeader';

export function ProjectCard({ project }: { project: ProjectSummary }) {
  const dates = formatDateRange(project.startDate, project.endDate, 'Ongoing');
  const cover = project.mediaLayout !== 'none' ? project.images.find((image) => isImageSrc(image.url)) : undefined;

  return (
    <article className="group relative flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-accent">
      {cover && (
        // Decorative here: the title link below names the project
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover.url} alt="" loading="lazy" className="-mx-5 -mt-5 mb-1 aspect-video w-[calc(100%+2.5rem)] max-w-none rounded-t-card border-b border-border object-cover" />
      )}
      <div>
        <h2 className="text-lg font-semibold leading-snug">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.title}
          </Link>
        </h2>
        {dates && <p className="text-sm text-muted">{dates}</p>}
      </div>
      {project.summary && <p className="text-muted">{project.summary}</p>}
      <div className="mt-auto">
        <TagList tags={project.technologies} label="Technologies" />
      </div>
    </article>
  );
}

export function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {projects.map((project) => (
        <li key={project.id} className="animate-fade-up">
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  );
}

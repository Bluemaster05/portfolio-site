import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProjects, getSite } from '@/lib/api/public-data';
import { enabledSections } from '@/lib/sections';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { isImageSrc } from '@/lib/images';
import { ProjectGrid } from '@/components/public/ProjectCard';
import { EmptyState } from '@/components/public/PageHeader';

export default async function HomePage() {
  const site = await getSite();
  if (!site) {
    return <EmptyState>This site isn&apos;t available right now. Please check back soon.</EmptyState>;
  }

  if (!site.sections.home) {
    const first = enabledSections(site.sections)[0];
    if (first) redirect(first.href);
  }

  const featured = site.sections.projects ? await getProjects(true) : [];

  return (
    <div className="grid gap-14">
      <section aria-labelledby="intro" className="animate-fade-up">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {isImageSrc(site.avatarUrl) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.avatarUrl}
              alt={`Photo of ${site.ownerName}`}
              className="size-28 shrink-0 rounded-full border border-border bg-surface object-cover sm:size-32"
            />
          )}
          <div>
            <h1 id="intro" className="text-4xl font-semibold tracking-tight sm:text-5xl">
              {site.ownerName}
            </h1>
            {site.headline && <p className="mt-3 text-xl text-muted">{site.headline}</p>}
            {site.location && <p className="mt-1 text-muted">{site.location}</p>}
          </div>
        </div>
        {!isEmptyDoc(site.bio) && <RichTextRenderer doc={site.bio} className="mt-8 text-lg" />}
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="featured">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h2 id="featured" className="text-2xl font-semibold tracking-tight">
              Featured projects
            </h2>
            <Link href="/projects" className="text-accent hover:underline">
              All projects →
            </Link>
          </div>
          <ProjectGrid projects={featured} />
        </section>
      )}
    </div>
  );
}

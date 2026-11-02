import Link from 'next/link';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getEducation, getExperience, getHonors, getProjects, getSite } from '@/lib/api/public-data';
import { enabledSections } from '@/lib/sections';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { isImageSrc } from '@/lib/images';
import { ProjectGrid } from '@/components/public/ProjectCard';
import { EmptyState } from '@/components/public/PageHeader';
import { ExperienceCard } from '@/components/public/ExperienceCard';
import { HonorCard } from '@/components/public/HonorCard';
import { EducationCard } from '@/components/public/EducationCard';
import { Avatar } from '@/components/public/Avatar';

export default async function HomePage() {
  const site = await getSite();
  if (!site) {
    return <EmptyState>This site isn&apos;t available right now. Please check back soon.</EmptyState>;
  }

  if (!site.sections.home) {
    const first = enabledSections(site.sections)[0];
    if (first) redirect(first.href);
  }

  const [featured, [featuredJob], [featuredEducation], [featuredHonor]] = await Promise.all([
    site.sections.projects ? getProjects(true) : [],
    // At most one of each of these can be featured (or none)
    site.sections.experience ? getExperience(true) : [],
    site.sections.education ? getEducation(true) : [],
    site.sections.honors ? getHonors(true) : [],
  ]);

  return (
    <div className="grid gap-14">
      <section aria-labelledby="intro" className="animate-fade-up">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {isImageSrc(site.avatarUrl) && (
            <Avatar
              src={site.avatarUrl}
              alt={`Photo of ${site.ownerName}`}
              crop={site.avatarCrop}
              className="size-28 border border-border bg-surface sm:size-32"
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
        <FeaturedSection id="featured" title="Featured projects" href="/projects" linkLabel="All projects">
          <ProjectGrid projects={featured} />
        </FeaturedSection>
      )}

      {featuredJob && (
        <FeaturedSection id="featured-experience" title="Featured experience" href="/experience" linkLabel="All experience">
          <ExperienceCard group={featuredJob} />
        </FeaturedSection>
      )}

      {featuredEducation && (
        <FeaturedSection id="featured-education" title="Featured education" href="/education" linkLabel="All education">
          <EducationCard entry={featuredEducation} />
        </FeaturedSection>
      )}

      {featuredHonor && (
        <FeaturedSection id="featured-honor" title="Featured honor" href="/honors" linkLabel="All honors & awards">
          <HonorCard honor={featuredHonor} />
        </FeaturedSection>
      )}
    </div>
  );
}

/** A home page section with a heading and a link to the full list. */
function FeaturedSection({
  id,
  title,
  href,
  linkLabel,
  children,
}: {
  id: string;
  title: string;
  href: string;
  linkLabel: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <Link href={href} className="text-accent hover:underline">
          {linkLabel} →
        </Link>
      </div>
      {children}
    </section>
  );
}

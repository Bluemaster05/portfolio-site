import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { publicApi } from './public-client';
import type { ProjectSummary, SectionKey } from './types';

/**
 * Cached reads for the public site. Each result lives for a few minutes, so admin edits show up
 * shortly after saving, and every result is tagged `portfolio` for on-demand revalidation.
 *
 * A failed or 404 response resolves to `undefined` (lists to `[]`): pages render an empty state
 * or call `notFound()` rather than crashing when the API is down or a section is disabled.
 */
export const PORTFOLIO_TAG = 'portfolio';

function cachePublic() {
  cacheLife('minutes');
  cacheTag(PORTFOLIO_TAG);
}

async function safely<T>(request: () => Promise<{ data?: T }>): Promise<T | undefined> {
  try {
    return (await request()).data;
  } catch (error) {
    console.error('Public API request failed', error);
    return undefined;
  }
}

export async function getSite() {
  'use cache';
  cachePublic();
  return safely(() => publicApi.GET('/api/public/site'));
}

/** Whether a section is switched on. Unknown (API down) counts as off. */
export async function isSectionEnabled(section: SectionKey) {
  const site = await getSite();
  return site?.sections[section] ?? false;
}

/**
 * An API older than this frontend (e.g. mid-deploy) omits the project media fields even though the
 * schema says they're always present; treat that as "no media" instead of crashing the page.
 */
function withMediaDefaults<T extends Pick<ProjectSummary, 'mediaLayout' | 'media'>>(project: T): T {
  return { ...project, mediaLayout: project.mediaLayout ?? 'none', media: project.media ?? [] };
}

export async function getProjects(featured?: boolean) {
  'use cache';
  cachePublic();
  const data = await safely(() =>
    publicApi.GET('/api/public/projects', { params: { query: { featured } } }),
  );
  return (data ?? []).map(withMediaDefaults);
}

/** Technologies used by published projects, with counts, for the project filter. */
export async function getProjectTechnologies() {
  'use cache';
  cachePublic();
  return (await safely(() => publicApi.GET('/api/public/projects/technologies'))) ?? [];
}

export async function getProject(slug: string) {
  'use cache';
  cachePublic();
  const project = await safely(() =>
    publicApi.GET('/api/public/projects/{slug}', { params: { path: { slug } } }),
  );
  return project && withMediaDefaults(project);
}

/**
 * Published jobs grouped by employer; with `featured`, only the featured job in its group. Entries in
 * the older flat shape (an API or cached result from before employers existed) are dropped instead
 * of crashing the page.
 */
export async function getExperience(featured?: boolean) {
  'use cache';
  cachePublic();
  const groups =
    (await safely(() => publicApi.GET('/api/public/experience', { params: { query: { featured } } }))) ?? [];
  return groups.filter((group) => group.employer !== undefined && Array.isArray(group.jobs));
}

/** One published job, with its write-up. */
export async function getExperienceJob(slug: string) {
  'use cache';
  cachePublic();
  return safely(() => publicApi.GET('/api/public/experience/{slug}', { params: { path: { slug } } }));
}

/** Published education entries; with `featured`, only the featured one. */
export async function getEducation(featured?: boolean) {
  'use cache';
  cachePublic();
  return (await safely(() => publicApi.GET('/api/public/education', { params: { query: { featured } } }))) ?? [];
}

/** One published education entry, with its write-up. */
export async function getEducationEntry(slug: string) {
  'use cache';
  cachePublic();
  return safely(() => publicApi.GET('/api/public/education/{slug}', { params: { path: { slug } } }));
}

/** Published honors; with `featured`, only the featured one. */
export async function getHonors(featured?: boolean) {
  'use cache';
  cachePublic();
  const honors = (await safely(() => publicApi.GET('/api/public/honors', { params: { query: { featured } } }))) ?? [];
  return honors.map(withMediaDefaults);
}

/** One published honor, with its write-up. */
export async function getHonor(slug: string) {
  'use cache';
  cachePublic();
  const honor = await safely(() => publicApi.GET('/api/public/honors/{slug}', { params: { path: { slug } } }));
  return honor && withMediaDefaults(honor);
}

export async function getBlogPosts() {
  'use cache';
  cachePublic();
  return (await safely(() => publicApi.GET('/api/public/blog'))) ?? [];
}

export async function getBlogPost(slug: string) {
  'use cache';
  cachePublic();
  return safely(() => publicApi.GET('/api/public/blog/{slug}', { params: { path: { slug } } }));
}

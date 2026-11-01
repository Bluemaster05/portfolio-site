import { adminClient } from '@/lib/api/admin-client';
import type { Project } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { ensureOk, unwrap } from '../api-error';
import { bool, list, mediaItems, optional, richText, text, type FormValues } from '../form-values';
import { DATE_HELP, type ContentResource } from './resource';

type MediaLayout = components['schemas']['ProjectMediaLayout'];

const MEDIA_LAYOUTS: { value: MediaLayout; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'single', label: 'Single header (one image or video)' },
  { value: 'gallery', label: 'Gallery' },
];

function mediaLayout(values: FormValues): MediaLayout {
  const value = text(values, 'mediaLayout');
  return MEDIA_LAYOUTS.find((layout) => layout.value === value)?.value ?? 'none';
}

function toBody(values: FormValues): components['schemas']['CreateProjectDto'] {
  return {
    title: text(values, 'title'),
    slug: text(values, 'slug'),
    summary: text(values, 'summary'),
    content: richText(values, 'content'),
    technologies: list(values, 'technologies'),
    repoUrl: text(values, 'repoUrl'),
    liveUrl: text(values, 'liveUrl'),
    mediaLayout: mediaLayout(values),
    // A single header shows one item; extras left over from a gallery aren't kept
    media: mediaLayout(values) === 'single' ? mediaItems(values, 'media').slice(0, 1) : mediaItems(values, 'media'),
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    featured: bool(values, 'featured'),
    published: bool(values, 'published'),
  };
}

export const projectsResource: ContentResource<Project> = {
  key: 'projects',
  label: 'Projects',
  singular: 'project',
  fields: [
    { name: 'title', label: 'Title', kind: 'text', required: true },
    { name: 'slug', label: 'URL slug', kind: 'slug', help: 'Leave empty to generate from the title' },
    { name: 'summary', label: 'Summary', kind: 'textarea', help: 'One or two sentences for cards and search results' },
    { name: 'technologies', label: 'Technologies', kind: 'tags', placeholder: 'TypeScript, React, PostgreSQL' },
    { name: 'startDate', label: 'Started', kind: 'date', help: DATE_HELP },
    { name: 'endDate', label: 'Finished', kind: 'date', help: 'Empty if ongoing' },
    { name: 'liveUrl', label: 'Live URL', kind: 'url' },
    { name: 'repoUrl', label: 'Source code URL', kind: 'url' },
    { name: 'mediaLayout', label: 'Images & videos', kind: 'select', options: MEDIA_LAYOUTS },
    {
      name: 'media',
      label: 'Project images & videos',
      kind: 'media',
      visibleWhen: (values) => mediaLayout(values) !== 'none',
      maxItemsFor: (values) => (mediaLayout(values) === 'single' ? 1 : undefined),
      helpFor: (values) =>
        mediaLayout(values) === 'single'
          ? 'One image or video, shown as a header above the write-up. Cards use it only if it is an image.'
          : 'Tiles follow this order. The main video (or the main image if there is no video) is shown large first; the main image is the cover on cards and the home page.',
    },
    { name: 'content', label: 'Write-up', kind: 'richtext' },
    { name: 'featured', label: 'Feature on the home page', kind: 'checkbox' },
    { name: 'published', label: 'Published', kind: 'checkbox' },
  ],
  describe: (project) => ({ title: project.title, subtitle: project.summary || undefined }),
  toValues: (project) => ({
    title: project?.title ?? '',
    slug: project?.slug ?? '',
    summary: project?.summary ?? '',
    content: project?.content ?? { type: 'doc', content: [] },
    technologies: project?.technologies ?? [],
    repoUrl: optional(project?.repoUrl),
    liveUrl: optional(project?.liveUrl),
    mediaLayout: project?.mediaLayout ?? 'none',
    media: project?.media ?? [],
    startDate: optional(project?.startDate),
    endDate: optional(project?.endDate),
    featured: project?.featured ?? false,
    published: project?.published ?? false,
  }),
  api: {
    list: async () => unwrap(await adminClient.GET('/api/admin/projects')),
    get: async (id) => unwrap(await adminClient.GET('/api/admin/projects/{id}', { params: { path: { id } } })),
    create: async (values) => unwrap(await adminClient.POST('/api/admin/projects', { body: toBody(values) })),
    update: async (id, values) =>
      unwrap(await adminClient.PATCH('/api/admin/projects/{id}', { params: { path: { id } }, body: toBody(values) })),
    setPublished: async (id, published) =>
      unwrap(await adminClient.PATCH('/api/admin/projects/{id}', { params: { path: { id } }, body: { published } })),
    remove: async (id) => ensureOk(await adminClient.DELETE('/api/admin/projects/{id}', { params: { path: { id } } })),
    reorder: async (ids) => unwrap(await adminClient.PUT('/api/admin/projects/order', { body: { ids } })),
  },
};

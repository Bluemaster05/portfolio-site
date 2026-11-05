import { adminClient } from '@/lib/api/admin-client';
import type { Experience } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { formatDateRange } from '@/lib/format';
import { ensureOk, unwrap } from '../api-error';
import { bool, ids, list, optional, richText, text, type FormValues } from '../form-values';
import { DATE_HELP, type ContentResource } from './resource';

function toBody(values: FormValues): components['schemas']['CreateExperienceDto'] {
  return {
    employerId: Number(text(values, 'employerId')),
    role: text(values, 'role'),
    slug: text(values, 'slug'),
    employmentType: text(values, 'employmentType'),
    location: text(values, 'location'),
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    description: richText(values, 'description'),
    writeup: richText(values, 'writeup'),
    skills: list(values, 'skills'),
    technologyIds: ids(values, 'technologyIds'),
    published: bool(values, 'published'),
  };
}

const EMPTY_DOC = { type: 'doc', content: [] };

/** Each experience entry is one job at an employer, with its own page at /experience/[slug]. */
export const experienceResource: ContentResource<Experience> = {
  key: 'experience',
  label: 'Experience',
  singular: 'job',
  fields: [
    {
      name: 'employerId',
      label: 'Employer',
      kind: 'employer',
      required: true,
      help: 'Several jobs can share an employer. Edit names, links and logos under Employers.',
      tab: 'Details',
    },
    { name: 'role', label: 'Role / job title', kind: 'text', required: true, tab: 'Details' },
    {
      name: 'slug',
      label: 'URL slug',
      kind: 'slug',
      help: 'The job’s page is /experience/<slug>. Leave empty to generate from the role and employer.',
      tab: 'Details',
    },
    {
      name: 'employmentType',
      label: 'Type',
      kind: 'text',
      placeholder: 'Full-time, Internship, Contract…',
      tab: 'Details',
    },
    { name: 'location', label: 'Location', kind: 'text', placeholder: 'City, Country or Remote', tab: 'Details' },
    { name: 'startDate', label: 'Started', kind: 'date', required: true, help: DATE_HELP, tab: 'Details' },
    { name: 'endDate', label: 'Ended', kind: 'date', help: 'Empty while this is your current role', tab: 'Details' },
    { name: 'published', label: 'Published', kind: 'checkbox', tab: 'Details' },
    {
      name: 'skills',
      label: 'Skills',
      kind: 'tags',
      help: 'Free-text, e.g. Leadership, Mentoring. Separate with commas.',
      tab: 'Skills & technologies',
    },
    {
      name: 'technologyIds',
      label: 'Technologies',
      kind: 'technologies',
      help: 'Picked from the shared list; shown as pins that open the projects using them.',
      tab: 'Skills & technologies',
    },
    {
      name: 'description',
      label: 'Description',
      kind: 'richtext',
      help: 'A short summary, shown in the experience list and at the top of the job’s page.',
      tab: 'Description',
    },
    {
      name: 'writeup',
      label: 'Write-up',
      kind: 'writeup',
      help: 'More detail and context, shown only on the job’s own page.',
      tab: 'Write-up',
    },
  ],
  // Listed under their employer, so the role alone is enough
  describe: (job) => ({ title: job.role, subtitle: formatDateRange(job.startDate, job.endDate) }),
  featuring: {
    isFeatured: (job) => job.featured,
    setFeatured: async (id, featured) =>
      unwrap(await adminClient.PATCH('/api/admin/experience/{id}', { params: { path: { id } }, body: { featured } })),
  },
  grouping: {
    singular: 'employer',
    manageHref: '/admin/employers',
    list: async () =>
      unwrap(await adminClient.GET('/api/admin/employers')).map(({ id, name }) => ({ id, title: name })),
    groupOf: (job) => job.employer.id,
    reorder: async (ids) => unwrap(await adminClient.PUT('/api/admin/employers/order', { body: { ids } })),
  },
  toValues: (job) => ({
    employerId: job ? String(job.employer.id) : '',
    role: job?.role ?? '',
    slug: job?.slug ?? '',
    employmentType: optional(job?.employmentType),
    location: optional(job?.location),
    startDate: job?.startDate ?? '',
    endDate: optional(job?.endDate),
    description: job?.description ?? EMPTY_DOC,
    writeup: job?.writeup ?? EMPTY_DOC,
    skills: job?.skills ?? [],
    technologyIds: job?.technologies.map((technology) => technology.id) ?? [],
    published: job?.published ?? false,
  }),
  api: {
    list: async () => unwrap(await adminClient.GET('/api/admin/experience')),
    get: async (id) => unwrap(await adminClient.GET('/api/admin/experience/{id}', { params: { path: { id } } })),
    create: async (values) => unwrap(await adminClient.POST('/api/admin/experience', { body: toBody(values) })),
    update: async (id, values) =>
      unwrap(await adminClient.PATCH('/api/admin/experience/{id}', { params: { path: { id } }, body: toBody(values) })),
    setPublished: async (id, published) =>
      unwrap(await adminClient.PATCH('/api/admin/experience/{id}', { params: { path: { id } }, body: { published } })),
    remove: async (id) => ensureOk(await adminClient.DELETE('/api/admin/experience/{id}', { params: { path: { id } } })),
    reorder: async (ids) => unwrap(await adminClient.PUT('/api/admin/experience/order', { body: { ids } })),
  },
};

import { adminClient } from '@/lib/api/admin-client';
import type { Education } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { formatDateRange } from '@/lib/format';
import { ensureOk, unwrap } from '../api-error';
import { bool, optional, richText, text, type FormValues } from '../form-values';
import { DATE_HELP, type ContentResource } from './resource';

function toBody(values: FormValues): components['schemas']['CreateEducationDto'] {
  return {
    institution: text(values, 'institution'),
    degree: text(values, 'degree'),
    slug: text(values, 'slug'),
    fieldOfStudy: text(values, 'fieldOfStudy'),
    location: text(values, 'location'),
    url: text(values, 'url'),
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    grade: text(values, 'grade'),
    description: richText(values, 'description'),
    writeup: richText(values, 'writeup'),
    published: bool(values, 'published'),
  };
}

export const educationResource: ContentResource<Education> = {
  key: 'education',
  label: 'Education',
  singular: 'education entry',
  fields: [
    { name: 'degree', label: 'Degree', kind: 'text', required: true, placeholder: 'B.S. Computer Science', tab: 'Details' },
    { name: 'institution', label: 'Institution', kind: 'text', required: true, tab: 'Details' },
    {
      name: 'slug',
      label: 'URL slug',
      kind: 'slug',
      help: 'The entry’s page is /education/<slug>. Leave empty to generate from the degree and institution.',
      tab: 'Details',
    },
    { name: 'fieldOfStudy', label: 'Field of study / minor', kind: 'text', tab: 'Details' },
    { name: 'location', label: 'Location', kind: 'text', tab: 'Details' },
    { name: 'startDate', label: 'Started', kind: 'date', help: DATE_HELP, tab: 'Details' },
    { name: 'endDate', label: 'Graduated', kind: 'date', help: 'Expected or actual', tab: 'Details' },
    { name: 'grade', label: 'Grade', kind: 'text', placeholder: '3.9 GPA', tab: 'Details' },
    { name: 'url', label: 'Institution URL', kind: 'url', tab: 'Details' },
    { name: 'published', label: 'Published', kind: 'checkbox', tab: 'Details' },
    {
      name: 'description',
      label: 'Description',
      kind: 'richtext',
      help: 'A short summary, shown on the education page and at the top of the entry’s page.',
      tab: 'Description',
    },
    {
      name: 'writeup',
      label: 'Write-up',
      kind: 'richtext',
      help: 'More detail and context, shown only on the entry’s own page.',
      tab: 'Write-up',
    },
  ],
  featuring: {
    isFeatured: (entry) => entry.featured,
    setFeatured: async (id, featured) =>
      unwrap(await adminClient.PATCH('/api/admin/education/{id}', { params: { path: { id } }, body: { featured } })),
  },
  describe: (entry) => ({
    title: `${entry.degree} · ${entry.institution}`,
    subtitle: formatDateRange(entry.startDate, entry.endDate, 'Expected'),
  }),
  toValues: (entry) => ({
    institution: entry?.institution ?? '',
    degree: entry?.degree ?? '',
    slug: entry?.slug ?? '',
    fieldOfStudy: optional(entry?.fieldOfStudy),
    location: optional(entry?.location),
    url: optional(entry?.url),
    startDate: optional(entry?.startDate),
    endDate: optional(entry?.endDate),
    grade: optional(entry?.grade),
    description: entry?.description ?? { type: 'doc', content: [] },
    writeup: entry?.writeup ?? { type: 'doc', content: [] },
    published: entry?.published ?? false,
  }),
  api: {
    list: async () => unwrap(await adminClient.GET('/api/admin/education')),
    get: async (id) => unwrap(await adminClient.GET('/api/admin/education/{id}', { params: { path: { id } } })),
    create: async (values) => unwrap(await adminClient.POST('/api/admin/education', { body: toBody(values) })),
    update: async (id, values) =>
      unwrap(await adminClient.PATCH('/api/admin/education/{id}', { params: { path: { id } }, body: toBody(values) })),
    setPublished: async (id, published) =>
      unwrap(await adminClient.PATCH('/api/admin/education/{id}', { params: { path: { id } }, body: { published } })),
    remove: async (id) => ensureOk(await adminClient.DELETE('/api/admin/education/{id}', { params: { path: { id } } })),
    reorder: async (ids) => unwrap(await adminClient.PUT('/api/admin/education/order', { body: { ids } })),
  },
};

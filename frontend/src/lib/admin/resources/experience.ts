import { adminClient } from '@/lib/api/admin-client';
import type { Experience } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { formatDateRange } from '@/lib/format';
import { ensureOk, unwrap } from '../api-error';
import { bool, list, optional, richText, text, type FormValues } from '../form-values';
import { DATE_HELP, type ContentResource } from './resource';

function toBody(values: FormValues): components['schemas']['CreateExperienceDto'] {
  return {
    organization: text(values, 'organization'),
    role: text(values, 'role'),
    employmentType: text(values, 'employmentType'),
    location: text(values, 'location'),
    url: text(values, 'url'),
    startDate: text(values, 'startDate'),
    endDate: text(values, 'endDate'),
    description: richText(values, 'description'),
    skills: list(values, 'skills'),
    published: bool(values, 'published'),
  };
}

export const experienceResource: ContentResource<Experience> = {
  key: 'experience',
  label: 'Experience',
  singular: 'experience entry',
  fields: [
    { name: 'role', label: 'Role / job title', kind: 'text', required: true },
    { name: 'organization', label: 'Organization', kind: 'text', required: true },
    { name: 'employmentType', label: 'Type', kind: 'text', placeholder: 'Full-time, Internship, Contract…' },
    { name: 'location', label: 'Location', kind: 'text', placeholder: 'City, Country or Remote' },
    { name: 'startDate', label: 'Started', kind: 'date', required: true, help: DATE_HELP },
    { name: 'endDate', label: 'Ended', kind: 'date', help: 'Empty while this is your current role' },
    { name: 'url', label: 'Organization URL', kind: 'url' },
    { name: 'skills', label: 'Skills', kind: 'tags' },
    { name: 'description', label: 'Description', kind: 'richtext' },
    { name: 'published', label: 'Published', kind: 'checkbox' },
  ],
  describe: (entry) => ({
    title: `${entry.role} · ${entry.organization}`,
    subtitle: formatDateRange(entry.startDate, entry.endDate),
  }),
  toValues: (entry) => ({
    organization: entry?.organization ?? '',
    role: entry?.role ?? '',
    employmentType: optional(entry?.employmentType),
    location: optional(entry?.location),
    url: optional(entry?.url),
    startDate: entry?.startDate ?? '',
    endDate: optional(entry?.endDate),
    description: entry?.description ?? { type: 'doc', content: [] },
    skills: entry?.skills ?? [],
    published: entry?.published ?? false,
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

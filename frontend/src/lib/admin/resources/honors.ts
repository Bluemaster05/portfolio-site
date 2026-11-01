import { adminClient } from '@/lib/api/admin-client';
import type { Honor } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { formatPartialDate } from '@/lib/format';
import { ensureOk, unwrap } from '../api-error';
import { bool, optional, richText, text, type FormValues } from '../form-values';
import { DATE_HELP, type ContentResource } from './resource';

function toBody(values: FormValues): components['schemas']['CreateHonorDto'] {
  return {
    title: text(values, 'title'),
    issuer: text(values, 'issuer'),
    date: text(values, 'date'),
    url: text(values, 'url'),
    description: richText(values, 'description'),
    published: bool(values, 'published'),
  };
}

export const honorsResource: ContentResource<Honor> = {
  key: 'honors',
  label: 'Honors & Awards',
  singular: 'honor',
  fields: [
    { name: 'title', label: 'Title', kind: 'text', required: true },
    { name: 'issuer', label: 'Issuer', kind: 'text', placeholder: 'Who awarded it' },
    { name: 'date', label: 'Date', kind: 'date', help: DATE_HELP },
    { name: 'url', label: 'Credential URL', kind: 'url' },
    { name: 'description', label: 'Description', kind: 'richtext' },
    { name: 'published', label: 'Published', kind: 'checkbox' },
  ],
  describe: (honor) => ({
    title: honor.title,
    subtitle: [honor.issuer, formatPartialDate(honor.date)].filter(Boolean).join(' · ') || undefined,
  }),
  toValues: (honor) => ({
    title: honor?.title ?? '',
    issuer: optional(honor?.issuer),
    date: optional(honor?.date),
    url: optional(honor?.url),
    description: honor?.description ?? { type: 'doc', content: [] },
    published: honor?.published ?? false,
  }),
  api: {
    list: async () => unwrap(await adminClient.GET('/api/admin/honors')),
    get: async (id) => unwrap(await adminClient.GET('/api/admin/honors/{id}', { params: { path: { id } } })),
    create: async (values) => unwrap(await adminClient.POST('/api/admin/honors', { body: toBody(values) })),
    update: async (id, values) =>
      unwrap(await adminClient.PATCH('/api/admin/honors/{id}', { params: { path: { id } }, body: toBody(values) })),
    setPublished: async (id, published) =>
      unwrap(await adminClient.PATCH('/api/admin/honors/{id}', { params: { path: { id } }, body: { published } })),
    remove: async (id) => ensureOk(await adminClient.DELETE('/api/admin/honors/{id}', { params: { path: { id } } })),
    reorder: async (ids) => unwrap(await adminClient.PUT('/api/admin/honors/order', { body: { ids } })),
  },
};

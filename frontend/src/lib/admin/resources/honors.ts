import { adminClient } from '@/lib/api/admin-client';
import type { Honor } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { formatPartialDate } from '@/lib/format';
import { ensureOk, unwrap } from '../api-error';
import { bool, optional, richText, text, type FormValues } from '../form-values';
import { mediaBody, mediaFields } from './media-fields';
import { DATE_HELP, type ContentResource } from './resource';

function toBody(values: FormValues): components['schemas']['CreateHonorDto'] {
  return {
    title: text(values, 'title'),
    slug: text(values, 'slug'),
    issuer: text(values, 'issuer'),
    date: text(values, 'date'),
    url: text(values, 'url'),
    ...mediaBody(values),
    description: richText(values, 'description'),
    writeup: richText(values, 'writeup'),
    published: bool(values, 'published'),
  };
}

export const honorsResource: ContentResource<Honor> = {
  key: 'honors',
  label: 'Honors & Awards',
  singular: 'honor',
  fields: [
    { name: 'title', label: 'Title', kind: 'text', required: true, tab: 'Details' },
    { name: 'issuer', label: 'Issuer', kind: 'text', placeholder: 'Who awarded it', tab: 'Details' },
    {
      name: 'slug',
      label: 'URL slug',
      kind: 'slug',
      help: 'The honor’s page is /honors/<slug>. Leave empty to generate from the title and issuer.',
      tab: 'Details',
    },
    { name: 'date', label: 'Date', kind: 'date', help: DATE_HELP, tab: 'Details' },
    {
      name: 'url',
      label: 'Credential URL',
      kind: 'url',
      help: 'A certificate or announcement, shown as “View credential”',
      tab: 'Details',
    },
    { name: 'published', label: 'Published', kind: 'checkbox', tab: 'Details' },
    ...mediaFields('honor', 'the picture on the honor’s card'),
    {
      name: 'description',
      label: 'Description',
      kind: 'richtext',
      help: 'A short summary, shown on the honors page and at the top of the honor’s page.',
      tab: 'Description',
    },
    {
      name: 'writeup',
      label: 'Write-up',
      kind: 'writeup',
      help: 'More detail and context, shown only on the honor’s own page.',
      tab: 'Write-up',
    },
  ],
  featuring: {
    isFeatured: (honor) => honor.featured,
    setFeatured: async (id, featured) =>
      unwrap(await adminClient.PATCH('/api/admin/honors/{id}', { params: { path: { id } }, body: { featured } })),
  },
  describe: (honor) => ({
    title: honor.title,
    subtitle: [honor.issuer, formatPartialDate(honor.date)].filter(Boolean).join(' · ') || undefined,
  }),
  toValues: (honor) => ({
    title: honor?.title ?? '',
    slug: honor?.slug ?? '',
    issuer: optional(honor?.issuer),
    date: optional(honor?.date),
    url: optional(honor?.url),
    mediaLayout: honor?.mediaLayout ?? 'none',
    media: honor?.media ?? [],
    description: honor?.description ?? { type: 'doc', content: [] },
    writeup: honor?.writeup ?? { type: 'doc', content: [] },
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

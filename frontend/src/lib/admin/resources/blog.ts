import { adminClient } from '@/lib/api/admin-client';
import type { BlogPost } from '@/lib/api/types';
import type { components } from '@/lib/api/schema';
import { formatDate } from '@/lib/format';
import { ensureOk, unwrap } from '../api-error';
import { bool, list, optional, richText, text, type FormValues } from '../form-values';
import type { ContentResource } from './resource';

function toBody(values: FormValues): components['schemas']['CreateBlogPostDto'] {
  return {
    title: text(values, 'title'),
    slug: text(values, 'slug'),
    excerpt: text(values, 'excerpt'),
    content: richText(values, 'content'),
    tags: list(values, 'tags'),
    coverImageUrl: text(values, 'coverImageUrl'),
    published: bool(values, 'published'),
  };
}

export const blogResource: ContentResource<BlogPost> = {
  key: 'blog',
  label: 'Blog',
  singular: 'post',
  fields: [
    { name: 'title', label: 'Title', kind: 'text', required: true },
    { name: 'slug', label: 'URL slug', kind: 'slug', help: 'Leave empty to generate from the title' },
    { name: 'excerpt', label: 'Excerpt', kind: 'textarea', help: 'Shown in the post list and search results' },
    { name: 'tags', label: 'Tags', kind: 'tags' },
    { name: 'coverImageUrl', label: 'Cover image URL', kind: 'url' },
    { name: 'content', label: 'Post', kind: 'richtext' },
    { name: 'published', label: 'Published', kind: 'checkbox' },
  ],
  describe: (post) => ({
    title: post.title,
    subtitle: post.publishedAt ? `Published ${formatDate(post.publishedAt)}` : 'Draft',
  }),
  toValues: (post) => ({
    title: post?.title ?? '',
    slug: post?.slug ?? '',
    excerpt: post?.excerpt ?? '',
    content: post?.content ?? { type: 'doc', content: [] },
    tags: post?.tags ?? [],
    coverImageUrl: optional(post?.coverImageUrl),
    published: post?.published ?? false,
  }),
  api: {
    list: async () => unwrap(await adminClient.GET('/api/admin/blog')),
    get: async (id) => unwrap(await adminClient.GET('/api/admin/blog/{id}', { params: { path: { id } } })),
    create: async (values) => unwrap(await adminClient.POST('/api/admin/blog', { body: toBody(values) })),
    update: async (id, values) =>
      unwrap(await adminClient.PATCH('/api/admin/blog/{id}', { params: { path: { id } }, body: toBody(values) })),
    setPublished: async (id, published) =>
      unwrap(await adminClient.PATCH('/api/admin/blog/{id}', { params: { path: { id } }, body: { published } })),
    remove: async (id) => ensureOk(await adminClient.DELETE('/api/admin/blog/{id}', { params: { path: { id } } })),
    reorder: async (ids) => unwrap(await adminClient.PUT('/api/admin/blog/order', { body: { ids } })),
  },
};

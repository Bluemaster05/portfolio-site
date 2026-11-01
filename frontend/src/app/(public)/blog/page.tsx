import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPosts, isSectionEnabled } from '@/lib/api/public-data';
import { formatDate } from '@/lib/format';
import { EmptyState, PageHeader } from '@/components/public/PageHeader';

export const metadata: Metadata = { title: 'Blog' };

export default async function BlogPage() {
  if (!(await isSectionEnabled('blog'))) notFound();
  const posts = await getBlogPosts();

  return (
    <>
      <PageHeader title="Blog" />
      {posts.length === 0 ? (
        <EmptyState>No posts yet.</EmptyState>
      ) : (
        <ul className="grid max-w-[70ch] gap-10">
          {posts.map((post) => (
            <li key={post.id} className="animate-fade-up">
              <article className="grid gap-1">
                {post.publishedAt && (
                  <p className="text-sm text-muted">
                    <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </p>
                )}
                <h2 className="text-xl font-semibold leading-snug">
                  <Link href={`/blog/${post.slug}`} className="hover:text-accent">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && <p className="text-muted">{post.excerpt}</p>}
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

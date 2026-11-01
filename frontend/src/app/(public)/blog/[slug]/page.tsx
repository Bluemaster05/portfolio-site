import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getBlogPost } from '@/lib/api/public-data';
import { formatDate } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { TagList } from '@/components/public/PageHeader';

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: { type: 'article', title: post.title, publishedTime: post.publishedAt },
  };
}

export default function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <BlogPostContent params={props.params} />
    </Suspense>
  );
}

async function BlogPostContent({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  return (
    <article className="animate-fade-up">
      <Link href="/blog" className="text-sm text-muted hover:text-foreground">
        ← All posts
      </Link>
      <header className="mb-10 mt-4 grid max-w-[70ch] gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-muted">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </p>
        )}
        <TagList tags={post.tags} label="Tags" />
      </header>
      <RichTextRenderer doc={post.content} />
    </article>
  );
}

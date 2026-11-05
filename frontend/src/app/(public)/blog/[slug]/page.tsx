import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getBlogPost } from '@/lib/api/public-data';
import { formatDate } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { TagList } from '@/components/public/PageHeader';
import { ZoomableImage } from '@/components/public/ZoomableImage';
import { isImageSrc } from '@/lib/images';

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
      <header className="mb-6 mt-3 grid max-w-[70ch] gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        {post.publishedAt && (
          <p className="text-muted">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </p>
        )}
        <TagList tags={post.tags} label="Tags" />
      </header>
      {isImageSrc(post.coverImageUrl) && (
        // Decorative: the title already says what the post is about
        <ZoomableImage
          src={post.coverImageUrl}
          buttonClassName="mb-8 w-full"
          className="max-h-[min(40vh,22rem)] w-full rounded-card border border-border bg-surface object-cover"
        />
      )}
      <RichTextRenderer doc={post.content} />
    </article>
  );
}
